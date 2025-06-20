import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import du middleware d'authentification
import { authenticateToken } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configuration Multer pour l'upload d'avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"), false);
    }
  },
});

// Middleware pour accéder aux données
const getAppData = (req, res, next) => {
  req.users = req.app.locals.users;
  next();
};

router.use(getAppData);

// Obtenir le profil de l'utilisateur connecté
router.get("/profile", authenticateToken, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour le profil
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, chatTheme } =
      req.body;
    const user = req.user;

    // Vérifier si le nom d'utilisateur est déjà pris
    if (username && username !== user.username) {
      for (const [userId, userData] of req.users) {
        if (
          userData.username.toLowerCase() === username.toLowerCase() &&
          userId !== user.id
        ) {
          return res
            .status(400)
            .json({ error: "Ce nom d'utilisateur est déjà pris" });
        }
      }
    }

    // Vérifier si l'email est déjà utilisé
    if (email && email !== user.email) {
      for (const [userId, userData] of req.users) {
        if (
          userData.email.toLowerCase() === email.toLowerCase() &&
          userId !== user.id
        ) {
          return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }
      }
    }

    // Si changement de mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Mot de passe actuel requis" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Mot de passe actuel incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Mettre à jour les autres champs
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    if (chatTheme) user.chatTheme = chatTheme;

    user.lastActive = moment.tz("Europe/Paris").toDate();

    // Sauvegarder les modifications
    req.users.set(user.id, user);

    // Retourner l'utilisateur mis à jour (sans le mot de passe)
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Upload d'avatar
router.post(
  "/avatar",
  authenticateToken,
  upload.single("avatar"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      const user = req.user;

      // Supprimer l'ancien avatar s'il existe
      if (user.avatar) {
        const oldAvatarPath = path.join(
          process.env.UPLOAD_PATH || "./uploads",
          path.basename(user.avatar),
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Mettre à jour l'avatar de l'utilisateur
      const avatarUrl = `/uploads/${req.file.filename}`;
      user.avatar = avatarUrl;
      user.lastActive = moment.tz("Europe/Paris").toDate();

      req.users.set(user.id, user);

      res.json({
        success: true,
        avatarUrl,
        message: "Avatar mis à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'upload d'avatar:", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  },
);

// Obtenir un utilisateur par ID (pour voir les profils)
router.get("/:userId", authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.users.get(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Retourner seulement les informations publiques
    const publicUserInfo = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };

    res.json(publicUserInfo);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Servir les fichiers uploadés
router.use("/uploads", express.static(process.env.UPLOAD_PATH || "./uploads"));

export default router;
