import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/use-projects";
import { useSSHCredentials } from "@/hooks/use-SSH-credentials";
import { useToast } from "@/hooks/use-toast";
import { useSessionTracker } from "@/hooks/use-session-tracker";
import {
  Header,
  ProjectGrid,
  ProjectsEmptyState,
  SSHCredentialAlert,
} from "./features";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { globalCredential, loading: sshLoading } = useSSHCredentials();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Track session activity for logged in users
  useSessionTracker();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          router.push("/auth/sign-in");
          return;
        }

        if (!session) {
          router.push("/auth/sign-in");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in again.",
        });
        router.push("/auth/sign-in");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth/sign-in");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, toast]);

  if (loading || projectsLoading || sshLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.main
        className="flex-1 p-6 space-y-6 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* SSH Credential Alert */}
        {!globalCredential && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SSHCredentialAlert />
          </motion.div>
        )}

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Projects
              </h2>
              <p className="text-muted-foreground">
                Manage and deploy your applications
              </p>
            </div>
          </div>

          {/* Project Grid or Empty State */}
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <ProjectsEmptyState />
          )}
        </div>
      </motion.main>
    </div>
  );
}
