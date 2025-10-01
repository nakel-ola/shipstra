import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, AlertTriangle, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const domainSchema = z.object({
  hostname: z
    .string()
    .min(1, "Domain is required")
    .refine((val) => {
      // Basic domain validation
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      return domainRegex.test(val);
    }, "Please enter a valid domain name"),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface AddDomainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDomain: (hostname: string) => void;
}

export function AddDomainModal({
  open,
  onOpenChange,
  onAddDomain,
}: AddDomainModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      hostname: "",
    },
  });

  const onSubmit = async (data: DomainFormData) => {
    setIsVerifying(true);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onAddDomain(data.hostname);
    form.reset();
    setIsVerifying(false);
  };

  const handleClose = () => {
    if (!isVerifying) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-glass/95 backdrop-blur-md border-glass-border shadow-glow">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Add Custom Domain
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com"
                        {...field}
                        className="bg-background/50 border-glass-border focus:border-primary/50"
                        disabled={isVerifying}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DNS Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">
                        DNS Configuration Required
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Before adding your domain, make sure you&apos;ve
                        configured the following DNS records at your domain
                        registrar:
                      </p>
                      <div className="space-y-1 text-sm font-mono bg-background/50 rounded p-3">
                        <div>A Record: @ → 185.158.133.1</div>
                        <div>A Record: www → 185.158.133.1</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-warning">
                        Important Notes
                      </h4>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        <li>
                          • DNS changes can take up to 48 hours to propagate
                        </li>
                        <li>
                          • SSL certificates will be automatically provisioned
                          after verification
                        </li>
                        <li>
                          • Remove any existing DNS records that conflict with
                          these settings
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Verification Status */}
              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-accent/5 border border-accent/20"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                    <div>
                      <h4 className="font-medium text-accent">
                        Verifying Domain
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Checking DNS records and domain configuration...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isVerifying}
                className="border-glass-border hover:bg-muted/10"
              >
                Cancel
              </Button>
              <motion.div
                whileHover={!isVerifying ? { scale: 1.02 } : {}}
                whileTap={!isVerifying ? { scale: 0.98 } : {}}
              >
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Add Domain"
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
