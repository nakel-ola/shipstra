import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-tight">
              Deploy to your own{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-gradient-shift bg-size-[200%_auto]">
                VPS, instantly.
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Get the Vercel-like experience, but on infrastructure you own.
              Deploy with one click, preview every PR, and scale without limits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              variant="hero"
              size="lg"
              className="shadow-glow hover:shadow-glow transition-all duration-300 animate-pulse-glow"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Free for 2 projects</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Deploy in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Your infrastructure</span>
            </div>
          </div>
        </div>

        {/* Right Column - Terminal Demo */}
        <div className="lg:pl-8 animate-fade-in-up">
          <Card className="bg-card/50 backdrop-blur-sm border-glass-border shadow-glass">
            <div className="p-6 space-y-4">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-glass-border">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">
                  deployment terminal
                </span>
                <div className="flex gap-2 ml-auto">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
              </div>

              {/* Terminal Content */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-primary">$</span>
                  <span>git push origin main</span>
                </div>

                <div className="text-muted-foreground ml-4">
                  <div>🔍 Detecting framework: Next.js</div>
                  <div>📦 Building application...</div>
                  <div>🐳 Creating Docker image...</div>
                  <div>🚀 Deploying to VPS (142.93.45.12)...</div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="h-4 w-4 text-success animate-bounce-in" />
                  <span className="text-success font-medium">
                    Deployment successful!
                  </span>
                </div>

                <div className="text-muted-foreground text-xs">
                  <div>📍 Live at: https://my-app.yourdomain.com</div>
                  <div>⚡ Deployed in 23 seconds</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
