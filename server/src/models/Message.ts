import mongoose, { Document, Schema } from "mongoose";

export interface IMessageAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file" | "video" | "audio";
  size: number;
  mimeType: string;
}

export interface IMessageReaction {
  emoji: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
}

export interface IMessageRead {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  senderId: mongoose.Types.ObjectId;
  senderUsername: string;
  senderAvatar?: string;
  groupId?: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  isPrivate: boolean;
  attachments: IMessageAttachment[];
  replyTo?: mongoose.Types.ObjectId;
  reactions: IMessageReaction[];
  readBy: IMessageRead[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Méthodes
  addReaction(
    emoji: string,
    userId: mongoose.Types.ObjectId,
    username: string,
  ): void;
  removeReaction(emoji: string, userId: mongoose.Types.ObjectId): void;
  markAsRead(userId: mongoose.Types.ObjectId): void;
  isReadBy(userId: mongoose.Types.ObjectId): boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, "Le contenu du message est requis"],
      trim: true,
      maxlength: [2000, "Le message ne peut pas dépasser 2000 caractères"],
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderUsername: {
      type: String,
      required: true,
    },

    senderAvatar: {
      type: String,
      default: null,
    },

    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    attachments: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "file", "video", "audio"],
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
      },
    ],

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    readBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour les recherches et performances
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ isPrivate: 1, createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ "readBy.userId": 1 });
messageSchema.index({ createdAt: -1 });

// Validation personnalisée
messageSchema.pre("save", function (next) {
  // Un message doit être soit dans un groupe, soit privé
  if (!this.groupId && !this.recipientId) {
    return next(
      new Error("Un message doit avoir un groupe ou un destinataire"),
    );
  }

  // Un message ne peut pas être à la fois de groupe et privé
  if (this.groupId && this.recipientId) {
    return next(
      new Error("Un message ne peut pas être à la fois de groupe et privé"),
    );
  }

  // D��finir isPrivate en fonction de la présence d'un destinataire
  this.isPrivate = !!this.recipientId;

  next();
});

// Marquer automatiquement comme lu par l'expéditeur
messageSchema.pre("save", function (next) {
  if (this.isNew) {
    this.readBy.push({
      userId: this.senderId,
      readAt: new Date(),
    });
  }
  next();
});

// Méthode pour ajouter une réaction
messageSchema.methods.addReaction = function (
  emoji: string,
  userId: mongoose.Types.ObjectId,
  username: string,
) {
  // Vérifier si l'utilisateur a déjà réagi avec cet emoji
  const existingReaction = this.reactions.find(
    (reaction: IMessageReaction) =>
      reaction.emoji === emoji &&
      reaction.userId.toString() === userId.toString(),
  );

  if (existingReaction) {
    throw new Error("L'utilisateur a déjà réagi avec cet emoji");
  }

  this.reactions.push({
    emoji,
    userId,
    username,
    createdAt: new Date(),
  });
};

// Méthode pour supprimer une réaction
messageSchema.methods.removeReaction = function (
  emoji: string,
  userId: mongoose.Types.ObjectId,
) {
  const reactionIndex = this.reactions.findIndex(
    (reaction: IMessageReaction) =>
      reaction.emoji === emoji &&
      reaction.userId.toString() === userId.toString(),
  );

  if (reactionIndex === -1) {
    throw new Error("Réaction non trouvée");
  }

  this.reactions.splice(reactionIndex, 1);
};

// Méthode pour marquer comme lu
messageSchema.methods.markAsRead = function (userId: mongoose.Types.ObjectId) {
  // Vérifier si déjà lu par cet utilisateur
  const alreadyRead = this.readBy.some(
    (read: IMessageRead) => read.userId.toString() === userId.toString(),
  );

  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date(),
    });
  }
};

// Méthode pour vérifier si lu par un utilisateur
messageSchema.methods.isReadBy = function (
  userId: mongoose.Types.ObjectId,
): boolean {
  return this.readBy.some(
    (read: IMessageRead) => read.userId.toString() === userId.toString(),
  );
};

// Ne pas retourner les messages supprimés par défaut
messageSchema.pre(["find", "findOne"], function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
