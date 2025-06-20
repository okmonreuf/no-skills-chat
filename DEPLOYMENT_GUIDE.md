# 🚀 Guide de Déploiement Automatique No-Skills Chat avec Termius

## 📋 Prérequis

### Serveur (no-skills.fr)

- Ubuntu/Debian ou CentOS/RHEL
- Node.js 18+ installé
- PM2 installé globalement
- PostgreSQL (optionnel pour DB)
- Nginx (recommandé pour proxy)
- Accès SSH avec clés

### Local (votre machine)

- Termius installé et configuré
- Git configuré
- Node.js et npm installés

## 🔧 Configuration Initiale du Serveur

### 1. Préparation du serveur via Termius

```bash
# Se connecter au serveur
ssh no-skills@no-skills.fr

# Créer l'utilisateur de déploiement
sudo adduser no-skills
sudo usermod -aG sudo no-skills

# Créer les répertoires
sudo mkdir -p /var/www/no-skills-chat
sudo chown -R no-skills:no-skills /var/www/no-skills-chat

# Installer Node.js (si pas déjà fait)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Configurer PM2 pour démarrage automatique
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u no-skills --hp /home/no-skills
```

### 2. Configuration des clés SSH

```bash
# Sur votre machine locale, générer une clé SSH (si pas déjà fait)
ssh-keygen -t ed25519 -C "deploy@no-skills.fr"

# Copier la clé publique sur le serveur
ssh-copy-id no-skills@no-skills.fr

# Ou manuellement :
cat ~/.ssh/id_ed25519.pub | ssh no-skills@no-skills.fr "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## 🚀 Déploiement avec Termius

### Méthode 1 : Déploiement Manuel via Termius

1. **Ouvrir Termius** et se connecter au serveur no-skills.fr

2. **Cloner le projet** (première fois uniquement) :

```bash
cd /var/www/no-skills-chat
git clone https://github.com/votre-username/no-skills-chat.git .
```

3. **Exécuter le script de déploiement** :

```bash
chmod +x deploy.sh
./deploy.sh deploy
```

### Méthode 2 : Déploiement Automatique avec Snippets Termius

#### Configuration des Snippets dans Termius

1. **Ouvrir Termius** → Aller dans les **Snippets**

2. **Créer les snippets suivants** :

**Snippet 1 : "Deploy No-Skills"**

```bash
#!/bin/bash
echo "🚀 Déploiement No-Skills Chat"
cd /var/www/no-skills-chat

# Backup de l'ancienne version
if [ -d ".git" ]; then
    echo "💾 Sauvegarde..."
    cp -r . ../backup-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

# Mise à jour du code
echo "📥 Mise à jour du code..."
git fetch origin
git reset --hard origin/main

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Redémarrage avec PM2
echo "🔄 Redémarrage PM2..."
pm2 stop no-skills-chat 2>/dev/null || true
pm2 delete no-skills-chat 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "✅ Déploiement terminé !"
pm2 status
```

**Snippet 2 : "Check Status"**

```bash
#!/bin/bash
echo "📊 Statut No-Skills Chat"
pm2 status
echo ""
echo "📝 Logs récents :"
pm2 logs no-skills-chat --lines 20 --nostream
```

**Snippet 3 : "Rollback"**

```bash
#!/bin/bash
echo "🔄 Rollback No-Skills Chat"
cd /var/www

# Trouver la dernière sauvegarde
LATEST_BACKUP=$(ls -t backup-* 2>/dev/null | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    echo "📦 Restauration de $LATEST_BACKUP"
    rm -rf no-skills-chat
    mv "$LATEST_BACKUP" no-skills-chat
    cd no-skills-chat

    pm2 stop no-skills-chat 2>/dev/null || true
    pm2 start ecosystem.config.cjs --env production
    pm2 save

    echo "✅ Rollback terminé !"
else
    echo "❌ Aucune sauvegarde trouvée"
fi
```

**Snippet 4 : "Update System"**

```bash
#!/bin/bash
echo "🔧 Mise à jour du système"
sudo apt update && sudo apt upgrade -y
sudo npm update -g pm2
echo "✅ Système mis à jour"
```

### Méthode 3 : Déploiement avec Actions Automatisées

#### Configuration de l'Action Termius

1. **Créer une Action** dans Termius :

   - Nom : "Deploy No-Skills Chat"
   - Type : SSH Command
   - Host : no-skills.fr
   - Username : no-skills

2. **Commande de l'Action** :

```bash
cd /var/www/no-skills-chat && ./deploy.sh deploy
```

3. **Variables d'environnement** (optionnel) :

```bash
export NODE_ENV=production
export PORT=3001
```

## 🔄 Workflow de Déploiement Complet

### Étape 1 : Développement Local

```bash
# Sur votre machine de développement
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

### Étape 2 : Déploiement via Termius

1. Ouvrir Termius
2. Se connecter à no-skills.fr
3. Exécuter le snippet "Deploy No-Skills" OU lancer l'action automatisée
4. Vérifier avec le snippet "Check Status"

### Étape 3 : Vérification

```bash
# Vérifier que l'application fonctionne
curl -f https://no-skills.fr/health || echo "❌ Erreur"

# Vérifier les logs
pm2 logs no-skills-chat --lines 10
```

## 🔧 Configuration Nginx (Recommandé)

```nginx
# /etc/nginx/sites-available/no-skills.fr
server {
    listen 80;
    listen 443 ssl http2;
    server_name no-skills.fr www.no-skills.fr;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/no-skills.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/no-skills.fr/privkey.pem;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuration pour Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Fichiers statiques
    location /uploads/ {
        alias /var/www/no-skills-chat/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 📱 Utilisation avec l'App Mobile Termius

### Configuration de Host Quick Actions

1. **Ouvrir l'app Termius mobile**
2. **Aller dans votre host no-skills.fr**
3. **Créer des Quick Actions** :

**Quick Action 1 : "🚀 Deploy"**

```bash
cd /var/www/no-skills-chat && ./deploy.sh deploy && pm2 status
```

**Quick Action 2 : "📊 Status"**

```bash
pm2 status && pm2 logs no-skills-chat --lines 5 --nostream
```

**Quick Action 3 : "🔄 Restart"**

```bash
pm2 restart no-skills-chat && pm2 status
```

**Quick Action 4 : "📝 Logs"**

```bash
pm2 logs no-skills-chat --lines 50
```

### Notifications Push

Configurer les notifications Termius pour être alerté en cas de problème :

1. **Settings** → **Notifications**
2. Activer **Command Completion**
3. Activer **SSH Connection Status**

## 🚨 Monitoring et Alertes

### Script de Monitoring (monitoring.sh)

```bash
#!/bin/bash
# Monitoring No-Skills Chat

# Vérifier si l'application répond
if ! curl -f -s https://no-skills.fr/health > /dev/null; then
    echo "❌ $(date): Application non accessible" >> /var/log/no-skills-monitor.log
    # Redémarrer l'application
    pm2 restart no-skills-chat

    # Envoyer une alerte (optionnel)
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 No-Skills Chat redémarré automatiquement"}' \
        YOUR_WEBHOOK_URL
else
    echo "✅ $(date): Application OK" >> /var/log/no-skills-monitor.log
fi
```

### Crontab pour monitoring automatique

```bash
# Ajouter à crontab : crontab -e
*/5 * * * * /var/www/no-skills-chat/monitoring.sh
```

## 🔐 Sécurité

### Checklist de Sécurité

- [ ] Clés SSH configurées (pas de mot de passe)
- [ ] Firewall configuré (UFW ou iptables)
- [ ] Fail2ban installé et configuré
- [ ] Certificats SSL Let's Encrypt
- [ ] Variables d'environnement sécurisées
- [ ] Logs de sécurité activés
- [ ] Sauvegardes automatiques configurées

### Configuration Fail2ban

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
```

## 📚 Commandes Utiles

```bash
# Déploiement
./deploy.sh deploy

# Vérifier le statut
./deploy.sh status

# Voir les logs
./deploy.sh logs

# Redémarrer
./deploy.sh restart

# Rollback
./deploy.sh rollback

# Arrêter
./deploy.sh stop

# Mise à jour des dépendances
npm update && npm audit fix

# Nettoyage des logs PM2
pm2 flush

# Monitoring en temps réel
pm2 monit
```

## 🆘 Dépannage

### Problèmes Courants

**1. Erreur de permission**

```bash
sudo chown -R no-skills:no-skills /var/www/no-skills-chat
chmod +x /var/www/no-skills-chat/deploy.sh
```

**2. Port occupé**

```bash
sudo lsof -i :3001
sudo kill -9 PID
```

**3. PM2 ne démarre pas**

```bash
pm2 kill
pm2 start ecosystem.config.cjs --env production
```

**4. Base de données inaccessible**

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**5. Certificat SSL expiré**

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Logs Importants

```bash
# Logs application
pm2 logs no-skills-chat

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -f -u no-skills-chat

# Logs de sécurité
sudo tail -f /var/log/auth.log
```

## 📞 Support

En cas de problème :

1. **Vérifier les logs** avec les commandes ci-dessus
2. **Consulter le guide** de dépannage
3. **Contacter** : admin@no-skills.fr
4. **GitHub Issues** : Pour les bugs du code

---

**🎉 Votre déploiement No-Skills Chat est maintenant configuré pour un déploiement automatique et sécurisé avec Termius !**
