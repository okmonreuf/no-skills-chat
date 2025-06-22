#!/bin/bash

# Script de déploiement pour YupiChat
# Usage: ./deploy.sh [production|staging|development]

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-development}
PROJECT_NAME="yupichat"
BACKEND_DIR="server"
FRONTEND_DIR="."
LOGS_DIR="logs"

# Fonction d'affichage coloré
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction de vérification des prérequis
check_requirements() {
    print_status "Vérification des prérequis..."

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi

    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi

    # Vérifier PM2 pour la production
    if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
        if ! command -v pm2 &> /dev/null; then
            print_warning "PM2 n'est pas installé. Installation en cours..."
            npm install -g pm2
        fi
    fi

    # Vérifier Docker pour MongoDB
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Installation requise pour MongoDB."
        print_status "Installez Docker depuis: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé"
        exit 1
    fi

    print_success "Prérequis vérifiés"
}

# Fonction de gestion MongoDB avec Docker
setup_mongodb() {
    print_status "Configuration de MongoDB avec Docker..."

    # Exporter les variables d'environnement pour Docker Compose
    export MONGO_PASSWORD="SecureYupiPassword123!"
    export MONGO_EXPRESS_PASSWORD="AdminYupi123!"

    # Créer le fichier .env pour Docker si nécessaire (pour référence)
    if [ ! -f ".env.docker" ]; then
        print_status "Création du fichier .env.docker..."
        cat > .env.docker << EOF
MONGO_PASSWORD=SecureYupiPassword123!
MONGO_EXPRESS_PASSWORD=AdminYupi123!
EOF
        print_success "Fichier .env.docker créé"
    fi

    # Vérifier quelle version de docker-compose est disponible
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        print_error "Ni 'docker compose' ni 'docker-compose' ne sont disponibles"
        exit 1
    fi

    # Démarrer MongoDB avec Docker Compose
    if [ "$ENVIRONMENT" = "development" ]; then
        print_status "Démarrage de MongoDB en mode développement (avec Mongo Express)..."
        COMPOSE_PROFILES=development $DOCKER_COMPOSE_CMD up -d mongodb mongo-express
    else
        print_status "Démarrage de MongoDB en mode production..."
        $DOCKER_COMPOSE_CMD up -d mongodb
    fi

    # Attendre que MongoDB soit prêt
    print_status "Attente du démarrage de MongoDB..."
    for i in {1..30}; do
        if docker exec yupichat-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null 2>&1; then
            print_success "MongoDB est prêt !"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Timeout: MongoDB n'a pas pu démarrer"
            print_status "Vérification des logs Docker..."
            docker logs yupichat-mongodb --tail 20
            exit 1
        fi
        print_status "Tentative $i/30 - Attente de MongoDB..."
        sleep 2
    done

    # Mettre à jour la configuration du backend
    update_mongodb_config
}

# Fonction pour mettre à jour la configuration MongoDB
update_mongodb_config() {
    print_status "Mise à jour de la configuration MongoDB..."

    # Mettre à jour le fichier .env du serveur
    if [ -f "server/.env" ]; then
        # Remplacer la ligne MONGODB_URI
        sed -i 's|^MONGODB_URI=.*|MONGODB_URI=mongodb://yupichat_user:YupiChatPassword123!@localhost:27017/yupichat|' server/.env
    else
        # Créer le fichier .env s'il n'existe pas
        cp server/.env.example server/.env
        sed -i 's|^MONGODB_URI=.*|MONGODB_URI=mongodb://yupichat_user:YupiChatPassword123!@localhost:27017/yupichat|' server/.env
    fi

    print_success "Configuration MongoDB mise à jour"
}

# Fonction de sauvegarde am��liorée
backup_current() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Création d'une sauvegarde..."

        BACKUP_DIR="/var/backups/yupichat/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"

        # Sauvegarder les fichiers actuels
        if [ -d "/var/www/yupichat" ]; then
            cp -r /var/www/yupichat "$BACKUP_DIR/"
        fi

        # Sauvegarder la base de données MongoDB (via Docker)
        print_status "Sauvegarde de la base de données..."
        if docker exec yupichat-mongodb mongodump \
            --host localhost \
            --port 27017 \
            --username yupichat_admin \
            --password "SecureYupiPassword123!" \
            --authenticationDatabase admin \
            --db yupichat \
            --out /tmp/backup 2>/dev/null; then
            docker cp yupichat-mongodb:/tmp/backup "$BACKUP_DIR/mongodb/" 2>/dev/null || true
            docker exec yupichat-mongodb rm -rf /tmp/backup 2>/dev/null || true
            print_success "Sauvegarde MongoDB créée"
        else
            print_warning "Sauvegarde MongoDB échouée (base vide ou pas encore initialisée)"
        fi

        print_success "Sauvegarde créée dans $BACKUP_DIR"
    fi
}

# Fonction de nettoyage
cleanup() {
    print_status "Nettoyage des fichiers temporaires..."

    # Nettoyer les caches npm
    npm cache clean --force

    # Nettoyer les node_modules si nécessaire
    if [ "$CLEAN_INSTALL" = "true" ]; then
        rm -rf node_modules
        rm -rf $BACKEND_DIR/node_modules
    fi

    # Créer les dossiers nécessaires
    mkdir -p $LOGS_DIR
    mkdir -p $BACKEND_DIR/dist
    mkdir -p $BACKEND_DIR/logs
    mkdir -p $BACKEND_DIR/src/uploads

    print_success "Nettoyage terminé"
}

# Fonction d'installation des dépendances
install_dependencies() {
    print_status "Installation des dépendances..."

    # Frontend dependencies
    print_status "Installation des dépendances frontend..."
    npm install

    # Backend dependencies
    print_status "Installation des dépendances backend..."
    cd $BACKEND_DIR
    npm install
    cd ..

    print_success "Dépendances installées"
}

# Fonction de build
build_project() {
    print_status "Build du projet..."

    # Build frontend
    print_status "Build du frontend..."
    npm run build

    # Build backend
    print_status "Build du backend..."
    cd $BACKEND_DIR
    npm run build
    cd ..

    print_success "Build terminé"
}

# Fonction de test
run_tests() {
    if [ "$SKIP_TESTS" != "true" ]; then
        print_status "Exécution des tests..."

        # Tests frontend
        npm run test

        # Tests backend
        cd $BACKEND_DIR
        if [ -f "package.json" ] && grep -q "test" package.json; then
            npm test
        fi
        cd ..

        print_success "Tests passés"
    else
        print_warning "Tests ignorés"
    fi
}

# Fonction de vérification du type
typecheck() {
    print_status "Vérification des types TypeScript..."

    # Typecheck frontend
    npm run typecheck

    # Typecheck backend
    cd $BACKEND_DIR
    npm run typecheck
    cd ..

    print_success "Types vérifiés"
}

# Fonction de déploiement selon l'environnement
deploy_app() {
    case $ENVIRONMENT in
        production)
            deploy_production
            ;;
        staging)
            deploy_staging
            ;;
        development)
            deploy_development
            ;;
        *)
            print_error "Environnement non valide: $ENVIRONMENT"
            print_error "Utilisation: ./deploy.sh [production|staging|development]"
            exit 1
            ;;
    esac
}

# Déploiement en production
deploy_production() {
    print_status "Déploiement en production..."

    # Arrêter les processus existants
    pm2 stop ecosystem.config.cjs || true

    # Créer les dossiers de production
    sudo mkdir -p /var/www/yupichat
    sudo mkdir -p /var/www/yupichat/uploads
    sudo mkdir -p /var/log/yupichat
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled

    # Copier les fichiers
    sudo cp -r dist/* /var/www/yupichat/
    sudo cp -r $BACKEND_DIR/dist /var/www/yupichat/server/
    sudo cp -r $BACKEND_DIR/node_modules /var/www/yupichat/server/
    sudo cp $BACKEND_DIR/package.json /var/www/yupichat/server/
    sudo cp ecosystem.config.cjs /var/www/yupichat/

    # Copier la configuration Nginx
    sudo cp nginx-no-skills.conf /etc/nginx/sites-available/no-skills.fr

    # Activer le site Nginx (si nginx est installé)
    if command -v nginx &> /dev/null; then
        sudo ln -sf /etc/nginx/sites-available/no-skills.fr /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx || print_warning "Nginx non configuré"
    fi

    # Configurer les permissions
    sudo chown -R www-data:www-data /var/www/yupichat
    sudo chmod -R 755 /var/www/yupichat

    # Démarrer avec PM2
    cd /var/www/yupichat
    pm2 start ecosystem.config.cjs --env production
    pm2 save

    # Configurer PM2 pour démarrer au boot
    pm2 startup

    print_success "Déployé en production"
}

# Déploiement en staging
deploy_staging() {
    print_status "Déploiement en staging..."

    pm2 stop ecosystem.config.cjs || true
    pm2 start ecosystem.config.cjs --env staging

    print_success "Déployé en staging"
}

# Déploiement en développement
deploy_development() {
    print_status "Démarrage en mode développement..."

    # Tuer les processus existants
    pkill -f "npm run dev" || true
    pkill -f "tsx watch" || true

    # Démarrer le backend en mode développement
    cd $BACKEND_DIR
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # Démarrer le frontend en mode développement
    npm run dev &
    FRONTEND_PID=$!

    print_success "Serveurs de développement démarrés"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend: http://localhost:3001"
    print_status "Appuyez sur Ctrl+C pour arrêter"

    # Attendre l'interruption
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait
}

# Fonction de vérification post-déploiement
post_deploy_check() {
    if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
        print_status "Vérification post-déploiement..."

        # Attendre que les services démarrent
        sleep 10

        # Vérifier que PM2 fonctionne
        if pm2 list | grep -q "yupichat"; then
            print_success "Services PM2 actifs"
        else
            print_error "Problème avec les services PM2"
            exit 1
        fi

        # Vérifier la connectivité HTTP
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "API backend accessible"
        else
            print_warning "API backend non accessible (normal si en cours de démarrage)"
        fi

        print_success "Vérifications terminées"
    fi
}

# Fonction principale
main() {
    echo "======================================"
    echo "   Déploiement YupiChat - $ENVIRONMENT"
    echo "======================================"

    # Vérifier les arguments
    if [ "$ENVIRONMENT" = "help" ] || [ "$ENVIRONMENT" = "--help" ] || [ "$ENVIRONMENT" = "-h" ]; then
        echo "Usage: $0 [environment] [options]"
        echo ""
        echo "Environnements:"
        echo "  production  - Déploiement en production avec PM2"
        echo "  staging     - Déploiement en staging avec PM2"
        echo "  development - Démarrage en mode développement"
        echo ""
        echo "Options d'environnement:"
        echo "  CLEAN_INSTALL=true    - Supprime node_modules avant installation"
        echo "  SKIP_TESTS=true       - Ignore les tests"
        echo "  BACKUP=false          - Skip backup en production"
        echo ""
        echo "Exemples:"
        echo "  $0 production"
        echo "  CLEAN_INSTALL=true $0 staging"
        echo "  SKIP_TESTS=true $0 development"
        exit 0
    fi

    # Exécution des étapes
    check_requirements
    setup_mongodb

    if [ "$BACKUP" != "false" ]; then
        backup_current
    fi

    cleanup
    install_dependencies
    typecheck
    run_tests
    build_project
    deploy_app
    post_deploy_check

    echo "======================================"
    print_success "Déploiement $ENVIRONMENT terminé avec succès!"
    echo "======================================"

    # Afficher les informations de connexion
    case $ENVIRONMENT in
        production)
            print_status "Application déployée en production"
            print_status "🌐 Site web: https://no-skills.fr"
            print_status "⚙️  API: https://no-skills.fr/api/health"
            print_status "📊 Logs: pm2 logs yupichat-backend"
            print_status "📈 Status: pm2 status"
            print_status "🔄 Restart: pm2 restart ecosystem.config.cjs"
            print_status "🗄️  MongoDB: docker logs yupichat-mongodb"
            ;;
        staging)
            print_status "Application déployée en staging"
            print_status "Logs: pm2 logs"
            print_status "MongoDB: docker logs yupichat-mongodb"
            ;;
        development)
            print_status "Serveurs de développement actifs"
            print_status "Frontend: http://localhost:5173"
            print_status "Backend: http://localhost:3001"
            print_status "MongoDB: docker exec -it yupichat-mongodb mongosh"
            print_status "Mongo Express: http://localhost:8081 (admin/AdminYupi123!)"
            ;;
    esac
}

# Exécuter le script principal
main "$@"
