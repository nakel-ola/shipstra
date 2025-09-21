import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Github, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { SuccessCard } from "./success-card";
import Link from "next/link";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    teamName: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export const FormSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      teamName: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;

      // Split full name into first and last name
      const nameParts = data.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            team_name: data.teamName || null,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
      } else {
        setShowSuccess(true);
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setIsGitHubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "GitHub sign up failed",
          description: error.message,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const isFormValid = form.formState.isValid && !isLoading;

  if (showSuccess) {
    return <SuccessCard />;
  }

  return (
    <Card className="backdrop-blur-md bg-glass border-glass-border shadow-glass">
      <CardHeader className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CardTitle className="text-2xl font-display font-bold">
            Create your account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Start deploying to your VPS in minutes.
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* GitHub OAuth Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button
            variant="outline"
            type="button"
            className="w-full h-12 border-glass-border bg-glass/50 hover:bg-glass hover:shadow-glow transition-all duration-300 group"
            onClick={handleGitHubSignUp}
            disabled={isGitHubLoading}
          >
            {isGitHubLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            Continue with GitHub
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-glass-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </motion.div>

        {/* Sign up Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm animate-pulse" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm animate-pulse" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Create a strong password"
                        type="password"
                        className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <PasswordStrengthMeter password={password} />
                    <FormMessage className="text-destructive text-sm animate-pulse" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm animate-pulse" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your team or company name"
                        className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm animate-pulse" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-glass-border p-4 bg-glass/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I accept the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:text-primary-glow transition-colors"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:text-primary-glow transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-12 bg-gradient-primary hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>

        {/* Sign in link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-primary hover:text-primary-glow transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
