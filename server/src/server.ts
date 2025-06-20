import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import { setupSocketIO } from "./sockets/socket";
import { setupRoutes } from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { authenticateSocket } from "./middleware/auth";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware de sécurité
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP
  message: {
    error: "Trop de requêtes, veuillez réessayer plus tard",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes API
setupRoutes(app, io);

// Servir le frontend en production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
  });
}

// Middleware d'erreur
app.use(notFound);
app.use(errorHandler);

// Configuration Socket.IO
setupSocketIO(io);

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/yupichat";

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("🗄️  MongoDB connecté avec succès");
  } catch (error) {
    logger.error("❌ Erreur de connexion MongoDB:", error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  logger.error("❌ Exception non capturée:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Promesse rejetée non gérée:", { reason, promise });
  process.exit(1);
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3001;

    server.listen(PORT, () => {
      logger.info(`🚀 Serveur YupiChat démarré sur le port ${PORT}`);
      logger.info(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      );

      if (process.env.NODE_ENV === "development") {
        logger.info(
          `📝 API Documentation: http://localhost:${PORT}/api/health`,
        );
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("🛑 SIGTERM reçu, arrêt en cours...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info("✅ Serveur arrêté proprement");
          process.exit(0);
        });
      });
    });
  } catch (error) {
    logger.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

// Créer le compte admin par défaut au démarrage
const createDefaultAdmin = async () => {
  try {
    const { User } = await import("./models/User");
    const bcrypt = await import("bcryptjs");

    const adminExists = await User.findOne({ username: "Yupi" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("1515Dh!dofly", 12);

      await User.create({
        username: "Yupi",
        email: "admin@yupichat.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        status: "online",
      });

      logger.info('👑 Compte administrateur "Yupi" créé avec succès');
    }
  } catch (error) {
    logger.error("❌ Erreur lors de la création du compte admin:", error);
  }
};

// Démarrer le serveur et créer l'admin
startServer().then(() => {
  setTimeout(createDefaultAdmin, 2000); // Attendre 2s que la DB soit prête
});

export { app, server, io };
