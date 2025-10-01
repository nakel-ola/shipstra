import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  repository_url?: string;
  source_url?: string;
  build_command: string;
  output_directory: string;
  domain?: string;
  status: 'pending' | 'building' | 'deployed' | 'failed' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  repositoryUrl?: string;
  sourceUrl?: string;
  buildCommand?: string;
  outputDirectory?: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = data?.map(project => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description!,
        repository_url: project.repository_url!,
        source_url: project.source_url!,
        build_command: project.build_command!,
        output_directory: project.output_directory!,
        domain: project.domain!,
        status: project.status as Project['status'],
        created_at: project.created_at,
        updated_at: project.updated_at,
      })) || [];

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (input: CreateProjectInput) => {
    if (!user) return null;

    try {
      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_project_slug', {
          project_name: input.name,
          user_id_param: user.id
        });

      if (slugError) throw slugError;

      const slug = slugData;

      // Create optimistic project for immediate UI update
      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: input.name,
        slug: slug,
        description: input.description,
        repository_url: input.repositoryUrl,
        source_url: input.sourceUrl,
        build_command: input.buildCommand || 'npm run build',
        output_directory: input.outputDirectory || 'dist',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update UI
      setProjects(prev => [optimisticProject, ...prev]);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: input.name,
          slug: slug,
          description: input.description,
          repository_url: input.repositoryUrl,
          source_url: input.sourceUrl,
          build_command: input.buildCommand || 'npm run build',
          output_directory: input.outputDirectory || 'dist',
        })
        .select()
        .single();

      if (error) throw error;

      // Create a notification for the new project
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'project_created',
          title: 'Project Created',
          message: `Project "${input.name}" has been created successfully.`,
          project_id: data.id,
        });

      toast({
        title: "Success",
        description: `Project "${input.name}" created successfully.`,
      });

      // Replace optimistic project with real data
      setProjects(prev => prev.map(p => 
        p.id === optimisticProject.id 
          ? {
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
            }
          : p
      ));

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Remove optimistic project on error
      setProjects(prev => prev.filter(p => !p.id.startsWith('temp-')));
      
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<CreateProjectInput>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          repository_url: updates.repositoryUrl,
          source_url: updates.sourceUrl,
          build_command: updates.buildCommand,
          output_directory: updates.outputDirectory,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully.",
      });

      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });

      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();

      // Set up real-time subscription for projects
      const subscription = supabase
        .channel('projects_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Project change detected:', payload);
            fetchProjects(); // Refetch projects when changes occur
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};