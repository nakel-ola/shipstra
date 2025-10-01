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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export const FormSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const { toast } = useToast();
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: result.error.message,
        });
      } 
      else if (result.requires2FA) {
        router.push(
          `/auth/verify-2fa?email=${encodeURIComponent(
            data.email
          )}&password=${encodeURIComponent(data.password)}`
        );
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter your 6-digit verification code.",
        });
      } 
      else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
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

  const handleGitHubSignIn = async () => {
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
          title: "GitHub sign in failed",
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

  return (
    <Card className="backdrop-blur-md bg-glass border-glass-border shadow-glass">
      {/* Regular Login Form */}
      <>
        <CardHeader className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardTitle className="text-2xl font-display font-bold">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Welcome back! Enter your credentials to continue.
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
              onClick={handleGitHubSignIn}
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
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Email/Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                          placeholder="Enter your password"
                          type="password"
                          className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-sm animate-pulse" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary-glow transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full h-12 bg-gradient-primary hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Sign up link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-primary hover:text-primary-glow transition-colors"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </CardContent>
      </>
    </Card>
  );
};
