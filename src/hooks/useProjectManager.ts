import { useState, useEffect } from 'react';
import { useFireproofProjects, Project } from './useFireproof';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedProject extends Omit<Project, 'code'> {
  code: {
    components: Record<string, string>;
    hooks: Record<string, string>;
    utils: Record<string, string>;
    types: string;
    config: string;
  };
  backend?: {
    schema: string;
    edgeFunctions: Record<string, string>;
    rls: string[];
  };
  deployment?: {
    envVars: Record<string, string>;
    buildCommands: string[];
  };
  infrastructure?: {
    database: string;
    storage: string;
    rpc: string;
    paymaster?: string;
  };
}

export const useProjectManager = () => {
  const { projects, saveProject, updateProject, deleteProject } = useFireproofProjects();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEnhancedProject = async (project: Omit<EnhancedProject, '_id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Save to Fireproof (local storage)
      const localResult = await saveProject({
        title: project.title,
        description: project.description || '',
        category: project.category,
        template_id: project.template_id,
        code: project.code,
        preview_data: project.preview_data || {},
        is_published: project.is_published,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_id: project.user_id
      });

      // Also save to Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .insert({
            title: project.title,
            description: project.description || '',
            category: project.category,
            template_id: project.template_id,
            code: project.code,
            preview_data: {
              ...project.preview_data,
              backend: project.backend,
              deployment: project.deployment,
              infrastructure: project.infrastructure
            },
            is_published: project.is_published,
            user_id: user.id
          });

        if (supabaseError) {
          console.warn('Failed to save to Supabase:', supabaseError);
          // Continue with local save even if Supabase fails
        }
      }

      return localResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save project';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (id: string): EnhancedProject | null => {
    const project = projects.find(p => p._id === id);
    if (!project) return null;

    return {
      ...project,
      code: typeof project.code === 'object' ? project.code : {
        components: {},
        hooks: {},
        utils: {},
        types: '',
        config: ''
      },
      backend: project.preview_data?.backend,
      deployment: project.preview_data?.deployment,
      infrastructure: project.preview_data?.infrastructure
    };
  };

  const getUserProjects = (): EnhancedProject[] => {
    return projects.map(project => ({
      ...project,
      code: typeof project.code === 'object' ? project.code : {
        components: {},
        hooks: {},
        utils: {},
        types: '',
        config: ''
      },
      backend: project.preview_data?.backend,
      deployment: project.preview_data?.deployment,
      infrastructure: project.preview_data?.infrastructure
    }));
  };

  const publishProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const project = getProjectById(id);
      if (!project) throw new Error('Project not found');

      // Update local project
      await updateProject(id, {
        is_published: true,
        updated_at: new Date().toISOString()
      });

      // Update Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: supabaseError } = await supabase
          .from('projects')
          .update({ is_published: true })
          .eq('user_id', user.id)
          .eq('title', project.title);

        if (supabaseError) {
          console.warn('Failed to publish to Supabase:', supabaseError);
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish project';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deployProject = async (project: EnhancedProject) => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would:
      // 1. Create a deployment package
      // 2. Upload to Vercel/Netlify
      // 3. Configure environment variables
      // 4. Deploy edge functions to Supabase
      // 5. Set up database schema
      
      console.log('Deploying project:', project.title);
      console.log('Deployment config:', project.deployment);
      console.log('Backend schema:', project.backend?.schema);

      // Mock deployment - in reality this would call deployment APIs
      await new Promise(resolve => setTimeout(resolve, 3000));

      const deploymentUrl = `https://${project.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.vercel.app`;
      
      // Update project with deployment URL
      await updateProject(project._id!, {
        preview_data: {
          ...project.preview_data,
          deploymentUrl,
          deployedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });

      return deploymentUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy project';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncWithSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: supabaseProjects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // TODO: Implement smart sync logic to merge local and remote projects
      console.log('Supabase projects:', supabaseProjects);
      
    } catch (err) {
      console.warn('Failed to sync with Supabase:', err);
    }
  };

  // Auto-sync when component mounts
  useEffect(() => {
    syncWithSupabase();
  }, []);

  return {
    projects: getUserProjects(),
    loading,
    error,
    saveProject: saveEnhancedProject,
    updateProject,
    deleteProject,
    getProjectById,
    publishProject,
    deployProject,
    syncWithSupabase
  };
};