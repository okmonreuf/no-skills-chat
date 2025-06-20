import express from "express";
import moment from "moment-timezone";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// Middleware pour vérifier les permissions admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    return res.status(403).json({ error: "Accès administrateur requis" });
  }
  next();
};

// Middleware pour accéder aux données
const getAppData = (req, res, next) => {
  req.users = req.app.locals.users;
  req.chats = req.app.locals.chats;
  req.messages = req.app.locals.messages;
  req.bans = req.app.locals.bans;
  next();
};

router.use(authenticateToken);
router.use(requireAdmin);
router.use(getAppData);

// Statistiques admin
router.get("/stats", (req, res) => {
  try {
    const totalUsers = req.users.size;
    const totalMessages = req.messages.size;
    const totalGroups = Array.from(req.chats.values()).filter(
      (chat) => chat.type === "group",
    ).length;
    const bannedUsers = Array.from(req.users.values()).filter(
      (user) => user.isBanned,
    ).length;
    const activeUsers = Array.from(req.users.values()).filter((user) =>
      moment.tz("Europe/Paris").subtract(1, "hour").isBefore(user.lastActive),
    ).length;

    const stats = {
      totalUsers,
      totalMessages,
      totalGroups,
      bannedUsers,
      activeUsers,
      recentActivity: [], // TODO: Implémenter l'activité récente
    };

    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir tous les utilisateurs
router.get("/users", (req, res) => {
  try {
    const users = Array.from(req.users.values()).map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Bannir un utilisateur
router.post("/users/:userId/ban", (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration, banType } = req.body;

    const user = req.users.get(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ error: "Impossible de bannir un administrateur" });
    }

    // Bannir l'utilisateur
    user.isBanned = true;
    user.banReason = reason;
    if (duration > 0) {
      user.banUntil = moment
        .tz("Europe/Paris")
        .add(duration, "minutes")
        .toDate();
    }

    req.users.set(userId, user);

    // Si ban IP, ajouter aux bans IP
    if (banType === "ip" && user.lastIp) {
      const banId = Date.now().toString();
      req.bans.set(banId, {
        type: "ip",
        ip: user.lastIp,
        reason,
        until: duration > 0 ? user.banUntil : null,
        createdAt: moment.tz("Europe/Paris").toDate(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du bannissement:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Débannir un utilisateur
router.post("/users/:userId/unban", (req, res) => {
  try {
    const { userId } = req.params;

    const user = req.users.get(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    user.isBanned = false;
    user.banReason = null;
    user.banUntil = null;

    req.users.set(userId, user);

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du débannissement:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Activité récente
router.get("/activity", (req, res) => {
  try {
    // TODO: Implémenter la récupération de l'activité récente
    const recentActivity = [];
    res.json(recentActivity);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;
