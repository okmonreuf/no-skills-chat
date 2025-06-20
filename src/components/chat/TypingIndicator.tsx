import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypingIndicator as TypingIndicatorType } from "@/services/chat";

interface TypingIndicatorProps {
  users: TypingIndicatorType[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0].username} écrit...`;
    } else if (users.length === 2) {
      return `${users[0].username} et ${users[1].username} écrivent...`;
    } else {
      return `${users[0].username} et ${users.length - 1} autres écrivent...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 ml-2"
    >
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <Avatar
            key={user.userId}
            className="w-6 h-6 border-2 border-background"
          >
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-sm text-muted-foreground">{getUsersText()}</span>
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </motion.div>
  );
}
