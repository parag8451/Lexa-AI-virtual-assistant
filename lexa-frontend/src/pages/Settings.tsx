import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SettingsLayout } from "./settings/SettingsLayout";
import { SettingsSkeleton } from "./settings/components/SettingsSkeleton";
import { GeneralTab } from "./settings/tabs/GeneralTab";
import { AccountTab } from "./settings/tabs/AccountTab";
import { SecurityTab } from "./settings/tabs/SecurityTab";
import { PrivacyTab } from "./settings/tabs/PrivacyTab";
import { NotificationsTab } from "./settings/tabs/NotificationsTab";
import { PersonalizationTab } from "./settings/tabs/PersonalizationTab";
import { IntegrationsTab } from "./settings/tabs/IntegrationsTab";
import { BillingTab } from "./settings/tabs/BillingTab";
import { DataExportTab } from "./settings/tabs/DataExportTab";
import { AppearanceTab } from "./settings/tabs/AppearanceTab";
import { LanguageTab } from "./settings/tabs/LanguageTab";
import { AccessibilityTab } from "./settings/tabs/AccessibilityTab";
import { AboutTab } from "./settings/tabs/AboutTab";
import { DangerZoneTab } from "./settings/tabs/DangerZoneTab";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "general";

  useEffect(() => {
    // TEMPORARY: Disabled auth redirect so you can view the Settings UI without logging in
    // if (!loading && !user) {
    //   navigate("/auth");
    // }
  }, [user, loading, navigate]);

  if (loading) {
    return <SettingsSkeleton />;
  }

  const renderTab = () => {
    switch (currentTab) {
      case "general": return <GeneralTab />;
      case "account": return <AccountTab />;
      case "security": return <SecurityTab />;
      case "privacy": return <PrivacyTab />;
      case "notifications": return <NotificationsTab />;
      case "personalization": return <PersonalizationTab />;
      case "integrations": return <IntegrationsTab />;
      case "billing": return <BillingTab />;
      case "export": return <DataExportTab />;
      case "appearance": return <AppearanceTab />;
      case "language": return <LanguageTab />;
      case "accessibility": return <AccessibilityTab />;
      case "about": return <AboutTab />;
      case "danger": return <DangerZoneTab />;
      default: return <GeneralTab />;
    }
  };

  return (
    <SettingsLayout currentTab={currentTab}>
      {renderTab()}
    </SettingsLayout>
  );
}
