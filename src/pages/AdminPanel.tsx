import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { socketService } from "../services/socket";
import { apiService } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Users,
  Ban,
  Shield,
  Crown,
  UserMinus,
  UserPlus,
  Activity,
  MessageSquare,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  MoreVertical,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { User, AdminStats, BanInfo } from "../types";
import moment from "moment-timezone";
import { cn } from "../lib/utils";

export default function AdminPanel() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [showCreateModModal, setShowCreateModModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // États pour les formulaires
  const [banForm, setBanForm] = useState<BanInfo>({
    reason: "",
    duration: 0,
    banType: "account",
  });
  const [modForm, setModForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "moderator") {
      loadAdminData();
      setupRealtimeUpdates();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterRole, filterStatus]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, activityData] = await Promise.all([
        apiService.getAdminStats(token!),
        apiService.getAllUsers(token!),
        apiService.getRecentActivity(token!),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Erreur lors du chargement des données admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    // Notifications temps réel pour les admins
    socketService.onAdminNotification((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
    });

    // Mises à jour utilisateurs
    socketService.onUserBanned((data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId
            ? { ...u, isBanned: true, banReason: data.reason }
            : u,
        ),
      );
    });

    socketService.onUserUnbanned((data) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, isBanned: false } : u)),
      );
    });
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (filterStatus !== "all") {
      if (filterStatus === "banned") {
        filtered = filtered.filter((u) => u.isBanned);
      } else if (filterStatus === "active") {
        filtered = filtered.filter((u) => !u.isBanned);
      } else if (filterStatus === "unverified") {
        filtered = filtered.filter((u) => !u.isVerified);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banForm.reason.trim()) return;

    try {
      await apiService.banUser(selectedUser.id, banForm, token!);
      await loadAdminData();
      setShowBanModal(false);
      setBanForm({ reason: "", duration: 0, banType: "account" });
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur lors du bannissement:", error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await apiService.unbanUser(userId, token!);
      await loadAdminData();
    } catch (error) {
      console.error("Erreur lors du débannissement:", error);
    }
  };

  const handleCreateModerator = async () => {
    if (!modForm.username || !modForm.email || !modForm.password) return;

    try {
      await apiService.createModerator(modForm, token!);
      await loadAdminData();
      setShowCreateModModal(false);
      setModForm({ username: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de la création du modérateur:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    try {
      await apiService.deleteUser(userId, token!);
      await loadAdminData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (user: User) => {
    if (user.isBanned) return "bg-red-100 text-red-800";
    if (!user.isVerified) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (user: User) => {
    if (user.isBanned) return "Banni";
    if (!user.isVerified) return "Non vérifié";
    return "Actif";
  };

  const formatDate = (date: Date) => {
    return moment.tz(date, "Europe/Paris").format("DD/MM/YYYY HH:mm");
  };

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas accès à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (window.location.href = "/chat")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel Administrateur
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications temps réel */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Badge className="bg-red-500 text-white">
                    {notifications.length}
                  </Badge>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="moderation">Modération</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs totaux
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages totaux
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalMessages}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs actifs
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs bannis
                  </CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.bannedUsers}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications temps réel */}
            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications en temps réel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notifications.slice(0, 5).map((notif, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{notif.message}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {moment(notif.timestamp).fromNow()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérez les comptes utilisateurs et leurs permissions
                    </CardDescription>
                  </div>
                  {user?.role === "admin" && (
                    <Dialog
                      open={showCreateModModal}
                      onOpenChange={setShowCreateModModal}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Créer un modérateur
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Créer un compte modérateur</DialogTitle>
                          <DialogDescription>
                            Créez un nouveau compte avec les privilèges de
                            modération
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="mod-username">
                              Nom d'utilisateur
                            </Label>
                            <Input
                              id="mod-username"
                              value={modForm.username}
                              onChange={(e) =>
                                setModForm({
                                  ...modForm,
                                  username: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="mod-email">Email</Label>
                            <Input
                              id="mod-email"
                              type="email"
                              value={modForm.email}
                              onChange={(e) =>
                                setModForm({
                                  ...modForm,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="mod-password">Mot de passe</Label>
                            <Input
                              id="mod-password"
                              type="password"
                              value={modForm.password}
                              onChange={(e) =>
                                setModForm({
                                  ...modForm,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowCreateModModal(false)}
                          >
                            Annuler
                          </Button>
                          <Button onClick={handleCreateModerator}>Créer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtres et recherche */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher des utilisateurs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="banned">Banni</SelectItem>
                      <SelectItem value="unverified">Non vérifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table des utilisateurs */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière activité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userItem.avatar} />
                              <AvatarFallback>
                                {userItem.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {userItem.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userItem.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(userItem.role)}>
                            {userItem.role === "admin"
                              ? "Admin"
                              : userItem.role === "moderator"
                                ? "Modérateur"
                                : "Utilisateur"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(userItem)}>
                            {getStatusText(userItem)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(userItem.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(userItem);
                                setShowUserDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!userItem.isBanned ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowBanModal(true);
                                }}
                              >
                                <Ban className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnbanUser(userItem.id)}
                              >
                                <Shield className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            {user?.role === "admin" &&
                              userItem.id !== user.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUser(userItem.id)}
                                >
                                  <UserMinus className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modération */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bans récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .filter((u) => u.isBanned)
                      .slice(0, 5)
                      .map((bannedUser) => (
                        <div
                          key={bannedUser.id}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {bannedUser.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {bannedUser.username}
                              </div>
                              <div className="text-sm text-red-600">
                                {bannedUser.banReason}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnbanUser(bannedUser.id)}
                          >
                            Débannir
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modérateurs actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .filter((u) => u.role === "moderator")
                      .map((mod) => (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={mod.avatar} />
                              <AvatarFallback>
                                {mod.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{mod.username}</div>
                              <div className="text-sm text-gray-500">
                                {formatDate(mod.lastActive)}
                              </div>
                            </div>
                          </div>
                          {user?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(mod.id)}
                            >
                              Supprimer
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activité récente */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente en temps réel</CardTitle>
                <CardDescription>
                  Surveillance en temps réel de l'activité des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 10).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm">{activity.description}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de bannissement */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Bannir {selectedUser?.username} du système de messagerie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Raison du ban</Label>
              <Textarea
                id="ban-reason"
                placeholder="Expliquez la raison du bannissement..."
                value={banForm.reason}
                onChange={(e) =>
                  setBanForm({ ...banForm, reason: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="ban-duration">Durée (en minutes)</Label>
              <Input
                id="ban-duration"
                type="number"
                placeholder="0 pour permanent"
                value={banForm.duration}
                onChange={(e) =>
                  setBanForm({ ...banForm, duration: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="ban-type">Type de ban</Label>
              <Select
                value={banForm.banType}
                onValueChange={(value: "account" | "ip") =>
                  setBanForm({ ...banForm, banType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Compte uniquement</SelectItem>
                  <SelectItem value="ip">Ban IP (plus strict)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={!banForm.reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Bannir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
