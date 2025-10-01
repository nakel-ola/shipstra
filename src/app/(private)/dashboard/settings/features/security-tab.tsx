/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Smartphone,
  Globe,
  Clock,
  MoreVertical,
  X,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSecurity } from "@/hooks/use-security";
import { useSessionTracker } from "@/hooks/use-session-tracker";

export function SecurityTab() {
  const {
    securitySettings,
    sessions,
    loading,
    qrCodeUrl,
    totpSecret,
    setup2FA,
    verify2FA,
    disable2FA,
    revokeSession,
    revokeAllSessions,
    downloadBackupCodes,
  } = useSecurity();

  // Track session activity
  useSessionTracker();

  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [setupStep, setSetupStep] = useState<"qr" | "verify">("qr");
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      await setup2FA();
      setShowSetup2FA(true);
      setSetupStep("qr");
    } else {
      setShowDisable2FA(true);
    }
  };

  const handleVerify2FA = async () => {
    const success = await verify2FA(verificationCode);
    if (success) {
      setShowSetup2FA(false);
      setVerificationCode("");
      setSetupStep("qr");
    }
  };

  const handleDisable2FA = async () => {
    const success = await disable2FA(disableCode);
    if (success) {
      setShowDisable2FA(false);
      setDisableCode("");
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Two-Factor Authentication */}
      <Card className="bg-glass border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Enable 2FA</div>
              <div className="text-sm text-muted-foreground">
                Secure your account with two-factor authentication
              </div>
            </div>
            <Switch
              checked={securitySettings.two_factor_enabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {securitySettings.two_factor_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="border border-white/10 rounded-lg p-6 bg-background/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-500">2FA Enabled</p>
                      <p className="text-sm text-muted-foreground">
                        Your account is protected with two-factor authentication
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                      className="border-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Codes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisable2FA(true)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-glass border-white/10 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-500/20 text-green-400 border-green-500/30"
              >
                {sessions.length} Active
              </Badge>
              {sessions.filter((s) => !s.is_current).length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Revoke All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-glass border-white/10 backdrop-blur-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign out all other devices. You will remain
                        signed in on this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={revokeAllSessions}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Revoke All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-white/10 rounded-lg bg-background/20 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-muted-foreground">
                    Device & Location
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    IP Address
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Last Active
                  </TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-white/10">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {session.device_info}
                          </span>
                          {session.is_current && (
                            <Badge
                              variant="outline"
                              className="bg-primary/20 text-primary border-primary/30 text-xs"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.location || "Unknown location"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {session.ip_address || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatLastActive(session.last_active)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!session.is_current && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-glass border-white/10 backdrop-blur-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => revokeSession(session.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Revoke Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetup2FA} onOpenChange={setShowSetup2FA}>
        <DialogContent className="bg-glass border-white/10 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === "qr"
                ? "Scan the QR code with your authenticator app"
                : "Enter the verification code from your authenticator app"}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {setupStep === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {qrCodeUrl && (
                  <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                      <img
                        src={qrCodeUrl}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Manual entry key:
                      </p>
                      <p className="text-xs font-mono bg-background/30 px-3 py-2 rounded border">
                        {totpSecret}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSetupStep("verify")}
                      className="w-full bg-gradient-primary"
                    >
                      Continue to Verification
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {setupStep === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-500">Backup Codes</p>
                      <p className="text-amber-500/80">
                        Save your backup codes before enabling 2FA. You&apos;ll
                        need them if you lose access to your authenticator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSetupStep("qr")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify2FA}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 bg-gradient-primary"
                  >
                    Enable 2FA
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Dialog */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent className="bg-glass border-white/10 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current 2FA code to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-code">Verification Code</Label>
              <Input
                id="disable-code"
                placeholder="Enter 6-digit code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-500">Warning</p>
                  <p className="text-red-500/80">
                    Disabling 2FA will make your account less secure.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDisable2FA(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable2FA}
                disabled={disableCode.length !== 6}
                variant="destructive"
                className="flex-1"
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
