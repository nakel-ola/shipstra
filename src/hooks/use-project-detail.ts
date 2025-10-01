import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { Project } from './use-projects';

export interface Deployment {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  branch: string;
  commit_hash?: string;
  started_at?: string;
  finished_at?: string;
  deployed_at?: string;
  created_at: string;
  build_logs?: string;
  error_message?: string;
}

export const useProjectDetail = (projectId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploymentsLoading, setDeploymentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!user) return;

    try {
      console.log('📡 Fetching project:', projectId, 'for user:', user.id);
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('❌ Project fetch error:', error);
        if (error.code === 'PGRST116') {
          console.log('📝 Setting error: Project not found');
          setError('Project not found');
        } else {
          throw error;
        }
        return;
      }

      console.log('✅ Project fetched successfully:', data.name);
      const mappedProject: Project = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description!,
        repository_url: data.repository_url!,
        source_url: data.source_url!,
        build_command: data.build_command!,
        output_directory: data.output_directory!,
        domain: data.domain!,
        status: data.status as Project['status'],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProject(mappedProject);
    } catch (error) {
      console.error('💥 Error fetching project:', error);
      setError('Failed to load project');
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeployments = async () => {
    if (!user) return;

    try {
      setDeploymentsLoading(true);
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedDeployments: Deployment[] = (data || []).map(deployment => ({
        id: deployment.id,
        project_id: deployment.project_id,
        user_id: deployment.user_id,
        status: deployment.status as Deployment['status'],
        branch: deployment.branch!,
        commit_hash: deployment.commit_hash!,
        started_at: deployment.started_at!,
        finished_at: deployment.finished_at!,
        deployed_at: deployment.deployed_at!,
        created_at: deployment.created_at,
        build_logs: deployment.build_logs!,
        error_message: deployment.error_message!,
      }));

      setDeployments(mappedDeployments);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      toast({
        title: "Error",
        description: "Failed to load deployment history.",
        variant: "destructive",
      });
    } finally {
      setDeploymentsLoading(false);
    }
  };

  const createDeployment = async () => {
    if (!user || !project) return null;

    try {
      const { data, error } = await supabase
        .from('deployments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          status: 'pending',
          branch: 'main',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const mappedDeployment: Deployment = {
        id: data.id,
        project_id: data.project_id,
        user_id: data.user_id,
        status: data.status as Deployment['status'],
        branch: data.branch!,
        commit_hash: data.commit_hash!,
        started_at: data.started_at!,
        finished_at: data.finished_at!,
        deployed_at: data.deployed_at!,
        created_at: data.created_at,
        build_logs: data.build_logs!,
        error_message: data.error_message!,
      };

      // Add to deployments list
      setDeployments(prev => [mappedDeployment, ...prev]);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'deployment_started',
          title: 'Deployment Started',
          message: `Deployment for "${project.name}" has been started.`,
          project_id: projectId,
          deployment_id: data.id,
        });

      toast({
        title: "Deployment Started",
        description: "Your deployment has been queued.",
      });

      return mappedDeployment;
    } catch (error) {
      console.error('Error creating deployment:', error);
      toast({
        title: "Error",
        description: "Failed to start deployment.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProjectSettings = async (updates: Partial<Project>) => {
    if (!user || !project) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          repository_url: updates.repository_url,
          source_url: updates.source_url,
          build_command: updates.build_command,
          output_directory: updates.output_directory,
          domain: updates.domain,
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setProject(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Success",
        description: "Project settings updated successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",  
        description: "Failed to update project settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user && projectId) {
      fetchProject();
      fetchDeployments();

      // Set up real-time subscription for deployments
      const subscription = supabase
        .channel('deployment_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'deployments',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            console.log('Deployment change detected:', payload);
            fetchDeployments(); // Refetch deployments when changes occur
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, projectId]);

  return {
    project,
    deployments,
    loading,
    deploymentsLoading,
    error,
    createDeployment,
    updateProjectSettings,
    refetch: () => {
      fetchProject();
      fetchDeployments();
    },
  };
};