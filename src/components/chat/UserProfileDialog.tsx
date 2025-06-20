import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Mail,
  Calendar,
  Shield,
  Crown,
  Edit2,
  Save,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/services/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  user,
}: UserProfileDialogProps) {
  const { updateProfile, uploadAvatar, isLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Upload avatar d'abord si un nouveau fichier est sélectionné
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      // Mettre à jour le profil
      await updateProfile(formData);

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Administrateur",
          icon: <Crown className="w-4 h-4" />,
          color: "bg-yellow-500 text-white",
        };
      case "moderator":
        return {
          label: "Modérateur",
          icon: <Shield className="w-4 h-4" />,
          color: "bg-blue-500 text-white",
        };
      default:
        return {
          label: "Utilisateur",
          icon: null,
          color: "bg-gray-500 text-white",
        };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Mon Profil
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar et informations principales */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <h3 className="text-xl font-semibold">{user.username}</h3>
                <Badge className={roleInfo.color}>
                  {roleInfo.icon}
                  <span className="ml-1">{roleInfo.label}</span>
                </Badge>
              </div>

              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="capitalize">{user.status}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Membre depuis{" "}
                    {format(new Date(user.createdAt), "MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations éditables */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded-md">
                  {user.username}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex-1 p-2 bg-muted/50 rounded-md flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}
                {!user.isVerified && (
                  <Badge variant="destructive">Non vérifié</Badge>
                )}
                {user.isVerified && (
                  <Badge variant="default" className="bg-green-500">
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">
                Messages envoyés
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {format(new Date(user.lastSeen), "HH:mm")}
              </div>
              <div className="text-xs text-muted-foreground">
                Dernière activité
              </div>
            </div>
          </div>

          {/* Actions supplémentaires */}
          {!isEditing && (
            <div className="space-y-2">
              {!user.isVerified && (
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Changer le mot de passe
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
