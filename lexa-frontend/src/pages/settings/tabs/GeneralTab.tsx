import { useState } from "react";
import { User, Upload, Check, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function GeneralTab() {
  const { user } = useAuth();

  // State for editable fields
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "Lexa User");

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.user_metadata?.username || "@lexa_user");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  // Preferences state
  const [model, setModel] = useState("lexa-balanced");
  const [responseBehavior, setResponseBehavior] = useState(false); // false = detailed, true = concise
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Mock save function
  const handleSaveName = async () => {
    // TODO: Connect to real Supabase endpoint
    // await supabase.auth.updateUser({ data: { full_name: displayName } });
    toast.success("Display name updated successfully");
    setIsEditingName(false);
  };

  const handleSaveUsername = async () => {
    // TODO: Connect to backend for uniqueness check
    toast.success("Username updated successfully");
    setIsEditingUsername(false);
  };

  const handleChangeEmail = async () => {
    // TODO: Implement Supabase updateUser email change
    toast.info("Verification email sent to new address. Please verify to complete the change.");
    setIsEditingEmail(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">General Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and basic preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Profile Picture</h3>
          <div className="flex items-center gap-6 p-4 rounded-xl border border-border/40 bg-muted/10">
            <div className="relative group cursor-pointer">
              <Avatar className="h-20 w-20 border-2 border-border/50">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Button variant="secondary" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New Picture
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. 1MB max. (TODO: Crop tool)
              </p>
            </div>
          </div>
        </section>

        {/* Profile Details */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Profile Details</h3>
          <div className="space-y-4 p-5 rounded-xl border border-border/40 bg-muted/10">

            {/* Display Name */}
            <div className="grid gap-2">
              <Label>Display Name</Label>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="max-w-md"
                  />
                  <Button size="icon" variant="ghost" className="text-emerald-500" onClick={handleSaveName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setIsEditingName(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between max-w-md p-3 rounded-lg bg-background border border-border/30">
                  <span className="text-sm font-medium">{displayName}</span>
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => setIsEditingName(true)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label>Username</Label>
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="max-w-md"
                  />
                  <Button size="icon" variant="ghost" className="text-emerald-500" onClick={handleSaveUsername}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setIsEditingUsername(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between max-w-md p-3 rounded-lg bg-background border border-border/30">
                  <span className="text-sm font-medium">{username}</span>
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => setIsEditingUsername(true)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="grid gap-2 pt-2">
              <Label>Email Address</Label>
              {isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="max-w-md"
                  />
                  <Button size="icon" variant="ghost" className="text-emerald-500" onClick={handleChangeEmail}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setIsEditingEmail(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between max-w-md p-3 rounded-lg bg-background border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{user?.email}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => setIsEditingEmail(true)}>
                    Change
                  </Button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">App Preferences</h3>
          <div className="space-y-5 p-5 rounded-xl border border-border/40 bg-muted/10">

            {/* Default Model */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Default Chat Model</Label>
                <p className="text-xs text-muted-foreground">Choose which model starts new conversations.</p>
              </div>
              <Select value={model} onValueChange={(val) => { setModel(val); toast.success("Default model saved"); }}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lexa-balanced">Balanced (Claude 3.5)</SelectItem>
                  <SelectItem value="lexa-fast">Fast (Flash)</SelectItem>
                  <SelectItem value="lexa-expert">Expert (Opus)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Response Behavior */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Concise Responses</Label>
                <p className="text-xs text-muted-foreground">Force the AI to be brief and direct.</p>
              </div>
              <Switch
                checked={responseBehavior}
                onCheckedChange={(val) => { setResponseBehavior(val); toast.success("Response behavior updated"); }}
              />
            </div>

            {/* Timezone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <Label>Time Zone</Label>
                <p className="text-xs text-muted-foreground">Used for reminders and timestamps.</p>
              </div>
              <Select value={timezone} onValueChange={(val) => { setTimezone(val); toast.success("Timezone updated"); }}>
                <SelectTrigger className="w-[200px] bg-background text-xs truncate">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={timezone}>Auto: {timezone}</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
