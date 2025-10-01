import { Card } from "@/components/ui/card";
import { Zap, GitBranch, RotateCcw, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "One-Click Deploy",
    description:
      "Push your code and watch it deploy instantly to your VPS. No configuration needed, just pure speed.",
    gradient: "from-primary to-primary-glow",
  },
  {
    icon: GitBranch,
    title: "PR Previews",
    description:
      "Every pull request gets its own preview environment. Test changes before they hit production.",
    gradient: "from-accent to-accent-glow",
  },
  {
    icon: RotateCcw,
    title: "Instant Rollback",
    description:
      "Made a mistake? Roll back to any previous deployment with a single click. Zero downtime guaranteed.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Logs & Metrics",
    description:
      "Monitor your applications with real-time logs, performance metrics, and uptime tracking.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export function FeatureCards() {
  return (
    <section className="py-16 lg:py-24" id="features">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Everything you need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              deploy fast
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of modern deployment tools on your own
            infrastructure. No vendor lock-in, no surprises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`group relative overflow-hidden bg-card/50 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-500 animate-fade-in-${
                index + 1
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Icon with gradient background */}
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg font-display group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
