import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, MessageCircle, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Particules animées en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Section gauche - Présentation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
            >
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
              YupiChat
            </h1>

            <p className="text-xl text-muted-foreground">
              La plateforme de messagerie moderne et sécurisée pour votre
              communauté
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-chat-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-chat-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Sécurité Avancée</h3>
                <p className="text-sm text-muted-foreground">
                  Chiffrement de bout en bout et modération intelligente
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-chat-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-chat-accent" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Système de Communication Avancé
                </h3>
                <p className="text-sm text-muted-foreground">
                  Technologie de pointe pour des échanges sécurisés
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-admin-success/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-admin-success" />
              </div>
              <div>
                <h3 className="font-semibold">Temps Réel</h3>
                <p className="text-sm text-muted-foreground">
                  Messages instantanés avec indicateurs de lecture
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section droite - Formulaire */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <Card className="glass-effect border-border/50 shadow-2xl">
            <CardHeader className="space-y-2">
              <div className="lg:hidden flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">YupiChat</h1>
              </div>

              <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte pour accéder au chat
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-12 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 bg-background/50 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    "Se connecter"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Pas encore de compte ?{" "}
                  </span>
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Créer un compte
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
