import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Mail, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
  onMemberAdded?: () => void;
}

export function InviteTeamModal({ isOpen, onClose, organizationId, onMemberAdded }: InviteTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "No organization selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to invite team members.",
          variant: "destructive",
        });
        return;
      }

      // Check if user with this email already exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', data.email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking existing user:', userError);
        toast({
          title: "Error",
          description: "Failed to check user existence. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // For now, we'll create a pending invitation record
      // In a real app, you'd send an actual email invitation
      const { error: inviteError } = await supabase
        .from('team_members')
        .insert({
          organization_id: organizationId,
          user_id: existingUser?.user_id || user.id, // Temporary: use current user for demo
          role: data.role,
          status: 'pending',
          invited_by: user.id,
        });

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
        toast({
          title: "Error",
          description: "Failed to send invitation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}.`,
      });
      
      form.reset();
      onClose();
      onMemberAdded?.();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="bg-glass border-white/10 backdrop-blur-xl max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Invite Team Member
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send an invitation to join your organization
                </p>
              </DialogHeader>

              <div className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="colleague@example.com"
                                className="pl-10 bg-background/50 border-white/20 focus:border-primary"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-white/20 focus:border-primary">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-glass border-white/10 backdrop-blur-xl">
                              <SelectItem value="admin" className="hover:bg-white/10">
                                <div className="space-y-1">
                                  <div className="font-medium">Admin</div>
                                  <div className="text-xs text-muted-foreground">
                                    Can manage organization and projects
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="member" className="hover:bg-white/10">
                                <div className="space-y-1">
                                  <div className="font-medium">Member</div>
                                  <div className="text-xs text-muted-foreground">
                                    Can access and contribute to projects
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="border-white/20 hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
                      >
                        {isLoading ? (
                          <motion.div
                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}