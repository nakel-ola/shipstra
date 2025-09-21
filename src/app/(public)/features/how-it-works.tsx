"use client";

import { Card } from "@/components/ui/card";
import { Github, Server, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Github,
    title: "Connect GitHub",
    description:
      "Link your GitHub repository with a single click. We support all popular frameworks.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Server,
    title: "Add SSH Credentials",
    description:
      "Securely connect your VPS or dedicated server. Your infrastructure, your control.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Rocket,
    title: "Deploy",
    description:
      "Push your code and watch the magic happen. Automatic builds, testing, and deployment.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-mesh">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Get started in{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              3 simple steps
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to deployed in minutes. No complex configuration, no steep
            learning curve.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center space-y-6 animate-fade-in-up"
            >
              <Card
                className={`p-8 ${step.bgColor} backdrop-blur border-glass-border ${step.borderColor} shadow-glass hover:shadow-glow transition-all duration-500 group`}
              >
                <div className="text-center space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl font-display">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Arrow connector (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute translate-x-24 lg:translate-x-32">
                  <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
