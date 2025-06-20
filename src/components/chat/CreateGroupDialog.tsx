import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Lock, Globe, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const { createGroup } = useChat();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await createGroup(
        formData.name.trim(),
        formData.description.trim() || undefined,
        formData.isPrivate,
      );

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      isPrivate: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <span>Créer un nouveau groupe</span>
          </DialogTitle>
          <DialogDescription>
            Créez un espace de discussion pour votre équipe ou communauté
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom du groupe */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Nom du groupe *</Label>
            <Input
              id="groupName"
              placeholder="Mon super groupe"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/50 caractères
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (optionnel)</Label>
            <Textarea
              id="groupDescription"
              placeholder="Décrivez brièvement le but de ce groupe..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/200 caractères
            </p>
          </div>

          {/* Type de groupe */}
          <div className="space-y-3">
            <Label>Type de groupe</Label>

            <div className="grid gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-colors ${
                    !formData.isPrivate
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isPrivate: false }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Groupe public</h4>
                      <p className="text-sm text-muted-foreground">
                        Tout le monde peut voir et rejoindre ce groupe
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        !formData.isPrivate
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {!formData.isPrivate && (
                        <div className="w-full h-full bg-white rounded-full scale-50" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-colors ${
                    formData.isPrivate
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isPrivate: true }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Groupe privé</h4>
                      <p className="text-sm text-muted-foreground">
                        Seuls les membres invités peuvent voir ce groupe
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        formData.isPrivate
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {formData.isPrivate && (
                        <div className="w-full h-full bg-white rounded-full scale-50" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Créer le groupe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
