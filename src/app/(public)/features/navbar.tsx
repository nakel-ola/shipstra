"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Zap, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border backdrop-blur-xl bg-glass/80 supports-[backdrop-filter]:bg-glass/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display">DeployVPS</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Features
          </a>
          <a
            href="#docs"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Docs
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Pricing
          </a>
          <ThemeToggle />
          {user ? (
            <Button variant="hero" size="sm" className="shadow-glow" asChild>
              <Link href="/dashboard">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button variant="hero" size="sm" className="shadow-glow" asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-glass-border bg-glass/95 backdrop-blur-xl">
          <div className="container py-4 space-y-4">
            <a
              href="#features"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#docs"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
            <a
              href="#pricing"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <div className="flex items-center justify-between pt-2 pb-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="pt-2 space-y-2">
              {user ? (
                <Button
                  variant="hero"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                  <Button variant="hero" size="sm" className="w-full" asChild>
                    <Link href="/auth/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
