import { io, Socket } from "socket.io-client";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "moderator" | "user";
  avatar?: string;
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpires?: Date;
  lastSeen: Date;
  status: "online" | "offline" | "away";
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  private baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  private socket: Socket | null = null;
  private user: User | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        this.user = JSON.parse(userData);
        this.connectSocket();
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error,
        );
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.user = null;
    this.disconnectSocket();
  }

  private connectSocket(): void {
    if (!this.socket && this.user) {
      this.socket = io(this.baseURL, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      this.socket.on("connect", () => {
        console.log("Connecté au serveur WebSocket");
      });

      this.socket.on("disconnect", () => {
        console.log("Déconnecté du serveur WebSocket");
      });

      this.socket.on("userBanned", (data) => {
        if (data.userId === this.user?.id) {
          this.handleBan(data);
        }
      });
    }
  }

  private disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleBan(banData: { reason: string; expires?: Date }): void {
    this.clearStorage();
    window.location.href = `/banned?reason=${encodeURIComponent(banData.reason)}&expires=${banData.expires || ""}`;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      this.user = data.user;
      this.connectSocket();

      return data.user;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  }

  async register(registerData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'inscription");
      }

      return data.user;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      this.clearStorage();
    }
  }

  async verifyEmail(code: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de vérification");
      }

      if (this.user) {
        this.user.isVerified = true;
        localStorage.setItem("user", JSON.stringify(this.user));
      }
    } catch (error) {
      console.error("Erreur de vérification email:", error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de mise à jour");
      }

      this.user = data.user;
      localStorage.setItem("user", JSON.stringify(this.user));

      return data.user;
    } catch (error) {
      console.error("Erreur de mise à jour profil:", error);
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${this.baseURL}/api/auth/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'upload");
      }

      if (this.user) {
        this.user.avatar = data.avatarUrl;
        localStorage.setItem("user", JSON.stringify(this.user));
      }

      return data.avatarUrl;
    } catch (error) {
      console.error("Erreur d'upload avatar:", error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.user && !!localStorage.getItem("token");
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false;

    if (this.user.role === "admin") return true;

    if (this.user.role === "moderator") {
      const moderatorPermissions = [
        "manage_groups",
        "view_user_profiles",
        "timeout_users",
        "manage_public_messages",
      ];
      return moderatorPermissions.includes(permission);
    }

    return false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const authService = new AuthService();
