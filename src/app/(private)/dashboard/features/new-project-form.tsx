"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Github, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/use-projects";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { GitHubConnectModal } from "@/components/github/github-connect-modal";

const githubSchema = z.object({
  repository: z.string().min(1, "Please select a GitHub repository"),
  projectName: z.string().min(1, "Project name is required"),
  buildCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
});

const manualSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  sourceUrl: z.string().url("Please enter a valid source URL"),
  buildCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
});

type GitHubFormData = z.infer<typeof githubSchema>;
type ManualFormData = z.infer<typeof manualSchema>;

interface NewProjectFormProps {
  type: "github" | "manual";
  onSuccess?: () => void;
}

export const NewProjectForm = ({ type, onSuccess }: NewProjectFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showGitHubConnect, setShowGitHubConnect] = useState(false);
  const { toast } = useToast();
  const { createProject } = useProjects();

  const schema = type === "github" ? githubSchema : manualSchema;

  const {
    repositories,
    isLoading: isLoadingRepos,
    isConnected,
    refreshAll,
  } = useGitHubRepos();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: "",
      repository: type === "github" ? "" : undefined,
      sourceUrl: type === "manual" ? "" : undefined,
      buildCommand: "npm run build",
      outputDirectory: "dist",
    },
  });

  const onSubmit = async (data: GitHubFormData | ManualFormData) => {
    setIsLoading(true);

    try {
      let repositoryUrl: string | undefined;

      if (type === "github") {
        const gitHubData = data as GitHubFormData;
        const selectedRepo = repositories.find(
          (repo) => repo.full_name === gitHubData.repository
        );
        repositoryUrl = selectedRepo?.html_url;
      } else {
        repositoryUrl = undefined;
      }

      const projectInput = {
        name: data.projectName,
        repositoryUrl,
        sourceUrl:
          type === "manual" ? (data as ManualFormData).sourceUrl : undefined,
        buildCommand: data.buildCommand,
        outputDirectory: data.outputDirectory,
      };

      const result = await createProject(projectInput);

      if (result) {
        form.reset();
        onSuccess?.();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to create project",
        description:
          "There was an error creating your project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header with icon */}
          <div className="flex items-center gap-3 pb-4 border-b border-glass-border">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              {type === "github" ? (
                <Github className="w-4 h-4 text-primary" />
              ) : (
                <LinkIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {type === "github" ? "Import from GitHub" : "Deploy from URL"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {type === "github"
                  ? "Connect your GitHub repository for automatic deployments"
                  : "Deploy from any public Git repository or archive URL"}
              </p>
            </div>
          </div>

          {/* Project Name */}
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-awesome-project"
                    className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be used as the project identifier and deployment
                  URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Repository/Source URL */}
          <FormField
            control={form.control}
            name={type === "github" ? "repository" : "sourceUrl"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {type === "github" ? "GitHub Repository" : "Source URL"}
                </FormLabel>
                <FormControl>
                  {type === "github" ? (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading || isLoadingRepos}
                    >
                      <SelectTrigger className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300">
                        <SelectValue
                          placeholder={
                            !isConnected
                              ? "Connect GitHub account first"
                              : isLoadingRepos
                              ? "Loading repositories..."
                              : "Select a repository"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {!isConnected ? (
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-center text-muted-foreground">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              GitHub account not connected
                            </div>
                            <Button
                              onClick={() => setShowGitHubConnect(true)}
                              size="sm"
                              className="w-full bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                            >
                              <Github className="w-4 h-4 mr-2" />
                              Connect GitHub Account
                            </Button>
                          </div>
                        ) : repositories.length === 0 ? (
                          <div className="flex items-center justify-center py-4 text-muted-foreground">
                            No repositories found
                          </div>
                        ) : (
                          repositories.map((repo) => (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{repo.name}</span>
                                {repo.private && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                    Private
                                  </span>
                                )}
                              </div>
                              {repo.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {repo.description}
                                </div>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="https://github.com/username/repository.git"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      {...field}
                    />
                  )}
                </FormControl>
                <FormDescription>
                  {type === "github"
                    ? isConnected
                      ? "Select a repository from your GitHub account to deploy."
                      : "Connect your GitHub account in settings to access your repositories."
                    : "Public Git repository or archive URL to deploy from."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Build Settings */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buildCommand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Build Command</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="npm run build"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Command to build your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputDirectory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Directory</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="dist"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Directory containing build output.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || isLoading}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <GitHubConnectModal
        open={showGitHubConnect}
        onOpenChange={setShowGitHubConnect}
        onSuccess={async () => {
          await refreshAll();
          toast({
            title: "GitHub Connected",
            description: "You can now select from your GitHub repositories.",
          });
        }}
      />
    </motion.div>
  );
};
