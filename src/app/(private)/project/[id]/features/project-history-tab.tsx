import { motion } from "framer-motion";
import {
  RotateCcw,
  Calendar,
  GitCommit,
  Clock,
  MoreHorizontal,
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectHistoryTabProps {
  project: Project;
  deployments?: Deployment[];
  deploymentsLoading?: boolean;
  onCreateDeployment?: () => Promise<Deployment | null>;
  onUpdateProject?: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectHistoryTab = ({
  deployments = [],
  deploymentsLoading = false,
}: ProjectHistoryTabProps) => {
  const { toast } = useToast();

  const handleRollback = (deploymentId: string) => {
    toast({
      title: "Rollback Initiated",
      description: `Rolling back to deployment ${deploymentId}...`,
    });
  };

  // Use real deployments or fallback to mock data
  const displayDeployments =
    deployments.length > 0
      ? deployments.map((dep) => ({
          id: dep.id,
          commit: dep.commit_hash || "No commit message",
          hash: dep.commit_hash?.substring(0, 7) || "unknown",
          branch: dep.branch,
          status: dep.status,
          date: dep.deployed_at || dep.created_at,
          duration:
            dep.finished_at && dep.started_at
              ? Math.ceil(
                  (new Date(dep.finished_at).getTime() -
                    new Date(dep.started_at).getTime()) /
                    1000
                ) + "s"
              : "N/A",
          author: "System",
        }))
      : [
          {
            id: "mock_1",
            commit: "Initial deployment",
            hash: "a1b2c3d",
            branch: "main",
            status: "deployed",
            date: new Date().toISOString(),
            duration: "1m 30s",
            author: "System",
          },
        ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shadow-glow-green">
            Deployed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 shadow-glow-red">
            Failed
          </Badge>
        );
      case "building":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
            Building
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deployment History
          </CardTitle>
          <CardDescription>
            View and manage your deployment history
            {deploymentsLoading && " (Loading...)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-glass-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-glass-border">
                  <TableHead>Commit</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayDeployments.map((deployment, index) => (
                  <motion.tr
                    key={deployment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-white/5 border-glass-border transition-colors"
                  >
                    <TableCell className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{deployment.commit}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {deployment.hash}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="backdrop-blur-md bg-glass/50 border-glass-border"
                      >
                        {deployment.branch}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(deployment.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(deployment.date).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>{deployment.duration}</TableCell>
                    <TableCell>{deployment.author}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="backdrop-blur-md bg-glass/95 border-glass-border"
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="cursor-pointer"
                                disabled={deployment.status !== "deployed"}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Rollback
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="backdrop-blur-md bg-glass/95 border-glass-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Rollback
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to rollback to this
                                  deployment? This will revert your project to
                                  the state of commit{" "}
                                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                    {deployment.hash}
                                  </code>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRollback(deployment.id)}
                                  className="bg-gradient-primary hover:shadow-glow"
                                >
                                  Rollback
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
