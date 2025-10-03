"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateProjectWizard } from "./use-create-project-wizard";
import { SourceCodeStep } from "./source-code-step";
import { ProjectDetailsStep } from "./project-details-step";
import { DeploymentStep } from "./deployment-step";

const steps = [
  {
    number: 1,
    title: "Get Source Code",
    description: "Connect your repository",
  },
  {
    number: 2,
    title: "Project Details",
    description: "Configure your project",
  },
  {
    number: 3,
    title: "Deployment",
    description: "Deploy to production",
  },
];

export function CreateProjectWizard() {
  const {
    currentStep,
    wizardData,
    goToNextStep,
    goToPrevStep,
    resetWizard,
    updateSourceCodeData,
    updateProjectDetailsData,
    updateDeploymentData,
    addEnvironmentVariable,
    updateEnvironmentVariable,
    removeEnvironmentVariable,
    importFromEnv,
  } = useCreateProjectWizard();

  const handleProjectNameUpdate = (name: string) => {
    updateProjectDetailsData({ projectName: name });
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        getStepStatus(step.number) === "completed"
                          ? "bg-green-500 text-white"
                          : getStepStatus(step.number) === "active"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getStepStatus(step.number) === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : getStepStatus(step.number) === "active" ? (
                        <Circle className="w-5 h-5 fill-current" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <Separator
                      className={`mx-4 w-16 h-px transition-all duration-300 ${
                        getStepStatus(step.number) === "completed"
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                      orientation="horizontal"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <SourceCodeStep
                  data={wizardData.sourceCode}
                  onUpdate={updateSourceCodeData}
                  onNext={goToNextStep}
                  onProjectNameUpdate={handleProjectNameUpdate}
                />
              )}

              {currentStep === 2 && (
                <ProjectDetailsStep
                  sourceCodeData={wizardData.sourceCode}
                  data={wizardData.projectDetails}
                  onUpdate={updateProjectDetailsData}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                  addEnvironmentVariable={addEnvironmentVariable}
                  updateEnvironmentVariable={updateEnvironmentVariable}
                  removeEnvironmentVariable={removeEnvironmentVariable}
                  importFromEnv={importFromEnv}
                />
              )}

              {currentStep === 3 && (
                <DeploymentStep
                  sourceCodeData={wizardData.sourceCode}
                  projectDetailsData={wizardData.projectDetails}
                  data={wizardData.deployment}
                  onUpdate={updateDeploymentData}
                  onReset={resetWizard}
                />
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-8 opacity-50 hover:opacity-100 transition-opacity">
            <CardContent className="p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Debug Info (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(
                    {
                      currentStep,
                      sourceCode: wizardData.sourceCode,
                      projectDetails: wizardData.projectDetails,
                      deployment: {
                        ...wizardData.deployment,
                        logs: `${wizardData.deployment.logs.length} logs`,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}