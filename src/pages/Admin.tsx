import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  MessageSquare,
  Activity,
  Ban,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Settings,
  Crown,
  Eye,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { adminService, AdminStats } from "@/services/admin";
import { User } from "@/services/auth";
import { Group } from "@/services/chat";

export default function Admin() {
  const { user } = useAuth();

  // États pour les données
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [moderators, setModerators] = useState<User[]>([]);

  // États pour la pagination et filtres
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modals
  const [showCreateModerator, setShowCreateModerator] = useState(false);
  const [showBanUser, setShowBanUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      window.location.href = "/chat";
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, groupsData, moderatorsData] =
        await Promise.all([
          adminService.getStats(),
          adminService.getUsers(1, 20),
          adminService.getAllGroups(1, 20),
          adminService.getModerators(),
        ]);

      setStats(statsData);
      setUsers(usersData.users);
      setGroups(groupsData.groups);
      setModerators(moderatorsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-admin-primary rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel Administrateur</h1>
              <p className="text-muted-foreground">
                Gestion complète du système YupiChat
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/chat")}
            >
              Retour au chat
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistiques générales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="admin-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs totaux
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.totalUsers)}
                  </div>
                  <p className="text-xs text-admin-success">
                    <TrendingUp className="inline w-3 h-3 mr-1" />+
                    {stats.newUsersLast7days} cette semaine
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="admin-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs actifs
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.activeUsers)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                    du total
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="admin-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages (24h)
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.messagesLast24h)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(stats.totalMessages)} au total
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="admin-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs bannis
                  </CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-admin-danger">
                    {formatNumber(stats.bannedUsers)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.unverifiedUsers} non vérifiés
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="groups">Groupes</TabsTrigger>
            <TabsTrigger value="moderators">Modérateurs</TabsTrigger>
            <TabsTrigger value="bans">Bannissements</TabsTrigger>
            <TabsTrigger value="logs">Logs système</TabsTrigger>
          </TabsList>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Gestion des utilisateurs
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="moderator">Modérateurs</SelectItem>
                    <SelectItem value="user">Utilisateurs</SelectItem>
                    <SelectItem value="banned">Bannis</SelectItem>
                    <SelectItem value="unverified">Non vérifiés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "moderator"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {user.role === "admin" && (
                            <Crown className="w-3 h-3 mr-1" />
                          )}
                          {user.role === "moderator" && (
                            <Shield className="w-3 h-3 mr-1" />
                          )}
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "moderator"
                              ? "Modérateur"
                              : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.isBanned ? (
                            <Badge variant="destructive">Banni</Badge>
                          ) : !user.isVerified ? (
                            <Badge variant="outline">Non vérifié</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-500"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                              Actif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!user.isBanned && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanUser(true);
                              }}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {user.isBanned && (
                            <Button variant="ghost" size="sm">
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Onglet Groupes */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gestion des groupes</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un groupe
              </Button>
            </div>

            <div className="grid gap-4">
              {groups.map((group) => (
                <Card key={group.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {group.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} membres •{" "}
                          {group.isPrivate ? "Privé" : "Public"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créé le{" "}
                          {new Date(group.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Modérateurs */}
          <TabsContent value="moderators" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gestion des modérateurs</h3>
              <Button onClick={() => setShowCreateModerator(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un modérateur
              </Button>
            </div>

            <div className="grid gap-4">
              {moderators.map((moderator) => (
                <Card key={moderator.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={moderator.avatar} />
                        <AvatarFallback className="bg-blue-500/10 text-blue-500">
                          {moderator.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold flex items-center space-x-2">
                          <span>{moderator.username}</span>
                          <Shield className="w-4 h-4 text-blue-500" />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {moderator.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Modérateur depuis{" "}
                          {new Date(moderator.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Bannissements */}
          <TabsContent value="bans" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Gestion des bannissements
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Banni par</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* TODO: Charger et afficher les bannissements */}
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucun bannissement actif
                      </p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Onglet Logs */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Logs système en temps réel
              </h3>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="error">Erreurs</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card>
              <ScrollArea className="h-96">
                <div className="p-4 space-y-2">
                  {/* TODO: Charger et afficher les logs en temps réel */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p>Connexion aux logs en temps réel...</p>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateModeratorDialog
        open={showCreateModerator}
        onOpenChange={setShowCreateModerator}
        onSuccess={loadData}
      />

      <BanUserDialog
        open={showBanUser}
        onOpenChange={setShowBanUser}
        user={selectedUser}
        onSuccess={loadData}
      />
    </div>
  );
}

// Dialog pour créer un modérateur
function CreateModeratorDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createModerator(formData);
      onSuccess();
      onOpenChange(false);
      setFormData({ username: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de la création du modérateur:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau modérateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label>Nom d'utilisateur</label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label>Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label>Mot de passe</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Créer le modérateur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dialog pour bannir un utilisateur
function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await adminService.banUser({
        userId: user.id,
        reason,
        duration: duration ? parseInt(duration) * 60 : undefined, // Convertir en minutes
      });
      onSuccess();
      onOpenChange(false);
      setReason("");
      setDuration("");
    } catch (error) {
      console.error("Erreur lors du bannissement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bannir l'utilisateur</DialogTitle>
        </DialogHeader>
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label>Raison du bannissement *</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez la raison du bannissement..."
                required
              />
            </div>

            <div className="space-y-2">
              <label>Durée (en heures, vide = permanent)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="24"
                min="1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" variant="destructive" className="flex-1">
                Bannir l'utilisateur
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
