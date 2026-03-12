import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, Save, Sparkles, User } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";

const displayNameSchema = z.string().max(100, "Display name must be less than 100 characters").optional();

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalDisplayName, setOriginalDisplayName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    setHasChanges(displayName !== originalDisplayName);
  }, [displayName, originalDisplayName]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setDisplayName(data.display_name || "");
      setOriginalDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const validation = displayNameSchema.safeParse(displayName);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("user_id", user.id);

      if (error) throw error;

      setOriginalDisplayName(displayName);
      toast({
        title: "Profile updated",
        description: "Your display name has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {/* Ambient effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-[breathe_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-[breathe_10s_ease-in-out_infinite_1s]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-2xl">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 h-14 w-14 rounded-2xl gradient-aurora blur-xl opacity-50 animate-pulse" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">Loading...</span>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 border-b border-border/30 glass-strong"
      >
        <div className="container flex h-16 items-center gap-4 px-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0 rounded-xl hover:bg-muted/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 rounded-xl gradient-aurora flex items-center justify-center shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
            <h1 className="text-lg font-bold">Profile</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container max-w-2xl px-4 py-8 space-y-6 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
        <Card className="glass-card border-border/20 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-lg"
              >
                <User className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-base">Profile Information</CardTitle>
                <CardDescription className="text-xs">Update your profile picture and display name</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-2xl" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
                  <AvatarFallback className="text-2xl font-bold gradient-aurora text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full gradient-primary text-white shadow-lg disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Click to upload a new profile picture
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm font-medium text-foreground">Display Name</Label>
              <Input
                id="display-name"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear in the app
              </p>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <div className="flex items-center gap-2 h-12 px-4 bg-muted/20 border border-border/20 rounded-xl">
                <span className="text-muted-foreground">{user.email}</span>
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Verified
                </span>
              </div>
            </div>

            {/* Save Button */}
            <motion.div whileHover={{ scale: hasChanges ? 1.02 : 1 }} whileTap={{ scale: hasChanges ? 0.98 : 1 }}>
              <Button
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="w-full h-12 gradient-primary rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </div>
  );
}
