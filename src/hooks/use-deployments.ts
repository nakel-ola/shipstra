import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Deployment {
  id: string;
  user_id: string;
  project_id: string;
  status: string;
  branch: string | null;
  commit_hash: string | null;
  build_logs: string | null;
  error_message: string | null;
  started_at: string | null;
  deployed_at: string | null;
  finished_at: string | null;
  created_at: string;
  projects?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Project {
  id: string;
  name: string;
  slug: string;
}

export const useDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      
      const { data: deploymentsData, error: deploymentsError } = await supabase
        .from("deployments")
        .select(`
          *,
          projects (
            id,
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (deploymentsError) {
        console.error("Error fetching deployments:", deploymentsError);
        toast.error("Failed to fetch deployments");
        return;
      }

      setDeployments(deploymentsData || []);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      toast.error("Failed to fetch deployments");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        return;
      }

      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const createDeployment = async (projectId: string, branch = "main") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create deployments");
        return null;
      }

      const { data, error } = await supabase
        .from("deployments")
        .insert({
          project_id: projectId,
          user_id: user.id,
          branch,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating deployment:", error);
        toast.error("Failed to create deployment");
        return null;
      }

      toast.success("Deployment started successfully");
      fetchDeployments(); // Refresh the list
      return data;
    } catch (error) {
      console.error("Error creating deployment:", error);
      toast.error("Failed to create deployment");
      return null;
    }
  };

  useEffect(() => {
    fetchDeployments();
    fetchProjects();

    // Set up real-time subscription for deployments
    const channel = supabase
      .channel("deployments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deployments",
        },
        () => {
          fetchDeployments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    deployments,
    projects,
    loading,
    createDeployment,
    refetch: fetchDeployments,
  };
};