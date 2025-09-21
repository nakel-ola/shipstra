"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and experimentation",
    icon: Zap,
    features: [
      "2 projects",
      "Basic deployments",
      "Community support",
      "SSL certificates",
      "Basic monitoring",
    ],
    buttonText: "Start Free",
    buttonVariant: "outline-solid" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Everything you need for professional development",
    icon: Crown,
    features: [
      "Unlimited projects",
      "PR previews",
      "Advanced monitoring",
      "Priority support",
      "Custom domains",
      "Team collaboration",
      "Advanced rollbacks",
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "hero" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large teams with advanced requirements",
    icon: Building,
    features: [
      "Everything in Pro",
      "SSO integration",
      "Advanced security",
      "SLA guarantees",
      "Custom integrations",
      "Dedicated support",
      "Training sessions",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline-solid" as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="py-16 lg:py-24" id="pricing">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Simple{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and scale as you
            grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden p-8 bg-card/50 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-500 animate-fade-in-${
                index + 1
              } ${plan.popular ? "border-primary/50 shadow-glow" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-px left-4 right-4 h-px bg-gradient-primary" />
              )}

              {plan.popular && (
                <div className="absolute top-4 right-4 bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-r ${
                      plan.popular
                        ? "from-primary to-primary-glow"
                        : "from-muted to-accent/20"
                    } flex items-center justify-center`}
                  >
                    <plan.icon
                      className={`h-6 w-6 ${
                        plan.popular
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-display">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        / {plan.period}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            All plans include 14-day free trial. No credit card required. Cancel
            anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
