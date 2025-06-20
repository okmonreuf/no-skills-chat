import { Server, Socket } from "socket.io";
import { authenticateSocket } from "../middleware/auth";
import { logger, loggerUtils } from "../utils/logger";
import { User } from "../models/User";

export const setupSocketIO = (io: Server) => {
  // Middleware d'authentification pour tous les sockets
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    loggerUtils.socket("user_connected", user?.userId, {
      username: user?.username,
      socketId: socket.id,
    });

    // Joindre l'utilisateur à sa room personnelle
    socket.join(`user:${user.userId}`);

    // Émettre le statut en ligne aux autres utilisateurs
    socket.broadcast.emit("userStatusChanged", {
      userId: user.userId,
      username: user.username,
      status: "online",
    });

    // Gestion de la déconnexion
    socket.on("disconnect", async () => {
      try {
        // Mettre à jour le statut de l'utilisateur
        await User.findByIdAndUpdate(user.userId, {
          status: "offline",
          lastSeen: new Date(),
        });

        // Informer les autres utilisateurs
        socket.broadcast.emit("userStatusChanged", {
          userId: user.userId,
          username: user.username,
          status: "offline",
        });

        loggerUtils.socket("user_disconnected", user?.userId, {
          username: user?.username,
          socketId: socket.id,
        });
      } catch (error) {
        logger.error("Erreur lors de la déconnexion socket:", error);
      }
    });

    // TODO: Ajouter les autres événements socket
    // - Gestion des messages
    // - Gestion des groupes
    // - Gestion de la frappe
    // - etc.
  });
};
