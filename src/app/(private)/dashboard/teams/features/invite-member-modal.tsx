import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, Shield, UserCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTeams } from "@/hooks/use-teams";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], { message: "Please select a role" }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
    description: "Can manage team members and settings",
    className:
      "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-500/20",
  },
  {
    value: "member",
    label: "Member",
    icon: UserCheck,
    description: "Can access projects and collaborate",
    className:
      "bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-600 border-gray-500/20",
  },
];

export const InviteMemberModal = ({
  open,
  onOpenChange,
}: InviteMemberModalProps) => {
  const { inviteMember } = useTeams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const selectedRole = form.watch("role");
  const selectedRoleConfig = roleOptions.find(
    (option) => option.value === selectedRole
  );

  const handleSubmit = async (data: InviteFormData) => {
    setIsLoading(true);

    try {
      const success = await inviteMember(data);
      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-glass/95 backdrop-blur-md border-glass-border shadow-glow">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Add a new member to collaborate on your projects
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="colleague@company.com"
                      className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-glass/50 border-glass-border focus:border-primary">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-glass/95 backdrop-blur-sm border-glass-border">
                      {roleOptions.map((role) => {
                        const RoleIcon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2 py-1">
                              <RoleIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {role.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Role Preview */}
            {selectedRoleConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-muted/20 rounded-lg border border-glass-border"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${selectedRoleConfig.className} border flex items-center gap-1`}
                  >
                    <selectedRoleConfig.icon className="h-3 w-3" />
                    {selectedRoleConfig.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedRoleConfig.description}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
                className="border-glass-border hover:bg-glass/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isLoading}
                className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
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

        {/* Info Section */}
        <div className="pt-4 border-t border-glass-border">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground mb-1">
                What happens next?
              </p>
              <ul className="space-y-1 text-xs">
                <li>• An invitation email will be sent to the recipient</li>
                <li>• They&apos;ll have 7 days to accept the invitation</li>
                <li>
                  • Once accepted, they&apos;ll have access based on their role
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
