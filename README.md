# 🚀 YupiChat - Système de Messagerie Moderne

Un système de messagerie complet, sécurisé et moderne conçu pour les communautés et équipes. YupiChat offre une expérience de chat en temps réel avec des fonctionnalités avancées d'administration et de modération.

![YupiChat Banner](https://via.placeholder.com/1200x400/667eea/ffffff?text=YupiChat+-+Messagerie+Moderne)

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité

- Système d'inscription et connexion sécurisé
- Vérification d'email obligatoire
- Authentification JWT avec sessions persistantes
- Chiffrement des mots de passe avec bcrypt
- Rate limiting pour prévenir les attaques

### 👥 Gestion des Utilisateurs

- **Compte Administrateur Principal** : `Yupi` / `1515Dh!dofly`
- Création de comptes modérateurs par les admins
- Système de rôles (Admin, Modérateur, Utilisateur)
- Profils utilisateurs personnalisables avec avatars
- Statuts en ligne/hors ligne/absent en temps réel

### 💬 Messagerie Avancée

- Chat en temps réel avec WebSocket
- Messages privés et groupes
- Groupes publics et privés
- Heures affichées en fuseau horaire de Paris
- Système de "vu" pour les messages
- Réactions emoji sur les messages
- Réponses aux messages
- Upload de fichiers et images
- Indicateurs de frappe en temps réel

### 🛡️ Administration & Modération

- **Panel Admin Complet** :

  - Création/suppression de modérateurs
  - Gestion complète des permissions
  - Statistiques en temps réel
  - Logs système en direct
  - Gestion des bannissements et timeouts
  - Bannissement par IP
  - Vue d'ensemble de tous les utilisateurs et groupes

- **Panel Modérateur** :
  - Gestion des groupes publics
  - Modération des messages
  - Timeouts temporaires
  - Vue des profils utilisateurs
  - Statistiques de modération

### 🎨 Interface Moderne

- Design moderne avec Tailwind CSS
- Thème sombre par défaut
- Interface responsive (mobile, tablette, desktop)
- Animations fluides avec Framer Motion
- Composants UI cohérents avec Radix UI
- Personnalisation des couleurs et thèmes

### 🚫 Système de Bannissement

- Bannissements temporaires ou permanents
- Page de bannissement avec raison et temps restant
- Notification par email des bannissements
- Débannissement automatique à l'expiration
- Historique complet des sanctions

## 🛠️ Technologies Utilisées

### Frontend

- **React 18** avec TypeScript
- **Vite** pour le bundling et développement
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Radix UI** pour les composants accessibles
- **React Router** pour la navigation
- **Zustand** pour la gestion d'état
- **Socket.IO Client** pour le temps réel

### Backend

- **Node.js** avec Express
- **TypeScript** pour la sécurité des types
- **MongoDB** avec Mongoose
- **Socket.IO** pour le temps réel
- **JWT** pour l'authentification
- **Bcrypt** pour le chiffrement
- **Multer** + **Sharp** pour l'upload d'images
- **Winston** pour les logs
- **Nodemailer** pour les emails

### Déploiement

- **PM2** pour la gestion des processus
- **Scripts de déploiement** automatisés
- **Configuration Nginx** (optionnelle)
- **Support Docker** (à venir)

## 🚀 Installation et Déploiement

### 📋 Prérequis

```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version

# MongoDB
mongod --version

# PM2 (pour la production)
npm install -g pm2
```

### 🔧 Installation Rapide

1. **Cloner le projet**

```bash
git clone <your-repo-url>
cd yupichat
```

2. **Installer les dépendances frontend**

```bash
npm install
```

3. **Installer les dépendances backend**

```bash
cd server
./install-deps.sh
# ou manuellement :
npm install
cp .env.example .env
```

4. **Configurer l'environnement**

```bash
# Éditer server/.env avec vos paramètres
nano server/.env
```

5. **Démarrer MongoDB**

```bash
# Sur Ubuntu/Debian :
sudo systemctl start mongod

# Sur macOS avec Homebrew :
brew services start mongodb-community

# Ou directement :
mongod
```

### 🖥️ Développement

```bash
# Démarrage automatique (frontend + backend)
./deploy.sh development

# Ou séparément :

# Frontend (port 5173)
npm run dev

# Backend (port 3001)
cd server
npm run dev
```

### 🌐 Production

```bash
# Déploiement automatique
./deploy.sh production

# Ou étape par étape :
npm run build
cd server && npm run build
pm2 start ecosystem.config.cjs --env production
```

## ⚙️ Configuration

### 🔑 Variables d'Environnement

Principales variables dans `server/.env` :

```env
# Serveur
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-domain.com

# Sécurité
JWT_SECRET=your-super-secret-key-min-32-chars

# Base de données
MONGODB_URI=mongodb://localhost:27017/yupichat

# Email (Gmail exemple)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 📧 Configuration Email

#### Gmail

1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `SMTP_PASS`

#### Autres services supportés

- **Mailgun** : Configuration SMTP dans `.env`
- **SendGrid** : Utiliser la configuration SMTP
- **Custom SMTP** : N'importe quel serveur SMTP

### 🔒 Sécurité en Production

```bash
# Générer une clé JWT sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Configurer le firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# SSL avec Let's Encrypt (recommandé)
sudo certbot --nginx -d your-domain.com
```

## 📖 Utilisation

### 👤 Comptes par Défaut

- **Administrateur** : `Yupi` / `1515Dh!dofly`
  - Accès complet au système
  - Création de modérateurs
  - Gestion des bannissements

### 🎯 Accès aux Panels

- **Chat** : `/chat`
- **Admin** : `/admin` (admins seulement)
- **Modération** : `/moderator` (admins + modérateurs)

### 📱 Fonctionnalités Chat

1. **Créer un groupe** : Bouton "+" dans la sidebar
2. **Messages privés** : Cliquer sur un utilisateur
3. **Réactions** : Survoler un message et cliquer sur 😊
4. **Upload** : Glisser-déposer ou cliquer sur 📎
5. **Réponses** : Cliquer sur un message puis écrire

### 🛡️ Administration

1. **Créer un modérateur** :

   - Aller dans l'onglet "Modérateurs"
   - Cliquer "Créer un modérateur"
   - Remplir les informations

2. **Bannir un utilisateur** :

   - Onglet "Utilisateurs"
   - Cliquer sur l'icône de bannissement
   - Spécifier la raison et durée

3. **Voir les logs** :
   - Onglet "Logs système"
   - Logs en temps réel avec filtres

## 🔧 Scripts Disponibles

### Frontend

```bash
npm run dev          # Développement
npm run build        # Build production
npm run preview      # Prévisualiser le build
npm run typecheck    # Vérification TypeScript
npm test             # Tests
```

### Backend

```bash
npm run dev          # Développement avec rechargement
npm run build        # Compilation TypeScript
npm start            # Démarrer en production
npm run typecheck    # Vérification TypeScript
```

### Déploiement

```bash
./deploy.sh development    # Développement
./deploy.sh staging        # Staging
./deploy.sh production     # Production

# Options :
CLEAN_INSTALL=true ./deploy.sh production  # Installation propre
SKIP_TESTS=true ./deploy.sh staging        # Ignorer les tests
```

## 📁 Structure du Projet

```
yupichat/
├── 📁 src/                    # Frontend React
│   ├── 📁 components/         # Composants réutilisables
│   │   ├── 📁 ui/             # Composants UI de base
│   │   └── 📁 chat/           # Composants spécifiques au chat
│   ├── 📁 hooks/              # Hooks React personnalisés
│   ├── 📁 pages/              # Pages de l'application
│   ├── 📁 services/           # Services API et logique métier
│   └── 📁 lib/                # Utilitaires et helpers
├── 📁 server/                 # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 models/         # Modèles MongoDB
│   │   ├── 📁 routes/         # Routes API Express
│   │   ├── 📁 middleware/     # Middleware personnalisés
│   │   ├── 📁 utils/          # Utilitaires backend
│   │   └── 📁 sockets/        # Gestion Socket.IO
│   └── 📁 dist/               # Code compilé
├── 📁 public/                 # Assets statiques
├── ecosystem.config.cjs       # Configuration PM2
├── deploy.sh                  # Script de déploiement
└── README.md                  # Cette documentation
```

## 🚨 Dépannage

### Problèmes Courants

1. **Port déjà utilisé**

```bash
# Voir les processus sur le port 3001
lsof -i :3001
# Tuer le processus
kill -9 PID
```

2. **MongoDB non connecté**

```bash
# Vérifier le statut
sudo systemctl status mongod
# Redémarrer
sudo systemctl restart mongod
```

3. **Emails non envoyés**

- Vérifier les credentials SMTP dans `.env`
- Tester avec un service comme Ethereal Email
- Vérifier les logs : `pm2 logs yupichat-backend`

4. **Erreurs de build**

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### 📊 Monitoring

```bash
# Statut des processus PM2
pm2 status

# Logs en temps réel
pm2 logs yupichat-backend --lines 100

# Monitoring système
pm2 monit

# Redémarrer un service
pm2 restart yupichat-backend
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Documentation** : Ce README
- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Email** : admin@yupichat.com

## 🎯 Roadmap

### Version 1.1

- [ ] Messages vocaux
- [ ] Partage d'écran
- [ ] Intégrations (Discord, Slack)
- [ ] API publique

### Version 1.2

- [ ] Applications mobiles
- [ ] Chiffrement end-to-end
- [ ] Thèmes personnalisés
- [ ] Plugins système

---

**Développé avec ❤️ pour créer la meilleure expérience de chat possible**

_YupiChat - Connecter les communautés, un message à la fois._
