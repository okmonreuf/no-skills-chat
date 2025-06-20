#!/bin/bash

# Script d'installation des dépendances backend pour YupiChat
echo "Installation des dépendances backend YupiChat..."

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "Erreur: package.json non trouvé. Exécutez ce script depuis le dossier server/"
    exit 1
fi

# Installer les dépendances
npm install

# Créer les dossiers nécessaires
mkdir -p src/uploads/avatars
mkdir -p src/uploads/files
mkdir -p logs
mkdir -p dist

# Copier le fichier .env d'exemple
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Fichier .env créé. N'oubliez pas de le configurer !"
fi

echo "Installation terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Configurez le fichier .env avec vos paramètres"
echo "2. Assurez-vous que MongoDB est démarré"
echo "3. Lancez 'npm run dev' pour démarrer en mode développement"
