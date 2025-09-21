"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { BrandPanel } from "../sign-in/features";
import Link from "next/link";
// import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

const twoFASchema = z.object({
  code: z.string().length(6, "Please enter a 6-digit code"),
});

type TwoFAData = z.infer<typeof twoFASchema>;

const TwoFactorVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  //   const navigate = useNavigate();
  //   const location = useLocation();
  const router = useRouter();
  const { verify2FALogin } = useAuth();

  // Get credentials from navigation state
  const credentials = location.state?.credentials as
    | { email: string; password: string }
    | undefined;

  const form = useForm<TwoFAData>({
    resolver: zodResolver(twoFASchema),
    defaultValues: {
      code: "",
    },
  });

  // Redirect if no credentials provided
  useEffect(() => {
    if (!credentials) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please sign in again.",
      });
      router.push("/auth/sign-in");
    }
  }, [credentials, router, toast]);

  const onSubmit = async (data: TwoFAData) => {
    if (!credentials) return;

    setIsLoading(true);
    try {
      const result = await verify2FALogin(
        credentials.email,
        credentials.password,
        data.code
      );

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.error.message,
        });
        form.reset();
      } else {
        toast({
          title: "Welcome back!",
          description: "Two-factor authentication successful.",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth/sign-in");
  };

  const isFormValid = form.formState.isValid && !isLoading;

  if (!credentials) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-subtle overflow-hidden relative">
      {/* Animated background spots */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Brand panel */}
        <div className="hidden lg:flex lg:w-1/2">
          <BrandPanel />
        </div>

        {/* Right side - 2FA form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="backdrop-blur-md bg-glass border-glass-border shadow-glass">
              <CardHeader className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CardTitle className="text-2xl font-display font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter the 6-digit code from your authenticator app to
                    continue.
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000000"
                                maxLength={6}
                                className="h-12 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 text-center text-2xl tracking-widest"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  field.onChange(value);
                                }}
                                autoFocus
                              />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm animate-pulse" />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <Button
                          type="submit"
                          disabled={!isFormValid}
                          className="w-full h-12 bg-gradient-primary hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify & Sign In"
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleBackToLogin}
                          className="w-full h-12 hover:bg-glass/60"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Sign In
                        </Button>
                      </div>
                    </form>
                  </Form>
                </motion.div>

                {/* Sign up link */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
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
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
