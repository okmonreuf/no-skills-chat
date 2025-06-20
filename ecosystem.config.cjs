module.exports = {
  apps: [
    {
      name: "yupichat-frontend",
      script: "npm",
      args: "run preview",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4173,
        VITE_API_URL: "http://localhost:3001",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4173,
        VITE_API_URL: "http://localhost:3001",
      },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend-combined.log",
      time: true,
    },
    {
      name: "yupichat-backend",
      script: "./server/dist/server.js",
      cwd: "./server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        CLIENT_URL: "http://localhost:4173",
        JWT_SECRET: "your-super-secret-jwt-key-change-in-production",
        MONGODB_URI: "mongodb://localhost:27017/yupichat",

        // Configuration SMTP (à configurer selon votre service)
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        SMTP_USER: "your-email@gmail.com",
        SMTP_PASS: "your-app-password",
        SMTP_FROM: "YupiChat <noreply@yupichat.com>",

        // Configuration upload
        UPLOAD_PATH: "/var/www/yupichat/uploads",
        MAX_FILE_SIZE: "10485760", // 10MB en bytes

        // Configuration logs
        LOG_LEVEL: "info",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        CLIENT_URL: "https://your-domain.com",
        JWT_SECRET: "your-super-secret-jwt-key-change-in-production",
        MONGODB_URI: "mongodb://localhost:27017/yupichat",

        // Configuration SMTP pour production
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        SMTP_USER: "your-email@gmail.com",
        SMTP_PASS: "your-app-password",
        SMTP_FROM: "YupiChat <noreply@yupichat.com>",

        // Configuration upload pour production
        UPLOAD_PATH: "/var/www/yupichat/uploads",
        MAX_FILE_SIZE: "10485760",

        // Configuration logs pour production
        LOG_LEVEL: "warn",
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true,

      // Configuration de monitoring
      monitoring: false,
      pmx: false,

      // Configuration de restart
      max_restarts: 10,
      min_uptime: "60s",

      // Configuration de cluster si nécessaire
      // instances: "max", // Décommentez pour utiliser tous les CPU
      // exec_mode: "cluster",
    },
  ],

  // Configuration de déploiement (optionnel)
  deploy: {
    production: {
      user: "root",
      host: "your-server-ip",
      ref: "origin/main",
      repo: "https://github.com/your-username/yupichat.git",
      path: "/var/www/yupichat",

      // Scripts de déploiement
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && npm run build && cd server && npm install && npm run build && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": "apt update && apt install nodejs npm mongodb -y",

      // Variables d'environnement pour le déploiement
      env: {
        NODE_ENV: "production",
      },
    },

    staging: {
      user: "root",
      host: "staging-server-ip",
      ref: "origin/develop",
      repo: "https://github.com/your-username/yupichat.git",
      path: "/var/www/yupichat-staging",
      "post-deploy":
        "npm install && npm run build && cd server && npm install && npm run build && pm2 reload ecosystem.config.cjs --env staging",
      env: {
        NODE_ENV: "staging",
      },
    },
  },
};
