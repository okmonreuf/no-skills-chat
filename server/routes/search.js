import express from "express";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// Middleware pour accéder aux données
const getAppData = (req, res, next) => {
  req.users = req.app.locals.users;
  req.messages = req.app.locals.messages;
  next();
};

router.use(authenticateToken);
router.use(getAppData);

// Rechercher des utilisateurs
router.get("/users", (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Query trop courte" });
    }

    const query = q.trim().toLowerCase();
    const results = [];

    for (const [userId, user] of req.users) {
      if (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ) {
        // Retourner seulement les infos publiques
        results.push({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
        });
      }
    }

    res.json(results.slice(0, 20)); // Limiter à 20 résultats
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Rechercher des messages
router.get("/messages", (req, res) => {
  try {
    const { q, chatId } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Query trop courte" });
    }

    const query = q.trim().toLowerCase();
    const results = [];

    for (const [messageId, message] of req.messages) {
      // Filtrer par chat si spécifié
      if (chatId && message.chatId !== chatId) {
        continue;
      }

      if (message.content.toLowerCase().includes(query)) {
        results.push(message);
      }
    }

    // Trier par date décroissante et limiter
    results
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la recherche de messages:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;
