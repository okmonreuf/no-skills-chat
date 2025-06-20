import { motion } from "framer-motion";
import { Home, MessageCircle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-muted/30 rounded-full"
            animate={{
              x: [0, 200, 0],
              y: [0, -200, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
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

      <div className="text-center space-y-8 max-w-md relative z-10">
        {/* Animation 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="space-y-4"
        >
          <div className="relative">
            <motion.h1
              className="text-8xl font-bold text-primary/20 select-none"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              404
            </motion.h1>

            {/* Icône de chat qui rebondit */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold">Page introuvable</h2>
            <p className="text-muted-foreground">
              Oups ! La page que vous cherchez semble avoir disparu dans le
              cyberespace.
            </p>
          </motion.div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Que souhaitez-vous faire ?
            </h3>

            <div className="space-y-2">
              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-center space-x-2 text-sm text-muted-foreground"
              >
                <Search className="w-4 h-4" />
                <span>Vérifiez l'URL dans la barre d'adresse</span>
              </motion.div>

              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-center space-x-2 text-sm text-muted-foreground"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Retournez au chat pour discuter</span>
              </motion.div>

              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-center space-x-2 text-sm text-muted-foreground"
              >
                <Home className="w-4 h-4" />
                <span>Explorez depuis la page d'accueil</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la page précédente
          </Button>

          <Button onClick={() => navigate("/chat")} className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Aller au chat
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Page d'accueil
          </Button>
        </motion.div>

        {/* Easter egg - Code d'erreur amusant */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xs text-muted-foreground/50"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ERR_CHAT_BUBBLE_LOST_IN_VOID
          </motion.p>
        </motion.div>
      </div>

      {/* Effet de lueur subtile */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
