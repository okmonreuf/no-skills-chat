import { Express } from "express";
import { Server } from "socket.io";
import authRoutes from "./auth";
// Les autres routes seront ajoutées ici

export const setupRoutes = (app: Express, io: Server) => {
  // Route de santé
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "YupiChat API est opérationnel",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Routes d'authentification
  app.use("/api/auth", authRoutes);

  // TODO: Ajouter les autres routes
  // app.use("/api/chat", chatRoutes);
  // app.use("/api/admin", adminRoutes);
};
