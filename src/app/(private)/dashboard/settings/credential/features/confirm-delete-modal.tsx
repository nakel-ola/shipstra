import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SSHCredential } from '@/hooks/use-SSH-credentials';

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credential: SSHCredential | null;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  credential,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!credential) return null;

  const isGlobal = credential.type === 'global';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-glass/95 backdrop-blur-md border-glass-border">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            Delete SSH Credential
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {isGlobal 
                ? 'Are you sure you want to delete the global SSH credential? This will prevent new project deployments until a new global credential is added.'
                : `Are you sure you want to delete the SSH credential for "${credential.projectName}"?`
              }
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/5 border border-destructive/20"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-mono">{credential.host}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-mono">{credential.username}</span>
                </div>
                {credential.projectName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project:</span>
                    <span>{credential.projectName}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {isGlobal && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg bg-warning/5 border border-warning/20"
              >
                <p className="text-sm text-warning-foreground">
                  <strong>Warning:</strong> Deleting the global credential will require you to add a new one before creating or deploying projects.
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-glass-border hover:bg-muted/10"
            >
              Cancel
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.4)] transition-all duration-300"
              >
                Delete Credential
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}