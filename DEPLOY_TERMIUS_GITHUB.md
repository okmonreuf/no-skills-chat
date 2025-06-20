# 🚀 Déploiement No-Skills Chat avec Termius PC + GitHub

## 📋 Configuration Initiale

### 1. Préparation du Repository GitHub

#### Créer le repository

```bash
# Sur votre PC, dans le dossier du projet
git init
git add .
git commit -m "Initial commit No-Skills Chat"

# Créer un repo sur GitHub : https://github.com/new
# Nom suggéré: no-skills-chat

# Lier le repo local au repo GitHub
git remote add origin https://github.com/VOTRE-USERNAME/no-skills-chat.git
git branch -M main
git push -u origin main
```

### 2. Configuration du Script de Déploiement

Modifier le fichier `deploy-github.sh` :

```bash
# Ligne 11 - Remplacez par votre username GitHub
GITHUB_REPO="VOTRE-USERNAME/no-skills-chat"
```

### 3. Configuration Termius sur PC

#### Installation et Configuration

1. **Télécharger Termius** : https://termius.com/
2. **Installer** sur votre PC Windows/Mac/Linux
3. **Configurer la connexion SSH** :
   - Host: `no-skills.fr`
   - Username: `no-skills`
   - Port: `22`
   - Authentication: SSH Key (recommandé)

#### Générer et Configurer les Clés SSH

```bash
# Sur votre PC, dans Git Bash ou Terminal
ssh-keygen -t ed25519 -C "deploy@no-skills.fr"

# Copier la clé publique sur le serveur
ssh-copy-id no-skills@no-skills.fr

# Ou manuellement
cat ~/.ssh/id_ed25519.pub | ssh no-skills@no-skills.fr "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 4. Configuration des Snippets Termius

#### Snippet 1: "🚀 Deploy from GitHub"

```bash
#!/bin/bash
cd /tmp
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh -o deploy-github.sh
chmod +x deploy-github.sh
./deploy-github.sh deploy
```

#### Snippet 2: "📊 Status Check"

```bash
#!/bin/bash
cd /var/www/no-skills-chat
echo "📊 No-Skills Chat Status"
echo "======================="
pm2 status
echo ""
echo "🏥 Health Check:"
curl -s http://localhost:3001/health || echo "❌ App not responding"
echo ""
echo "📝 Recent logs:"
pm2 logs no-skills-chat --lines 10 --nostream
```

#### Snippet 3: "📝 Show Logs"

```bash
#!/bin/bash
pm2 logs no-skills-chat --lines 50 --nostream
```

#### Snippet 4: "🔄 Restart App"

```bash
#!/bin/bash
pm2 restart no-skills-chat
pm2 status
```

#### Snippet 5: "🔄 Rollback"

```bash
#!/bin/bash
cd /tmp
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh -o deploy-github.sh
chmod +x deploy-github.sh
./deploy-github.sh rollback
```

## 🎯 Workflow de Déploiement

### Méthode 1: Depuis le Terminal Local (PC)

```bash
# 1. Développer et commiter
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main

# 2. Se connecter avec Termius et déployer
ssh no-skills@no-skills.fr
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh deploy
```

### Méthode 2: Via Snippets Termius (Recommandé)

1. **Ouvrir Termius** sur votre PC
2. **Se connecter** à no-skills.fr
3. **Exécuter le snippet** "🚀 Deploy from GitHub"
4. **Vérifier** avec "📊 Status Check"

### Méthode 3: Commande Unique via Termius

```bash
# Une seule commande pour tout déployer
ssh no-skills@no-skills.fr 'curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s deploy'
```

## 📱 Configuration Mobile (Bonus)

### Quick Actions pour l'App Termius Mobile

#### Quick Action 1: "🚀 Deploy"

```bash
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s deploy
```

#### Quick Action 2: "📊 Status"

```bash
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s status
```

#### Quick Action 3: "📝 Logs"

```bash
pm2 logs no-skills-chat --lines 20
```

## 🔧 Commandes Termius Utiles

### Commandes de Base

```bash
# Déploiement complet
./deploy-github.sh deploy

# Vérifier le statut
./deploy-github.sh status

# Voir les logs
./deploy-github.sh logs

# Redémarrer
./deploy-github.sh restart

# Rollback
./deploy-github.sh rollback
```

### Commandes de Debug

```bash
# Monitoring en temps réel
pm2 monit

# Logs en temps réel
pm2 logs no-skills-chat

# Informations système
pm2 info no-skills-chat

# Redémarrer avec logs
pm2 restart no-skills-chat && pm2 logs no-skills-chat --lines 20
```

## 🚨 Automatisation Avancée

### Script de Déploiement Local (deploy-local.sh)

```bash
#!/bin/bash
# Script pour déployer depuis votre PC

set -e

echo "🚀 Déploiement No-Skills Chat"
echo "============================="

# 1. Push vers GitHub
echo "📤 Push vers GitHub..."
git add .
read -p "💬 Message de commit: " commit_msg
git commit -m "$commit_msg"
git push origin main

# 2. Déployer sur le serveur
echo "🌐 Déploiement sur le serveur..."
ssh no-skills@no-skills.fr 'curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s deploy'

echo "✅ Déploiement terminé!"
echo "🌐 https://no-skills.fr"
```

### GitHub Actions (Optionnel)

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to no-skills.fr

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: no-skills.fr
          username: no-skills
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s deploy
```

## 🔐 Sécurité et Bonnes Pratiques

### Variables d'Environnement Sécurisées

```bash
# Sur le serveur, créer un fichier .env
ssh no-skills@no-skills.fr
cd /var/www/no-skills-chat
nano .env
```

Contenu du `.env`:

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=votre-secret-tres-long-et-securise
DB_PASSWORD=mot-de-passe-base-de-donnees
EMAIL_PASSWORD=mot-de-passe-email
```

### Permissions Sécurisées

```bash
# Sur le serveur
sudo chown -R no-skills:no-skills /var/www/no-skills-chat
chmod 600 /var/www/no-skills-chat/.env
chmod +x /var/www/no-skills-chat/deploy-github.sh
```

## 📊 Monitoring et Alertes

### Script de Monitoring Automatique

```bash
# Créer un monitoring script
ssh no-skills@no-skills.fr

cat > /var/www/monitor.sh << 'EOF'
#!/bin/bash
if ! curl -f -s https://no-skills.fr/health > /dev/null; then
    pm2 restart no-skills-chat
    echo "$(date): Application redémarrée" >> /var/log/no-skills-monitor.log
fi
EOF

chmod +x /var/www/monitor.sh

# Ajouter au crontab
crontab -e
# Ajouter: */5 * * * * /var/www/monitor.sh
```

## 🆘 Dépannage Rapide

### Problèmes Courants

**1. Erreur de connexion SSH**

```bash
# Tester la connexion
ssh -v no-skills@no-skills.fr

# Regénérer les clés si nécessaire
ssh-keygen -t ed25519 -C "deploy@no-skills.fr" -f ~/.ssh/id_ed25519_noskills
ssh-copy-id -i ~/.ssh/id_ed25519_noskills no-skills@no-skills.fr
```

**2. Erreur GitHub**

```bash
# Vérifier l'accès au repo
curl -s https://api.github.com/repos/VOTRE-USERNAME/no-skills-chat

# Cloner manuellement pour tester
git clone https://github.com/VOTRE-USERNAME/no-skills-chat.git test-clone
```

**3. Application ne démarre pas**

```bash
# Via Termius
pm2 logs no-skills-chat
pm2 restart no-skills-chat --watch
```

**4. Port occupé**

```bash
# Via Termius
sudo lsof -i :3001
sudo kill -9 PID_DU_PROCESSUS
pm2 restart no-skills-chat
```

## 📚 Commandes de Référence Rapide

```bash
# Déploiement complet depuis Termius
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s deploy

# Status rapide
pm2 status && curl -s http://localhost:3001/health

# Logs temps réel
pm2 logs no-skills-chat

# Redémarrage d'urgence
pm2 restart no-skills-chat

# Rollback rapide
curl -s -L https://raw.githubusercontent.com/VOTRE-USERNAME/no-skills-chat/main/deploy-github.sh | bash -s rollback
```

---

## 🎉 Résumé du Workflow

1. **Développer** sur votre PC
2. **Commiter et Push** vers GitHub
3. **Ouvrir Termius**
4. **Exécuter** le snippet "🚀 Deploy from GitHub"
5. **Vérifier** avec "📊 Status Check"
6. **Profiter** de votre app sur https://no-skills.fr !

**🚀 Votre système de déploiement est maintenant prêt pour un déploiement en un clic depuis Termius + GitHub !**
