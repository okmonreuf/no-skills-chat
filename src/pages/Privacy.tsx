import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Database,
  FileText,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold">
                  Politique de Confidentialité
                </h1>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              Conforme RGPD
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction RGPD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-400">
                <Shield className="w-5 h-5" />
                <span>Protection de Vos Données Personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 dark:text-blue-300">
              <p className="mb-3">
                <strong>
                  YupiChat s'engage à protéger votre vie privée et vos données
                  personnelles.
                </strong>
              </p>
              <p className="mb-2">
                Cette politique de confidentialité vous informe sur la collecte,
                l'utilisation et la protection de vos données conformément au
                Règlement Général sur la Protection des Données (RGPD) et à la
                loi Informatique et Libertés.
              </p>
              <p className="text-sm">
                <strong>Responsable du traitement :</strong> [Yupi] -
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table des matières */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Sommaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a
                  href="#donnees-collectees"
                  className="text-primary hover:underline"
                >
                  1. Données Collectées
                </a>
                <a href="#finalites" className="text-primary hover:underline">
                  2. Finalités du Traitement
                </a>
                <a
                  href="#bases-legales"
                  className="text-primary hover:underline"
                >
                  3. Bases Légales
                </a>
                <a
                  href="#destinataires"
                  className="text-primary hover:underline"
                >
                  4. Destinataires
                </a>
                <a
                  href="#conservation"
                  className="text-primary hover:underline"
                >
                  5. Durée de Conservation
                </a>
                <a href="#droits" className="text-primary hover:underline">
                  6. Vos Droits
                </a>
                <a href="#securite" className="text-primary hover:underline">
                  7. Sécurité
                </a>
                <a href="#cookies" className="text-primary hover:underline">
                  8. Cookies
                </a>
                <a href="#transferts" className="text-primary hover:underline">
                  9. Transferts Internationaux
                </a>
                <a href="#contact" className="text-primary hover:underline">
                  10. Contact DPO
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-8">
          {/* Section 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            id="donnees-collectees"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span>1. Données Personnelles Collectées</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    1.1 Données d'Identification
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Nom d'utilisateur</li>
                    <li>Adresse email</li>
                    <li>Mot de passe (chiffré)</li>
                    <li>Photo de profil (optionnelle)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    1.2 Données de Connexion
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Adresse IP</li>
                    <li>Horodatage des connexions</li>
                    <li>Informations sur le navigateur et l'appareil</li>
                    <li>Localisation géographique approximative</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">1.3 Données d'Usage</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Messages envoyés et reçus</li>
                    <li>Fichiers partagés</li>
                    <li>Participation aux groupes</li>
                    <li>Statut de connexion (en ligne/hors ligne)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            id="finalites"
          >
            <Card>
              <CardHeader>
                <CardTitle>2. Finalités du Traitement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Finalités Principales</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Fourniture du service de messagerie</li>
                      <li>Gestion des comptes utilisateurs</li>
                      <li>Authentification et sécurité</li>
                      <li>Support technique</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Finalités Secondaires</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Amélioration du service</li>
                      <li>Analyse statistique (anonymisée)</li>
                      <li>Prévention de la fraude</li>
                      <li>Respect des obligations légales</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            id="bases-legales"
          >
            <Card>
              <CardHeader>
                <CardTitle>3. Bases Légales du Traitement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm">
                      Exécution du Contrat (Art. 6.1.b RGPD)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Traitement nécessaire à l'exécution des conditions
                      d'utilisation
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm">
                      Intérêt Légitime (Art. 6.1.f RGPD)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sécurité, prévention de la fraude, amélioration du service
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm">
                      Consentement (Art. 6.1.a RGPD)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cookies non essentiels, communications marketing (si
                      applicable)
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm">
                      Obligation Légale (Art. 6.1.c RGPD)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Conservation des données de connexion (LCEN)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            id="destinataires"
          >
            <Card>
              <CardHeader>
                <CardTitle>4. Destinataires des Données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Destinataires Internes</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>Équipe technique (développement, maintenance)</li>
                    <li>Service de modération</li>
                    <li>Support utilisateur</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prestataires Externes</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>
                      Hébergeur de données (sous contrat de sous-traitance RGPD)
                    </li>
                    <li>Service d'envoi d'emails (sous contrat DPA)</li>
                    <li>Prestataires de sécurité informatique</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Autorités Compétentes</h4>
                  <p className="text-sm text-muted-foreground">
                    En cas de réquisition judiciaire ou d'obligation légale,
                    conformément aux
                    <a
                      href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000801164/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mx-1"
                    >
                      dispositions de la LCEN
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            id="conservation"
          >
            <Card>
              <CardHeader>
                <CardTitle>5. Durée de Conservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Type de Données</th>
                        <th className="text-left p-2">Durée</th>
                        <th className="text-left p-2">Base Légale</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-2">Données de compte</td>
                        <td className="p-2">Durée du compte + 3 ans</td>
                        <td className="p-2">Intérêt légitime</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Messages</td>
                        <td className="p-2">Durée du compte</td>
                        <td className="p-2">Exécution du contrat</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Logs de connexion</td>
                        <td className="p-2">12 mois</td>
                        <td className="p-2">Obligation légale (LCEN)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Données de modération</td>
                        <td className="p-2">5 ans</td>
                        <td className="p-2">Intérêt légitime</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 6 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            id="droits"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span>6. Vos Droits RGPD</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-800 dark:text-green-400">
                        Droit d'Accès
                      </h4>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Connaître les données traitées vous concernant
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-400">
                        Droit de Rectification
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Corriger les données inexactes
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-red-800 dark:text-red-400">
                        Droit à l'Effacement
                      </h4>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        Supprimer vos données personnelles
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-400">
                        Droit de Portabilité
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Récupérer vos données dans un format structuré
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-orange-800 dark:text-orange-400">
                        Droit d'Opposition
                      </h4>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        S'opposer au traitement de vos données
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-400">
                        Droit de Limitation
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Limiter le traitement de vos données
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Comment Exercer Vos Droits
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pour exercer vos droits, contactez notre DPO :
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>
                      Email :{" "}
                      <a
                        href="mailto:dpo@yupichat.com"
                        className="text-primary hover:underline"
                      >
                        dpo@yupichat.com
                      </a>
                    </li>
                    <li>Délai de réponse : 1 mois maximum</li>
                    <li>Pièce d'identité requise pour vérification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 7 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            id="securite"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <span>7. Mesures de Sécurité</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Mesures Techniques</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Chiffrement AES-256 des données</li>
                      <li>HTTPS/TLS pour les communications</li>
                      <li>Hachage des mots de passe (bcrypt)</li>
                      <li>Authentification à deux facteurs</li>
                      <li>Surveillance en temps réel</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Mesures Organisationnelles
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Accès restreint aux données</li>
                      <li>Formation du personnel</li>
                      <li>Audit de sécurité régulier</li>
                      <li>Plan de réponse aux incidents</li>
                      <li>Contrats de sous-traitance RGPD</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 8 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            id="cookies"
          >
            <Card>
              <CardHeader>
                <CardTitle>8. Cookies et Technologies Similaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Cookies Essentiels</h4>
                    <p className="text-sm text-muted-foreground">
                      Nécessaires au fonctionnement du service
                      (authentification, sécurité, préférences). Ces cookies ne
                      nécessitent pas de consentement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Cookies de Performance
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permettent d'analyser l'utilisation du service de manière
                      anonyme. Soumis à votre consentement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Gestion des Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez gérer vos préférences cookies via les
                      paramètres de votre navigateur ou notre centre de
                      préférences accessible dans les paramètres de votre
                      compte.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 9 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            id="transferts"
          >
            <Card>
              <CardHeader>
                <CardTitle>9. Transferts Internationaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vos données sont hébergées au sein de l'Union Européenne et ne
                  font l'objet d'aucun transfert vers des pays tiers,
                  garantissant le respect du cadre juridique européen.
                </p>
                <p className="text-sm text-muted-foreground">
                  En cas de transfert exceptionnel, celui-ci sera encadré par
                  les garanties appropriées (clauses contractuelles types,
                  décision d'adéquation) conformément au RGPD.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 10 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            id="contact"
          >
            <Card>
              <CardHeader>
                <CardTitle>10. Contact et Réclamations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Délégué à la Protection des Données (DPO)
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground"></div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Droit de Réclamation</h4>
                  <p className="text-sm text-muted-foreground">
                    Vous disposez du droit d'introduire une réclamation auprès
                    de l'autorité de contrôle compétente :
                  </p>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">
                      CNIL (Commission Nationale de l'Informatique et des
                      Libertés)
                    </p>
                    <div></div>
                    <p className="text-xs">
                      <a
                        href="https://www.cnil.fr/fr/plaintes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Formulaire de plainte en ligne
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            <strong>Dernière mise à jour :</strong> Juin 2025
          </p>
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-primary">
              Conditions d'Utilisation
            </Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-primary">
              Gestion des Cookies
            </Link>
            <span>•</span>
            <a href="mailto:dpo@yupichat.com" className="hover:text-primary">
              Contact DPO
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
