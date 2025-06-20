import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Users,
  Edit2,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  LogOut,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Group } from "@/services/chat";

interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function GroupSettingsDialog({
  open,
  onOpenChange,
  group,
}: GroupSettingsDialogProps) {
  const { user } = useAuth();
  const { leaveGroup } = useChat();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || "",
  });
  const [inviteLink] = useState(`https://yupichat.com/invite/${group.id}`);
  const [linkCopied, setLinkCopied] = useState(false);

  const isAdmin = group.admins.includes(user?.id || "");
  const canManage =
    user?.role === "admin" || user?.role === "moderator" || isAdmin;

  const handleSave = async () => {
    try {
      // TODO: Implémenter la mise à jour du groupe
      console.log("Mettre à jour le groupe:", formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(group.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la sortie du groupe:", error);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  const getOnlineMembers = () => {
    return group.members.filter((member) => member.status === "online");
  };

  const getMemberRole = (member: any) => {
    if (group.admins.includes(member.userId)) {
      return {
        label: "Admin",
        icon: <Crown className="w-3 h-3" />,
        color: "text-yellow-500",
      };
    }
    return { label: "Membre", icon: null, color: "text-muted-foreground" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Paramètres du groupe</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="members">
              Membres ({group.members.length})
            </TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              {/* Avatar et informations du groupe */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {group.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{group.name}</h3>
                    {canManage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        {isEditing ? "Annuler" : "Modifier"}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>{group.members.length} membres</span>
                    <span>•</span>
                    <span>{getOnlineMembers().length} en ligne</span>
                    <span>•</span>
                    <Badge variant={group.isPrivate ? "secondary" : "default"}>
                      {group.isPrivate ? "Privé" : "Public"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Formulaire d'édition */}
              {isEditing && canManage ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Nom du groupe</Label>
                    <Input
                      id="groupName"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    Enregistrer les modifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                    {group.description || "Aucune description disponible"}
                  </p>
                </div>
              )}

              {/* Lien d'invitation */}
              <div className="space-y-2">
                <Label>Lien d'invitation</Label>
                <div className="flex space-x-2">
                  <Input value={inviteLink} readOnly className="flex-1" />
                  <Button variant="outline" onClick={copyInviteLink}>
                    {linkCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partagez ce lien pour inviter de nouveaux membres
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Liste des membres</h4>
              {canManage && (
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter
                </Button>
              )}
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {group.members.map((member) => {
                  const role = getMemberRole(member);
                  const isCurrentUser = member.userId === user?.id;

                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`status-indicator ${member.status}`}>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {member.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {member.username}
                            </span>
                            {role.icon && (
                              <span className={role.color}>{role.icon}</span>
                            )}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                Vous
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {role.label} • Rejoint le{" "}
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {canManage && !isCurrentUser && (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Crown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-destructive">Zone de danger</h4>

              <div className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Quitter le groupe
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Quitter le groupe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir quitter le groupe "{group.name}
                        " ? Vous ne recevrez plus les messages et devrez être
                        réinvité pour rejoindre à nouveau.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeaveGroup}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Quitter le groupe
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {canManage && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer le groupe
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le groupe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le groupe "{group.name}
                          " et tous ses messages seront définitivement
                          supprimés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                          Supprimer définitivement
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
