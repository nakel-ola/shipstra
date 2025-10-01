import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, GitCommit, User, Rocket, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectActiveTabProps {
  project: Project;
  deployments: Deployment[];
  deploymentsLoading: boolean;
  onCreateDeployment: () => Promise<Deployment | null>;
  onUpdateProject: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectActiveTab = ({
  project,
  deployments,
  deploymentsLoading,
  onCreateDeployment,
  onUpdateProject,
}: ProjectActiveTabProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const { toast } = useToast();

  const latestDeployment = deployments[0];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);

    try {
      const deployment = await onCreateDeployment();
      if (deployment) {
        // Simulate deployment progress
        const interval = setInterval(() => {
          setDeployProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsDeploying(false);
              return 100;
            }
            return prev + 10;
          });
        }, 300);
      } else {
        setIsDeploying(false);
      }
    } catch (error) {
      setIsDeploying(false);
      setDeployProgress(0);
    }
  };

  const handleRollback = () => {
    toast({
      title: "Rollback Initiated",
      description: "Rolling back to previous deployment...",
    });
  };

  // Current deployment data from latest deployment or fallback
  const currentDeployment = latestDeployment
    ? {
        id: latestDeployment.id,
        commit: latestDeployment.commit_hash || "Latest deployment",
        hash: latestDeployment.commit_hash?.substring(0, 7) || "unknown",
        author: "System",
        date: latestDeployment.deployed_at || latestDeployment.created_at,
        buildTime:
          latestDeployment.finished_at && latestDeployment.started_at
            ? Math.ceil(
                (new Date(latestDeployment.finished_at).getTime() -
                  new Date(latestDeployment.started_at).getTime()) /
                  1000
              ) + "s"
            : "N/A",
        size: "N/A",
      }
    : {
        id: "no_deployment",
        commit: "No deployments yet",
        hash: "N/A",
        author: "N/A",
        date: new Date().toISOString(),
        buildTime: "N/A",
        size: "N/A",
      };

  return (
    <div className="space-y-6">
      {/* Current Deployment Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Current Deployment</CardTitle>
                <CardDescription>
                  {latestDeployment
                    ? "Active production deployment"
                    : "No active deployments"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-md bg-glass/95 border-glass-border">
                    <DialogHeader>
                      <DialogTitle>Deploy New Version</DialogTitle>
                      <DialogDescription>
                        Deploy the latest changes from your repository
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {isDeploying ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Deploying...
                          </div>
                          <Progress value={deployProgress} className="w-full" />
                          <p className="text-xs text-muted-foreground">
                            {deployProgress < 30 && "Building..."}
                            {deployProgress >= 30 &&
                              deployProgress < 60 &&
                              "Testing..."}
                            {deployProgress >= 60 &&
                              deployProgress < 90 &&
                              "Deploying..."}
                            {deployProgress >= 90 && "Finalizing..."}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleDeploy}
                          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                        >
                          Start Deployment
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                {latestDeployment && (
                  <Button
                    variant="outline"
                    onClick={handleRollback}
                    className="backdrop-blur-md bg-glass/50 border-glass-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rollback
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestDeployment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitCommit className="h-4 w-4" />
                    Commit
                  </div>
                  <div>
                    <p className="font-medium">{currentDeployment.commit}</p>
                    <Badge variant="secondary" className="text-xs">
                      {currentDeployment.hash}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Author
                  </div>
                  <p className="font-medium">{currentDeployment.author}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Deployed
                  </div>
                  <p className="font-medium">
                    {new Date(currentDeployment.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Build Time
                  </div>
                  <p className="font-medium">{currentDeployment.buildTime}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  No deployments yet. Create your first deployment to get
                  started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Deployment Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">
                {project.status === "deployed" ? "99.9%" : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">
                {project.status === "deployed" ? "142ms" : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-400">
                {currentDeployment.size}
              </div>
              <p className="text-xs text-muted-foreground">Bundle Size</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
