#!/bin/bash

# 🚀 Script de déploiement No-Skills Chat
# Usage: ./deploy.sh

echo "🚀 Déploiement No-Skills Chat sur no-skills.fr"
echo "=============================================="

# Configuration - MODIFIEZ VOTRE USERNAME GITHUB ICI
GITHUB_USER="okmonreufE"  # ⚠️ CHANGEZ ÇA !
REPO_NAME="no-skills-chat"

echo "📂 Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "🌐 Serveur: no-skills.fr"
echo ""

# Déploiement via SSH
ssh no-skills@no-skills.fr << EOF
    echo "🔧 Déploiement en cours..."
    
    # Aller dans le dossier
    cd /var/www/no-skills-chat || {
        echo "📁 Création du dossier..."
        sudo mkdir -p /var/www/no-skills-chat
        sudo chown -R no-skills:no-skills /var/www/no-skills-chat
        cd /var/www/no-skills-chat
    }
    
    # Cloner ou mettre à jour
    if [ -d ".git" ]; then
        echo "🔄 Mise à jour..."
        git pull origin main
    else
        echo "📥 Clone du repository..."
        git clone https://github.com/$GITHUB_USER/$REPO_NAME.git .
    fi
    
    # Installer les dépendances
    echo "📦 Installation..."
    npm install --production
    
    # Build
    echo "🔨 Build..."
    npm run build
    
    # Redémarrer avec PM2
    echo "🚀 Redémarrage..."
    pm2 stop no-skills-chat 2>/dev/null || true
    pm2 delete no-skills-chat 2>/dev/null || true
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    
    echo "✅ Déployé avec succès!"
    pm2 status
EOF

echo ""
echo "🎉 Déploiement terminé!"
echo "🌐 Votre site: https://no-skills.fr"
