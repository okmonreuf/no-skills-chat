#!/bin/bash

# Script d'installation SSL pour no-skills.fr
# Usage: ./install-ssl.sh

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

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then
    print_error "Ce script doit être exécuté en tant que root"
    echo "Usage: sudo ./install-ssl.sh"
    exit 1
fi

print_status "Installation des certificats SSL pour no-skills.fr"

# Installer certbot si pas déjà installé
if ! command -v certbot &> /dev/null; then
    print_status "Installation de Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Arrêter nginx temporairement
print_status "Arrêt temporaire de Nginx..."
systemctl stop nginx || true

# Obtenir les certificats SSL
print_status "Obtention des certificats SSL Let's Encrypt..."
certbot certonly --standalone \
    -d no-skills.fr \
    -d www.no-skills.fr \
    --email admin@no-skills.fr \
    --agree-tos \
    --non-interactive

# Mettre à jour la configuration Nginx avec SSL
print_status "Mise à jour de la configuration Nginx avec SSL..."

cat > /etc/nginx/sites-available/no-skills.fr << 'EOF'
# Configuration Nginx pour no-skills.fr - YupiChat avec SSL

server {
    listen 80;
    server_name no-skills.fr www.no-skills.fr;
    
    # Redirection HTTPS automatique
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name no-skills.fr www.no-skills.fr;

    # Configuration SSL Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/no-skills.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/no-skills.fr/privkey.pem;
    
    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Racine du site (frontend YupiChat)
    root /var/www/yupichat;
    index index.html;

    # Gestion des logs
    access_log /var/log/nginx/yupichat-access.log;
    error_log /var/log/nginx/yupichat-error.log;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Sécurité headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Routes API - Proxy vers le backend Node.js
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket - Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Fichiers uploadés
    location /uploads/ {
        alias /var/www/yupichat/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Assets statiques avec cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Route principale - SPA Frontend
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Fichiers de configuration
    location ~ /\.(env|git) {
        deny all;
        return 404;
    }
}
EOF

# Activer le site et redémarrer nginx
ln -sf /etc/nginx/sites-available/no-skills.fr /etc/nginx/sites-enabled/
nginx -t
systemctl start nginx

# Configurer le renouvellement automatique
print_status "Configuration du renouvellement automatique..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

print_success "SSL configuré avec succès !"
print_status "🌐 Site accessible sur: https://no-skills.fr"
print_status "🔒 Certificats auto-renouvelés tous les jours à 12h"
