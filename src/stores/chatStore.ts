import { create } from "zustand";
import { ChatState, Chat, Message, User } from "../types";

interface ChatStore extends ChatState {
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  setMessages: (messages: Message[]) => void;
  setOnlineUsers: (users: string[]) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  removeUserFromChat: (chatId: string, userId: string) => void;
  addUserToChat: (chatId: string, user: User) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  onlineUsers: [],
  typing: {},

  setChats: (chats) => set({ chats }),

  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),

  addMessage: (message) => {
    const { messages, currentChat } = get();
    if (currentChat && message.chatId === currentChat.id) {
      set({ messages: [...messages, message] });
    }
  },

  updateMessage: (messageId, content) => {
    const { messages } = get();
    set({
      messages: messages.map((msg) =>
        msg.id === messageId ? { ...msg, content, editedAt: new Date() } : msg,
      ),
    });
  },

  deleteMessage: (messageId) => {
    const { messages } = get();
    set({
      messages: messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, isDeleted: true, content: "Message supprimé" }
          : msg,
      ),
    });
  },

  setMessages: (messages) => set({ messages }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setTyping: (userId, isTyping) => {
    const { typing } = get();
    if (isTyping) {
      set({ typing: { ...typing, [userId]: true } });
    } else {
      const newTyping = { ...typing };
      delete newTyping[userId];
      set({ typing: newTyping });
    }
  },

  addChat: (chat) => {
    const { chats } = get();
    set({ chats: [...chats, chat] });
  },

  updateChat: (chatId, updates) => {
    const { chats } = get();
    set({
      chats: chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat,
      ),
    });
  },

  removeUserFromChat: (chatId, userId) => {
    const { chats } = get();
    set({
      chats: chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              participants: chat.participants.filter((p) => p.id !== userId),
              admins: chat.admins.filter((id) => id !== userId),
              moderators: chat.moderators.filter((id) => id !== userId),
            }
          : chat,
      ),
    });
  },

  addUserToChat: (chatId, user) => {
    const { chats } = get();
    set({
      chats: chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, participants: [...chat.participants, user] }
          : chat,
      ),
    });
  },
}));
