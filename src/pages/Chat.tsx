import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Settings, Users, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { UserProfileDialog } from "@/components/chat/UserProfileDialog";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { GroupSettingsDialog } from "@/components/chat/GroupSettingsDialog";

export default function Chat() {
  const { user } = useAuth();
  const {
    groups,
    currentGroup,
    currentRecipient,
    loadGroups,
    initializeRealtime,
    cleanup,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState("");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadGroups();
      initializeRealtime();
    }

    return () => {
      cleanup();
    };
  }, [user]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return null; // Ou redirection vers login
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar mobile */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ChatSidebar
            user={user}
            groups={filteredGroups}
            currentGroup={currentGroup}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onGroupSelect={(group) => {
              setIsMobileSidebarOpen(false);
            }}
            onShowUserProfile={() => setShowUserProfile(true)}
            onShowCreateGroup={() => setShowCreateGroup(true)}
            onShowGroupSettings={() => setShowGroupSettings(true)}
          />
        </SheetContent>
      </Sheet>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-80 border-r border-border">
        <ChatSidebar
          user={user}
          groups={filteredGroups}
          currentGroup={currentGroup}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onGroupSelect={() => {}}
          onShowUserProfile={() => setShowUserProfile(true)}
          onShowCreateGroup={() => setShowCreateGroup(true)}
          onShowGroupSettings={() => setShowGroupSettings(true)}
        />
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Users className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex items-center space-x-2">
            {currentGroup ? (
              <>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentGroup.avatar} />
                  <AvatarFallback>
                    {currentGroup.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm">{currentGroup.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {currentGroup.members.length} membres
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                <span className="font-semibold gradient-text">YupiChat</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGroupSettings(true)}
            disabled={!currentGroup}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Zone de chat */}
        <ChatArea
          currentGroup={currentGroup}
          currentRecipient={currentRecipient}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        user={user}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />

      {currentGroup && (
        <GroupSettingsDialog
          open={showGroupSettings}
          onOpenChange={setShowGroupSettings}
          group={currentGroup}
        />
      )}
    </div>
  );
}
