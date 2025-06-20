import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Settings,
  LogOut,
  User,
  MessageCircle,
  Users,
  Lock,
  Crown,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Group } from "@/services/chat";
import { User as UserType } from "@/services/auth";

interface ChatSidebarProps {
  user: UserType;
  groups: Group[];
  currentGroup: Group | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onGroupSelect: (group: Group) => void;
  onShowUserProfile: () => void;
  onShowCreateGroup: () => void;
  onShowGroupSettings: () => void;
}

export function ChatSidebar({
  user,
  groups,
  currentGroup,
  searchTerm,
  onSearchChange,
  onGroupSelect,
  onShowUserProfile,
  onShowCreateGroup,
  onShowGroupSettings,
}: ChatSidebarProps) {
  const { logout } = useAuth();
  const { setCurrentGroup } = useChat();

  const [activeTab, setActiveTab] = useState<"groups" | "direct">("groups");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const handleGroupClick = (group: Group) => {
    setCurrentGroup(group);
    onGroupSelect(group);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getOnlineCount = (group: Group) => {
    return group.members.filter((member) => member.status === "online").length;
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header utilisateur */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10 status-indicator online">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-sidebar-foreground truncate">
                {user.username}
              </h3>
              {getRoleIcon(user.role)}
            </div>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onShowUserProfile}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/admin")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Panel Admin
                </DropdownMenuItem>
              )}
              {(user.role === "admin" || user.role === "moderator") && (
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/moderator")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Panel Modérateur
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>

        {/* Onglets */}
        <div className="flex bg-sidebar-accent/50 rounded-lg p-1">
          <Button
            variant={activeTab === "groups" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setActiveTab("groups")}
          >
            <Users className="w-4 h-4 mr-1" />
            Groupes
          </Button>
          <Button
            variant={activeTab === "direct" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setActiveTab("direct")}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Direct
          </Button>
        </div>
      </div>

      {/* Liste des groupes/conversations */}
      <ScrollArea className="flex-1 px-2 chat-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "groups" && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-1 pb-4"
            >
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={
                      currentGroup?.id === group.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start h-auto p-3 relative group"
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {group.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {group.isPrivate && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {group.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-chat-online/10 text-chat-online text-xs"
                          >
                            {getOnlineCount(group)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.members.length} membres
                        </p>
                      </div>
                    </div>

                    {/* Notification badge */}
                    {/* TODO: Ajouter logique pour messages non lus */}
                    {false && <div className="notification-badge">3</div>}
                  </Button>
                </motion.div>
              ))}

              {/* Bouton créer un groupe */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-dashed border-primary/50 text-primary hover:bg-primary/10"
                  onClick={onShowCreateGroup}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un groupe
                </Button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "direct" && (
            <motion.div
              key="direct"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-1 pb-4"
            >
              {/* TODO: Implémenter la liste des conversations directes */}
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune conversation directe</p>
                <p className="text-xs">
                  Cliquez sur un utilisateur pour démarrer une conversation
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>YupiChat v1.0</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>En ligne</span>
          </div>
        </div>
      </div>
    </div>
  );
}
