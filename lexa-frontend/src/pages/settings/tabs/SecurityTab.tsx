import { useState } from "react";
import { Smartphone, Monitor, LogOut, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  
  // Real-time password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

  const handleUpdatePassword = async () => {
    if (typeof currentPassword !== "string" || currentPassword.trim().length === 0) {
      toast.error("Please enter your current password");
      return;
    }
    if (!hasMinLength || !hasUpper || !hasNumber || !hasSymbol) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    
    try {
      // Re-authenticate with current password to verify identity
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Unable to verify identity. Please sign in again.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update to new password via Supabase
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error("Failed to update password: " + error.message);
        return;
      }
      toast.success("Password updated successfully");
    } catch {
      toast.error("An error occurred while updating your password");
    }
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Security & Login</h2>
        <p className="text-sm text-muted-foreground">Protect your account with strong security controls.</p>
      </div>

      <div className="space-y-8">
        
        {/* Password Management */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Password Management</h3>
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10 space-y-4">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="max-w-md" />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="max-w-md" />
            </div>
            
            {/* Live Password Strength Meter */}
            {newPassword && (
              <div className="max-w-md p-3 rounded-lg bg-background border border-border/30 space-y-2">
                <p className="text-xs font-medium mb-2">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={hasMinLength ? "text-emerald-500" : "text-muted-foreground"}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={hasUpper ? "text-emerald-500" : "text-muted-foreground"}>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={hasNumber ? "text-emerald-500" : "text-muted-foreground"}>Number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSymbol ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={hasSymbol ? "text-emerald-500" : "text-muted-foreground"}>Special character</span>
                  </div>
                </div>
              </div>
            )}
            
            <Button onClick={handleUpdatePassword} disabled={!currentPassword || !newPassword}>
              Update Password
            </Button>
            <p className="text-xs text-muted-foreground">Last changed 45 days ago</p>
          </div>
        </section>

        {/* Two-Factor Authentication */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Two-Factor Authentication (2FA)</h3>
          <div className="p-5 rounded-xl border border-border/40 bg-muted/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    Authenticator App
                    {is2FAEnabled && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">Enabled</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">Use an app like Authy or Google Authenticator to generate one-time codes.</p>
                </div>
              </div>
              <Button 
                variant={is2FAEnabled ? "outline" : "default"} 
                onClick={() => {
                  if (is2FAEnabled) {
                    setIs2FAEnabled(false);
                    toast.success("2FA Disabled");
                  } else {
                    setShow2FASetup(true);
                  }
                }}
              >
                {is2FAEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
            
            {show2FASetup && !is2FAEnabled && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 mt-4 space-y-4">
                <p className="text-sm font-medium">Setup 2FA (Mock)</p>
                <div className="w-32 h-32 bg-background border rounded-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">QR CODE</span>
                </div>
                <div className="grid gap-2">
                  <Label>Enter 6-digit code</Label>
                  <div className="flex gap-2">
                    <Input placeholder="000000" className="max-w-[150px]" />
                    <Button onClick={() => {
                      setIs2FAEnabled(true);
                      setShow2FASetup(false);
                      toast.success("2FA successfully enabled!");
                    }}>Verify</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Active Sessions</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/10">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    Windows • Chrome
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold tracking-wider">Current</span>
                  </p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA • IP: 192.168.1.1</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">iPhone 14 • Safari</p>
                  <p className="text-xs text-muted-foreground">New York, NY • Last active 2h ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Log Out</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
            <LogOut className="w-4 h-4" />
            Log out of all other sessions
          </Button>
        </section>

      </div>
    </div>
  );
}
