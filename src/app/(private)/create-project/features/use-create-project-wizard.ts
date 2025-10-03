"use client";

import { useState, useCallback } from "react";

export type WizardStep = 1 | 2 | 3;

export interface SourceCodeData {
  type: "github" | "public" | null;
  githubRepo?: {
    id: number;
    name: string;
    full_name: string;
    owner: string;
    default_branch: string;
    clone_url: string;
    html_url: string;
  };
  publicRepoUrl?: string;
}

export interface ProjectDetailsData {
  projectName: string;
  branch: string;
  rootDirectory?: string;
  buildCommand: string;
  environmentVariables: Array<{ key: string; value: string }>;
  autoDeploy: "commit" | "pr" | "disabled";
}

export interface DeploymentData {
  status: "idle" | "building" | "success" | "failed";
  logs: string[];
  deployedUrl?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface WizardData {
  sourceCode: SourceCodeData;
  projectDetails: ProjectDetailsData;
  deployment: DeploymentData;
}

const initialSourceCodeData: SourceCodeData = {
  type: null,
};

const initialProjectDetailsData: ProjectDetailsData = {
  projectName: "",
  branch: "main",
  rootDirectory: "",
  buildCommand: "npm run build",
  environmentVariables: [],
  autoDeploy: "commit",
};

const initialDeploymentData: DeploymentData = {
  status: "idle",
  logs: [],
};

export function useCreateProjectWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    sourceCode: initialSourceCodeData,
    projectDetails: initialProjectDetailsData,
    deployment: initialDeploymentData,
  });

  const updateSourceCodeData = useCallback((data: Partial<SourceCodeData>) => {
    setWizardData((prev) => ({
      ...prev,
      sourceCode: { ...prev.sourceCode, ...data },
    }));
  }, []);

  const updateProjectDetailsData = useCallback((data: Partial<ProjectDetailsData>) => {
    setWizardData((prev) => ({
      ...prev,
      projectDetails: { ...prev.projectDetails, ...data },
    }));
  }, []);

  const updateDeploymentData = useCallback((data: Partial<DeploymentData>) => {
    setWizardData((prev) => ({
      ...prev,
      deployment: { ...prev.deployment, ...data },
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3) as WizardStep);
  }, []);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as WizardStep);
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setWizardData({
      sourceCode: initialSourceCodeData,
      projectDetails: initialProjectDetailsData,
      deployment: initialDeploymentData,
    });
  }, []);

  const canGoToNextStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return wizardData.sourceCode.type !== null &&
               (wizardData.sourceCode.type === "public"
                ? !!wizardData.sourceCode.publicRepoUrl
                : !!wizardData.sourceCode.githubRepo);
      case 2:
        return !!wizardData.projectDetails.projectName &&
               !!wizardData.projectDetails.branch;
      case 3:
        return false; // No next step after deployment
      default:
        return false;
    }
  }, [currentStep, wizardData]);

  const canGoToPrevStep = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  const addEnvironmentVariable = useCallback(() => {
    updateProjectDetailsData({
      environmentVariables: [
        ...wizardData.projectDetails.environmentVariables,
        { key: "", value: "" },
      ],
    });
  }, [wizardData.projectDetails.environmentVariables, updateProjectDetailsData]);

  const updateEnvironmentVariable = useCallback((index: number, key: string, value: string) => {
    const newEnvVars = [...wizardData.projectDetails.environmentVariables];
    newEnvVars[index] = { key, value };
    updateProjectDetailsData({ environmentVariables: newEnvVars });
  }, [wizardData.projectDetails.environmentVariables, updateProjectDetailsData]);

  const removeEnvironmentVariable = useCallback((index: number) => {
    const newEnvVars = wizardData.projectDetails.environmentVariables.filter((_, i) => i !== index);
    updateProjectDetailsData({ environmentVariables: newEnvVars });
  }, [wizardData.projectDetails.environmentVariables, updateProjectDetailsData]);

  const importFromEnv = useCallback((envContent: string) => {
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const envVars = lines.map(line => {
      const [key, ...valueParts] = line.split('=');
      return { key: key.trim(), value: valueParts.join('=').trim() };
    }).filter(({ key }) => key);

    updateProjectDetailsData({ environmentVariables: envVars });
  }, [updateProjectDetailsData]);

  return {
    // State
    currentStep,
    wizardData,

    // Navigation
    goToNextStep,
    goToPrevStep,
    goToStep,
    resetWizard,
    canGoToNextStep: canGoToNextStep(),
    canGoToPrevStep: canGoToPrevStep(),

    // Data updates
    updateSourceCodeData,
    updateProjectDetailsData,
    updateDeploymentData,

    // Environment variables helpers
    addEnvironmentVariable,
    updateEnvironmentVariable,
    removeEnvironmentVariable,
    importFromEnv,
  };
}