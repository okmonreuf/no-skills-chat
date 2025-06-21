import mongoose, { Document, Schema } from "mongoose";

export interface IGroupMember {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
  joinedAt: Date;
  role: "admin" | "member";
  status: "online" | "offline" | "away";
}

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  members: IGroupMember[];
  admins: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  inviteCode?: string;
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: Date;
  updatedAt: Date;

  // Méthodes
  addMember(
    userId: mongoose.Types.ObjectId,
    username: string,
    avatar?: string,
  ): void;
  removeMember(userId: mongoose.Types.ObjectId): void;
  promoteToAdmin(userId: mongoose.Types.ObjectId): void;
  demoteFromAdmin(userId: mongoose.Types.ObjectId): void;
  isMember(userId: mongoose.Types.ObjectId): boolean;
  isAdmin(userId: mongoose.Types.ObjectId): boolean;
  generateInviteCode(): string;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, "Le nom du groupe est requis"],
      trim: true,
      minlength: [1, "Le nom du groupe doit contenir au moins 1 caractère"],
      maxlength: [50, "Le nom du groupe ne peut pas dépasser 50 caractères"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "La description ne peut pas dépasser 200 caractères"],
    },

    avatar: {
      type: String,
      default: null,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        avatar: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        status: {
          type: String,
          enum: ["online", "offline", "away"],
          default: "offline",
        },
      },
    ],

    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    settings: {
      allowInvites: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      maxMembers: {
        type: Number,
        default: 100,
        min: 2,
        max: 1000,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index pour les recherches
groupSchema.index({ name: 1 });
groupSchema.index({ isPrivate: 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ "members.userId": 1 });
groupSchema.index({ admins: 1 });
groupSchema.index({ inviteCode: 1 });

// Ajouter automatiquement le créateur comme admin et membre
groupSchema.pre("save", function (next) {
  if (this.isNew) {
    // Ajouter le créateur comme admin
    this.admins.push(this.createdBy);

    // Générer un code d'invitation si le groupe est privé
    if (this.isPrivate && !this.inviteCode) {
      this.inviteCode = this.generateInviteCode();
    }
  }
  next();
});

// Méthode pour ajouter un membre
groupSchema.methods.addMember = function (
  userId: mongoose.Types.ObjectId,
  username: string,
  avatar?: string,
) {
  if (this.isMember(userId)) {
    throw new Error("L'utilisateur est déjà membre du groupe");
  }

  if (this.members.length >= this.settings.maxMembers) {
    throw new Error("Le groupe a atteint le nombre maximum de membres");
  }

  this.members.push({
    userId,
    username,
    avatar,
    joinedAt: new Date(),
    role: "member",
    status: "online",
  });
};

// Méthode pour supprimer un membre
groupSchema.methods.removeMember = function (userId: mongoose.Types.ObjectId) {
  const memberIndex = this.members.findIndex(
    (member: IGroupMember) => member.userId.toString() === userId.toString(),
  );

  if (memberIndex === -1) {
    throw new Error("L'utilisateur n'est pas membre du groupe");
  }

  // Ne pas permettre au créateur de quitter le groupe
  if (this.createdBy.toString() === userId.toString()) {
    throw new Error("Le créateur du groupe ne peut pas le quitter");
  }

  this.members.splice(memberIndex, 1);

  // Retirer des admins si nécessaire
  const adminIndex = this.admins.findIndex(
    (admin: mongoose.Types.ObjectId) => admin.toString() === userId.toString(),
  );
  if (adminIndex !== -1) {
    this.admins.splice(adminIndex, 1);
  }
};

// Méthode pour promouvoir en admin
groupSchema.methods.promoteToAdmin = function (
  userId: mongoose.Types.ObjectId,
) {
  if (!this.isMember(userId)) {
    throw new Error("L'utilisateur n'est pas membre du groupe");
  }

  if (this.isAdmin(userId)) {
    throw new Error("L'utilisateur est déjà administrateur");
  }

  this.admins.push(userId);

  // Mettre à jour le rôle dans les membres
  const member = this.members.find(
    (m: IGroupMember) => m.userId.toString() === userId.toString(),
  );
  if (member) {
    member.role = "admin";
  }
};

// Méthode pour rétrograder d'admin
groupSchema.methods.demoteFromAdmin = function (
  userId: mongoose.Types.ObjectId,
) {
  if (this.createdBy.toString() === userId.toString()) {
    throw new Error("Le créateur du groupe ne peut pas être rétrogradé");
  }

  const adminIndex = this.admins.findIndex(
    (admin: mongoose.Types.ObjectId) => admin.toString() === userId.toString(),
  );

  if (adminIndex === -1) {
    throw new Error("L'utilisateur n'est pas administrateur");
  }

  this.admins.splice(adminIndex, 1);

  // Mettre à jour le rôle dans les membres
  const member = this.members.find(
    (m: IGroupMember) => m.userId.toString() === userId.toString(),
  );
  if (member) {
    member.role = "member";
  }
};

// Méthode pour vérifier si un utilisateur est membre
groupSchema.methods.isMember = function (
  userId: mongoose.Types.ObjectId,
): boolean {
  return this.members.some(
    (member: IGroupMember) => member.userId.toString() === userId.toString(),
  );
};

// Méthode pour vérifier si un utilisateur est admin
groupSchema.methods.isAdmin = function (
  userId: mongoose.Types.ObjectId,
): boolean {
  return this.admins.some(
    (admin: mongoose.Types.ObjectId) => admin.toString() === userId.toString(),
  );
};

// Méthode pour générer un code d'invitation
groupSchema.methods.generateInviteCode = function (): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const Group = mongoose.model<IGroup>("Group", groupSchema);
