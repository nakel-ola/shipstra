import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  GitBranch,
  Server,
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectSettingsTabProps {
  project: Project;
  deployments?: Deployment[];
  deploymentsLoading?: boolean;
  onCreateDeployment?: () => Promise<Deployment | null>;
  onUpdateProject?: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectSettingsTab = ({
  project,
  onUpdateProject,
}: ProjectSettingsTabProps) => {
  const { toast } = useToast();
  const [envVars, setEnvVars] = useState([
    { key: "DATABASE_URL", value: "postgresql://...", isSecret: true },
    { key: "API_KEY", value: "sk_test_...", isSecret: true },
    { key: "NODE_ENV", value: "production", isSecret: false },
  ]);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    repository_url: project.repository_url || "",
    build_command: project.build_command,
    output_directory: project.output_directory,
    domain: project.domain || "",
  });

  const handleSave = async () => {
    if (!onUpdateProject) {
      toast({
        title: "Error",
        description: "Unable to save settings.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await onUpdateProject(formData);
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your project settings have been updated successfully.",
        });
      }
    } catch  {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "", isSecret: false }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const toggleSecretVisibility = (index: number) => {
    setShowSecrets((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Repository Settings */}
      <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository
          </CardTitle>
          <CardDescription>Configure your repository settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="backdrop-blur-md bg-glass/50 border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                value={formData.repository_url}
                onChange={(e) =>
                  setFormData({ ...formData, repository_url: e.target.value })
                }
                className="backdrop-blur-md bg-glass/50 border-glass-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="backdrop-blur-md bg-glass/50 border-glass-border"
              placeholder="Project description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Runtime Settings */}
      <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Runtime
          </CardTitle>
          <CardDescription>Configure runtime environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="build-command">Build Command</Label>
              <Input
                id="build-command"
                value={formData.build_command}
                onChange={(e) =>
                  setFormData({ ...formData, build_command: e.target.value })
                }
                className="backdrop-blur-md bg-glass/50 border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-dir">Output Directory</Label>
              <Input
                id="output-dir"
                value={formData.output_directory}
                onChange={(e) =>
                  setFormData({ ...formData, output_directory: e.target.value })
                }
                className="backdrop-blur-md bg-glass/50 border-glass-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Custom Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
              className="backdrop-blur-md bg-glass/50 border-glass-border"
              placeholder="example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card className="backdrop-blur-md bg-glass/60 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Environment Variables
            </div>
            <Button
              onClick={addEnvVar}
              size="sm"
              variant="outline"
              className="backdrop-blur-md bg-glass/50 border-glass-border hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </CardTitle>
          <CardDescription>
            Manage environment variables for your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {envVars.map((envVar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end"
            >
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={envVar.key}
                  onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                  placeholder="VARIABLE_NAME"
                  className="backdrop-blur-md bg-glass/50 border-glass-border"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Value</Label>
                <div className="relative">
                  <Input
                    type={
                      envVar.isSecret && !showSecrets[index]
                        ? "password"
                        : "text"
                    }
                    value={envVar.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    placeholder="Variable value"
                    className="backdrop-blur-md bg-glass/50 border-glass-border pr-10"
                  />
                  {envVar.isSecret && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => toggleSecretVisibility(index)}
                    >
                      {showSecrets[index] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => removeEnvVar(index)}
                  size="sm"
                  variant="outline"
                  className="backdrop-blur-md bg-glass/50 border-glass-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
