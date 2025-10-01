"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Github, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const githubSchema = z.object({
  repositoryUrl: z.string().url("Please enter a valid GitHub repository URL"),
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
  const { toast } = useToast();
  const { createProject } = useProjects();

  const schema = type === "github" ? githubSchema : manualSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: "",
      repositoryUrl: "",
      sourceUrl: "",
      buildCommand: "npm run build",
      outputDirectory: "dist",
    },
  });

  const onSubmit = async (data: GitHubFormData | ManualFormData) => {
    setIsLoading(true);

    try {
      const projectInput = {
        name: data.projectName,
        repositoryUrl:
          type === "github"
            ? (data as GitHubFormData).repositoryUrl
            : undefined,
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
    } catch (error) {
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
            name={type === "github" ? "repositoryUrl" : "sourceUrl"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {type === "github" ? "GitHub Repository" : "Source URL"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      type === "github"
                        ? "https://github.com/username/repository"
                        : "https://github.com/username/repository.git"
                    }
                    className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {type === "github"
                    ? "The GitHub repository URL to deploy from."
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
    </motion.div>
  );
};
