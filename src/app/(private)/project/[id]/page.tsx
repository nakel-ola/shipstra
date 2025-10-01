"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, GitBranch, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProjectActiveTab,
  ProjectHistoryTab,
  ProjectSettingsTab,
  ProjectSecurityTab,
  ProjectDomainsTab,
  ProjectLogsTab,
} from "./features";
import { useProjectDetail } from "@/hooks/use-project-detail";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";
import { useRouter } from "next/navigation";

type Props = {
  params: { id: string };
};

const ProjectDetail = ({ params: { id } }: Props) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  const {
    project,
    deployments,
    loading,
    deploymentsLoading,
    error,
    createDeployment,
    updateProjectSettings,
  } = useProjectDetail(id || "");

  // Redirect if not authenticated
  useEffect(() => {
    console.log(
      "🔐 Auth check - loading:",
      authLoading,
      "User:",
      !!user,
      "Project ID:",
      id
    );
    if (authLoading) return;
    if (!user) {
      console.log("❌ No user after init, redirecting to sign-in");
      router.push("/auth/sign-in");
    }
  }, [user, authLoading, router, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !project) {
    console.log("🚫 Showing error page - Error:", error, "Project:", !!project);
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="backdrop-blur-md bg-glass border-glass-border shadow-glass max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Project Not Found
            </CardTitle>
            <CardDescription className="text-center">
              {error ||
                "The project you're looking for doesn't exist or you don't have access to it."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "deployed":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          label: "Deployed",
        };
      case "building":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          label: "Building",
        };
      case "failed":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          label: "Failed",
        };
      case "pending":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          label: "Pending",
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  const tabs = [
    { id: "active", label: "Active", component: ProjectActiveTab },
    { id: "history", label: "History", component: ProjectHistoryTab },
    { id: "settings", label: "Settings", component: ProjectSettingsTab },
    { id: "security", label: "Security", component: ProjectSecurityTab },
    { id: "domains", label: "Domains", component: ProjectDomainsTab },
    { id: "logs", label: "Logs", component: ProjectLogsTab },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="backdrop-blur-md bg-glass/50 border-glass-border hover:bg-glass hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {project.repository_url && (
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-glass/50 border-glass-border"
                >
                  <GitBranch className="h-3 w-3 mr-1" />
                  {project.repository_url.replace("https://github.com/", "")}
                </Badge>
              )}
              <Badge className={`${statusConfig.color} border`}>
                {statusConfig.label}
              </Badge>
              {project.domain && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(`https://${project.domain}`, "_blank")
                  }
                  className="backdrop-blur-md bg-glass/50 border-glass-border hover:bg-glass hover:scale-105 transition-all duration-200"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Live
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="backdrop-blur-md bg-glass/50 border-glass-border mb-6 p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-glow transition-all duration-300"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => {
              const Component = tab.component as React.ComponentType<{
                project: Project;
                deployments?: Deployment[];
                deploymentsLoading?: boolean;
                onCreateDeployment?: () => Promise<Deployment | null>;
                onUpdateProject?: (
                  updates: Partial<Project>
                ) => Promise<boolean>;
              }>;
              return (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Component
                      project={project}
                      deployments={deployments}
                      deploymentsLoading={deploymentsLoading}
                      onCreateDeployment={createDeployment}
                      onUpdateProject={updateProjectSettings}
                    />
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
