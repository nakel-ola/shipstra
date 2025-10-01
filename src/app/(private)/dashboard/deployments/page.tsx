"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useDeployments } from "@/hooks/use-deployments";
import { formatDistanceToNow } from "date-fns";

const Deployments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const { deployments, loading, projects } = useDeployments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "queued":
        return <Clock className="w-4 h-4" />;
      case "running":
        return <Loader className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
      case "queued":
        return "bg-muted/60 text-muted-foreground border-muted";
      case "running":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse shadow-glow";
      case "success":
        return "bg-green-500/20 text-green-300 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
      case "rolled_back":
        return "bg-violet-500/20 text-violet-300 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]";
      default:
        return "bg-muted/60 text-muted-foreground border-muted";
    }
  };

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesSearch =
      deployment.projects?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      deployment.commit_hash
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      deployment.branch?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || deployment.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || deployment.project_id === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  const getDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return "Running...";
    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Deployments
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all your project deployments
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-primary shadow-glow hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Deploy New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-glass/95 backdrop-blur-xl border-glass-border">
            <DialogHeader>
              <DialogTitle>Deploy New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger className="bg-glass/50 border-glass-border">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Branch (default: main)"
                className="bg-glass/50 border-glass-border"
              />
              <Button className="w-full bg-gradient-primary">
                Start Deployment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-glass/60 backdrop-blur-xl border-glass-border shadow-glow">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search deployments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-glass/50 border-glass-border"
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-glass/50 border-glass-border">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-glass/50 border-glass-border">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="rolled_back">Rolled Back</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deployments Table */}
      <Card className="bg-glass/60 backdrop-blur-xl border-glass-border shadow-glow overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            Recent Deployments ({filteredDeployments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead>Project</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-glass-border">
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-glass/30 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredDeployments.length > 0 ? (
                  filteredDeployments.map((deployment, index) => (
                    <motion.tr
                      key={deployment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-glass-border hover:bg-glass/30 transition-all duration-200 group cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {deployment.projects?.name || "Unknown Project"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-glass/30 border-glass-border"
                        >
                          {deployment.branch || "main"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-glass/30 px-2 py-1 rounded">
                          {deployment.commit_hash?.substring(0, 8) || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 ${getStatusBadgeClass(
                            deployment.status
                          )}`}
                        >
                          {getStatusIcon(deployment.status)}
                          {deployment.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {deployment.started_at
                          ? formatDistanceToNow(
                              new Date(deployment.started_at),
                              { addSuffix: true }
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getDuration(
                          deployment.started_at || deployment.created_at,
                          deployment.finished_at
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-glass/50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {deployment.status === "success" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-glass/50"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                          <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">No deployments yet</p>
                          <p className="text-sm">
                            Start your first deployment to see it here
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deployments;
