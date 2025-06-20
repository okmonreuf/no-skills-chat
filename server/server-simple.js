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
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    contentSecurityPolicy: false, // Désactiver CSP pour éviter les conflits
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
  max: 100,
  message: "Trop de requêtes depuis cette IP, réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Stockage temporaire en mémoire
const users = new Map();
const messages = new Map();
const chats = new Map();
const bans = new Map();
const onlineUsers = new Set();

// Middleware pour les logs
app.use((req, res, next) => {
  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "no-skills-super-secret-key-2025",
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Token invalide" });
      }

      const user = users.get(decoded.userId);
      if (!user || user.isBanned) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      req.user = user;
      next();
    },
  );
};

// Routes API simples
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Trouver l'utilisateur par email
    let user = null;
    for (const [userId, userData] of users) {
      if (userData.email.toLowerCase() === email.toLowerCase()) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Vérifier si l'utilisateur est banni
    if (user.isBanned) {
      return res.status(403).json({
        error: "Votre compte est banni",
        reason: user.banReason,
      });
    }

    // Mettre à jour la dernière activité
    user.lastActive = moment.tz("Europe/Paris").toDate();
    users.set(user.id, user);

    // Générer le token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "no-skills-super-secret-key-2025",
      { expiresIn: "7d" },
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur, email et mot de passe requis" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Vérifier si l'email existe déjà
    for (const [userId, userData] of users) {
      if (userData.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }
      if (userData.username.toLowerCase() === username.toLowerCase()) {
        return res
          .status(400)
          .json({ error: "Ce nom d'utilisateur est déjà pris" });
      }
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      isVerified: true, // Simplifié pour les tests
      isBanned: false,
      createdAt: moment.tz("Europe/Paris").toDate(),
      lastActive: moment.tz("Europe/Paris").toDate(),
      avatar: null,
      chatTheme: "default",
    };

    users.set(userId, newUser);

    // Générer le token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || "no-skills-super-secret-key-2025",
      { expiresIn: "7d" },
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: moment.tz("Europe/Paris").toISOString(),
    uptime: process.uptime(),
    users: users.size,
    messages: messages.size,
    env: NODE_ENV,
  });
});

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

// Création de l'admin par défaut
const createDefaultAdmin = async () => {
  const adminId = "admin-default";
  const defaultAdmin = {
    id: adminId,
    username: process.env.ADMIN_USERNAME || "Yupi",
    email: process.env.ADMIN_EMAIL || "admin@no-skills.fr",
    password: await bcrypt.hash(
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

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] Nouvelle connexion Socket.IO: ${socket.id}`);

  socket.on("disconnect", () => {
    const timestamp = moment.tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${timestamp}] Déconnexion Socket.IO: ${socket.id}`);
  });
});

// Exportation pour les données
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
    `🚀 [${timestamp}] Serveur No-Skills Chat (simple) démarré sur le port ${PORT}`,
  );
  console.log(`🌍 Mode: ${NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`📧 Admin: ${process.env.ADMIN_USERNAME || "Yupi"}`);

  if (NODE_ENV === "development") {
    console.log(`💻 Interface: http://localhost:${PORT}`);
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
