import { motion } from "framer-motion";
import { AlertTriangle, Home, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function AgeRestricted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:to-red-950/20 flex items-center justify-center p-4">
      {/* Particules d'alerte */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-red-400/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 8,
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
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-red-200 shadow-2xl dark:border-red-800">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto"
            >
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                Accès Restreint
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Service réservé aux personnes de 15 ans et plus
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avertissement principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-800 dark:text-red-400">
                    Pourquoi cette restriction ?
                  </h3>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                    <p>
                      <strong>YupiChat</strong> est un service de communication
                      avancé conçu pour un public mature. Cette restriction
                      d'âge est mise en place pour :
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        Respecter la réglementation sur la protection des
                        mineurs
                      </li>
                      <li>
                        Garantir un environnement approprié pour nos
                        utilisateurs
                      </li>
                      <li>
                        Assurer la conformité avec les lois françaises et
                        européennes
                      </li>
                      <li>
                        Maintenir la qualité et la sécurité de nos échanges
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Informations légales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <Scale className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Cadre Légal</h3>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Cette restriction est conforme aux dispositions légales
                  françaises et européennes concernant :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Le Règlement Général sur la Protection des Données (RGPD) -
                    Article 8 sur le consentement des enfants
                  </li>
                  <li>La Loi française pour une République numérique</li>
                  <li>
                    Les recommandations de la CNIL sur la protection des mineurs
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Alternatives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                Alternatives recommandées pour les moins de 15 ans
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>
                  Nous vous encourageons à utiliser des plateformes adaptées à
                  votre âge avec supervision parentale :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Messenger Kids (Meta)</li>
                  <li>WhatsApp (avec accord parental)</li>
                  <li>Discord (sections modérées)</li>
                </ul>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>

              <Link to="/terms" target="_blank" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Scale className="w-4 h-4 mr-2" />
                  Lire les CGU
                </Button>
              </Link>
            </motion.div>

            {/* Note informative */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-xs text-muted-foreground border-t pt-4"
            >
              <p>
                <strong>Note :</strong> Cette vérification est automatique. Si
                vous pensez qu'il y a une erreur, vous pourrez créer un compte
                en confirmant votre âge lors de l'inscription.
              </p>
              <p className="mt-2">
                Nous respectons votre vie privée et ne conservons aucune
                information personnelle lors de cette vérification.
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Effet de pulsation subtile */}
        <motion.div
          className="absolute inset-0 bg-red-500/5 rounded-lg -z-10"
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}
