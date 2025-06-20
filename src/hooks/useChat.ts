import { create } from "zustand";
import { chatService, Group, Message, TypingIndicator } from "@/services/chat";

interface ChatState {
  // État
  groups: Group[];
  messages: Message[];
  currentGroup: Group | null;
  currentRecipient: string | null;
  isLoadingGroups: boolean;
  isLoadingMessages: boolean;
  typingUsers: TypingIndicator[];

  // Actions
  loadGroups: () => Promise<void>;
  loadMessages: (groupId?: string, recipientId?: string) => Promise<void>;
  sendMessage: (
    content: string,
    replyTo?: string,
    attachments?: File[],
  ) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;

  // Groupes
  createGroup: (
    name: string,
    description?: string,
    isPrivate?: boolean,
  ) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  setCurrentGroup: (group: Group | null) => void;
  setCurrentRecipient: (recipientId: string | null) => void;

  // Temps réel
  startTyping: () => void;
  stopTyping: () => void;
  initializeRealtime: () => void;
  cleanup: () => void;
}

export const useChat = create<ChatState>((set, get) => ({
  groups: [],
  messages: [],
  currentGroup: null,
  currentRecipient: null,
  isLoadingGroups: false,
  isLoadingMessages: false,
  typingUsers: [],

  loadGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      const groups = await chatService.getGroups();
      set({ groups, isLoadingGroups: false });
    } catch (error) {
      console.error("Erreur lors du chargement des groupes:", error);
      set({ isLoadingGroups: false });
    }
  },

  loadMessages: async (groupId, recipientId) => {
    set({ isLoadingMessages: true });
    try {
      const { messages } = await chatService.getMessages(groupId, recipientId);
      set({ messages, isLoadingMessages: false });
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, replyTo, attachments) => {
    const { currentGroup, currentRecipient } = get();
    try {
      const message = await chatService.sendMessage({
        content,
        groupId: currentGroup?.id,
        recipientId: currentRecipient || undefined,
        replyTo,
        attachments,
      });

      // Le message sera ajouté via WebSocket
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },

  editMessage: async (messageId, content) => {
    try {
      await chatService.editMessage(messageId, content);
      // Le message sera mis à jour via WebSocket
    } catch (error) {
      console.error("Erreur lors de la modification du message:", error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      // Le message sera supprimé via WebSocket
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      throw error;
    }
  },

  markAsRead: async (messageId) => {
    try {
      await chatService.markAsRead(messageId);
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      await chatService.addReaction(messageId, emoji);
    } catch (error) {
      console.error("Erreur lors de l'ajout de réaction:", error);
      throw error;
    }
  },

  removeReaction: async (messageId, emoji) => {
    try {
      await chatService.removeReaction(messageId, emoji);
    } catch (error) {
      console.error("Erreur lors de la suppression de réaction:", error);
      throw error;
    }
  },

  createGroup: async (name, description, isPrivate = false) => {
    try {
      const group = await chatService.createGroup({
        name,
        description,
        isPrivate,
      });
      set((state) => ({ groups: [...state.groups, group] }));
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
      throw error;
    }
  },

  joinGroup: async (groupId) => {
    try {
      await chatService.joinGroup(groupId);
      // Le groupe sera mis à jour via WebSocket
    } catch (error) {
      console.error("Erreur lors de l'adhésion au groupe:", error);
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await chatService.leaveGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        currentGroup:
          state.currentGroup?.id === groupId ? null : state.currentGroup,
      }));
    } catch (error) {
      console.error("Erreur lors de la sortie du groupe:", error);
      throw error;
    }
  },

  setCurrentGroup: (group) => {
    set({ currentGroup: group, currentRecipient: null });
    if (group) {
      get().loadMessages(group.id);
    }
  },

  setCurrentRecipient: (recipientId) => {
    set({ currentRecipient: recipientId, currentGroup: null });
    if (recipientId) {
      get().loadMessages(undefined, recipientId);
    }
  },

  startTyping: () => {
    const { currentGroup, currentRecipient } = get();
    chatService.sendTypingIndicator(
      currentGroup?.id,
      currentRecipient || undefined,
    );
  },

  stopTyping: () => {
    const { currentGroup, currentRecipient } = get();
    chatService.stopTypingIndicator(
      currentGroup?.id,
      currentRecipient || undefined,
    );
  },

  initializeRealtime: () => {
    // Écouter les nouveaux messages
    chatService.subscribeToMessages((message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    // Écouter les mises à jour de messages
    chatService.subscribeToMessageUpdates((message) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === message.id ? message : m,
        ),
      }));
    });

    // Écouter les suppressions de messages
    chatService.subscribeToMessageDeletes((messageId) => {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    });

    // Écouter les indicateurs de frappe
    chatService.subscribeToTyping((typing) => {
      set((state) => {
        const existingIndex = state.typingUsers.findIndex(
          (t) => t.userId === typing.userId && t.groupId === typing.groupId,
        );

        if (typing.isTyping) {
          if (existingIndex === -1) {
            return { typingUsers: [...state.typingUsers, typing] };
          }
        } else {
          if (existingIndex !== -1) {
            return {
              typingUsers: state.typingUsers.filter(
                (_, i) => i !== existingIndex,
              ),
            };
          }
        }
        return state;
      });
    });

    // Écouter les mises à jour de groupes
    chatService.subscribeToGroupUpdates((group) => {
      set((state) => ({
        groups: state.groups.map((g) => (g.id === group.id ? group : g)),
      }));
    });
  },

  cleanup: () => {
    chatService.unsubscribeFromMessages();
  },
}));
