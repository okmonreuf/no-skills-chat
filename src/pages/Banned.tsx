import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Ban, Clock, AlertTriangle, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Banned() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "Violation des règles";
  const expiresParam = searchParams.get("expires");

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    if (expiresParam && expiresParam !== "") {
      const expiresDate = new Date(expiresParam);
      const now = new Date();

      if (expiresDate > now) {
        const remaining = expiresDate.getTime() - now.getTime();
        setTimeRemaining(remaining);

        const interval = setInterval(() => {
          const newRemaining = expiresDate.getTime() - new Date().getTime();
          if (newRemaining <= 0) {
            // Bannissement expiré, rediriger vers la page de connexion
            window.location.href = "/login";
          } else {
            setTimeRemaining(newRemaining);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        // Bannissement déjà expiré
        window.location.href = "/login";
      }
    } else {
      setIsPermanent(true);
    }
  }, [expiresParam]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "";

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressPercentage = () => {
    if (!timeRemaining || !expiresParam) return 0;

    const expiresDate = new Date(expiresParam);
    const totalDuration = expiresDate.getTime() - Date.now() + timeRemaining;
    const elapsed = totalDuration - timeRemaining;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center p-4">
      {/* Particules d'alerte */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-destructive/20 rounded-full"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-destructive/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto"
            >
              <Ban className="w-8 h-8 text-destructive" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-2xl text-destructive">
                Compte suspendu
              </CardTitle>
              <p className="text-muted-foreground">
                Votre accès à YupiChat a été temporairement restreint
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Raison du bannissement */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-destructive">
                  Raison de la suspension
                </h4>
              </div>
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm">{reason}</p>
              </div>
            </div>

            {/* Durée du bannissement */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold">Durée de la suspension</h4>
              </div>

              {isPermanent ? (
                <div className="p-4 bg-muted/50 border border-border rounded-lg text-center">
                  <Badge
                    variant="destructive"
                    className="mb-2 text-base px-4 py-2"
                  >
                    Suspension permanente
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Cette suspension n'a pas de date d'expiration. Contactez un
                    administrateur pour plus d'informations.
                  </p>
                </div>
              ) : timeRemaining && timeRemaining > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-lg text-center">
                    <motion.div
                      key={timeRemaining}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-destructive font-mono"
                    >
                      {formatTimeRemaining()}
                    </motion.div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temps restant avant la levée de la suspension
                    </p>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression</span>
                      <span>{getProgressPercentage().toFixed(0)}%</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-2" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Informations importantes */}
            <div className="space-y-3">
              <h4 className="font-semibold">Informations importantes</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • Vous ne pouvez pas accéder au chat pendant cette suspension
                </p>
                <p>
                  • Vos données et conversations sont conservées en sécurité
                </p>
                <p>• En cas d'erreur, contactez un administrateur</p>
                {!isPermanent && (
                  <p>
                    • Vous pourrez vous reconnecter automatiquement après
                    l'expiration
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>

              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Contacter un administrateur
              </Button>
            </div>

            {/* Note sur les règles */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                En utilisant YupiChat, vous acceptez de respecter nos{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  règles de la communauté
                </span>{" "}
                et nos{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  conditions d'utilisation
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Effet de pulsation pour l'urgence */}
        {isPermanent && (
          <motion.div
            className="absolute inset-0 bg-destructive/5 rounded-lg -z-10"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
