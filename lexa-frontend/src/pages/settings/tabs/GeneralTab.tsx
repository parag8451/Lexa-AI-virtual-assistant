import * as React from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EditableField, Pill, SettingRow, SettingsCard, SettingsPage, SettingsSection } from "./primitives";

export function GeneralTab() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = React.useState<string>(user?.user_metadata?.full_name || "Lexa User");
  const [username, setUsername] = React.useState<string>(user?.user_metadata?.username || "@lexa_user");
  const [email, setEmail] = React.useState<string>(user?.email || "");
  const [model, setModel] = React.useState("lexa-balanced");
  const [concise, setConcise] = React.useState(false);
  const [timezone, setTimezone] = React.useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const initial = (displayName.trim()[0] || "L").toUpperCase();

  return (
    <SettingsPage title="General Settings" description="Manage your profile and basic preferences.">
      <SettingsSection title="Profile Picture">
        <SettingsCard className="flex items-center gap-6 p-4">
          <button
            type="button"
            className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Change profile picture"
          >
            <Avatar className="h-20 w-20 border-2 border-border/50">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xl text-primary">{initial}</AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </span>
          </button>
          <div className="space-y-1.5">
            <Button variant="secondary" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload New Picture
            </Button>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Profile Details">
        <SettingsCard className="space-y-4">
          <EditableField
            label="Display Name"
            value={displayName}
            onSave={async (value) => {
              setDisplayName(value);
              toast.success("Display name updated successfully");
            }}
          />
          <EditableField
            label="Username"
            value={username}
            onSave={async (value) => {
              setUsername(value);
              toast.success("Username updated successfully");
            }}
          />
          <EditableField
            label="Email Address"
            type="email"
            value={email}
            editLabel="Change"
            autoComplete="email"
            display={
              <span className="flex items-center gap-3">
                <span className="text-sm font-medium">{email || "Not set"}</span>
                <Pill tone="success">Verified</Pill>
              </span>
            }
            onSave={async (value) => {
              setEmail(value);
              toast.info("Verification email sent. Please confirm to complete the change.");
            }}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="App Preferences">
        <SettingsCard className="space-y-5">
          <SettingRow
            title="Default Chat Model"
            description="Choose which model starts new conversations."
            control={
              <Select
                value={model}
                onValueChange={(value) => {
                  setModel(value);
                  toast.success("Default model saved");
                }}
              >
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lexa-balanced">Balanced</SelectItem>
                  <SelectItem value="lexa-fast">Fast</SelectItem>
                  <SelectItem value="lexa-expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            title="Concise Responses"
            description="Force the AI to be brief and direct."
            htmlFor="concise"
            control={
              <Switch
                id="concise"
                checked={concise}
                onCheckedChange={(value) => {
                  setConcise(value);
                  toast.success("Response behavior updated");
                }}
              />
            }
          />
          <SettingRow
            title="Time Zone"
            description="Used for reminders and timestamps."
            control={
              <Select
                value={timezone}
                onValueChange={(value) => {
                  setTimezone(value);
                  toast.success("Timezone updated");
                }}
              >
                <SelectTrigger className="w-[200px] bg-background text-xs">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={timezone}>Auto ({timezone})</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}