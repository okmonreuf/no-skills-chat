#!/bin/bash

# Script de déploiement No-Skills Chat depuis GitHub
# Usage: ./deploy-github.sh [deploy|status|logs|restart|rollback]

set -e

# Configuration - MODIFIEZ CES VALEURS
GITHUB_REPO="votre-username/no-skills-chat"  # Remplacez par votre repo GitHub
BRANCH="main"
SERVER_USER="no-skills"
SERVER_HOST="no-skills.fr"
APP_PATH="/var/www/no-skills-chat"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonction de log avec emojis
log() {
    echo -e "${GREEN}✅ [$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}❌ [ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  [WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  [INFO] $1${NC}"
}

success() {
    echo -e "${PURPLE}🎉 [SUCCESS] $1${NC}"
}

# Vérifier si on est connecté au serveur
check_connection() {
    info "Vérification de la connexion au serveur..."
    
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_HOST exit 2>/dev/null; then
        log "Connexion SSH OK"
    else
        error "Impossible de se connecter au serveur $SERVER_HOST"
    fi
}

# Déploiement depuis GitHub
deploy_from_github() {
    log "🚀 Début du déploiement No-Skills Chat depuis GitHub"
    info "Repository: https://github.com/$GITHUB_REPO"
    info "Branch: $BRANCH"
    
    ssh $SERVER_USER@$SERVER_HOST << EOF
        set -e
        
        echo "🔧 Déploiement No-Skills Chat"
        echo "=============================="
        echo "📅 \$(date '+%Y-%m-%d %H:%M:%S')"
        echo "📂 Repository: $GITHUB_REPO"
        echo "🌿 Branch: $BRANCH"
        echo ""
        
        # Variables
        APP_PATH="$APP_PATH"
        BACKUP_PATH="/var/www/backup-\$(date +%Y%m%d_%H%M%S)"
        
        # Créer le répertoire si nécessaire
        if [ ! -d "\$APP_PATH" ]; then
            echo "📁 Création du répertoire \$APP_PATH..."
            sudo mkdir -p \$APP_PATH
            sudo chown -R \$(whoami):\$(whoami) \$APP_PATH
        fi
        
        cd \$APP_PATH
        
        # Backup de l'ancienne version
        if [ -d ".git" ]; then
            echo "💾 Sauvegarde vers \$BACKUP_PATH..."
            cp -r . \$BACKUP_PATH || echo "⚠️  Erreur lors de la sauvegarde (non critique)"
        fi
        
        # Clone ou mise à jour depuis GitHub
        if [ -d ".git" ]; then
            echo "🔄 Mise à jour depuis GitHub..."
            git fetch origin
            git reset --hard origin/$BRANCH
            git pull origin $BRANCH
        else
            echo "📥 Clone depuis GitHub..."
            git clone https://github.com/$GITHUB_REPO.git .
            git checkout $BRANCH
        fi
        
        # Afficher les derniers commits
        echo "📝 Derniers commits:"
        git log --oneline -5
        echo ""
        
        # Installation des dépendances
        echo "📦 Installation des dépendances..."
        if [ -f "package.json" ]; then
            # Nettoyer node_modules pour éviter les conflits
            rm -rf node_modules package-lock.json 2>/dev/null || true
            npm install --production
        else
            echo "❌ package.json non trouvé"
            exit 1
        fi
        
        # Build de l'application
        echo "🔨 Build de l'application..."
        npm run build || echo "⚠️  Build échoué, continuons..."
        
        # Créer les dossiers nécessaires
        echo "📁 Création des dossiers..."
        mkdir -p logs uploads server/routes
        
        # Permissions
        chmod +x deploy.sh 2>/dev/null || true
        chmod +x deploy-github.sh 2>/dev/null || true
        
        # Vérifier PM2
        if ! command -v pm2 &> /dev/null; then
            echo "📦 Installation de PM2..."
            npm install -g pm2
        fi
        
        # Arrêter l'ancienne version
        echo "⏹️  Arrêt de l'ancienne version..."
        pm2 stop no-skills-chat 2>/dev/null || echo "ℹ️  Aucune instance à arrêter"
        pm2 delete no-skills-chat 2>/dev/null || echo "ℹ️  Aucune instance à supprimer"
        
        # Démarrer la nouvelle version
        echo "🚀 Démarrage de No-Skills Chat..."
        if [ -f "ecosystem.config.cjs" ]; then
            pm2 start ecosystem.config.cjs --env production
            pm2 save
        else
            echo "❌ ecosystem.config.cjs non trouvé"
            exit 1
        fi
        
        # Configuration du démarrage automatique
        sudo pm2 startup systemd -u \$(whoami) --hp /home/\$(whoami) 2>/dev/null || echo "ℹ️  Startup déjà configuré"
        
        echo ""
        echo "✅ Déploiement terminé avec succès!"
        echo "🌐 L'application est disponible sur: https://no-skills.fr"
        echo ""
        echo "📊 Statut PM2:"
        pm2 status
        echo ""
        echo "📝 Logs récents:"
        pm2 logs no-skills-chat --lines 10 --nostream || true
EOF
    
    success "Déploiement terminé! 🎉"
    info "Application disponible sur: https://no-skills.fr"
}

# Vérifier le statut
check_status() {
    info "📊 Vérification du statut..."
    
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        echo "📊 Statut No-Skills Chat"
        echo "========================"
        echo "🕐 $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # Statut PM2
        if command -v pm2 &> /dev/null; then
            echo "🔧 Statut PM2:"
            pm2 status
            echo ""
            
            # Test de santé de l'application
            echo "🏥 Test de santé:"
            if curl -f -s http://localhost:3001/health > /dev/null; then
                echo "✅ Application accessible (port 3001)"
            else
                echo "❌ Application non accessible (port 3001)"
            fi
            
            if curl -f -s https://no-skills.fr/health > /dev/null; then
                echo "✅ Site accessible (HTTPS)"
            else
                echo "⚠️  Site non accessible (HTTPS)"
            fi
            
            echo ""
            echo "💾 Utilisation des ressources:"
            pm2 monit --no-interaction || echo "Monitoring non disponible"
        else
            echo "❌ PM2 non installé"
        fi
        
        echo ""
        echo "💿 Espace disque:"
        df -h /var/www/
        
        echo ""
        echo "🔄 Dernière mise à jour Git:"
        cd /var/www/no-skills-chat 2>/dev/null && git log -1 --oneline || echo "Git non disponible"
EOF
}

# Afficher les logs
show_logs() {
    info "📝 Affichage des logs..."
    
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        echo "📝 Logs No-Skills Chat"
        echo "====================="
        echo ""
        
        if command -v pm2 &> /dev/null; then
            echo "🔧 Logs PM2 (30 dernières lignes):"
            pm2 logs no-skills-chat --lines 30 --nostream
        else
            echo "❌ PM2 non disponible"
        fi
        
        echo ""
        echo "🔍 Pour suivre les logs en temps réel:"
        echo "ssh no-skills@no-skills.fr 'pm2 logs no-skills-chat'"
EOF
}

# Redémarrer l'application
restart_app() {
    info "🔄 Redémarrage de l'application..."
    
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        echo "🔄 Redémarrage No-Skills Chat"
        echo "============================="
        
        if command -v pm2 &> /dev/null; then
            pm2 restart no-skills-chat
            pm2 status
        else
            echo "❌ PM2 non disponible"
            exit 1
        fi
EOF
    
    log "Application redémarrée"
}

# Rollback vers la sauvegarde précédente
rollback() {
    warning "🔄 Rollback vers la version précédente..."
    
    ssh $SERVER_USER@$SERVER_HOST << 'EOF'
        echo "🔄 Rollback No-Skills Chat"
        echo "=========================="
        
        # Trouver la dernière sauvegarde
        LATEST_BACKUP=$(ls -t /var/www/backup-* 2>/dev/null | head -1)
        
        if [ -n "$LATEST_BACKUP" ]; then
            echo "📦 Restauration de $LATEST_BACKUP"
            
            # Sauvegarder la version actuelle
            mv /var/www/no-skills-chat /var/www/broken-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
            
            # Restaurer la sauvegarde
            mv "$LATEST_BACKUP" /var/www/no-skills-chat
            cd /var/www/no-skills-chat
            
            # Redémarrer
            pm2 stop no-skills-chat 2>/dev/null || true
            pm2 start ecosystem.config.cjs --env production
            pm2 save
            
            echo "✅ Rollback terminé"
            pm2 status
        else
            echo "❌ Aucune sauvegarde trouvée"
            exit 1
        fi
EOF
    
    success "Rollback terminé"
}

# Menu principal
case "${1:-deploy}" in
    "deploy")
        check_connection
        deploy_from_github
        ;;
    "status")
        check_connection
        check_status
        ;;
    "logs")
        check_connection
        show_logs
        ;;
    "restart")
        check_connection
        restart_app
        ;;
    "rollback")
        check_connection
        rollback
        ;;
    *)
        echo "🚀 No-Skills Chat - Déploiement GitHub"
        echo "======================================"
        echo ""
        echo "Usage: $0 {deploy|status|logs|restart|rollback}"
        echo ""
        echo "Commandes disponibles:"
        echo "  deploy   - Déploie depuis GitHub"
        echo "  status   - Affiche le statut de l'application"
        echo "  logs     - Affiche les logs"
        echo "  restart  - Redémarre l'application"
        echo "  rollback - Revient à la version précédente"
        echo ""
        echo "Configuration actuelle:"
        echo "  Repository: https://github.com/$GITHUB_REPO"
        echo "  Branch: $BRANCH"
        echo "  Serveur: $SERVER_USER@$SERVER_HOST"
        echo ""
        exit 1
        ;;
esac
