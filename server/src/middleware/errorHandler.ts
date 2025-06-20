import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Interface pour les erreurs personnalisées
interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Middleware pour les routes non trouvées
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(
    `Route non trouvée - ${req.originalUrl}`,
  );
  error.statusCode = 404;
  next(error);
};

// Middleware de gestion d'erreurs global
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Erreur interne du serveur";

  // Gestion des erreurs spécifiques

  // Erreur de validation Mongoose
  if (error.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values((error as any).errors).map(
      (err: any) => err.message,
    );
    message = `Erreur de validation: ${errors.join(", ")}`;
  }

  // Erreur de duplication Mongoose (code 11000)
  if ((error as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((error as any).keyPattern)[0];
    message = `${field} déjà utilisé`;
  }

  // Erreur de cast Mongoose (ID invalide)
  if (error.name === "CastError") {
    statusCode = 400;
    message = "ID invalide";
  }

  // Erreur JWT
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token invalide";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expiré";
  }

  // Erreur Multer (upload de fichiers)
  if (error.name === "MulterError") {
    statusCode = 400;
    if ((error as any).code === "LIMIT_FILE_SIZE") {
      message = "Fichier trop volumineux";
    } else if ((error as any).code === "LIMIT_FILE_COUNT") {
      message = "Trop de fichiers";
    } else {
      message = "Erreur lors de l'upload du fichier";
    }
  }

  // Logger l'erreur
  logger.error("Erreur serveur:", {
    message: error.message,
    stack: error.stack,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.userId,
    body: req.method !== "GET" ? req.body : undefined,
  });

  // Réponse en fonction de l'environnement
  const response: any = {
    success: false,
    message,
  };

  // En développement, inclure plus de détails
  if (process.env.NODE_ENV === "development") {
    response.error = {
      name: error.name,
      stack: error.stack,
      statusCode,
    };

    if (req.method !== "GET") {
      response.requestBody = req.body;
    }
  }

  // Erreurs spécifiques avec des codes personnalisés
  if (statusCode === 500) {
    // Pour les erreurs 500, ne pas exposer les détails en production
    if (process.env.NODE_ENV === "production") {
      response.message = "Erreur interne du serveur";
    }
  }

  res.status(statusCode).json(response);
};

// Gestionnaire d'erreurs asynchrones
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Créateur d'erreurs personnalisées
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs prédéfinies courantes
export const createError = {
  badRequest: (message: string = "Requête invalide") =>
    new AppError(message, 400),

  unauthorized: (message: string = "Non autorisé") =>
    new AppError(message, 401),

  forbidden: (message: string = "Accès interdit") => new AppError(message, 403),

  notFound: (message: string = "Ressource non trouvée") =>
    new AppError(message, 404),

  conflict: (message: string = "Conflit") => new AppError(message, 409),

  tooManyRequests: (
    message: string = "Trop de requêtes, réessayez plus tard",
  ) => new AppError(message, 429),

  internalServer: (message: string = "Erreur interne du serveur") =>
    new AppError(message, 500),

  serviceUnavailable: (message: string = "Service indisponible") =>
    new AppError(message, 503),
};

// Middleware pour capturer les erreurs non gérées
export const setupErrorHandling = () => {
  // Gestion des exceptions non capturées
  process.on("uncaughtException", (error: Error) => {
    logger.error("Exception non capturée:", error);
    process.exit(1);
  });

  // Gestion des promesses rejetées non gérées
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("Promesse rejetée non gérée:", { reason, promise });
    process.exit(1);
  });

  // Gestion gracieuse de l'arrêt
  process.on("SIGTERM", () => {
    logger.info("SIGTERM reçu, arrêt en cours...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT reçu, arrêt en cours...");
    process.exit(0);
  });
};

// Middleware de validation des paramètres
export const validateObjectId = (paramName: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError.badRequest(`ID ${paramName} invalide`));
    }

    next();
  };
};

// Middleware de validation du contenu JSON
export const validateJsonContent = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.is("application/json") && !req.body) {
    return next(createError.badRequest("Corps de requête JSON invalide"));
  }
  next();
};

// Gestionnaire d'erreurs pour Socket.IO
export const socketErrorHandler = (socket: any, error: Error) => {
  logger.error("Erreur Socket.IO:", {
    message: error.message,
    stack: error.stack,
    socketId: socket.id,
    userId: socket.data?.user?.userId,
    username: socket.data?.user?.username,
  });

  // Émettre l'erreur au client
  socket.emit("error", {
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Erreur de connexion",
    code: "SOCKET_ERROR",
  });
};
