import express from "express";
import moment from "moment-timezone";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// Middleware pour accéder aux données
const getAppData = (req, res, next) => {
  req.users = req.app.locals.users;
  req.chats = req.app.locals.chats;
  req.messages = req.app.locals.messages;
  next();
};

router.use(getAppData);

// Obtenir tous les chats de l'utilisateur
router.get("/", authenticateToken, (req, res) => {
  try {
    const userChats = [];
    for (const [chatId, chat] of req.chats) {
      if (chat.participants.some((p) => p.id === req.user.id)) {
        userChats.push(chat);
      }
    }
    res.json(userChats);
  } catch (error) {
    console.error("Erreur lors de la récupération des chats:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir les messages d'un chat
router.get("/:chatId/messages", authenticateToken, (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const chat = req.chats.get(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat introuvable" });
    }

    // Vérifier que l'utilisateur fait partie du chat
    if (!chat.participants.some((p) => p.id === req.user.id)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Récupérer les messages du chat
    const chatMessages = [];
    for (const [messageId, message] of req.messages) {
      if (message.chatId === chatId) {
        chatMessages.push(message);
      }
    }

    // Trier par date et paginer
    chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const messages = chatMessages.slice(startIndex, endIndex);

    res.json({
      messages,
      hasMore: endIndex < chatMessages.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Créer un groupe
router.post("/groups", authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Le nom du groupe est requis" });
    }

    const groupId = Date.now().toString();
    const newGroup = {
      id: groupId,
      name: name.trim(),
      description: description || "",
      type: "group",
      avatar: null,
      createdBy: req.user.id,
      participants: [req.user],
      admins: [req.user.id],
      moderators: [],
      createdAt: moment.tz("Europe/Paris").toDate(),
      lastMessage: null,
      settings: {
        allowFiles: true,
        allowEmojis: true,
        slowMode: 0,
      },
    };

    req.chats.set(groupId, newGroup);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Erreur lors de la création du groupe:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;
