"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const examples = {
  "Next.js": `// deployops.config.js
export default {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  distDir: '.next',
  env: {
    NODE_ENV: 'production'
  },
  domains: ['myapp.com']
}`,
  "NestJS": `// deployops.config.js
export default {
  framework: 'nestjs',
  buildCommand: 'npm run build',
  startCommand: 'npm run start:prod',
  port: 3000,
  env: {
    NODE_ENV: 'production'
  }
}`,
};

export function CodeExample() {
  const [activeTab, setActiveTab] = useState<keyof typeof examples>("Next.js");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(examples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Configuration made{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              simple
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Just one config file. That&apos;s all you need to deploy any application to your VPS.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-glass-border shadow-glass">
            {/* Tab Headers */}
            <div className="flex border-b border-glass-border bg-muted/20">
              {Object.keys(examples).map((framework) => (
                <button
                  key={framework}
                  onClick={() => setActiveTab(framework as keyof typeof examples)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === framework
                      ? "text-primary bg-background/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {framework}
                  {activeTab === framework && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                <code className="text-foreground whitespace-pre">
                  {examples[activeTab]}
                </code>
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}