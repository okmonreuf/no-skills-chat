import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, MessageCircle, Mail, User, Lock } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    // Calculer la force du mot de passe
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      // Cette erreur devrait être gérée par le hook
      return;
    }

    if (!acceptTerms) {
      // Rediriger vers la page d'âge restreint si les conditions ne sont pas acceptées
      window.location.href = "/age-restricted";
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setRegistrationSuccess(true);
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Très faible";
      case 2:
        return "Faible";
      case 3:
        return "Moyen";
      case 4:
        return "Fort";
      case 5:
        return "Très fort";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
              <CardDescription>
                Un email de vérification a été envoyé à votre adresse. Veuillez
                vérifier votre boîte mail et cliquer sur le lien pour activer
                votre compte.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link to="/login" className="w-full">
                <Button className="w-full">Retour à la connexion</Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Particules animées en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-primary/10 rounded-full"
            animate={{
              x: [0, 150, 0],
              y: [0, -150, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-effect border-border/50 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">YupiChat</h1>
            </div>

            <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour rejoindre la communauté
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choisissez un nom d'utilisateur"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Créez un mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 pr-12 bg-background/50"
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

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Force du mot de passe:</span>
                      <span
                        className={
                          passwordStrength >= 4
                            ? "text-green-500"
                            : passwordStrength >= 3
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 pr-12 bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  J'accepte les{" "}
                  <Link
                    to="/terms"
                    className="text-primary hover:underline font-semibold"
                    target="_blank"
                  >
                    Conditions Générales d'Utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline font-semibold"
                    target="_blank"
                  >
                    Politique de Confidentialité
                  </Link>
                  . Je confirme avoir au moins 15 ans.
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !acceptTerms ||
                  formData.password !== formData.confirmPassword ||
                  passwordStrength < 3
                }
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
                  "Créer mon compte"
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Déjà un compte ? </span>
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
