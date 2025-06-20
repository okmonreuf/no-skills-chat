export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "admin" | "moderator" | "user";
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  banUntil?: Date;
  ipBanned?: string[];
  createdAt: Date;
  lastActive: Date;
  chatTheme?: string;
  permissions?: string[];
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  user: User;
  chatId: string;
  createdAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  replyTo?: string;
  attachments?: string[];
}

export interface Chat {
  id: string;
  name: string;
  description?: string;
  type: "private" | "group";
  avatar?: string;
  createdBy: string;
  participants: User[];
  admins: string[];
  moderators: string[];
  createdAt: Date;
  lastMessage?: Message;
  settings: {
    allowFiles: boolean;
    allowEmojis: boolean;
    slowMode: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  onlineUsers: string[];
  typing: { [userId: string]: boolean };
}

export interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  totalGroups: number;
  bannedUsers: number;
  activeUsers: number;
  recentActivity: any[];
}

export interface BanInfo {
  reason: string;
  duration: number; // en minutes, 0 = permanent
  banType: "account" | "ip";
}

export interface NotificationSettings {
  messages: boolean;
  mentions: boolean;
  groups: boolean;
  email: boolean;
}
