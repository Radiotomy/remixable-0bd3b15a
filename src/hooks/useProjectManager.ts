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
  storageProvider?: string;
  cloudSynced?: boolean;
}

export const useProjectManager = () => {
  const { projects: localProjects, saveProject, updateProject, deleteProject, database } = useFireproofProjects();
  const [supabaseProjects, setSupabaseProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedFromSupabase, setHasFetchedFromSupabase] = useState(false);
  const [storageProvider, setStorageProvider] = useState<string>('fireproof');

  // Save project - Fireproof FIRST (primary), then optionally sync to Supabase
  const saveEnhancedProject = async (project: Omit<EnhancedProject, '_id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Save to Fireproof FIRST (local-first, instant)
      const localResult = await saveProject({
        title: project.title,
        description: project.description || '',
        category: project.category,
        template_id: project.template_id,
        code: project.code,
        preview_data: {
          ...project.preview_data,
          backend: project.backend,
          deployment: project.deployment,
          infrastructure: project.infrastructure,
          storageProvider: project.infrastructure?.database || 'fireproof'
        },
        is_published: project.is_published,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_id: project.user_id
      });

      console.log('Project saved to Fireproof:', localResult.id);

      // Step 2: Optionally sync to Supabase for cloud backup (if user is authenticated)
      let supabaseProjectId: string | null = null;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
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
              infrastructure: project.infrastructure,
              localId: localResult.id // Link to local version
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
            console.warn('Cloud backup failed (will retry later):', supabaseError.message);
          } else if (supabaseProject) {
            supabaseProjectId = supabaseProject.id;
            console.log('Project synced to cloud:', supabaseProjectId);
            
            // Update local project with cloud ID
            await updateProject(localResult.id, {
              preview_data: {
                ...project.preview_data,
                cloudId: supabaseProjectId,
                cloudSynced: true,
                lastSyncAt: new Date().toISOString()
              }
            });
          }
        } catch (syncError) {
          console.warn('Cloud sync error (project saved locally):', syncError);
        }
      }

      return { ...localResult, supabaseId: supabaseProjectId, storageProvider: 'fireproof' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save project';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (id: string): EnhancedProject | null => {
    // Check local Fireproof projects FIRST (primary), then Supabase
    const allProjects = [
      ...localProjects.map(p => ({
        ...p,
        code: typeof p.code === 'object' ? p.code : {
          components: {},
          hooks: {},
          utils: {},
          types: '',
          config: ''
        },
        storageProvider: 'fireproof'
      })),
      ...supabaseProjects
    ];
    
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
    // Merge local and cloud projects, preferring local (Fireproof) as source of truth
    const localEnhanced: EnhancedProject[] = localProjects.map(project => ({
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
      infrastructure: project.preview_data?.infrastructure,
      storageProvider: 'fireproof',
      cloudSynced: !!project.preview_data?.cloudId
    }));

    // Find cloud projects that don't exist locally (for cross-device sync)
    const localIds = new Set(localEnhanced.map(p => p.preview_data?.cloudId).filter(Boolean));
    const cloudOnlyProjects = supabaseProjects.filter(p => !localIds.has(p._id));

    return [...localEnhanced, ...cloudOnlyProjects];
  };

  const publishProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const project = getProjectById(id);
      if (!project) throw new Error('Project not found');

      // Update local project first
      await updateProject(id, {
        is_published: true,
        updated_at: new Date().toISOString()
      });

      // Then sync to Supabase if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user && project.preview_data?.cloudId) {
        const { error: supabaseError } = await supabase
          .from('projects')
          .update({ is_published: true })
          .eq('id', project.preview_data.cloudId);

        if (supabaseError) {
          console.warn('Failed to publish to cloud:', supabaseError);
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

      console.log('Deploying project:', project.title);
      console.log('Deployment config:', project.deployment);
      console.log('Backend schema:', project.backend?.schema);

      // Mock deployment - in reality this would call Vercel deployment APIs
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
        infrastructure: (p.preview_data as any)?.infrastructure,
        storageProvider: 'supabase',
        cloudSynced: true
      }));

      setSupabaseProjects(transformedProjects);
      setHasFetchedFromSupabase(true);
      console.log('Cloud projects loaded:', transformedProjects.length);
      
    } catch (err) {
      console.warn('Failed to sync with cloud:', err);
      setHasFetchedFromSupabase(true);
    } finally {
      setLoading(false);
    }
  };

  const exportProject = async (id: string) => {
    const project = getProjectById(id);
    if (!project) throw new Error('Project not found');
    
    const exportData = JSON.stringify(project, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProject = async (file: File) => {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text);
      
      // Save as new project
      return await saveEnhancedProject({
        ...projectData,
        _id: undefined, // Generate new ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to import project: Invalid file format');
    }
  };

  // Auto-sync when component mounts
  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Local projects are always available immediately
  const isLoading = loading;

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
    hasFetchedFromSupabase,
    storageProvider,
    exportProject,
    importProject
  };
};
