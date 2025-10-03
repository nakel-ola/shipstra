"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings,
  Plus,
  Trash2,
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useGitHubApp } from "@/hooks/use-github-app";
import {
  ProjectDetailsData,
  SourceCodeData,
} from "./use-create-project-wizard";

const projectDetailsSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(50, "Project name must be less than 50 characters"),
  branch: z.string().min(1, "Branch is required"),
  rootDirectory: z.string().optional(),
  buildCommand: z.string().min(1, "Build command is required"),
  autoDeploy: z.enum(["commit", "pr", "disabled"]),
});

type ProjectDetailsFormData = z.infer<typeof projectDetailsSchema>;

interface ProjectDetailsStepProps {
  sourceCodeData: SourceCodeData;
  data: ProjectDetailsData;
  onUpdate: (data: Partial<ProjectDetailsData>) => void;
  onNext: () => void;
  onPrev: () => void;
  addEnvironmentVariable: () => void;
  updateEnvironmentVariable: (
    index: number,
    key: string,
    value: string
  ) => void;
  removeEnvironmentVariable: (index: number) => void;
  importFromEnv: (content: string) => void;
}

export function ProjectDetailsStep({
  sourceCodeData,
  data,
  onUpdate,
  onNext,
  onPrev,
  addEnvironmentVariable,
  updateEnvironmentVariable,
  removeEnvironmentVariable,
  importFromEnv,
}: ProjectDetailsStepProps) {
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [envImportContent, setEnvImportContent] = useState("");
  const [showEnvImportDialog, setShowEnvImportDialog] = useState(false);

  const { toast } = useToast();
  const { fetchBranches } = useGitHubApp();

  const form = useForm<ProjectDetailsFormData>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      projectName: data.projectName,
      branch: data.branch,
      rootDirectory: data.rootDirectory || "",
      buildCommand: data.buildCommand,
      autoDeploy: data.autoDeploy,
    },
  });

  // Fetch branches when GitHub repo is selected
  useEffect(() => {
    if (sourceCodeData.type === "github" && sourceCodeData.githubRepo) {
      fetchRepositoryBranches();
    }
  }, [sourceCodeData]);

  const fetchRepositoryBranches = async () => {
    if (!sourceCodeData.githubRepo) return;

    setIsLoadingBranches(true);
    try {
      const [owner, repo] = sourceCodeData.githubRepo.full_name.split("/");
      const branchData = await fetchBranches(owner, repo);
      console.log({ sourceCodeData });

      const branchNames = branchData.map((branch) => branch.name);
      setBranches(branchNames);

      // Set default branch if not already set
      if (!data.branch || data.branch === "main") {
        const defaultBranch = sourceCodeData.githubRepo.default_branch;
        form.setValue("branch", defaultBranch);
        onUpdate({ branch: defaultBranch });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch branches",
        description:
          "Could not load repository branches. Using default branch.",
      });
      setBranches([sourceCodeData.githubRepo.default_branch]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Detect build command based on project name or structure
  const detectBuildCommand = (projectName: string): string => {
    const name = projectName.toLowerCase();
    if (name.includes("next") || name.includes("react")) {
      return "npm run build";
    }
    if (name.includes("nest") || name.includes("express")) {
      return "npm run build";
    }
    if (name.includes("vue")) {
      return "npm run build";
    }
    if (name.includes("angular")) {
      return "ng build";
    }
    return "npm run build";
  };

  const onSubmit = (formData: ProjectDetailsFormData) => {
    onUpdate({
      projectName: formData.projectName,
      branch: formData.branch,
      rootDirectory: formData.rootDirectory,
      buildCommand: formData.buildCommand,
      autoDeploy: formData.autoDeploy,
    });
    onNext();
  };

  const handleEnvImport = () => {
    if (envImportContent.trim()) {
      importFromEnv(envImportContent);
      setEnvImportContent("");
      setShowEnvImportDialog(false);
      toast({
        title: "Environment variables imported",
        description:
          "Successfully imported environment variables from .env content.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Project Details</h2>
        <p className="text-muted-foreground">
          Configure your project settings and deployment preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="my-awesome-project"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      onChange={(e) => {
                        field.onChange(e);
                        onUpdate({ projectName: e.target.value });

                        // Auto-detect build command
                        const detectedCommand = detectBuildCommand(
                          e.target.value
                        );
                        if (
                          form.getValues("buildCommand") === "npm run build"
                        ) {
                          form.setValue("buildCommand", detectedCommand);
                          onUpdate({ buildCommand: detectedCommand });
                        }
                      }}
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

            {/* Branch */}
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    {sourceCodeData.type === "github" && branches.length > 0 ? (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          onUpdate({ branch: value });
                        }}
                        disabled={isLoadingBranches}
                      >
                        <SelectTrigger className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300">
                          <SelectValue
                            placeholder={
                              isLoadingBranches
                                ? "Loading branches..."
                                : "Select a branch"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4" />
                                {branch}
                                {branch ===
                                  sourceCodeData.githubRepo?.default_branch && (
                                  <span className="text-xs text-muted-foreground">
                                    (default)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...field}
                        placeholder="main"
                        className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        onChange={(e) => {
                          field.onChange(e);
                          onUpdate({ branch: e.target.value });
                        }}
                      />
                    )}
                  </FormControl>
                  <FormDescription>
                    {sourceCodeData.type === "github"
                      ? "Select the branch to deploy from."
                      : "Enter the branch name to deploy from."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Root Directory */}
            <FormField
              control={form.control}
              name="rootDirectory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root Directory (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., apps/web"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      onChange={(e) => {
                        field.onChange(e);
                        onUpdate({ rootDirectory: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The directory where your project is located (leave empty for
                    root).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Build Command */}
            <FormField
              control={form.control}
              name="buildCommand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Build Command</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="npm run build"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      onChange={(e) => {
                        field.onChange(e);
                        onUpdate({ buildCommand: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The command to build your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Auto Deploy */}
          <FormField
            control={form.control}
            name="autoDeploy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto Deploy</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value: "commit" | "pr" | "disabled") => {
                      field.onChange(value);
                      onUpdate({ autoDeploy: value });
                    }}
                  >
                    <SelectTrigger className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commit">On every commit</SelectItem>
                      <SelectItem value="pr">On pull request open</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Choose when to automatically deploy your project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Environment Variables
                </span>
                <div className="flex gap-2">
                  <Dialog
                    open={showEnvImportDialog}
                    onOpenChange={setShowEnvImportDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" type="button">
                        <FileText className="w-4 h-4 mr-2" />
                        Import from .env
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import from .env file</DialogTitle>
                        <DialogDescription>
                          Paste the contents of your .env file to import
                          environment variables.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder={`NODE_ENV=production\nAPI_URL=https://api.example.com\nDATABASE_URL=postgresql://...`}
                          value={envImportContent}
                          onChange={(e) => setEnvImportContent(e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowEnvImportDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEnvImport}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import Variables
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEnvironmentVariable}
                    type="button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Set environment variables for your project deployment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.environmentVariables.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No environment variables configured</p>
                  <p className="text-sm">
                    Click &quot;Add Variable&quot; to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.environmentVariables.map((envVar, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="KEY"
                        value={envVar.key}
                        onChange={(e) =>
                          updateEnvironmentVariable(
                            index,
                            e.target.value,
                            envVar.value
                          )
                        }
                        className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      />
                      <Input
                        placeholder="value"
                        value={envVar.value}
                        onChange={(e) =>
                          updateEnvironmentVariable(
                            index,
                            envVar.key,
                            e.target.value
                          )
                        }
                        className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeEnvironmentVariable(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
            >
              Deploy Project
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}