#!/bin/bash

# Script de déploiement pour No-Skills Chat
# Compatible avec Termius et PM2

set -e

# Configuration
SERVER_USER="no-skills"
SERVER_HOST="no-skills.fr"
APP_PATH="/var/www/no-skills-chat"
REPO_URL="git@github.com:your-username/no-skills-chat.git"
BRANCH="main"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v ssh &> /dev/null; then
        error "SSH n'est pas installé"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé"
    fi
    
    log "Prérequis OK"
}

# Test de connexion SSH
test_ssh_connection() {
    log "Test de connexion SSH vers $SERVER_USER@$SERVER_HOST..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_HOST exit 2>/dev/null; then
        log "Connexion SSH OK"
    else
        error "Impossible de se connecter au serveur. Vérifiez vos clés SSH."
    fi
}

# Déploiement principal
deploy() {
    log "Début du déploiement sur no-skills.fr..."
    
    # Commandes à exécuter sur le serveur
    ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
        set -e
        
        echo "🚀 Déploiement No-Skills Chat"
        echo "=============================="
        
        APP_PATH="/var/www/no-skills-chat"
        
        # Créer le répertoire si il n'existe pas
        if [ ! -d "$APP_PATH" ]; then
            echo "📁 Création du répertoire de l'application..."
            sudo mkdir -p $APP_PATH
            sudo chown -R $(whoami):$(whoami) $APP_PATH
        fi
        
        cd $APP_PATH
        
        # Backup de l'ancienne version si elle existe
        if [ -d ".git" ]; then
            echo "💾 Sauvegarde de l'ancienne version..."
            if [ -d "../backup" ]; then
                rm -rf ../backup
            fi
            cp -r . ../backup
        fi
        
        # Clone ou mise à jour du repository
        if [ -d ".git" ]; then
            echo "🔄 Mise à jour du code..."
            git fetch origin
            git reset --hard origin/main
        else
            echo "📥 Clone du repository..."
            git clone https://github.com/your-username/no-skills-chat.git .
        fi
        
        # Installation des dépendances
        echo "📦 Installation des dépendances..."
        if [ -f "package.json" ]; then
            # Utiliser npm ou yarn selon le lock file présent
            if [ -f "yarn.lock" ]; then
                yarn install --production
            elif [ -f "pnpm-lock.yaml" ]; then
                pnpm install --prod
            else
                npm ci --only=production
            fi
        fi
        
        # Build de l'application
        echo "🔨 Build de l'application..."
        if [ -f "package.json" ]; then
            if [ -f "yarn.lock" ]; then
                yarn build
            elif [ -f "pnpm-lock.yaml" ]; then
                pnpm run build
            else
                npm run build
            fi
        fi
        
        # Création des dossiers nécessaires
        echo "📁 Création des dossiers..."
        mkdir -p logs
        mkdir -p uploads
        mkdir -p server
        
        # Vérifier que PM2 est installé
        if ! command -v pm2 &> /dev/null; then
            echo "⚠️  PM2 non trouvé, installation..."
            npm install -g pm2
        fi
        
        # Démarrage/redémarrage avec PM2
        echo "🚀 Démarrage de l'application avec PM2..."
        
        # Arrêter l'ancienne instance si elle existe
        pm2 stop no-skills-chat 2>/dev/null || true
        pm2 delete no-skills-chat 2>/dev/null || true
        
        # Démarrer la nouvelle instance
        if [ -f "ecosystem.config.cjs" ]; then
            pm2 start ecosystem.config.cjs --env production
        else
            echo "❌ Fichier ecosystem.config.cjs non trouvé"
            exit 1
        fi
        
        # Sauvegarder la configuration PM2
        pm2 save
        
        # Configuration du démarrage automatique
        sudo pm2 startup systemd -u $(whoami) --hp /home/$(whoami) 2>/dev/null || true
        
        echo "✅ Déploiement terminé avec succès!"
        echo "📊 Statut de l'application:"
        pm2 status
        
        echo "📝 Logs récents:"
        pm2 logs no-skills-chat --lines 10 --nostream
ENDSSH
    
    log "Déploiement terminé avec succès! 🎉"
    info "L'application est maintenant disponible sur https://no-skills.fr"
    info "Pour voir les logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs no-skills-chat'"
    info "Pour redémarrer: ssh $SERVER_USER@$SERVER_HOST 'pm2 restart no-skills-chat'"
}

# Rollback en cas de problème
rollback() {
    warning "Rollback vers la version précédente..."
    
    ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
        set -e
        
        APP_PATH="/var/www/no-skills-chat"
        
        if [ -d "${APP_PATH}/../backup" ]; then
            echo "🔄 Restauration de la sauvegarde..."
            rm -rf $APP_PATH
            mv ${APP_PATH}/../backup $APP_PATH
            cd $APP_PATH
            
            pm2 stop no-skills-chat 2>/dev/null || true
            pm2 start ecosystem.config.cjs --env production
            
            echo "✅ Rollback terminé"
        else
            echo "❌ Aucune sauvegarde trouvée"
            exit 1
        fi
ENDSSH
    
    log "Rollback terminé"
}

# Menu principal
case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        test_ssh_connection
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "status")
        ssh $SERVER_USER@$SERVER_HOST 'pm2 status'
        ;;
    "logs")
        ssh $SERVER_USER@$SERVER_HOST 'pm2 logs no-skills-chat'
        ;;
    "restart")
        ssh $SERVER_USER@$SERVER_HOST 'pm2 restart no-skills-chat'
        ;;
    "stop")
        ssh $SERVER_USER@$SERVER_HOST 'pm2 stop no-skills-chat'
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|logs|restart|stop}"
        echo ""
        echo "Commandes disponibles:"
        echo "  deploy   - Déploie la dernière version"
        echo "  rollback - Revient à la version précédente"
        echo "  status   - Affiche le statut de l'application"
        echo "  logs     - Affiche les logs en temps réel"
        echo "  restart  - Redémarre l'application"
        echo "  stop     - Arrête l'application"
        exit 1
        ;;
esac
