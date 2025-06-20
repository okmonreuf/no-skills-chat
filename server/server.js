import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import path from "path";
import moment from "moment-timezone";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Initialisation Express
const app = express();
const server = createServer(app);

// Configuration Socket.IO avec CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware de sécurité
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configuration CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes depuis cette IP, réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Middleware pour les logs avec timezone Paris
app.use((req, res, next) => {
  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Stockage temporaire en mémoire (à remplacer par une vraie base de données)
const users = new Map();
const messages = new Map();
const chats = new Map();
const bans = new Map();
const onlineUsers = new Set();

// Création de l'admin par défaut
const createDefaultAdmin = async () => {
  const adminId = "admin-default";
  const defaultAdmin = {
    id: adminId,
    username: process.env.ADMIN_USERNAME || "Yupi",
    email: process.env.ADMIN_EMAIL || "admin@no-skills.fr",
    password: (await import("bcryptjs")).default.hashSync(
      process.env.ADMIN_PASSWORD || "1515Dh!dofly",
      10,
    ),
    role: "admin",
    isVerified: true,
    isBanned: false,
    createdAt: new Date(),
    lastActive: new Date(),
    avatar: null,
    chatTheme: "default",
  };

  users.set(adminId, defaultAdmin);
  console.log(`✅ Admin par défaut créé: ${defaultAdmin.username}`);
};

// Routes API (imports dynamiques)
const { default: authRoutes } = await import("./routes/auth.js");
const { default: usersRoutes } = await import("./routes/users.js");
const { default: chatsRoutes } = await import("./routes/chats.js");
const { default: adminRoutes } = await import("./routes/admin.js");
const { default: searchRoutes } = await import("./routes/search.js");

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

// Servir les fichiers statiques
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.error(`[${timestamp}] Erreur:`, err);

  res.status(err.status || 500).json({
    error:
      NODE_ENV === "production" ? "Erreur interne du serveur" : err.message,
    timestamp: moment.tz("Europe/Paris").toISOString(),
  });
});

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: moment.tz("Europe/Paris").toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: NODE_ENV,
  });
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] Nouvelle connexion Socket.IO: ${socket.id}`);

  // Authentification Socket
  socket.on("authenticate", (token) => {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = users.get(decoded.userId);

      if (user && !user.isBanned) {
        socket.userId = user.id;
        socket.user = user;
        onlineUsers.add(user.id);

        // Rejoindre les salles des chats de l'utilisateur
        for (const [chatId, chat] of chats) {
          if (chat.participants.some((p) => p.id === user.id)) {
            socket.join(chatId);
          }
        }

        // Notifier les autres utilisateurs
        socket.broadcast.emit("userOnline", user.id);
        io.emit("usersOnline", Array.from(onlineUsers));

        console.log(`✅ Utilisateur authentifié: ${user.username}`);
      }
    } catch (error) {
      console.error("Erreur d'authentification Socket:", error);
      socket.disconnect();
    }
  });

  // Envoi de messages
  socket.on("sendMessage", (data) => {
    if (!socket.userId) return;

    const messageId = Date.now().toString();
    const message = {
      id: messageId,
      content: data.content,
      userId: socket.userId,
      user: socket.user,
      chatId: data.chatId,
      createdAt: moment.tz("Europe/Paris").toDate(),
      editedAt: null,
      isDeleted: false,
      replyTo: data.replyTo || null,
    };

    messages.set(messageId, message);

    // Envoyer à tous les participants du chat
    io.to(data.chatId).emit("newMessage", message);

    // Notification admin en temps réel
    const adminNotification = {
      type: "new_message",
      message: `Nouveau message de ${socket.user.username}`,
      timestamp: moment.tz("Europe/Paris").toDate(),
      data: { messageId, chatId: data.chatId },
    };

    // Envoyer aux admins connectés
    for (const [userId, user] of users) {
      if (
        (user.role === "admin" || user.role === "moderator") &&
        onlineUsers.has(userId)
      ) {
        io.to(getSocketIdByUserId(userId)).emit(
          "adminNotification",
          adminNotification,
        );
      }
    }
  });

  // Indicateur de frappe
  socket.on("typing", (data) => {
    if (!socket.userId) return;

    socket.to(data.chatId).emit("typing", {
      userId: socket.userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  });

  // Rejoindre une salle
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // Quitter une salle
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit("userOffline", socket.userId);
      io.emit("usersOnline", Array.from(onlineUsers));

      // Mettre à jour la dernière activité
      const user = users.get(socket.userId);
      if (user) {
        user.lastActive = moment.tz("Europe/Paris").toDate();
        users.set(socket.userId, user);
      }
    }

    const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${timestamp}] Déconnexion Socket.IO: ${socket.id}`);
  });
});

// Fonction utilitaire pour trouver l'ID de socket par ID utilisateur
function getSocketIdByUserId(userId) {
  for (const [socketId, socket] of io.sockets.sockets) {
    if (socket.userId === userId) {
      return socketId;
    }
  }
  return null;
}

// Exportation pour les routes
app.locals.users = users;
app.locals.messages = messages;
app.locals.chats = chats;
app.locals.bans = bans;
app.locals.onlineUsers = onlineUsers;
app.locals.io = io;

// Démarrage du serveur
server.listen(PORT, async () => {
  await createDefaultAdmin();

  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.log(
    `🚀 [${timestamp}] Serveur No-Skills Chat démarré sur le port ${PORT}`,
  );
  console.log(`🌍 Mode: ${NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`📧 Admin: ${process.env.ADMIN_USERNAME || "Yupi"}`);

  if (NODE_ENV === "development") {
    console.log(`💻 Interface de développement: http://localhost:${PORT}`);
  }
});

// Gestion propre de l'arrêt
process.on("SIGTERM", () => {
  console.log("🛑 Signal SIGTERM reçu, arrêt du serveur...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Signal SIGINT reçu, arrêt du serveur...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });
});
