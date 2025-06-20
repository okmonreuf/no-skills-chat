import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  Eye,
  Ban,
  Search,
  Filter,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin";
import { User } from "@/services/auth";
import { Group } from "@/services/chat";

export default function Moderator() {
  const { user } = useAuth();

  // États pour les données
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [timeouts, setTimeouts] = useState<any[]>([]);

  // États pour la recherche et filtres
  const [userSearch, setUserSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // États pour les modals
  const [showTimeoutUser, setShowTimeoutUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "moderator") {
      window.location.href = "/chat";
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, groupsData, timeoutsData] = await Promise.all([
        adminService.getUsers(1, 20),
        adminService.getAllGroups(1, 20),
        adminService.getTimeouts(1, 20),
      ]);

      setUsers(usersData.users);
      setGroups(groupsData.groups);
      setTimeouts(timeoutsData.timeouts);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel Modérateur</h1>
              <p className="text-muted-foreground">
                Gestion des utilisateurs et groupes
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
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs actifs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Dans les groupes publics
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Groupes gérés
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.length}</div>
                <p className="text-xs text-muted-foreground">
                  Groupes publics actifs
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Timeouts actifs
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {timeouts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sanctions temporaires
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="groups">Groupes</TabsTrigger>
            <TabsTrigger value="timeouts">Timeouts</TabsTrigger>
          </TabsList>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Surveillance utilisateurs
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
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="online">En ligne</SelectItem>
                    <SelectItem value="reported">Signalés</SelectItem>
                    <SelectItem value="timeout">En timeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead>Groupes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(
                      (u) =>
                        u.username
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()) ||
                        u.email
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()),
                    )
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`status-indicator ${user.status}`}>
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
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
                              user.status === "online"
                                ? "default"
                                : user.status === "away"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              user.status === "online"
                                ? "bg-green-500"
                                : user.status === "away"
                                  ? "bg-yellow-500"
                                  : ""
                            }
                          >
                            {user.status === "online"
                              ? "En ligne"
                              : user.status === "away"
                                ? "Absent"
                                : "Hors ligne"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.lastSeen).toLocaleString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {/* TODO: Afficher le nombre de groupes */}3 groupes
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowTimeoutUser(true);
                              }}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
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
              <h3 className="text-lg font-semibold">
                Gestion des groupes publics
              </h3>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </div>

            <div className="grid gap-4">
              {groups
                .filter((group) => !group.isPrivate)
                .map((group) => (
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
                            {
                              group.members.filter((m) => m.status === "online")
                                .length
                            }{" "}
                            en ligne
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.description || "Aucune description"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Onglet Timeouts */}
          <TabsContent value="timeouts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Timeouts actifs</h3>
              <Badge variant="outline">{timeouts.length} actifs</Badge>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Modérateur</TableHead>
                    <TableHead>Expire dans</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Aucun timeout actif
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeouts.map((timeout) => (
                      <TableRow key={timeout.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">
                                {timeout.username?.slice(0, 2).toUpperCase() ||
                                  "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {timeout.username || "Utilisateur supprimé"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{timeout.reason}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {timeout.bannedBy}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-orange-500">
                            {timeout.expiresAt
                              ? Math.max(
                                  0,
                                  Math.floor(
                                    (new Date(timeout.expiresAt).getTime() -
                                      Date.now()) /
                                      (1000 * 60),
                                  ),
                                )
                              : 0}{" "}
                            min
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Lever le timeout
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Timeout utilisateur */}
      <TimeoutUserDialog
        open={showTimeoutUser}
        onOpenChange={setShowTimeoutUser}
        user={selectedUser}
        onSuccess={loadData}
      />
    </div>
  );
}

// Dialog pour mettre un timeout à un utilisateur
function TimeoutUserDialog({
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
  const [duration, setDuration] = useState("60"); // En minutes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await adminService.timeoutUser(user.id, parseInt(duration), reason);
      onSuccess();
      onOpenChange(false);
      setReason("");
      setDuration("60");
    } catch (error) {
      console.error("Erreur lors du timeout:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mettre en timeout</DialogTitle>
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
              <label>Raison du timeout *</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Comportement inapproprié, spam, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <label>Durée (en minutes) *</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="180">3 heures</SelectItem>
                  <SelectItem value="360">6 heures</SelectItem>
                  <SelectItem value="720">12 heures</SelectItem>
                  <SelectItem value="1440">24 heures</SelectItem>
                </SelectContent>
              </Select>
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
                Appliquer le timeout
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
