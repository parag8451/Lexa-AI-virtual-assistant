import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Trash2, 
  Zap, 
  Sparkles,
  Moon,
  Sun,
  ChevronRight,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
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

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme !== "light");
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleDeleteAllConversations = async () => {
    if (!user) return;
    
    setIsDeletingAll(true);
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("All conversations deleted");
    } catch (error) {
      console.error("Error deleting conversations:", error);
      toast.error("Failed to delete conversations");
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (loading) {
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

  if (!user) {
    return null;
  }

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
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container max-w-2xl px-4 py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
        {/* Account */}
        <motion.div variants={itemVariants}>
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
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription className="text-xs">Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium text-sm">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified
              </div>
            </div>
            <Separator className="bg-border/30" />
            <motion.div whileHover={{ x: 4 }}>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-xl hover:bg-muted/30"
                onClick={() => navigate("/profile")}
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Edit Profile
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
            <Separator className="bg-border/30" />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={itemVariants}>
        <Card className="glass-card border-border/20 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
              >
                <Palette className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription className="text-xs">Customize how Lexa looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: darkMode ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                  )}
                </motion.div>
                <div>
                  <Label htmlFor="dark-mode" className="font-medium cursor-pointer text-sm">
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {darkMode ? "Easy on the eyes" : "Bright and clean"}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* AI Preferences */}
        <motion.div variants={itemVariants}>
        <Card className="glass-card border-border/20 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg"
              >
                <Zap className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-base">AI Preferences</CardTitle>
                <CardDescription className="text-xs">Configure AI behavior</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
              <div>
                <Label htmlFor="save-history" className="font-medium text-sm">Save Chat History</Label>
                <p className="text-xs text-muted-foreground">Store conversations for future reference</p>
              </div>
              <Switch
                id="save-history"
                checked={saveHistory}
                onCheckedChange={setSaveHistory}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={itemVariants}>
        <Card className="glass-card border-border/20 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg"
              >
                <Shield className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-base">Privacy & Data</CardTitle>
                <CardDescription className="text-xs">Manage your data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl h-12"
                    disabled={isDeletingAll}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All Conversations
                  </Button>
                </motion.div>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-strong border-border/30 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all conversations?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your chat history will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllConversations}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        </motion.div>

        {/* Help & Support */}
        <motion.div variants={itemVariants}>
        <Card className="glass-card border-border/20 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg"
              >
                <HelpCircle className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-base">Help & Support</CardTitle>
                <CardDescription className="text-xs">Get help with Lexa</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <motion.div whileHover={{ x: 4 }}>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-xl hover:bg-muted/30"
                onClick={() => window.open("https://docs.lovable.dev", "_blank")}
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Documentation
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>

        {/* About */}
        <motion.div variants={itemVariants} className="text-center py-8 space-y-4">
          <div className="flex justify-center">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl gradient-aurora flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 rounded-2xl gradient-aurora blur-xl opacity-40" />
            </motion.div>
          </div>
          <div className="space-y-1">
            <p className="gradient-text font-bold text-xl">Lexa AI</p>
            <p className="text-sm text-muted-foreground font-medium">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">Built with ❤️ using Lovable</p>
          </div>
        </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
