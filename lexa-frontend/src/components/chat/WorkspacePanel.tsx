import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Settings,
  UserPlus,
  Crown,
  Shield,
  User,
  Eye,
  MoreVertical,
  Trash2,
  LogOut,
  Mail,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces, WorkspaceRole, Workspace, WorkspaceMember } from "@/hooks/useWorkspaces";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<WorkspaceRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  owner: "text-yellow-500",
  admin: "text-blue-500",
  member: "text-green-500",
  viewer: "text-muted-foreground",
};

export function WorkspacePanel() {
  const { user } = useAuth();
  const {
    workspaces,
    currentWorkspace,
    members,
    invites,
    myRole,
    isLoading,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    cancelInvite,
  } = useWorkspaces();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");

  const canManage = myRole === "owner" || myRole === "admin";

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createWorkspace(newName, newDescription);
    setNewName("");
    setNewDescription("");
    setShowCreate(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteMember(inviteEmail, inviteRole);
    setInviteEmail("");
    setInviteRole("member");
    setShowInvite(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Team</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Workspaces
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Workspace List */}
          <div className="w-48 border-r border-border pr-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Workspaces</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => setCurrentWorkspace(workspace)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      currentWorkspace?.id === workspace.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="font-medium truncate">{workspace.name}</div>
                    {workspace.is_personal && (
                      <span className="text-xs text-muted-foreground">Personal</span>
                    )}
                  </button>
                ))}

                {workspaces.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No workspaces yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowCreate(true)}
                    >
                      Create one
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Workspace Details */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {showCreate ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Create Workspace</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCreate(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="Workspace name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleCreate} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workspace
                    </Button>
                  </div>
                </motion.div>
              ) : showInvite ? (
                <motion.div
                  key="invite"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Invite Member</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowInvite(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInvite} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </motion.div>
              ) : currentWorkspace ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{currentWorkspace.name}</h3>
                      {currentWorkspace.description && (
                        <p className="text-sm text-muted-foreground">
                          {currentWorkspace.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInvite(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canManage && (
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {myRole !== "owner" && (
                            <DropdownMenuItem
                              onClick={() => leaveWorkspace()}
                              className="text-destructive"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Workspace
                            </DropdownMenuItem>
                          )}
                          {myRole === "owner" && (
                            <DropdownMenuItem
                              onClick={() => deleteWorkspace(currentWorkspace.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Workspace
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Members ({members.length})
                    </h4>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {members.map((member) => {
                          const RoleIcon = ROLE_ICONS[member.role];
                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {member.profile?.display_name?.[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium">
                                    {member.profile?.display_name || "Unknown"}
                                    {member.user_id === user?.id && (
                                      <span className="text-muted-foreground ml-1">(you)</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <RoleIcon className={cn("h-3 w-3", ROLE_COLORS[member.role])} />
                                    <span className="text-muted-foreground capitalize">
                                      {member.role}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {canManage && member.user_id !== user?.id && member.role !== "owner" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {myRole === "owner" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => updateMemberRole(member.id, "admin")}
                                        >
                                          <Shield className="h-4 w-4 mr-2" />
                                          Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => updateMemberRole(member.id, "member")}
                                        >
                                          <User className="h-4 w-4 mr-2" />
                                          Make Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => updateMemberRole(member.id, "viewer")}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Make Viewer
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => removeMember(member.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Pending Invites */}
                  {canManage && invites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Pending Invites ({invites.length})
                      </h4>
                      <div className="space-y-2">
                        {invites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm">{invite.email}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {invite.role}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelInvite(invite.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select or create a workspace</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
