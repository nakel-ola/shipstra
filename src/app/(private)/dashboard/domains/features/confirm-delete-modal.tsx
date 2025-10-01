import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Domain {
  id: string;
  hostname: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  httpsEnabled: boolean;
  isPrimary: boolean;
}

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: Domain | null;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  domain,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!domain) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-glass/95 backdrop-blur-md border-glass-border">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            Remove Domain
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to remove this domain? This action cannot be undone and will immediately stop serving your application from this domain.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/5 border border-destructive/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-lg">{domain.hostname}</span>
                {domain.isPrimary && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    Primary
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="capitalize font-medium">{domain.status}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">HTTPS:</span>
                  <div className="font-medium">{domain.httpsEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </motion.div>

            {domain.isPrimary && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg bg-warning/5 border border-warning/20"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm text-warning-foreground font-medium">
                      <strong>Warning:</strong> This is your primary domain
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Removing the primary domain may affect how users access your application. 
                      Consider setting another domain as primary first.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {domain.status === 'verified' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg bg-muted/5 border border-muted/20"
              >
                <p className="text-sm text-muted-foreground">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Domain will immediately stop serving your application</li>
                  <li>• SSL certificate will be revoked</li>
                  <li>• You can re-add this domain later if needed</li>
                </ul>
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
                Remove Domain
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}