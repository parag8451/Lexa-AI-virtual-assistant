import * as React from "react";
import { Bell, Mail, Megaphone, MessageSquare, Moon, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SettingsCard, SettingsPage, SettingsSection, ToggleRow } from "./primitives.tsx";

type Prefs = {
  push: boolean;
  email: boolean;
  chatReplies: boolean;
  security: boolean;
  weekly: boolean;
  product: boolean;
  quietHours: boolean;
};

export function NotificationsTab() {
  const [prefs, setPrefs] = React.useState<Prefs>({
    push: true,
    email: true,
    chatReplies: true,
    security: true,
    weekly: false,
    product: false,
    quietHours: false,
  });

  const set = React.useCallback(
    (key: keyof Prefs) => (value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      toast.success("Notification preferences updated");
    },
    [],
  );

  return (
    <SettingsPage title="Notifications" description="Manage how and when you hear from us.">
      <SettingsSection title="Channels">
        <SettingsCard className="space-y-6">
          <ToggleRow
            id="notif-push"
            icon={<Bell className="h-4 w-4" />}
            title="Push notifications"
            description="Receive alerts on this device in real time."
            checked={prefs.push}
            onCheckedChange={set("push")}
          />
          <ToggleRow
            id="notif-email"
            icon={<Mail className="h-4 w-4" />}
            title="Email notifications"
            description="Get important updates delivered to your inbox."
            checked={prefs.email}
            onCheckedChange={set("email")}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="What you hear about">
        <SettingsCard className="space-y-6">
          <ToggleRow
            id="notif-chat"
            icon={<MessageSquare className="h-4 w-4" />}
            title="Chat replies"
            description="Notify me when the assistant finishes a long-running task."
            checked={prefs.chatReplies}
            onCheckedChange={set("chatReplies")}
          />
          <ToggleRow
            id="notif-security"
            icon={<ShieldAlert className="h-4 w-4" />}
            title="Security alerts"
            description="New sign-ins and suspicious activity. Strongly recommended."
            checked={prefs.security}
            onCheckedChange={set("security")}
          />
          <ToggleRow
            id="notif-weekly"
            icon={<Sparkles className="h-4 w-4" />}
            title="Weekly summary"
            description="A digest of your activity and highlights every Monday."
            checked={prefs.weekly}
            onCheckedChange={set("weekly")}
          />
          <ToggleRow
            id="notif-product"
            icon={<Megaphone className="h-4 w-4" />}
            title="Product news"
            description="Occasional updates about new features and improvements."
            checked={prefs.product}
            onCheckedChange={set("product")}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Schedule">
        <SettingsCard>
          <ToggleRow
            id="notif-quiet"
            icon={<Moon className="h-4 w-4" />}
            title="Quiet hours (10pm - 8am)"
            description="Pause all non-critical notifications overnight."
            checked={prefs.quietHours}
            onCheckedChange={set("quietHours")}
          />
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}