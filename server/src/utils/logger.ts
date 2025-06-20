import winston from "winston";
import path from "path";

// Configuration des couleurs pour la console
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  verbose: "cyan",
};

winston.addColors(colors);

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Format pour la console (plus lisible)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  }),
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: {
    service: "yupichat-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === "production" ? "warn" : "debug",
    }),

    // Fichier pour toutes les erreurs
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Fichier pour tous les logs
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],

  // Gestion des exceptions et rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
    }),
  ],
});

// En production, ajouter des transports supplémentaires si nécessaire
if (process.env.NODE_ENV === "production") {
  // Transport pour les erreurs critiques seulement
  logger.add(
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/critical.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  );
}

// Méthodes utilitaires pour des types de logs spécifiques
export const loggerUtils = {
  // Log d'authentification
  auth: (message: string, meta?: any) => {
    logger.info(`[AUTH] ${message}`, { category: "auth", ...meta });
  },

  // Log d'activité utilisateur
  userActivity: (
    userId: string,
    username: string,
    action: string,
    meta?: any,
  ) => {
    logger.info(`[USER_ACTIVITY] ${username} (${userId}): ${action}`, {
      category: "user_activity",
      userId,
      username,
      action,
      ...meta,
    });
  },

  // Log d'administration
  admin: (adminId: string, action: string, meta?: any) => {
    logger.warn(`[ADMIN] ${adminId}: ${action}`, {
      category: "admin",
      adminId,
      action,
      ...meta,
    });
  },

  // Log de modération
  moderation: (moderatorId: string, action: string, meta?: any) => {
    logger.warn(`[MODERATION] ${moderatorId}: ${action}`, {
      category: "moderation",
      moderatorId,
      action,
      ...meta,
    });
  },

  // Log de sécurité
  security: (message: string, meta?: any) => {
    logger.error(`[SECURITY] ${message}`, { category: "security", ...meta });
  },

  // Log de performance
  performance: (operation: string, duration: number, meta?: any) => {
    logger.info(`[PERFORMANCE] ${operation}: ${duration}ms`, {
      category: "performance",
      operation,
      duration,
      ...meta,
    });
  },

  // Log de socket
  socket: (event: string, userId?: string, meta?: any) => {
    logger.debug(`[SOCKET] ${event}`, {
      category: "socket",
      event,
      userId,
      ...meta,
    });
  },

  // Log de database
  database: (operation: string, collection: string, meta?: any) => {
    logger.debug(`[DB] ${operation} on ${collection}`, {
      category: "database",
      operation,
      collection,
      ...meta,
    });
  },

  // Log d'email
  email: (
    to: string,
    subject: string,
    status: "sent" | "failed",
    meta?: any,
  ) => {
    logger.info(`[EMAIL] ${status.toUpperCase()}: ${subject} to ${to}`, {
      category: "email",
      to,
      subject,
      status,
      ...meta,
    });
  },

  // Log d'upload de fichier
  fileUpload: (
    userId: string,
    filename: string,
    size: number,
    status: "success" | "failed",
    meta?: any,
  ) => {
    logger.info(
      `[FILE_UPLOAD] ${status.toUpperCase()}: ${filename} (${size} bytes) by ${userId}`,
      {
        category: "file_upload",
        userId,
        filename,
        size,
        status,
        ...meta,
      },
    );
  },
};

// Middleware pour logger les requêtes HTTP
export const httpLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/http.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Fonction pour créer des logs structurés pour les actions sensibles
export const createAuditLog = (
  userId: string,
  action: string,
  resource: string,
  details?: any,
) => {
  logger.warn("AUDIT LOG", {
    category: "audit",
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    details,
  });
};

// Stream pour Morgan (middleware de logging HTTP)
export const morganStream = {
  write: (message: string) => {
    httpLogger.info(message.trim());
  },
};

export { logger };
