import nodemailer from "nodemailer";
import { logger, loggerUtils } from "./logger";

// Configuration du transporteur email
const createTransporter = () => {
  // En développement, utiliser un service de test comme Ethereal
  if (process.env.NODE_ENV === "development") {
    return nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }

  // En production, utiliser un vrai service SMTP
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true pour 465, false pour d'autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Options d'email par défaut
const defaultOptions = {
  from: process.env.SMTP_FROM || "YupiChat <noreply@yupichat.com>",
};

// Templates d'email
const emailTemplates = {
  verification: (username: string, code: string) => ({
    subject: "Vérification de votre compte YupiChat",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">YupiChat</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Système de messagerie moderne</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Bonjour ${username} !</h2>
          <p style="color: #666; line-height: 1.6;">
            Bienvenue sur YupiChat ! Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Ce code est valide pendant 15 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>© 2024 YupiChat. Tous droits réservés.</p>
          <p>Cet email a été envoyé depuis une adresse automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    `,
    text: `
      Bonjour ${username} !
      
      Bienvenue sur YupiChat ! Pour activer votre compte, veuillez utiliser le code de vérification suivant :
      
      Code de vérification : ${code}
      
      Ce code est valide pendant 15 minutes.
      
      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
      
      © 2024 YupiChat. Tous droits réservés.
    `,
  }),

  passwordReset: (username: string, resetUrl: string) => ({
    subject: "Réinitialisation de votre mot de passe YupiChat",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">YupiChat</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Réinitialisation de mot de passe</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Bonjour ${username} !</h2>
          <p style="color: #666; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>© 2024 YupiChat. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: `
      Bonjour ${username} !
      
      Vous avez demandé la réinitialisation de votre mot de passe.
      
      Cliquez sur ce lien pour créer un nouveau mot de passe :
      ${resetUrl}
      
      Ce lien expire dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
      
      © 2024 YupiChat. Tous droits réservés.
    `,
  }),

  banNotification: (username: string, reason: string, duration?: string) => ({
    subject: "Suspension de votre compte YupiChat",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">YupiChat</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Notification de suspension</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Bonjour ${username},</h2>
          <p style="color: #666; line-height: 1.6;">
            Votre compte YupiChat a été suspendu pour la raison suivante :
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <strong style="color: #856404;">Raison :</strong> ${reason}
          </div>
          
          ${
            duration
              ? `<p style="color: #666; line-height: 1.6;">
                   <strong>Durée :</strong> ${duration}
                 </p>`
              : `<p style="color: #666; line-height: 1.6;">
                   <strong>Type :</strong> Suspension permanente
                 </p>`
          }
          
          <p style="color: #666; line-height: 1.6;">
            Si vous pensez que cette suspension est injustifiée, vous pouvez contacter un administrateur.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>© 2024 YupiChat. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: `
      Bonjour ${username},
      
      Votre compte YupiChat a été suspendu.
      
      Raison : ${reason}
      ${duration ? `Durée : ${duration}` : "Type : Suspension permanente"}
      
      Si vous pensez que cette suspension est injustifiée, vous pouvez contacter un administrateur.
      
      © 2024 YupiChat. Tous droits réservés.
    `,
  }),
};

// Fonction principale pour envoyer des emails
export const sendEmail = async (
  to: string,
  template: keyof typeof emailTemplates,
  data: any,
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](
      ...(Array.isArray(data) ? data : [data]),
    );

    const mailOptions = {
      ...defaultOptions,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);

    loggerUtils.email(to, emailContent.subject, "sent", {
      messageId: info.messageId,
      template,
    });

    // En développement, afficher l'URL de prévisualisation
    if (process.env.NODE_ENV === "development") {
      logger.info(
        `Email de test envoyé. URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`,
      );
    }

    return true;
  } catch (error) {
    loggerUtils.email(to, `Template: ${template}`, "failed", { error });
    logger.error("Erreur lors de l'envoi d'email:", error);
    return false;
  }
};

// Fonctions spécialisées pour chaque type d'email
export const sendVerificationEmail = async (
  email: string,
  username: string,
  code: string,
): Promise<boolean> => {
  return sendEmail(email, "verification", [username, code]);
};

export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  resetUrl: string,
): Promise<boolean> => {
  return sendEmail(email, "passwordReset", [username, resetUrl]);
};

export const sendBanNotificationEmail = async (
  email: string,
  username: string,
  reason: string,
  duration?: string,
): Promise<boolean> => {
  return sendEmail(email, "banNotification", [username, reason, duration]);
};

// Fonction pour tester la configuration email
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("Configuration email validée avec succès");
    return true;
  } catch (error) {
    logger.error("Erreur de configuration email:", error);
    return false;
  }
};

// Initialisation du service email
export const initializeEmailService = async () => {
  if (process.env.NODE_ENV === "development") {
    logger.info("Service email configuré en mode développement");
    return;
  }

  const isValid = await testEmailConfiguration();
  if (!isValid) {
    logger.warn(
      "Configuration email invalide - les emails ne seront pas envoyés",
    );
  } else {
    logger.info("Service email initialisé avec succès");
  }
};
