import { User, Chat, Message, AdminStats, BanInfo } from "../types";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://no-skills.fr/api"
    : "http://localhost:3001/api";

class ApiService {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ success: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request<{ success: boolean }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // User management
  async getProfile(token: string) {
    return this.request<User>("/users/profile", { method: "GET" }, token);
  }

  async updateProfile(data: Partial<User>, token: string) {
    return this.request<User>(
      "/users/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async uploadAvatar(file: File, token: string) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload de l'avatar");
    }

    return response.json();
  }

  // Chat management
  async getChats(token: string) {
    return this.request<Chat[]>("/chats", { method: "GET" }, token);
  }

  async getMessages(chatId: string, page: number = 1, token: string) {
    return this.request<{ messages: Message[]; hasMore: boolean }>(
      `/chats/${chatId}/messages?page=${page}`,
      { method: "GET" },
      token,
    );
  }

  async createGroup(name: string, description: string, token: string) {
    return this.request<Chat>(
      "/chats/groups",
      {
        method: "POST",
        body: JSON.stringify({ name, description }),
      },
      token,
    );
  }

  async updateGroup(groupId: string, data: Partial<Chat>, token: string) {
    return this.request<Chat>(
      `/chats/groups/${groupId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async addUserToGroup(groupId: string, userId: string, token: string) {
    return this.request<{ success: boolean }>(
      `/chats/groups/${groupId}/users`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      },
      token,
    );
  }

  async removeUserFromGroup(groupId: string, userId: string, token: string) {
    return this.request<{ success: boolean }>(
      `/chats/groups/${groupId}/users/${userId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  // Admin endpoints
  async getAdminStats(token: string) {
    return this.request<AdminStats>("/admin/stats", { method: "GET" }, token);
  }

  async getAllUsers(token: string) {
    return this.request<User[]>("/admin/users", { method: "GET" }, token);
  }

  async banUser(userId: string, banInfo: BanInfo, token: string) {
    return this.request<{ success: boolean }>(
      `/admin/users/${userId}/ban`,
      {
        method: "POST",
        body: JSON.stringify(banInfo),
      },
      token,
    );
  }

  async unbanUser(userId: string, token: string) {
    return this.request<{ success: boolean }>(
      `/admin/users/${userId}/unban`,
      {
        method: "POST",
      },
      token,
    );
  }

  async createModerator(
    userData: { username: string; email: string; password: string },
    token: string,
  ) {
    return this.request<User>(
      "/admin/moderators",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
      token,
    );
  }

  async deleteModerator(userId: string, token: string) {
    return this.request<{ success: boolean }>(
      `/admin/moderators/${userId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  async deleteUser(userId: string, token: string) {
    return this.request<{ success: boolean }>(
      `/admin/users/${userId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  async getRecentActivity(token: string) {
    return this.request<any[]>("/admin/activity", { method: "GET" }, token);
  }

  // Search
  async searchUsers(query: string, token: string) {
    return this.request<User[]>(
      `/search/users?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
      },
      token,
    );
  }

  async searchMessages(query: string, chatId?: string, token?: string) {
    const url = chatId
      ? `/search/messages?q=${encodeURIComponent(query)}&chatId=${chatId}`
      : `/search/messages?q=${encodeURIComponent(query)}`;

    return this.request<Message[]>(url, { method: "GET" }, token);
  }
}

export const apiService = new ApiService();
