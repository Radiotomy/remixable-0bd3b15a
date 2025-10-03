import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Check if user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('Not authenticated:', authError);
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      setUser(currentUser);

      // Check if user has admin role
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roles) {
        console.error('Not an admin:', roleError);
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return { isAdmin, isLoading, user };
};
