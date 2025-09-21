"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    content:
      "DeployVPS transformed our deployment process. We went from 30-minute deployments to 30 seconds, all on our own infrastructure.",
    author: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "/placeholder.svg",
    initials: "SC",
  },
  {
    content:
      "Finally, a deployment platform that doesn't lock us into their ecosystem. Full control over our infrastructure with zero complexity.",
    author: "Marcus Rodriguez",
    role: "Lead DevOps at StartupCo",
    avatar: "/placeholder.svg",
    initials: "MR",
  },
  {
    content:
      "The PR preview feature alone saved us countless hours of manual testing. Game-changer for our development workflow.",
    author: "Emily Watson",
    role: "Engineering Manager at DataLabs",
    avatar: "/placeholder.svg",
    initials: "EW",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-mesh">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Loved by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              developers
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of teams who&apos;ve made the switch to self-hosted
            deployments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.author}
              className={`p-6 bg-card/50 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-500 animate-fade-in-${
                index + 1
              }`}
            >
              <div className="space-y-4">
                <blockquote className="text-foreground leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </blockquote>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.author}
                    />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
