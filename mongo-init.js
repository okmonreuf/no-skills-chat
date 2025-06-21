// Script d'initialisation MongoDB pour YupiChat
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur

// Créer la base de données YupiChat
db = db.getSiblingDB("yupichat");

// Créer un utilisateur spécifique pour l'application
db.createUser({
  user: "yupichat_user",
  pwd: "YupiChatPassword123!",
  roles: [
    {
      role: "readWrite",
      db: "yupichat",
    },
  ],
});

// Créer les collections principales avec validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password", "role"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30,
          description: "Username must be a string between 3-30 characters",
        },
        email: {
          bsonType: "string",
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          description: "Must be a valid email address",
        },
        role: {
          bsonType: "string",
          enum: ["admin", "moderator", "user"],
          description: "Role must be admin, moderator, or user",
        },
      },
    },
  },
});

db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content", "sender", "timestamp"],
      properties: {
        content: {
          bsonType: "string",
          maxLength: 2000,
          description: "Message content cannot exceed 2000 characters",
        },
      },
    },
  },
});

db.createCollection("groups");

// Créer les index pour de meilleures performances
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ lastSeen: 1 });
db.users.createIndex({ status: 1 });

db.messages.createIndex({ timestamp: -1 });
db.messages.createIndex({ sender: 1 });
db.messages.createIndex({ group: 1 });

db.groups.createIndex({ name: 1 });
db.groups.createIndex({ "members.user": 1 });

print("🗄️  Base de données YupiChat initialisée avec succès !");
print("👤 Utilisateur yupichat_user créé");
print("📚 Collections et index créés");
