#!/bin/bash

# Script utilitaire pour la gestion MongoDB YupiChat
# Usage: ./mongodb-utils.sh [command]

set -e

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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

# Fonction d'aide
show_help() {
    echo "Script utilitaire MongoDB pour YupiChat"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands disponibles:"
    echo "  start       - Démarrer MongoDB avec Docker"
    echo "  stop        - Arrêter MongoDB"
    echo "  restart     - Redémarrer MongoDB"
    echo "  status      - Afficher le statut de MongoDB"
    echo "  logs        - Afficher les logs MongoDB"
    echo "  shell       - Ouvrir un shell MongoDB (mongosh)"
    echo "  backup      - Créer une sauvegarde de la DB"
    echo "  restore     - Restaurer une sauvegarde"
    echo "  reset       - Réinitialiser complètement la DB"
    echo "  stats       - Afficher les statistiques de la DB"
    echo "  admin       - Ouvrir Mongo Express (mode dev)"
    echo ""
    echo "Exemples:"
    echo "  $0 start"
    echo "  $0 backup"
    echo "  $0 shell"
}

# Démarrer MongoDB
start_mongodb() {
    print_status "Démarrage de MongoDB..."

    # Exporter les variables d'environnement
    export MONGO_PASSWORD="SecureYupiPassword123!"
    export MONGO_EXPRESS_PASSWORD="AdminYupi123!"

    # Déterminer la commande Docker Compose
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose n'est pas disponible"
        exit 1
    fi

    if [ "$1" = "dev" ]; then
        COMPOSE_PROFILES=development $DOCKER_COMPOSE_CMD up -d
        print_success "MongoDB et Mongo Express démarrés"
        print_status "Mongo Express disponible sur: http://localhost:8081"
    else
        $DOCKER_COMPOSE_CMD up -d mongodb
        print_success "MongoDB démarré"
    fi
}

# Arrêter MongoDB
stop_mongodb() {
    print_status "Arrêt de MongoDB..."

    # Déterminer la commande Docker Compose
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose down
    elif command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        print_error "Docker Compose n'est pas disponible"
        exit 1
    fi

    print_success "MongoDB arrêté"
}

# Redémarrer MongoDB
restart_mongodb() {
    print_status "Redémarrage de MongoDB..."

    # Déterminer la commande Docker Compose
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose restart mongodb
    elif command -v docker-compose &> /dev/null; then
        docker-compose restart mongodb
    else
        print_error "Docker Compose n'est pas disponible"
        exit 1
    fi

    print_success "MongoDB redémarré"
}

# Statut de MongoDB
status_mongodb() {
    print_status "Statut de MongoDB:"
    docker ps --filter name=yupichat-mongodb --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    # Test de connectivité
    if docker exec yupichat-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB est accessible"
    else
        print_error "MongoDB n'est pas accessible"
    fi
}

# Logs MongoDB
logs_mongodb() {
    print_status "Logs MongoDB (Ctrl+C pour quitter):"
    docker logs -f yupichat-mongodb
}

# Shell MongoDB
shell_mongodb() {
    print_status "Ouverture du shell MongoDB..."
    print_status "Utilisez 'use yupichat' pour accéder à la DB YupiChat"
    docker exec -it yupichat-mongodb mongosh
}

# Sauvegarde MongoDB
backup_mongodb() {
    BACKUP_DIR="./backups/mongodb/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    print_status "Création de la sauvegarde dans $BACKUP_DIR..."

    docker exec yupichat-mongodb mongodump --db yupichat --out /tmp/backup
    docker cp yupichat-mongodb:/tmp/backup/yupichat "$BACKUP_DIR/"
    docker exec yupichat-mongodb rm -rf /tmp/backup

    print_success "Sauvegarde créée dans $BACKUP_DIR"
}

# Restaurer MongoDB
restore_mongodb() {
    if [ -z "$1" ]; then
        print_error "Veuillez spécifier le chemin de la sauvegarde"
        echo "Usage: $0 restore /path/to/backup/folder"
        exit 1
    fi

    BACKUP_PATH="$1"

    if [ ! -d "$BACKUP_PATH" ]; then
        print_error "Le dossier de sauvegarde n'existe pas: $BACKUP_PATH"
        exit 1
    fi

    print_warning "Cette opération va remplacer toutes les données existantes!"
    read -p "Êtes-vous sûr? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restauration depuis $BACKUP_PATH..."

        docker cp "$BACKUP_PATH" yupichat-mongodb:/tmp/restore
        docker exec yupichat-mongodb mongorestore --db yupichat --drop /tmp/restore
        docker exec yupichat-mongodb rm -rf /tmp/restore

        print_success "Restauration terminée"
    else
        print_status "Restauration annulée"
    fi
}

# Réinitialiser MongoDB
reset_mongodb() {
    print_warning "Cette opération va supprimer TOUTES les données YupiChat!"
    read -p "Êtes-vous vraiment sûr? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Réinitialisation de MongoDB..."

        docker exec yupichat-mongodb mongosh yupichat --eval "db.dropDatabase()"

        # Réexécuter le script d'initialisation
        docker exec yupichat-mongodb mongosh yupichat < mongo-init.js

        print_success "MongoDB réinitialisé"
    else
        print_status "Réinitialisation annulée"
    fi
}

# Statistiques MongoDB
stats_mongodb() {
    print_status "Statistiques de la base de données YupiChat:"

    docker exec yupichat-mongodb mongosh yupichat --eval "
    print('📊 Statistiques YupiChat');
    print('========================');
    print();
    print('👥 Utilisateurs: ' + db.users.countDocuments());
    print('💬 Messages: ' + db.messages.countDocuments());
    print('🏠 Groupes: ' + db.groups.countDocuments());
    print();
    print('📈 Taille de la DB:');
    printjson(db.stats());
    "
}

# Ouvrir Mongo Express
admin_mongodb() {
    if docker ps --filter name=yupichat-mongo-express | grep -q yupichat-mongo-express; then
        print_success "Mongo Express est déjà actif"
    else
        print_status "Démarrage de Mongo Express..."

        # Exporter les variables d'environnement
        export MONGO_PASSWORD="SecureYupiPassword123!"
        export MONGO_EXPRESS_PASSWORD="AdminYupi123!"

        # Déterminer la commande Docker Compose
        if command -v docker &> /dev/null && docker compose version &> /dev/null; then
            COMPOSE_PROFILES=development docker compose up -d mongo-express
        elif command -v docker-compose &> /dev/null; then
            COMPOSE_PROFILES=development docker-compose up -d mongo-express
        else
            print_error "Docker Compose n'est pas disponible"
            exit 1
        fi
    fi

    print_status "Mongo Express disponible sur: http://localhost:8081"
    print_status "Identifiants: admin / AdminYupi123!"
}

# Script principal
case "$1" in
    start)
        start_mongodb "$2"
        ;;
    stop)
        stop_mongodb
        ;;
    restart)
        restart_mongodb
        ;;
    status)
        status_mongodb
        ;;
    logs)
        logs_mongodb
        ;;
    shell)
        shell_mongodb
        ;;
    backup)
        backup_mongodb
        ;;
    restore)
        restore_mongodb "$2"
        ;;
    reset)
        reset_mongodb
        ;;
    stats)
        stats_mongodb
        ;;
    admin)
        admin_mongodb
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac
