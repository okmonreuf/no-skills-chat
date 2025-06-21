import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "admin" | "moderator" | "user";
  avatar?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isBanned: boolean;
  banReason?: string;
  banExpires?: Date;
  bannedBy?: mongoose.Types.ObjectId;
  bannedAt?: Date;
  lastSeen: Date;
  status: "online" | "offline" | "away";
  createdAt: Date;
  updatedAt: Date;

  // Méthodes
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationCode(): string;
  isValidPassword(password: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est requis"],
      unique: true,
      trim: true,
      minlength: [
        3,
        "Le nom d'utilisateur doit contenir au moins 3 caractères",
      ],
      maxlength: [
        30,
        "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
      ],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores",
      ],
    },

    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Veuillez fournir un email valide"],
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
      select: false, // Ne pas inclure le mot de passe par défaut dans les requêtes
    },

    role: {
      type: String,
      enum: ["admin", "moderator", "user"],
      default: "user",
    },

    avatar: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      select: false,
    },

    verificationCodeExpires: {
      type: Date,
      select: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: null,
    },

    banExpires: {
      type: Date,
      default: null,
    },

    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    bannedAt: {
      type: Date,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.verificationCode;
        delete ret.verificationCodeExpires;
        return ret;
      },
    },
  },
);

// Index pour les recherches (username et email sont déjà indexés via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastSeen: 1 });

// Middleware pour hasher le mot de passe
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Mettre à jour lastSeen avant chaque sauvegarde
userSchema.pre("save", function (next) {
  if (this.status === "online") {
    this.lastSeen = new Date();
  }
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un code de vérification
userSchema.methods.generateVerificationCode = function (): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return code;
};

// Méthode pour valider la force du mot de passe
userSchema.methods.isValidPassword = function (password: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  );
};

// Middleware pour vérifier l'expiration des bannissements
userSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
  // Mettre à jour automatiquement les bannissements expirés
  this.updateMany(
    {
      isBanned: true,
      banExpires: { $lt: new Date() },
    },
    {
      $set: {
        isBanned: false,
        banReason: null,
        banExpires: null,
        bannedBy: null,
        bannedAt: null,
      },
    },
  );
});

export const User = mongoose.model<IUser>("User", userSchema);
