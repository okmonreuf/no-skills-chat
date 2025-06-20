#!/bin/bash

# 🚀 Script de déploiement direct sur VPS No-Skills Chat
# Usage: ./deploy-vps.sh

echo "🚀 Déploiement No-Skills Chat directement sur VPS"
echo "==============================================="

# Configuration - MODIFIEZ VOTRE USERNAME GITHUB ICI
GITHUB_USER="okmonreuf"  # ⚠️ CHANGEZ ÇA !
REPO_NAME="no-skills-chat"
APP_PATH="/var/www/no-skills-chat"

echo "📂 Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "📁 Dossier: $APP_PATH"
echo ""

# Créer le dossier si nécessaire
if [ ! -d "$APP_PATH" ]; then
    echo "📁 Création du dossier $APP_PATH..."
    sudo mkdir -p $APP_PATH
    sudo chown -R $(whoami):$(whoami) $APP_PATH
fi

cd $APP_PATH

# Backup de l'ancienne version
if [ -d ".git" ]; then
    echo "💾 Sauvegarde de l'ancienne version..."
    cp -r . ../backup-$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️ Pas de sauvegarde (premier déploiement)"
fi

# Cloner ou mettre à jour depuis GitHub
if [ -d ".git" ]; then
    echo "🔄 Mise à jour depuis GitHub..."
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo "📥 Clone du repository GitHub..."
    git clone https://github.com/$GITHUB_USER/$REPO_NAME.git .
fi

# Afficher les derniers commits
echo "📝 Derniers commits:"
git log --oneline -3
echo ""

# Installation des dépendances
echo "📦 Installation des dépendances..."
if [ -f "package.json" ]; then
    npm install --production
else
    echo "❌ package.json non trouvé!"
    exit 1
fi

# Build de l'application
echo "🔨 Build de l'application..."
npm run build || echo "⚠️ Build échoué, on continue..."

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p logs uploads server/routes

# Permissions
chmod +x deploy*.sh 2>/dev/null || true

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    sudo npm install -g pm2
fi

# Arrêter l'ancienne version
echo "⏹️ Arrêt de l'ancienne version..."
pm2 stop no-skills-chat 2>/dev/null || echo "ℹ️ Aucune instance à arrêter"
pm2 delete no-skills-chat 2>/dev/null || echo "ℹ️ Aucune instance à supprimer"

# Démarrer la nouvelle version
echo "🚀 Démarrage de No-Skills Chat..."
if [ -f "ecosystem.config.cjs" ]; then
    pm2 start ecosystem.config.cjs --env production
    pm2 save
else
    echo "❌ ecosystem.config.cjs non trouvé!"
    exit 1
fi

# Configuration du démarrage automatique
sudo pm2 startup systemd -u $(whoami) --hp $HOME 2>/dev/null || echo "ℹ️ Startup déjà configuré"

echo ""
echo "✅ Déploiement terminé avec succès!"
echo "🌐 Application disponible sur: https://no-skills.fr"
echo ""
echo "📊 Statut PM2:"
pm2 status
echo ""
echo "📝 Logs récents:"
pm2 logs no-skills-chat --lines 10 --nostream 2>/dev/null || echo "ℹ️ Logs non disponibles"

echo ""
echo "🔧 Commandes utiles:"
echo "  pm2 status              - Voir le statut"
echo "  pm2 logs no-skills-chat - Voir les logs"
echo "  pm2 restart no-skills-chat - Redémarrer"
echo "  ./deploy-vps.sh         - Redéployer"
