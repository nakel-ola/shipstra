import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Server, Key, Upload, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const credentialSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'Username is required'),
  authMethod: z.enum(['password', 'privateKey'], { message: 'Authentication method is required' }),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  passphrase: z.string().optional(),
  projectName: z.string().optional(),
}).refine((data) => {
  if (data.authMethod === 'password') {
    return data.password && data.password.length > 0;
  }
  if (data.authMethod === 'privateKey') {
    return data.privateKey && data.privateKey.length > 0;
  }
  return true;
}, {
  message: 'Password or Private Key is required based on authentication method',
  path: ['password'],
});

type CredentialFormData = z.infer<typeof credentialSchema>;

import { SSHCredential, SSHCredentialInput } from '@/hooks/use-SSH-credentials';

interface AddCredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'global' | 'project';
  credential?: SSHCredential;
  onSave: (data: SSHCredentialInput) => void;
}

export function AddCredentialModal({
  open,
  onOpenChange,
  type,
  credential,
  onSave,
}: AddCredentialModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      host: '',
      port: 22,
      username: '',
      authMethod: 'privateKey',
      password: '',
      privateKey: '',
      passphrase: '',
      projectName: '',
    },
  });

  const authMethod = form.watch('authMethod');

  useEffect(() => {
    if (credential) {
      form.reset({
        host: credential.host || '',
        port: credential.port || 22,
        username: credential.username || '',
        authMethod: credential.authMethod || 'privateKey',
        password: '',
        privateKey: '',
        passphrase: '',
        projectName: credential.projectName || '',
      });
    } else {
      form.reset({
        host: '',
        port: 22,
        username: '',
        authMethod: 'privateKey',
        password: '',
        privateKey: '',
        passphrase: '',
        projectName: '',
      });
    }
  }, [credential, form]);

  const onSubmit = (data: CredentialFormData) => {
    const credentialInput: SSHCredentialInput = {
      type,
      projectName: data.projectName,
      host: data.host,
      port: data.port,
      username: data.username,
      authMethod: data.authMethod,
      password: data.password,
      privateKey: data.privateKey,
      passphrase: data.passphrase,
    };
    onSave(credentialInput);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        form.setValue('privateKey', content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        form.setValue('privateKey', content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-glass/95 backdrop-blur-md border-glass-border shadow-glow">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            {credential ? 'Replace' : 'Add'} {type === 'global' ? 'Global' : 'Project'} Credential
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {/* Basic Connection Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Connection Details</h3>
                
                {type === 'project' && (
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Awesome Project" 
                            {...field} 
                            className="bg-background/50 border-glass-border focus:border-primary/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="server.example.com" 
                              {...field} 
                              className="bg-background/50 border-glass-border focus:border-primary/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="22"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 22)}
                            className="bg-background/50 border-glass-border focus:border-primary/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="deploy" 
                          {...field} 
                          className="bg-background/50 border-glass-border focus:border-primary/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Authentication Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Authentication</h3>
                
                <FormField
                  control={form.control}
                  name="authMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <motion.div
                            className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === 'password'
                                ? 'border-primary/50 bg-primary/5 shadow-glow'
                                : 'border-glass-border bg-background/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <RadioGroupItem value="password" id="password" />
                            <Label htmlFor="password" className="cursor-pointer font-medium">
                              Password
                            </Label>
                          </motion.div>
                          <motion.div
                            className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === 'privateKey'
                                ? 'border-primary/50 bg-primary/5 shadow-glow'
                                : 'border-glass-border bg-background/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <RadioGroupItem value="privateKey" id="privateKey" />
                            <Label htmlFor="privateKey" className="cursor-pointer font-medium">
                              Private Key
                            </Label>
                          </motion.div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode="wait">
                  {authMethod === 'password' && (
                    <motion.div
                      key="password-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••••" 
                                  {...field} 
                                  className="bg-background/50 border-glass-border focus:border-primary/50 pr-10"
                                  autoComplete="new-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {authMethod === 'privateKey' && (
                    <motion.div
                      key="privatekey-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="privateKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Private Key</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <div
                                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                                    dragActive
                                      ? 'border-primary/50 bg-primary/5 shadow-glow'
                                      : 'border-glass-border bg-background/30'
                                  }`}
                                  onDragEnter={handleDragEnter}
                                  onDragOver={handleDragEnter}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                >
                                  <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Drag and drop your private key file here, or
                                    </p>
                                    <Input
                                      type="file"
                                      accept=".pem,.key,.txt"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      id="keyFile"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById('keyFile')?.click()}
                                      className="border-primary/30 hover:bg-primary/10"
                                    >
                                      <Key className="h-4 w-4 mr-2" />
                                      Browse Files
                                    </Button>
                                  </div>
                                </div>
                                <Textarea 
                                  placeholder="-----BEGIN PRIVATE KEY-----&#10;[Your private key content]&#10;-----END PRIVATE KEY-----"
                                  {...field}
                                  rows={6}
                                  className="bg-background/50 border-glass-border focus:border-primary/50 font-mono text-xs resize-none"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passphrase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passphrase (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassphrase ? 'text' : 'password'}
                                  placeholder="Enter passphrase if your key is encrypted" 
                                  {...field} 
                                  className="bg-background/50 border-glass-border focus:border-primary/50 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassphrase(!showPassphrase)}
                                >
                                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-glass-border hover:bg-muted/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : credential ? 'Update Credential' : 'Add Credential'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}