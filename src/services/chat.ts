import { authService } from "./auth";

export interface Group {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  avatar?: string;
  members: GroupMember[];
  admins: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: Date;
  role: "admin" | "member";
  status: "online" | "offline" | "away";
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  groupId?: string;
  recipientId?: string;
  isPrivate: boolean;
  timestamp: Date;
  editedAt?: Date;
  isRead: boolean;
  readBy: MessageRead[];
  attachments?: MessageAttachment[];
  replyTo?: string;
  reactions: MessageReaction[];
}

export interface MessageRead {
  userId: string;
  readAt: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file" | "video" | "audio";
  size: number;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  username: string;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  groupId?: string;
  isTyping: boolean;
}

class ChatService {
  private baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  async getGroups(): Promise<Group[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/groups`, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors du chargement des groupes",
        );
      }

      return data.groups;
    } catch (error) {
      console.error("Erreur getGroups:", error);
      throw error;
    }
  }

  async createGroup(groupData: {
    name: string;
    description?: string;
    isPrivate: boolean;
  }): Promise<Group> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création du groupe");
      }

      return data.group;
    } catch (error) {
      console.error("Erreur createGroup:", error);
      throw error;
    }
  }

  async joinGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/groups/${groupId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'adhésion au groupe");
      }
    } catch (error) {
      console.error("Erreur joinGroup:", error);
      throw error;
    }
  }

  async leaveGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/groups/${groupId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la sortie du groupe");
      }
    } catch (error) {
      console.error("Erreur leaveGroup:", error);
      throw error;
    }
  }

  async getMessages(
    groupId?: string,
    recipientId?: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: Message[]; totalPages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (groupId) params.append("groupId", groupId);
      if (recipientId) params.append("recipientId", recipientId);

      const response = await fetch(
        `${this.baseURL}/api/chat/messages?${params}`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors du chargement des messages",
        );
      }

      return data;
    } catch (error) {
      console.error("Erreur getMessages:", error);
      throw error;
    }
  }

  async sendMessage(messageData: {
    content: string;
    groupId?: string;
    recipientId?: string;
    replyTo?: string;
    attachments?: File[];
  }): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append("content", messageData.content);

      if (messageData.groupId) formData.append("groupId", messageData.groupId);
      if (messageData.recipientId)
        formData.append("recipientId", messageData.recipientId);
      if (messageData.replyTo) formData.append("replyTo", messageData.replyTo);

      if (messageData.attachments) {
        messageData.attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }

      const response = await fetch(`${this.baseURL}/api/chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi du message");
      }

      return data.message;
    } catch (error) {
      console.error("Erreur sendMessage:", error);
      throw error;
    }
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/messages/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({ content }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la modification du message",
        );
      }

      return data.message;
    } catch (error) {
      console.error("Erreur editMessage:", error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la suppression du message",
        );
      }
    } catch (error) {
      console.error("Erreur deleteMessage:", error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/messages/${messageId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors du marquage comme lu");
      }
    } catch (error) {
      console.error("Erreur markAsRead:", error);
      throw error;
    }
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({ emoji }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de l'ajout de réaction");
      }
    } catch (error) {
      console.error("Erreur addReaction:", error);
      throw error;
    }
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/chat/messages/${messageId}/reactions`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({ emoji }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Erreur lors de la suppression de réaction",
        );
      }
    } catch (error) {
      console.error("Erreur removeReaction:", error);
      throw error;
    }
  }

  sendTypingIndicator(groupId?: string, recipientId?: string): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.emit("typing", { groupId, recipientId, isTyping: true });
    }
  }

  stopTypingIndicator(groupId?: string, recipientId?: string): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.emit("typing", { groupId, recipientId, isTyping: false });
    }
  }

  subscribeToMessages(callback: (message: Message) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("newMessage", callback);
    }
  }

  subscribeToMessageUpdates(callback: (message: Message) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("messageUpdated", callback);
    }
  }

  subscribeToMessageDeletes(callback: (messageId: string) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("messageDeleted", callback);
    }
  }

  subscribeToTyping(callback: (typing: TypingIndicator) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("userTyping", callback);
    }
  }

  subscribeToGroupUpdates(callback: (group: Group) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("groupUpdated", callback);
    }
  }

  unsubscribeFromMessages(): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
      socket.off("userTyping");
      socket.off("groupUpdated");
    }
  }
}

export const chatService = new ChatService();
