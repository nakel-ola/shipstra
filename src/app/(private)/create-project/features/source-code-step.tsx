"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, GitBranch, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGitHubApp } from "@/hooks/use-github-app";
import { SourceCodeData } from "./use-create-project-wizard";

interface SourceCodeStepProps {
  data: SourceCodeData;
  onUpdate: (data: Partial<SourceCodeData>) => void;
  onNext: () => void;
  onProjectNameUpdate: (name: string) => void;
}

const validatePublicRepoUrl = (url: string): boolean => {
  const pattern = /^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/.+\/.+/;
  return pattern.test(url);
};

export function SourceCodeStep({ data, onUpdate, onNext, onProjectNameUpdate }: SourceCodeStepProps) {
  const [activeTab, setActiveTab] = useState(data.type || "github");
  const [publicRepoUrl, setPublicRepoUrl] = useState(data.publicRepoUrl || "");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const { toast } = useToast();
  const {
    repositories,
    isLoading: isLoadingRepos,
    isConnected,
    installGitHubApp,
  } = useGitHubApp();

  useEffect(() => {
    if (data.type && data.type !== activeTab) {
      setActiveTab(data.type);
    }
  }, [data.type, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "github" | "public");
    onUpdate({ type: value as "github" | "public" });
    setUrlValidationError(null);
  };

  const handleGitHubRepoSelect = (repoFullName: string) => {
    const selectedRepo = repositories.find(repo => repo.full_name === repoFullName);
    if (selectedRepo) {
      const repoData = {
        id: selectedRepo.id,
        name: selectedRepo.name,
        full_name: selectedRepo.full_name,
        owner: selectedRepo.owner.login,
        default_branch: selectedRepo.default_branch,
        clone_url: selectedRepo.clone_url,
        html_url: selectedRepo.html_url,
      };

      onUpdate({
        type: "github",
        githubRepo: repoData,
        publicRepoUrl: undefined,
      });

      // Auto-populate project name
      onProjectNameUpdate(selectedRepo.name);
    }
  };

  const validateAndConnectPublicRepo = async () => {
    if (!publicRepoUrl.trim()) {
      setUrlValidationError("Please enter a repository URL");
      return;
    }

    if (!validatePublicRepoUrl(publicRepoUrl)) {
      setUrlValidationError("Please enter a valid GitHub, GitLab, or Bitbucket URL");
      return;
    }

    setIsValidatingUrl(true);
    setUrlValidationError(null);

    try {
      // Extract repository name from URL for project name
      const urlParts = publicRepoUrl.split('/');
      const repoName = urlParts[urlParts.length - 1].replace('.git', '');

      // Simulate repository validation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      onUpdate({
        type: "public",
        publicRepoUrl,
        githubRepo: undefined,
      });

      // Auto-populate project name
      onProjectNameUpdate(repoName);

      toast({
        title: "Repository Connected",
        description: "Successfully connected to the public repository.",
      });

    } catch {
      setUrlValidationError("Failed to connect to repository. Please check the URL and try again.");
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const canProceed = () => {
    if (data.type === "github") {
      return !!data.githubRepo;
    }
    if (data.type === "public") {
      return !!data.publicRepoUrl && validatePublicRepoUrl(data.publicRepoUrl);
    }
    return false;
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
        <h2 className="text-2xl font-bold">Get Source Code</h2>
        <p className="text-muted-foreground">
          Connect your repository to start deploying your project
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub App
            <Badge variant="secondary" className="text-xs">Recommended</Badge>
          </TabsTrigger>
          <TabsTrigger value="other" disabled className="flex items-center gap-2">
            Other Providers
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Public Git
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub App Integration
              </CardTitle>
              <CardDescription>
                Install and connect our GitHub App to fetch repositories you explicitly grant access to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Install our GitHub App to access repositories you explicitly grant access to
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={installGitHubApp}
                        className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Install GitHub App
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        <p>This will redirect you to GitHub to install our app with repository permissions you choose.</p>
                        <p className="mt-2 text-yellow-600">
                          Note: GitHub App must be configured with proper credentials in environment variables.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    GitHub App installed
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-repo">Select Repository</Label>
                    <Select
                      value={data.githubRepo?.full_name || ""}
                      onValueChange={handleGitHubRepoSelect}
                      disabled={isLoadingRepos}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingRepos
                              ? "Loading repositories..."
                              : "Select a repository"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {repositories.length === 0 ? (
                          <div className="flex items-center justify-center py-4 text-muted-foreground">
                            No repositories found
                          </div>
                        ) : (
                          repositories.map((repo) => (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="font-medium">{repo.name}</div>
                                  {repo.description && (
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                                      {repo.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {repo.private && (
                                    <Badge variant="secondary" className="text-xs">
                                      Private
                                    </Badge>
                                  )}
                                  {repo.language && (
                                    <Badge variant="outline" className="text-xs">
                                      {repo.language}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {data.githubRepo && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Selected: <strong>{data.githubRepo.full_name}</strong>
                        <br />
                        Default branch: <strong>{data.githubRepo.default_branch}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Other Git Providers</CardTitle>
              <CardDescription>
                Support for GitLab and Bitbucket is coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" disabled className="h-20 flex-col gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-orange-600" />
                  </div>
                  <span>GitLab</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </Button>
                <Button variant="outline" disabled className="h-20 flex-col gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Bitbucket</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Public Git Repository
              </CardTitle>
              <CardDescription>
                Enter a public Git URL from GitHub, GitLab, or Bitbucket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/username/repository.git"
                  value={publicRepoUrl}
                  onChange={(e) => {
                    setPublicRepoUrl(e.target.value);
                    setUrlValidationError(null);
                  }}
                  className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                />
                <p className="text-xs text-muted-foreground">
                  Supported: github.com, gitlab.com, bitbucket.org
                </p>
              </div>

              {urlValidationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{urlValidationError}</AlertDescription>
                </Alert>
              )}

              {data.type === "public" && data.publicRepoUrl && !urlValidationError && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Repository URL validated successfully
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={validateAndConnectPublicRepo}
                disabled={!publicRepoUrl.trim() || isValidatingUrl}
                className="w-full"
              >
                {isValidatingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Connect Repository
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
        >
          Continue to Project Details
        </Button>
      </div>

    </motion.div>
  );
}