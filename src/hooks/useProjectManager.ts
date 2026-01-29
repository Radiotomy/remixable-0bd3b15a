import { useState, useEffect } from 'react';
import { useFireproofProjects, Project } from './useFireproof';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
  const { projects: localProjects, saveProject, updateProject, deleteProject } = useFireproofProjects();
  const [supabaseProjects, setSupabaseProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedFromSupabase, setHasFetchedFromSupabase] = useState(false);

  const saveEnhancedProject = async (project: Omit<EnhancedProject, '_id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Get user first
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save to Supabase FIRST if user is authenticated (primary storage)
      let supabaseProjectId: string | null = null;
      if (user) {
        const insertData: {
          title: string;
          description: string;
          category: string | null;
          template_id: string | null;
          code: Json;
          preview_data: Json;
          is_published: boolean;
          user_id: string;
        } = {
          title: project.title,
          description: project.description || '',
          category: project.category || null,
          template_id: project.template_id || null,
          code: project.code as Json,
          preview_data: {
            ...project.preview_data,
            backend: project.backend,
            deployment: project.deployment,
            infrastructure: project.infrastructure
          } as Json,
          is_published: project.is_published,
          user_id: user.id
        };

        const { data: supabaseProject, error: supabaseError } = await supabase
          .from('projects')
          .insert([insertData])
          .select('id')
          .single();

        if (supabaseError) {
          console.error('Supabase save error:', supabaseError);
          throw new Error(`Failed to save project to cloud: ${supabaseError.message}`);
        }
        
        // Verify the project was saved and is readable
        if (supabaseProject) {
          supabaseProjectId = supabaseProject.id;
          const { data: verifiedProject, error: verifyError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', supabaseProject.id)
            .single();

          if (verifyError || !verifiedProject) {
            console.error('Project verification failed:', verifyError);
            throw new Error('Project saved but not readable. Check RLS policies.');
          }
        }
      }

      // Also save to Fireproof (local storage) as backup
      const localResult = await saveProject({
        title: project.title,
        description: project.description || '',
        category: project.category,
        template_id: project.template_id,
        code: project.code,
        preview_data: {
          ...project.preview_data,
          supabaseId: supabaseProjectId // Link to cloud version
        },
        is_published: project.is_published,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_id: project.user_id
      });

      return { ...localResult, supabaseId: supabaseProjectId };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save project';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (id: string): EnhancedProject | null => {
    // Check Supabase projects first, then local
    const allProjects = [...supabaseProjects, ...localProjects.map(p => ({
      ...p,
      code: typeof p.code === 'object' ? p.code : {
        components: {},
        hooks: {},
        utils: {},
        types: '',
        config: ''
      }
    }))];
    
    const project = allProjects.find(p => p._id === id);
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
    // Prioritize Supabase projects, use local as fallback
    if (supabaseProjects.length > 0) {
      return supabaseProjects;
    }
    
    return localProjects.map(project => ({
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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasFetchedFromSupabase(true);
        return;
      }

      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase projects to EnhancedProject format
      const transformedProjects: EnhancedProject[] = (projectsData || []).map(p => ({
        _id: p.id,
        title: p.title,
        description: p.description || undefined,
        category: p.category || 'custom',
        template_id: p.template_id || undefined,
        code: typeof p.code === 'object' && p.code !== null ? p.code as EnhancedProject['code'] : {
          components: {},
          hooks: {},
          utils: {},
          types: '',
          config: ''
        },
        preview_data: p.preview_data as Record<string, any> || {},
        is_published: p.is_published,
        created_at: p.created_at,
        updated_at: p.updated_at,
        user_id: p.user_id,
        backend: (p.preview_data as any)?.backend,
        deployment: (p.preview_data as any)?.deployment,
        infrastructure: (p.preview_data as any)?.infrastructure
      }));

      setSupabaseProjects(transformedProjects);
      setHasFetchedFromSupabase(true);
      console.log('Supabase projects loaded:', transformedProjects.length);
      
    } catch (err) {
      console.warn('Failed to sync with Supabase:', err);
      setHasFetchedFromSupabase(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync when component mounts
  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Show loading until we've attempted to fetch from Supabase
  const isLoading = loading || !hasFetchedFromSupabase;

  return {
    projects: getUserProjects(),
    loading: isLoading,
    error,
    saveProject: saveEnhancedProject,
    updateProject,
    deleteProject,
    getProjectById,
    publishProject,
    deployProject,
    syncWithSupabase,
    hasFetchedFromSupabase
  };
};