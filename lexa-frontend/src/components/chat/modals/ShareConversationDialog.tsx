import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Share2,
  Link2,
  Copy,
  Check,
  User,
  Users,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { useCollaboration, SharePermission, ConversationShare } from "@/hooks/useCollaboration";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ShareConversationDialogProps {
  conversationId: string;
  conversationTitle: string;
  trigger?: React.ReactNode;
}

const PERMISSION_OPTIONS: { value: SharePermission; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "view", label: "Can view", icon: Eye },
  { value: "comment", label: "Can comment", icon: MessageSquare },
  { value: "edit", label: "Can edit", icon: Edit },
];

export function ShareConversationDialog({
  conversationId,
  conversationTitle,
  trigger,
}: ShareConversationDialogProps) {
  const {
    shares,
    shareWithUser,
    shareWithWorkspace,
    updateSharePermission,
    removeShare,
  } = useCollaboration(conversationId);

  const { workspaces } = useWorkspaces();

  const [isOpen, setIsOpen] = useState(false);
  const [shareType, setShareType] = useState<"user" | "workspace">("user");
  const [shareTarget, setShareTarget] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!shareTarget) return;

    if (shareType === "user") {
      // For now, we'll use email/user ID - in production you'd want a user lookup
      await shareWithUser(conversationId, shareTarget, permission);
    } else {
      await shareWithWorkspace(conversationId, shareTarget, permission);
    }

    setShareTarget("");
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/shared/${conversationId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPermissionIcon = (perm: SharePermission) => {
    const option = PERMISSION_OPTIONS.find(o => o.value === perm);
    return option?.icon || Eye;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conversation Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium truncate">{conversationTitle}</p>
          </div>

          {/* Quick Share Link */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/shared/${conversationId.slice(0, 8)}...`}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Type Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setShareType("user")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm transition-colors",
                shareType === "user"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-4 w-4" />
              User
            </button>
            <button
              onClick={() => setShareType("workspace")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm transition-colors",
                shareType === "workspace"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              Workspace
            </button>
          </div>

          {/* Share Input */}
          <div className="flex gap-2">
            {shareType === "user" ? (
              <Input
                placeholder="Enter user ID or email"
                value={shareTarget}
                onChange={(e) => setShareTarget(e.target.value)}
              />
            ) : (
              <Select value={shareTarget} onValueChange={setShareTarget}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleShare} className="w-full" disabled={!shareTarget}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {/* Existing Shares */}
          {shares.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Shared with</h4>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {shares.map((share) => {
                    const PermIcon = getPermissionIcon(share.permission);
                    return (
                      <motion.div
                        key={share.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {share.shared_with_user_id ? (
                            <User className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm truncate max-w-[120px]">
                            {share.shared_with_user_id?.slice(0, 8) || "Workspace"}
                          </span>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <PermIcon className="h-3 w-3" />
                            {share.permission}
                          </Badge>
                          {share.expires_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(share.expires_at), "MMM d")}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeShare(share.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
