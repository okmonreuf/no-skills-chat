import React, { useState, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Bell,
  Palette,
  Shield,
  Crown,
  Save,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { User as UserType, NotificationSettings } from "../types";
import { cn } from "../lib/utils";

export default function Profile() {
  const { user, token, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // États du formulaire
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    messages: true,
    mentions: true,
    groups: true,
    email: true,
  });

  const [theme, setTheme] = useState(user?.chatTheme || "default");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpdate = async () => {
    if (!profileForm.username.trim()) {
      setMessage({ type: "error", text: "Le nom d'utilisateur est requis" });
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
      return;
    }

    if (
      profileForm.newPassword &&
      profileForm.newPassword !== profileForm.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        username: profileForm.username,
        email: profileForm.email,
        chatTheme: theme,
      };

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const updatedUser = await apiService.updateProfile(updateData, token!);
      updateUser(updatedUser);

      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      setProfileForm({
        ...profileForm,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Veuillez sélectionner une image" });
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "L'image ne doit pas dépasser 5MB",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.uploadAvatar(file, token!);
      updateUser({ avatar: result.avatarUrl });
      setMessage({ type: "success", text: "Avatar mis à jour avec succès" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la mise à jour de l'avatar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "moderator":
        return "Modérateur";
      default:
        return "Utilisateur";
    }
  };

  const themePresets = [
    {
      value: "default",
      name: "Par défaut",
      bg: "bg-white",
      text: "text-gray-900",
    },
    { value: "dark", name: "Sombre", bg: "bg-gray-900", text: "text-white" },
    { value: "blue", name: "Bleu", bg: "bg-blue-100", text: "text-blue-900" },
    {
      value: "green",
      name: "Vert",
      bg: "bg-green-100",
      text: "text-green-900",
    },
    {
      value: "purple",
      name: "Violet",
      bg: "bg-purple-100",
      text: "text-purple-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (window.location.href = "/chat")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Mon Profil
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {message && (
          <Alert
            className={cn("mb-6", {
              "bg-green-50 border-green-200 text-green-800":
                message.type === "success",
              "bg-red-50 border-red-200 text-red-800": message.type === "error",
            })}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et paramètres de compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.username}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(user?.role || "user")}
                      <Badge
                        variant={
                          user?.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {getRoleName(user?.role || "user")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Membre depuis{" "}
                      {new Date(user?.createdAt || "").toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                  </div>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          username: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Changement de mot de passe */}
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-semibold">Changer le mot de passe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Mot de passe actuel
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={profileForm.currentPassword}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              currentPassword: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={profileForm.newPassword}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            newPassword: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={profileForm.confirmPassword}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation de l'interface</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de votre interface de chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">
                    Thème de l'interface
                  </Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Choisissez un thème qui correspond à vos préférences
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {themePresets.map((preset) => (
                      <div
                        key={preset.value}
                        className={cn(
                          "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                          {
                            "border-blue-500 ring-2 ring-blue-200":
                              theme === preset.value,
                            "border-gray-200 hover:border-gray-300":
                              theme !== preset.value,
                          },
                        )}
                        onClick={() => setTheme(preset.value)}
                      >
                        <div
                          className={cn(
                            "w-full h-20 rounded-md mb-2",
                            preset.bg,
                          )}
                        >
                          <div className="p-2 space-y-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600",
                              )}
                            ></div>
                            <div
                              className={cn("w-16 h-2 rounded", preset.text, {
                                "bg-gray-700": preset.value === "default",
                                "bg-white": preset.value === "dark",
                                "bg-blue-700": preset.value === "blue",
                                "bg-green-700": preset.value === "green",
                                "bg-purple-700": preset.value === "purple",
                              })}
                            ></div>
                            <div
                              className={cn("w-12 h-2 rounded", preset.text, {
                                "bg-gray-500": preset.value === "default",
                                "bg-gray-300": preset.value === "dark",
                                "bg-blue-500": preset.value === "blue",
                                "bg-green-500": preset.value === "green",
                                "bg-purple-500": preset.value === "purple",
                              })}
                            ></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-center">
                          {preset.name}
                        </p>
                        {theme === preset.value && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    <Palette className="h-4 w-4 mr-2" />
                    Appliquer le thème
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Gérez vos notifications pour rester informé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-messages">Nouveaux messages</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications pour les nouveaux messages
                      </p>
                    </div>
                    <Switch
                      id="notif-messages"
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          messages: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-mentions">Mentions</Label>
                      <p className="text-sm text-gray-500">
                        Être notifié quand vous êtes mentionné
                      </p>
                    </div>
                    <Switch
                      id="notif-mentions"
                      checked={notifications.mentions}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          mentions: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-groups">Activité des groupes</Label>
                      <p className="text-sm text-gray-500">
                        Notifications pour l'activité dans vos groupes
                      </p>
                    </div>
                    <Switch
                      id="notif-groups"
                      checked={notifications.groups}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, groups: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-email">
                        Notifications par email
                      </Label>
                      <p className="text-sm text-gray-500">
                        Recevoir également les notifications par email
                      </p>
                    </div>
                    <Switch
                      id="notif-email"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={isLoading}>
                    <Bell className="h-4 w-4 mr-2" />
                    Enregistrer les préférences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
