"use client";

import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const navigation = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Changelog", href: "#" },
    { name: "Roadmap", href: "#" },
  ],
  support: [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#" },
    { name: "Guides", href: "#" },
    { name: "Help Center", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Security", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Status", href: "#" },
    { name: "DPA", href: "#" },
  ],
};

const social = [
  { name: "GitHub", href: "#", icon: Github },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "LinkedIn", href: "#", icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="border-t border-glass-border bg-card/20 backdrop-blur">
      <div className="container">
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">DeployVPS</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Deploy to your own VPS with the simplicity of modern platforms. 
              Your infrastructure, your control, zero vendor lock-in.
            </p>
            <div className="flex space-x-4">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-glass-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 DeployVPS. All rights reserved.
          </p>
          <div className="flex gap-6">
            {navigation.legal.map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}