import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Copy,
  Heart,
  Smile,
  Check,
  CheckCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Message } from "@/services/chat";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const { editMessage, deleteMessage, addReaction, removeReaction } = useChat();

  const [isHovered, setIsHovered] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Formatage de l'heure en fuseau horaire de Paris
  const formatTime = (date: Date) => {
    return format(new Date(date), "HH:mm", { locale: fr });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return format(messageDate, "dd/MM/yyyy", { locale: fr });
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      const existingReaction = message.reactions.find(
        (r) => r.emoji === emoji && r.userId === user?.id,
      );

      if (existingReaction) {
        await removeReaction(message.id, emoji);
      } else {
        await addReaction(message.id, emoji);
      }
    } catch (error) {
      console.error("Erreur lors de la réaction:", error);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleEditMessage = () => {
    // TODO: Implémenter l'édition de message
    console.log("Éditer le message:", message.id);
  };

  const handleDeleteMessage = async () => {
    try {
      await deleteMessage(message.id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const getReadStatus = () => {
    if (!isOwn) return null;

    const readCount = message.readBy.length;
    if (readCount === 0) {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    } else {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
  };

  const quickReactions = ["❤️", "👍", "😂", "😮", "😢", "👎"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex",
        isOwn ? "justify-end" : "justify-start",
        isFirstInGroup ? "mt-4" : "mt-1",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar pour les messages des autres (seulement le dernier du groupe) */}
      {!isOwn && isLastInGroup && (
        <Avatar className="w-8 h-8 mr-2 mt-auto">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.senderUsername.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Espace pour maintenir l'alignement */}
      {!isOwn && !isLastInGroup && <div className="w-10 mr-2" />}

      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {/* Nom de l'utilisateur (seulement pour le premier message du groupe) */}
        {!isOwn && isFirstInGroup && (
          <span className="text-xs text-muted-foreground mb-1 ml-2">
            {message.senderUsername}
          </span>
        )}

        <div className="relative group">
          {/* Bulle de message */}
          <div
            className={cn(
              "message-bubble relative max-w-md px-4 py-2 rounded-2xl",
              isOwn
                ? "bg-chat-bubble-own text-white"
                : "bg-chat-bubble-other text-foreground",
              isFirstInGroup && isOwn && "rounded-tr-md",
              isFirstInGroup && !isOwn && "rounded-tl-md",
              isLastInGroup && isOwn && "rounded-br-md",
              isLastInGroup && !isOwn && "rounded-bl-md",
            )}
          >
            {/* Message de réponse */}
            {message.replyTo && (
              <div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-primary">
                <p className="text-xs opacity-75">Réponse à un message</p>
              </div>
            )}

            {/* Contenu du message */}
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>

            {/* Pièces jointes */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-black/10 rounded-lg p-2"
                  >
                    {attachment.type === "image" ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                          <span className="text-xs font-mono">
                            {attachment.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium">
                            {attachment.name}
                          </p>
                          <p className="text-xs opacity-75">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Métadonnées */}
            <div
              className={cn(
                "flex items-center justify-between mt-1 text-xs",
                isOwn ? "text-white/70" : "text-muted-foreground",
              )}
            >
              <span>{formatTime(message.timestamp)}</span>
              <div className="flex items-center space-x-1">
                {message.editedAt && (
                  <span className="text-xs opacity-50">(modifié)</span>
                )}
                {getReadStatus()}
              </div>
            </div>
          </div>

          {/* Réactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(
                message.reactions.reduce(
                  (acc, reaction) => {
                    if (!acc[reaction.emoji]) {
                      acc[reaction.emoji] = [];
                    }
                    acc[reaction.emoji].push(reaction);
                    return acc;
                  },
                  {} as Record<string, typeof message.reactions>,
                ),
              ).map(([emoji, reactions]) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs rounded-full",
                    reactions.some((r) => r.userId === user?.id) &&
                      "bg-primary/20 border-primary",
                  )}
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji} {reactions.length}
                </Button>
              ))}
            </div>
          )}

          {/* Menu contextuel */}
          {(isHovered || showReactions) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "absolute top-0 flex items-center space-x-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg",
                isOwn ? "-left-20" : "-right-20",
              )}
            >
              {/* Réactions rapides */}
              <div className="flex items-center space-x-1">
                {quickReactions.slice(0, 3).map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-sm hover:scale-110 transition-transform"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>

              <div className="w-px h-4 bg-border" />

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Smile className="w-3 h-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {}}>
                    <Reply className="w-4 h-4 mr-2" />
                    Répondre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyMessage}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </DropdownMenuItem>
                  {isOwn && (
                    <>
                      <DropdownMenuItem onClick={handleEditMessage}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteMessage}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
