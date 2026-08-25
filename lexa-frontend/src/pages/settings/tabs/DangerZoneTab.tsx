import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DangerZoneTab() {
  const { signOut } = useAuth();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE MY ACCOUNT") {
      toast.error("Please type DELETE MY ACCOUNT exactly.");
      return;
    }
    if (typeof password !== "string" || password.trim().length === 0) {
      toast.error("Please enter your password.");
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Connect to real backend endpoint to verify password and delete user
      // 1. Verify password via Supabase
      // 2. Trigger edge function to delete all user data and Auth account
      
      // Simulating a successful deletion flow
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Account deleted. Redirecting...");
      signOut();
    } catch (error) {
      toast.error("Failed to delete account. Please check your password.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1 text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">Irreversible and destructive actions. Proceed with caution.</p>
      </div>

      <div className="space-y-6">
        
        {/* Deactivate Account */}
        <section className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-xl border border-destructive/20 bg-destructive/5">
            <div>
              <p className="text-sm font-semibold">Deactivate Account</p>
              <p className="text-xs text-muted-foreground max-w-md mt-1">
                Temporarily disable your account. Your profile and data will be hidden until you reactivate by logging back in.
              </p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Deactivate
            </Button>
          </div>
        </section>

        {/* Delete Account */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-destructive bg-destructive/10 gap-4">
            <div>
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" />
                Delete Account Permanently
              </p>
              <p className="text-xs text-destructive/80 max-w-md mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-strong border-destructive/30 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <div className="text-sm">
                      This action is <strong>irreversible</strong>. You will permanently lose:
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                        <li>All your chat history</li>
                        <li>Saved files and generated images</li>
                        <li>Your current subscription and remaining credits</li>
                        <li>Any custom settings and memory</li>
                      </ul>
                    </div>
                    
                    <div className="grid gap-2 mt-4">
                      <Label htmlFor="password">Enter your password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirm">
                        To verify, type <strong>DELETE MY ACCOUNT</strong> below:
                      </Label>
                      <Input 
                        id="confirm" 
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE MY ACCOUNT" 
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="rounded-xl"
                    disabled={isDeleting || deleteConfirmation !== "DELETE MY ACCOUNT" || !password}
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

      </div>
    </div>
  );
}
