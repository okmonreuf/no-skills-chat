import { io, Socket } from "socket.io-client";
import moment from "moment-timezone";

// Configuration pour le domaine no-skills.fr
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://no-skills.fr"
    : "http://localhost:3001";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connecté au serveur Socket.io");
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion Socket.io:", error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error("Impossible de se connecter au serveur"));
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Déconnecté du serveur:", reason);
      });

      // Configuration du timezone Paris pour tous les messages
      this.socket.on("message", (data) => {
        data.createdAt = moment.tz(data.createdAt, "Europe/Paris").toDate();
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Messages en temps réel
  onMessage(callback: (message: any) => void) {
    this.socket?.on("newMessage", callback);
  }

  onMessageUpdate(callback: (message: any) => void) {
    this.socket?.on("messageUpdated", callback);
  }

  onMessageDelete(callback: (messageId: string) => void) {
    this.socket?.on("messageDeleted", callback);
  }

  // Envoi de messages
  sendMessage(chatId: string, content: string, replyTo?: string) {
    this.socket?.emit("sendMessage", {
      chatId,
      content,
      replyTo,
      timestamp: moment.tz("Europe/Paris").toDate(),
    });
  }

  // Indicateur de frappe
  onTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void,
  ) {
    this.socket?.on("typing", callback);
  }

  setTyping(chatId: string, isTyping: boolean) {
    this.socket?.emit("typing", { chatId, isTyping });
  }

  // Utilisateurs en ligne
  onUsersOnline(callback: (users: string[]) => void) {
    this.socket?.on("usersOnline", callback);
  }

  // Notifications admin en temps réel
  onAdminNotification(callback: (notification: any) => void) {
    this.socket?.on("adminNotification", callback);
  }

  onUserBanned(callback: (data: any) => void) {
    this.socket?.on("userBanned", callback);
  }

  onUserUnbanned(callback: (data: any) => void) {
    this.socket?.on("userUnbanned", callback);
  }

  // Gestion des groupes
  onGroupUpdate(callback: (group: any) => void) {
    this.socket?.on("groupUpdated", callback);
  }

  onUserJoinedGroup(callback: (data: any) => void) {
    this.socket?.on("userJoinedGroup", callback);
  }

  onUserLeftGroup(callback: (data: any) => void) {
    this.socket?.on("userLeftGroup", callback);
  }

  // Méthodes utilitaires
  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Rejoindre/quitter des salles
  joinRoom(roomId: string) {
    this.socket?.emit("joinRoom", roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit("leaveRoom", roomId);
  }
}

export const socketService = new SocketService();
