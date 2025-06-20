import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { socketService } from "../services/socket";
import { apiService } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Settings,
  Search,
  UserPlus,
  Crown,
  Shield,
  Circle,
  Phone,
  Video,
} from "lucide-react";
import { Chat, Message, User } from "../types";
import moment from "moment-timezone";
import { cn } from "../lib/utils";
import EmojiPicker from "@emoji-mart/react";

export default function ChatPage() {
  const { user, token, logout } = useAuthStore();
  const {
    chats,
    currentChat,
    messages,
    onlineUsers,
    typing,
    setChats,
    setCurrentChat,
    addMessage,
    setMessages,
    setOnlineUsers,
    setTyping,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user && token) {
      initializeChat();
    }
  }, [user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Connexion Socket.io
      await socketService.connect(token!);

      // Charger les chats
      const userChats = await apiService.getChats(token!);
      setChats(userChats);

      // Configuration des événements Socket.io
      setupSocketEvents();
    } catch (error) {
      console.error("Erreur d'initialisation:", error);
    }
  };

  const setupSocketEvents = () => {
    // Messages en temps réel
    socketService.onMessage((message: Message) => {
      addMessage(message);
    });

    // Utilisateurs en ligne
    socketService.onUsersOnline((users: string[]) => {
      setOnlineUsers(users);
    });

    // Indicateur de frappe
    socketService.onTyping(({ userId, chatId, isTyping }) => {
      if (currentChat?.id === chatId && userId !== user?.id) {
        setTyping(userId, isTyping);
      }
    });
  };

  const handleChatSelect = async (chat: Chat) => {
    setCurrentChat(chat);
    socketService.joinRoom(chat.id);

    try {
      const { messages: chatMessages } = await apiService.getMessages(
        chat.id,
        1,
        token!,
      );
      setMessages(chatMessages);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentChat) return;

    socketService.sendMessage(currentChat.id, messageInput.trim());
    setMessageInput("");
    setShowEmojiPicker(false);

    // Arrêter l'indicateur de frappe
    if (isTyping) {
      socketService.setTyping(currentChat.id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!currentChat) return;

    if (value.length > 0 && !isTyping) {
      socketService.setTyping(currentChat.id, true);
      setIsTyping(true);
    }

    // Reset du timeout de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socketService.setTyping(currentChat.id, false);
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessageInput((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (date: Date) => {
    return moment.tz(date, "Europe/Paris").format("HH:mm");
  };

  const formatChatTime = (date: Date) => {
    const msgMoment = moment.tz(date, "Europe/Paris");
    const today = moment.tz("Europe/Paris");

    if (msgMoment.isSame(today, "day")) {
      return msgMoment.format("HH:mm");
    } else if (msgMoment.isSame(today.clone().subtract(1, "day"), "day")) {
      return "Hier";
    } else {
      return msgMoment.format("DD/MM");
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participants.some((p) =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const getTypingUsers = () => {
    return Object.keys(typing).filter(
      (userId) => typing[userId] && userId !== user?.id,
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  return (
    <div
      className={cn("flex h-screen bg-gray-100", {
        "bg-gray-900": selectedTheme === "dark",
        "bg-blue-50": selectedTheme === "blue",
      })}
    >
      {/* Sidebar - Liste des chats */}
      <div
        className={cn("w-80 bg-white border-r border-gray-200 flex flex-col", {
          "bg-gray-800 border-gray-700": selectedTheme === "dark",
          "bg-blue-100 border-blue-200": selectedTheme === "blue",
        })}
      >
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3
                  className={cn("font-semibold text-gray-900", {
                    "text-white": selectedTheme === "dark",
                  })}
                >
                  {user?.username}
                </h3>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(user?.role || "user")}
                  <Badge
                    variant={user?.role === "admin" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {user?.role === "admin"
                      ? "Admin"
                      : user?.role === "moderator"
                        ? "Modo"
                        : "Utilisateur"}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                {(user?.role === "admin" || user?.role === "moderator") && (
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/admin")}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des chats */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                  {
                    "bg-blue-50 hover:bg-blue-100": currentChat?.id === chat.id,
                    "hover:bg-gray-700": selectedTheme === "dark",
                    "bg-blue-200":
                      currentChat?.id === chat.id && selectedTheme === "blue",
                  },
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {chat.type === "group" ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        chat.name[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === "private" &&
                    chat.participants.some(
                      (p) => p.id !== user?.id && isUserOnline(p.id),
                    ) && (
                      <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-current" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn("font-medium text-gray-900 truncate", {
                        "text-white": selectedTheme === "dark",
                      })}
                    >
                      {chat.name}
                    </h4>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatChatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage.isDeleted
                        ? "Message supprimé"
                        : chat.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Zone de chat principal */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Header du chat */}
            <div
              className={cn("bg-white border-b border-gray-200 p-4", {
                "bg-gray-800 border-gray-700": selectedTheme === "dark",
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentChat.avatar} />
                    <AvatarFallback>
                      {currentChat.type === "group" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        currentChat.name[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3
                      className={cn("font-semibold text-gray-900", {
                        "text-white": selectedTheme === "dark",
                      })}
                    >
                      {currentChat.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentChat.type === "group"
                        ? `${currentChat.participants.length} membres`
                        : isUserOnline(
                              currentChat.participants.find(
                                (p) => p.id !== user?.id,
                              )?.id || "",
                            )
                          ? "En ligne"
                          : "Hors ligne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {currentChat.type === "private" && (
                    <>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {currentChat.type === "group" && (
                        <>
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Ajouter des membres
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Paramètres du groupe
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Personnaliser l'interface
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.userId === user?.id;
                  const showAvatar =
                    index === 0 ||
                    messages[index - 1].userId !== message.userId;

                  return (
                    <div
                      key={message.id}
                      className={cn("flex items-end space-x-2", {
                        "flex-row-reverse space-x-reverse": isOwn,
                      })}
                    >
                      {showAvatar && !isOwn && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {message.user.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn("max-w-xs lg:max-w-md xl:max-w-lg", {
                          "ml-10": !showAvatar && !isOwn,
                        })}
                      >
                        {showAvatar && !isOwn && (
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {message.user.username}
                            </span>
                            {getRoleIcon(message.user.role)}
                          </div>
                        )}

                        <div
                          className={cn("rounded-lg px-4 py-2", {
                            "bg-blue-500 text-white": isOwn,
                            "bg-gray-200 text-gray-900": !isOwn,
                            "bg-gray-700 text-white":
                              !isOwn && selectedTheme === "dark",
                          })}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>

                        <div
                          className={cn("flex items-center mt-1 space-x-1", {
                            "justify-end": isOwn,
                          })}
                        >
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {message.editedAt && (
                            <span className="text-xs text-gray-400">
                              (modifié)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Indicateur de frappe */}
                {getTypingUsers().length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">...</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-200 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div
              className={cn("bg-white border-t border-gray-200 p-4", {
                "bg-gray-800 border-gray-700": selectedTheme === "dark",
              })}
            >
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Tapez votre message..."
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="pr-20"
                  />

                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-50">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Écran de sélection */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez un chat dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
