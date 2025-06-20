import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { apiService } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import {
  ArrowLeft,
  Users,
  Plus,
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Search,
  MoreVertical,
} from "lucide-react";
import { Chat, User } from "../types";
import { cn } from "../lib/utils";

export default function Groups() {
  const { user, token } = useAuthStore();
  const { chats, addChat, updateChat, removeUserFromChat, addUserToChat } =
    useChatStore();
  const [groups, setGroups] = useState<Chat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  const [groupSettings, setGroupSettings] = useState({
    allowFiles: true,
    allowEmojis: true,
    slowMode: 0,
  });

  useEffect(() => {
    loadGroups();
  }, [chats]);

  const loadGroups = () => {
    const groupChats = chats.filter((chat) => chat.type === "group");
    setGroups(groupChats);
  };

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) return;

    setIsLoading(true);
    try {
      const newGroup = await apiService.createGroup(
        createForm.name,
        createForm.description,
        token!,
      );
      addChat(newGroup);
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "" });
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    setIsLoading(true);
    try {
      const updatedGroup = await apiService.updateGroup(
        selectedGroup.id,
        {
          settings: groupSettings,
        },
        token!,
      );
      updateChat(selectedGroup.id, updatedGroup);
      setShowSettingsModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const users = await apiService.searchUsers(query, token!);
      setSearchResults(users);
    } catch (error) {
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
    }
  };

  const handleAddUser = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      await apiService.addUserToGroup(selectedGroup.id, userId, token!);
      const user = searchResults.find((u) => u.id === userId);
      if (user) {
        addUserToChat(selectedGroup.id, user);
      }
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      await apiService.removeUserFromGroup(selectedGroup.id, userId, token!);
      removeUserFromChat(selectedGroup.id, userId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  const canManageGroup = (group: Chat) => {
    return (
      user?.role === "admin" ||
      group.createdBy === user?.id ||
      group.admins.includes(user?.id || "")
    );
  };

  const getUserRole = (group: Chat, userId: string) => {
    if (group.createdBy === userId) return "owner";
    if (group.admins.includes(userId)) return "admin";
    if (group.moderators.includes(userId)) return "moderator";
    return "member";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "admin":
        return <Crown className="h-3 w-3 text-orange-500" />;
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "admin":
        return "Admin";
      case "moderator":
        return "Modérateur";
      default:
        return "Membre";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (window.location.href = "/chat")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestion des Groupes
                </h1>
              </div>
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau groupe</DialogTitle>
                  <DialogDescription>
                    Créez un groupe de discussion pour vos équipes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Nom du groupe</Label>
                    <Input
                      id="group-name"
                      placeholder="Mon super groupe"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-description">Description</Label>
                    <Textarea
                      id="group-description"
                      placeholder="Décrivez l'objectif de ce groupe..."
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={isLoading || !createForm.name.trim()}
                  >
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des groupes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Mes groupes ({groups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                          {
                            "bg-blue-50 border border-blue-200":
                              selectedGroup?.id === group.id,
                          },
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {group.name}
                            </h4>
                            {getRoleIcon(getUserRole(group, user?.id || ""))}
                          </div>
                          <p className="text-sm text-gray-500">
                            {group.participants.length} membres
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Détails du groupe sélectionné */}
          <div className="lg:col-span-2">
            {selectedGroup ? (
              <div className="space-y-6">
                {/* Informations du groupe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={selectedGroup.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                            <Users className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-2xl">
                            {selectedGroup.name}
                          </CardTitle>
                          <CardDescription>
                            {selectedGroup.description ||
                              "Aucune description disponible"}
                          </CardDescription>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">
                              {selectedGroup.participants.length} membres
                            </Badge>
                            <Badge
                              variant={
                                getUserRole(selectedGroup, user?.id || "") ===
                                "owner"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {getRoleName(
                                getUserRole(selectedGroup, user?.id || ""),
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {canManageGroup(selectedGroup) && (
                        <div className="flex space-x-2">
                          <Dialog
                            open={showAddUserModal}
                            onOpenChange={setShowAddUserModal}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ajouter des membres</DialogTitle>
                                <DialogDescription>
                                  Recherchez et ajoutez des utilisateurs au
                                  groupe
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="relative">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Rechercher des utilisateurs..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                      setSearchQuery(e.target.value);
                                      handleSearchUsers(e.target.value);
                                    }}
                                    className="pl-10"
                                  />
                                </div>

                                {searchResults.length > 0 && (
                                  <ScrollArea className="h-48">
                                    <div className="space-y-2">
                                      {searchResults.map((searchUser) => (
                                        <div
                                          key={searchUser.id}
                                          className="flex items-center justify-between p-2 rounded-lg border"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage
                                                src={searchUser.avatar}
                                              />
                                              <AvatarFallback>
                                                {searchUser.username[0]?.toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">
                                                {searchUser.username}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                {searchUser.email}
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleAddUser(searchUser.id)
                                            }
                                            disabled={selectedGroup.participants.some(
                                              (p) => p.id === searchUser.id,
                                            )}
                                          >
                                            {selectedGroup.participants.some(
                                              (p) => p.id === searchUser.id,
                                            )
                                              ? "Déjà membre"
                                              : "Ajouter"}
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={showSettingsModal}
                            onOpenChange={setShowSettingsModal}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Paramètres du groupe</DialogTitle>
                                <DialogDescription>
                                  Configurez les paramètres de votre groupe
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Autoriser les fichiers</Label>
                                    <p className="text-sm text-gray-500">
                                      Les membres peuvent envoyer des fichiers
                                    </p>
                                  </div>
                                  <Switch
                                    checked={groupSettings.allowFiles}
                                    onCheckedChange={(checked) =>
                                      setGroupSettings({
                                        ...groupSettings,
                                        allowFiles: checked,
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Autoriser les emojis</Label>
                                    <p className="text-sm text-gray-500">
                                      Les membres peuvent utiliser des emojis
                                    </p>
                                  </div>
                                  <Switch
                                    checked={groupSettings.allowEmojis}
                                    onCheckedChange={(checked) =>
                                      setGroupSettings({
                                        ...groupSettings,
                                        allowEmojis: checked,
                                      })
                                    }
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="slow-mode">
                                    Mode lent (secondes)
                                  </Label>
                                  <Input
                                    id="slow-mode"
                                    type="number"
                                    min="0"
                                    value={groupSettings.slowMode}
                                    onChange={(e) =>
                                      setGroupSettings({
                                        ...groupSettings,
                                        slowMode: parseInt(e.target.value) || 0,
                                      })
                                    }
                                  />
                                  <p className="text-sm text-gray-500 mt-1">
                                    Délai minimum entre les messages (0 =
                                    désactivé)
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowSettingsModal(false)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={handleUpdateGroup}
                                  disabled={isLoading}
                                >
                                  Enregistrer
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Liste des membres */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Membres ({selectedGroup.participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {selectedGroup.participants.map((member) => {
                          const memberRole = getUserRole(
                            selectedGroup,
                            member.id,
                          );
                          const canRemove =
                            canManageGroup(selectedGroup) &&
                            member.id !== user?.id &&
                            memberRole !== "owner";

                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>
                                    {member.username[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium">
                                      {member.username}
                                    </p>
                                    {getRoleIcon(memberRole)}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {getRoleName(memberRole)}
                                  </p>
                                </div>
                              </div>

                              {canRemove && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveUser(member.id)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Sélectionnez un groupe
                  </h3>
                  <p className="text-gray-500">
                    Choisissez un groupe dans la liste pour voir ses détails
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
