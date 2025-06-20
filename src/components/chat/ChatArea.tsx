import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  Phone,
  Video,
  Info,
  MessageCircle,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Group } from "@/services/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmojiPicker } from "./EmojiPicker";

interface ChatAreaProps {
  currentGroup: Group | null;
  currentRecipient: string | null;
  onOpenMobileSidebar: () => void;
}

export function ChatArea({
  currentGroup,
  currentRecipient,
  onOpenMobileSidebar,
}: ChatAreaProps) {
  const { user } = useAuth();
  const {
    messages,
    isLoadingMessages,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gérer l'indication de frappe
  useEffect(() => {
    if (messageText && !isTyping) {
      setIsTyping(true);
      startTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) return;

    try {
      await sendMessage(messageText.trim(), undefined, selectedFiles);
      setMessageText("");
      setSelectedFiles([]);
      setIsTyping(false);
      stopTyping();

      // Focus sur l'input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const getTypingUsers = () => {
    return typingUsers.filter(
      (typing) =>
        typing.userId !== user?.id &&
        ((currentGroup && typing.groupId === currentGroup.id) ||
          (currentRecipient && !typing.groupId)),
    );
  };

  if (!currentGroup && !currentRecipient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Bienvenue sur YupiChat</h3>
            <p className="text-muted-foreground">
              Sélectionnez un groupe ou démarrez une conversation pour commencer
              à discuter
            </p>
          </div>
          <Button onClick={onOpenMobileSidebar} className="lg:hidden">
            <Users className="w-4 h-4 mr-2" />
            Voir les groupes
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header du chat */}
      {currentGroup && (
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentGroup.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentGroup.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{currentGroup.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{currentGroup.members.length} membres</span>
                <span>•</span>
                <Badge
                  variant="secondary"
                  className="bg-chat-online/10 text-chat-online"
                >
                  {
                    currentGroup.members.filter((m) => m.status === "online")
                      .length
                  }{" "}
                  en ligne
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Paramètres du groupe</DropdownMenuItem>
                <DropdownMenuItem>Membres</DropdownMenuItem>
                <DropdownMenuItem>Fichiers partagés</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Quitter le groupe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Zone des messages */}
      <ScrollArea className="flex-1 chat-scrollbar">
        <div className="p-4 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user?.id}
                  isFirstInGroup={
                    index === 0 ||
                    messages[index - 1].senderId !== message.senderId
                  }
                  isLastInGroup={
                    index === messages.length - 1 ||
                    messages[index + 1].senderId !== message.senderId
                  }
                />
              ))}
            </AnimatePresence>
          )}

          {/* Indicateur de frappe */}
          {getTypingUsers().length > 0 && (
            <TypingIndicator users={getTypingUsers()} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-border">
        {/* Fichiers sélectionnés */}
        {selectedFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-muted-foreground">Fichiers à envoyer:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-muted/50 rounded-lg p-2"
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                  ) : (
                    <File className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          {/* Bouton fichiers */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </div>

          {/* Zone de saisie */}
          <div className="flex-1 relative">
            <Textarea
              ref={messageInputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                currentGroup
                  ? `Envoyer un message dans #${currentGroup.name}...`
                  : "Envoyer un message..."
              }
              className="min-h-[2.5rem] max-h-32 resize-none pr-12"
              rows={1}
            />

            {/* Bouton emoji */}
            <div className="absolute right-2 bottom-2">
              <DropdownMenu
                open={showEmojiPicker}
                onOpenChange={setShowEmojiPicker}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Smile className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <EmojiPicker onEmojiSelect={addEmoji} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bouton envoyer */}
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() && selectedFiles.length === 0}
            className="h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
