import { authService, User } from "./auth";
import { Group } from "./chat";

export interface AdminStats {
  totalUsers: number;
  totalGroups: number;
  totalMessages: number;
  activeUsers: number;
  bannedUsers: number;
  unverifiedUsers: number;
  messagesLast24h: number;
  newUsersLast7days: number;
}

export interface BanData {
  userId: string;
  reason: string;
  duration?: number; // en minutes, undefined = permanent
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
}

export interface ModeratorData {
  username: string;
  email: string;
  password: string;
  permissions?: string[];
}

export interface SystemLog {
  id: string;
  type: "auth" | "chat" | "admin" | "error" | "warning" | "info";
  message: string;
  userId?: string;
  username?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface IPBan {
  id: string;
  ip: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
}

class AdminService {
  private baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/admin${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getToken()}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur serveur");
    }

    return data;
  }

  // Statistiques globales
  async getStats(): Promise<AdminStats> {
    try {
      return await this.makeRequest("/stats");
    } catch (error) {
      console.error("Erreur getStats:", error);
      throw error;
    }
  }

  // Gestion des utilisateurs
  async getUsers(
    page = 1,
    limit = 20,
    search?: string,
    role?: string,
  ): Promise<{
    users: User[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (role) params.append("role", role);

      return await this.makeRequest(`/users?${params}`);
    } catch (error) {
      console.error("Erreur getUsers:", error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      return await this.makeRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error("Erreur updateUser:", error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur deleteUser:", error);
      throw error;
    }
  }

  // Gestion des bannissements
  async banUser(
    banData: Omit<BanData, "bannedBy" | "bannedAt" | "expiresAt">,
  ): Promise<BanData> {
    try {
      return await this.makeRequest("/bans", {
        method: "POST",
        body: JSON.stringify(banData),
      });
    } catch (error) {
      console.error("Erreur banUser:", error);
      throw error;
    }
  }

  async unbanUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/bans/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur unbanUser:", error);
      throw error;
    }
  }

  async getBans(
    page = 1,
    limit = 20,
  ): Promise<{
    bans: BanData[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return await this.makeRequest(`/bans?${params}`);
    } catch (error) {
      console.error("Erreur getBans:", error);
      throw error;
    }
  }

  // Gestion des IP bannies
  async banIP(
    ipData: Omit<IPBan, "id" | "bannedAt" | "expiresAt">,
  ): Promise<IPBan> {
    try {
      return await this.makeRequest("/ip-bans", {
        method: "POST",
        body: JSON.stringify(ipData),
      });
    } catch (error) {
      console.error("Erreur banIP:", error);
      throw error;
    }
  }

  async unbanIP(ipBanId: string): Promise<void> {
    try {
      await this.makeRequest(`/ip-bans/${ipBanId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur unbanIP:", error);
      throw error;
    }
  }

  async getIPBans(
    page = 1,
    limit = 20,
  ): Promise<{
    ipBans: IPBan[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return await this.makeRequest(`/ip-bans?${params}`);
    } catch (error) {
      console.error("Erreur getIPBans:", error);
      throw error;
    }
  }

  // Gestion des modérateurs (admin seulement)
  async createModerator(moderatorData: ModeratorData): Promise<User> {
    try {
      return await this.makeRequest("/moderators", {
        method: "POST",
        body: JSON.stringify(moderatorData),
      });
    } catch (error) {
      console.error("Erreur createModerator:", error);
      throw error;
    }
  }

  async deleteModerator(moderatorId: string): Promise<void> {
    try {
      await this.makeRequest(`/moderators/${moderatorId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur deleteModerator:", error);
      throw error;
    }
  }

  async getModerators(): Promise<User[]> {
    try {
      const data = await this.makeRequest("/moderators");
      return data.moderators;
    } catch (error) {
      console.error("Erreur getModerators:", error);
      throw error;
    }
  }

  async updateModeratorPermissions(
    moderatorId: string,
    permissions: string[],
  ): Promise<User> {
    try {
      return await this.makeRequest(`/moderators/${moderatorId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      });
    } catch (error) {
      console.error("Erreur updateModeratorPermissions:", error);
      throw error;
    }
  }

  // Gestion des groupes
  async getAllGroups(
    page = 1,
    limit = 20,
  ): Promise<{
    groups: Group[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return await this.makeRequest(`/groups?${params}`);
    } catch (error) {
      console.error("Erreur getAllGroups:", error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      await this.makeRequest(`/groups/${groupId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur deleteGroup:", error);
      throw error;
    }
  }

  async updateGroupSettings(
    groupId: string,
    settings: Partial<Group>,
  ): Promise<Group> {
    try {
      return await this.makeRequest(`/groups/${groupId}`, {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Erreur updateGroupSettings:", error);
      throw error;
    }
  }

  // Logs système
  async getLogs(
    page = 1,
    limit = 50,
    type?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    logs: SystemLog[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) params.append("type", type);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      return await this.makeRequest(`/logs?${params}`);
    } catch (error) {
      console.error("Erreur getLogs:", error);
      throw error;
    }
  }

  // WebSocket pour logs en temps réel
  subscribeToLogs(callback: (log: SystemLog) => void): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.on("newLog", callback);
    }
  }

  unsubscribeFromLogs(): void {
    const socket = authService.getSocket();
    if (socket) {
      socket.off("newLog");
    }
  }

  // Méthodes pour modérateurs
  async timeoutUser(
    userId: string,
    duration: number,
    reason: string,
  ): Promise<void> {
    try {
      await this.makeRequest("/timeout", {
        method: "POST",
        body: JSON.stringify({ userId, duration, reason }),
      });
    } catch (error) {
      console.error("Erreur timeoutUser:", error);
      throw error;
    }
  }

  async removeTimeout(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/timeout/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur removeTimeout:", error);
      throw error;
    }
  }

  async getTimeouts(
    page = 1,
    limit = 20,
  ): Promise<{
    timeouts: BanData[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return await this.makeRequest(`/timeouts?${params}`);
    } catch (error) {
      console.error("Erreur getTimeouts:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
