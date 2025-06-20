import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";

const router = express.Router();

// Middleware pour accéder aux données
const getAppData = (req, res, next) => {
  req.users = req.app.locals.users;
  req.bans = req.app.locals.bans;
  next();
};

router.use(getAppData);

// Génération de token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Vérification des bans IP et compte
const checkBans = (req, res, next) => {
  const userIp = req.ip;
  const now = moment.tz("Europe/Paris").toDate();

  // Vérifier le ban IP
  for (const [banId, ban] of req.bans) {
    if (ban.type === "ip" && ban.ip === userIp) {
      if (!ban.until || new Date(ban.until) > now) {
        return res.status(403).json({
          error: "Votre adresse IP est bannie",
          reason: ban.reason,
          until: ban.until,
        });
      } else {
        // Ban expiré, le supprimer
        req.bans.delete(banId);
      }
    }
  }

  next();
};

// Login
router.post("/login", checkBans, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Trouver l'utilisateur par email
    let user = null;
    for (const [userId, userData] of req.users) {
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
      // Vérifier si le ban est temporaire et expiré
      if (user.banUntil && new Date(user.banUntil) <= new Date()) {
        user.isBanned = false;
        user.banReason = null;
        user.banUntil = null;
        req.users.set(user.id, user);
      } else {
        return res.status(403).json({
          error: "Votre compte est banni",
          reason: user.banReason,
          until: user.banUntil,
        });
      }
    }

    // Mettre à jour la dernière activité
    user.lastActive = moment.tz("Europe/Paris").toDate();
    req.users.set(user.id, user);

    // Générer le token
    const token = generateToken(user.id);

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

// Inscription
router.post("/register", checkBans, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur, email et mot de passe requis" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Vérifier si l'email existe déjà
    for (const [userId, userData] of req.users) {
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
      isVerified: false, // TODO: Implémenter la vérification email
      isBanned: false,
      createdAt: moment.tz("Europe/Paris").toDate(),
      lastActive: moment.tz("Europe/Paris").toDate(),
      avatar: null,
      chatTheme: "default",
    };

    req.users.set(userId, newUser);

    // Générer le token
    const token = generateToken(userId);

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser;

    // TODO: Envoyer l'email de vérification
    // await sendVerificationEmail(email, userId);

    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Vérification d'email (placeholder)
router.post("/verify-email", (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Implémenter la vérification réelle
    // Pour l'instant, on simule une vérification réussie

    res.json({ success: true, message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Renvoyer l'email de vérification
router.post("/resend-verification", (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Implémenter l'envoi d'email réel
    // Pour l'instant, on simule un envoi réussi

    res.json({ success: true, message: "Email de vérification envoyé" });
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Middleware d'authentification pour les routes protégées
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" });
    }

    const user = req.app.locals.users.get(decoded.userId);
    if (!user || user.isBanned) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    req.user = user;
    next();
  });
};

export default router;
