import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import rateLimit from "express-rate-limit";

import { User, IUser } from "../models/User";
import { authenticateToken } from "../middleware/auth";
import { logger } from "../utils/logger";
import { sendVerificationEmail } from "../utils/email";

const router = Router();

// Configuration multer pour l'upload d'avatar
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// Rate limiting pour les actions sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    error: "Trop de tentatives de connexion, réessayez dans 15 minutes",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP
  message: {
    error: "Trop d'inscriptions, réessayez dans 1 heure",
  },
});

// Fonction pour générer un JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });
};

// Validation pour l'inscription
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores",
    ),
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage(
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial",
    ),
];

// Validation pour la connexion
const loginValidation = [
  body("username").trim().notEmpty().withMessage("Nom d'utilisateur requis"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];

// POST /api/auth/register - Inscription
router.post(
  "/register",
  registerLimiter,
  registerValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { username, email, password } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Nom d'utilisateur ou email déjà utilisé",
        });
      }

      // Créer l'utilisateur
      const user = new User({
        username,
        email,
        password,
        status: "offline",
      });

      // Générer le code de vérification
      const verificationCode = user.generateVerificationCode();

      await user.save();

      // Envoyer l'email de vérification
      try {
        await sendVerificationEmail(email, username, verificationCode);
      } catch (emailError) {
        logger.warn(
          "Erreur lors de l'envoi de l'email de vérification:",
          emailError,
        );
        // Ne pas faire échouer l'inscription si l'email ne peut pas être envoyé
      }

      logger.info(`Nouvel utilisateur inscrit: ${username} (${email})`);

      res.status(201).json({
        success: true,
        message:
          "Inscription réussie. Vérifiez votre email pour activer votre compte.",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      logger.error("Erreur lors de l'inscription:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// POST /api/auth/login - Connexion
router.post(
  "/login",
  authLimiter,
  loginValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      // Trouver l'utilisateur et inclure le mot de passe
      const user = await User.findOne({ username }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Nom d'utilisateur ou mot de passe incorrect",
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Nom d'utilisateur ou mot de passe incorrect",
        });
      }

      // Vérifier si l'utilisateur est banni
      if (user.isBanned) {
        const banInfo: any = {
          reason: user.banReason,
          bannedAt: user.bannedAt,
        };

        if (user.banExpires) {
          banInfo.expiresAt = user.banExpires;
        }

        return res.status(403).json({
          success: false,
          message: "Compte banni",
          banInfo,
        });
      }

      // Mettre à jour le statut et la dernière connexion
      user.status = "online";
      user.lastSeen = new Date();
      await user.save();

      // Générer le token
      const token = generateToken(user._id.toString());

      logger.info(`Connexion réussie: ${username}`);

      res.json({
        success: true,
        message: "Connexion réussie",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          status: user.status,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la connexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// POST /api/auth/logout - Déconnexion
router.post(
  "/logout",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?.userId);
      if (user) {
        user.status = "offline";
        user.lastSeen = new Date();
        await user.save();
      }

      logger.info(`Déconnexion: ${user?.username}`);

      res.json({
        success: true,
        message: "Déconnexion réussie",
      });
    } catch (error) {
      logger.error("Erreur lors de la déconnexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// POST /api/auth/verify-email - Vérification d'email
router.post(
  "/verify-email",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Code de vérification requis",
        });
      }

      const user = await User.findById(req.user?.userId).select(
        "+verificationCode +verificationCodeExpires",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email déjà vérifié",
        });
      }

      if (
        !user.verificationCode ||
        user.verificationCode !== code ||
        (user.verificationCodeExpires &&
          user.verificationCodeExpires < new Date())
      ) {
        return res.status(400).json({
          success: false,
          message: "Code de vérification invalide ou expiré",
        });
      }

      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save();

      logger.info(`Email vérifié: ${user.username}`);

      res.json({
        success: true,
        message: "Email vérifié avec succès",
      });
    } catch (error) {
      logger.error("Erreur lors de la vérification d'email:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// PUT /api/auth/profile - Mise à jour du profil
router.put(
  "/profile",
  authenticateToken,
  [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("email").optional().isEmail().normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { username, email } = req.body;
      const user = await User.findById(req.user?.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Vérifier l'unicité si changement
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Nom d'utilisateur déjà utilisé",
          });
        }
        user.username = username;
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email déjà utilisé",
          });
        }
        user.email = email;
        user.isVerified = false; // Doit re-vérifier le nouveau email
      }

      await user.save();

      res.json({
        success: true,
        message: "Profil mis à jour avec succès",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          status: user.status,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// POST /api/auth/avatar - Upload d'avatar
router.post(
  "/avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni",
        });
      }

      const user = await User.findById(req.user?.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(__dirname, "../uploads/avatars");
      await fs.mkdir(uploadsDir, { recursive: true });

      // Traitement de l'image avec Sharp
      const filename = `${uuidv4()}.webp`;
      const filepath = path.join(uploadsDir, filename);

      await sharp(req.file.buffer)
        .resize(200, 200, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      // Supprimer l'ancien avatar s'il existe
      if (user.avatar) {
        const oldPath = path.join(
          __dirname,
          "../uploads/avatars",
          path.basename(user.avatar),
        );
        try {
          await fs.unlink(oldPath);
        } catch (error) {
          // Ignorer si le fichier n'existe pas
        }
      }

      // Mettre à jour l'URL de l'avatar
      const avatarUrl = `/uploads/avatars/${filename}`;
      user.avatar = avatarUrl;
      await user.save();

      res.json({
        success: true,
        message: "Avatar mis à jour avec succès",
        avatarUrl,
      });
    } catch (error) {
      logger.error("Erreur lors de l'upload d'avatar:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  },
);

// GET /api/auth/me - Obtenir les informations de l'utilisateur connecté
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        status: user.status,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      "Erreur lors de la récupération des informations utilisateur:",
      error,
    );
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
});

export default router;
