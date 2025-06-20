import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { User } from "../models/User";
import { logger } from "../utils/logger";

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: string;
      };
    }
  }
}

// Interface pour les tokens décodés
interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Middleware d'authentification pour les routes HTTP
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    ) as JWTPayload;

    // Vérifier que l'utilisateur existe et n'est pas banni
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (user.isBanned && user.banExpires && user.banExpires < new Date()) {
      // Bannissement expiré, débannir automatiquement
      user.isBanned = false;
      user.banReason = undefined;
      user.banExpires = undefined;
      user.bannedBy = undefined;
      user.bannedAt = undefined;
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Compte banni",
        banInfo: {
          reason: user.banReason,
          bannedAt: user.bannedAt,
          expiresAt: user.banExpires,
        },
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }

    logger.error("Erreur d'authentification:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication requis",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
      });
    }

    next();
  };
};

// Middleware d'authentification pour Socket.IO
export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token d'accès requis"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    ) as JWTPayload;

    // Vérifier que l'utilisateur existe et n'est pas banni
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Utilisateur non trouvé"));
    }

    if (user.isBanned && user.banExpires && user.banExpires < new Date()) {
      // Bannissement expiré, débannir automatiquement
      user.isBanned = false;
      user.banReason = undefined;
      user.banExpires = undefined;
      user.bannedBy = undefined;
      user.bannedAt = undefined;
      await user.save();
    }

    if (user.isBanned) {
      return next(new Error("Compte banni"));
    }

    // Mettre à jour le statut en ligne
    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    // Ajouter les informations utilisateur au socket
    socket.data.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    logger.error("Erreur d'authentification socket:", error);
    next(new Error("Authentification échouée"));
  }
};

// Middleware pour vérifier les permissions des modérateurs
export const requireModeratorPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication requis",
      });
    }

    // Les admins ont toutes les permissions
    if (req.user.role === "admin") {
      return next();
    }

    // Vérifier les permissions des modérateurs
    if (req.user.role === "moderator") {
      const moderatorPermissions = [
        "manage_groups",
        "view_user_profiles",
        "timeout_users",
        "manage_public_messages",
      ];

      if (moderatorPermissions.includes(permission)) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Permission insuffisante",
    });
  };
};

// Middleware pour logging des actions sensibles
export const logSensitiveAction = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body) {
      // Logger l'action si elle a réussi
      if (body.success !== false) {
        logger.info(`Action sensible: ${action}`, {
          userId: req.user?.userId,
          username: req.user?.username,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          body: req.body,
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

// Fonction utilitaire pour vérifier les permissions
export const checkPermission = (
  userRole: string,
  requiredPermission: string,
): boolean => {
  // Les admins ont toutes les permissions
  if (userRole === "admin") {
    return true;
  }

  // Permissions des modérateurs
  if (userRole === "moderator") {
    const moderatorPermissions = [
      "manage_groups",
      "view_user_profiles",
      "timeout_users",
      "manage_public_messages",
      "view_logs",
    ];

    return moderatorPermissions.includes(requiredPermission);
  }

  // Permissions des utilisateurs normaux
  if (userRole === "user") {
    const userPermissions = ["send_messages", "join_groups", "upload_files"];

    return userPermissions.includes(requiredPermission);
  }

  return false;
};

// Rate limiting spécialisé pour les actions sensibles
export const sensitiveActionLimiter = (maxAttempts: number = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.user?.userId}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    const userAttempts = attempts.get(key);

    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message:
          "Trop de tentatives d'actions sensibles, réessayez dans 15 minutes",
      });
    }

    userAttempts.count++;
    next();
  };
};
