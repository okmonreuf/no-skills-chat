import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Scale,
  AlertTriangle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function Terms() {
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
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">
                  Conditions Générales d'Utilisation
                </h1>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-green-500 text-green-700"
            >
              Version 1.0 - Janvier 2024
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Avertissement Important */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  Avertissement Important - Service Réservé aux +15 ans
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800 dark:text-amber-300">
              <p className="mb-2">
                <strong>
                  YupiChat est un service de communication réservé exclusivement
                  aux personnes âgées de 15 ans et plus.
                </strong>
              </p>
              <p>
                L'utilisation de ce service par des mineurs de moins de 15 ans
                est strictement interdite et constitue une violation de nos
                conditions d'utilisation.
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
              <CardTitle>Table des Matières</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#article-1" className="text-primary hover:underline">
                  1. Définitions et Objet
                </a>
                <a href="#article-2" className="text-primary hover:underline">
                  2. Acceptation des Conditions
                </a>
                <a href="#article-3" className="text-primary hover:underline">
                  3. Conditions d'Accès
                </a>
                <a href="#article-4" className="text-primary hover:underline">
                  4. Obligations de l'Utilisateur
                </a>
                <a href="#article-5" className="text-primary hover:underline">
                  5. Interdictions Formelles
                </a>
                <a href="#article-6" className="text-primary hover:underline">
                  6. Propriété Intellectuelle
                </a>
                <a href="#article-7" className="text-primary hover:underline">
                  7. Protection des Données
                </a>
                <a href="#article-8" className="text-primary hover:underline">
                  8. Sécurité et Sanctions
                </a>
                <a href="#article-9" className="text-primary hover:underline">
                  9. Responsabilité
                </a>
                <a href="#article-10" className="text-primary hover:underline">
                  10. Droit Applicable
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Articles */}
        <div className="space-y-8">
          {/* Article 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            id="article-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <span>Article 1 - Définitions et Objet</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1.1 Définitions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>« Service »</strong> : La plateforme YupiChat
                      accessible via l'URL [votre-domaine.com]
                    </li>
                    <li>
                      <strong>« Utilisateur »</strong> : Toute personne physique
                      âgée de 15 ans ou plus utilisant le Service
                    </li>
                    <li>
                      <strong>« Éditeur »</strong> : La société ou personne
                      physique exploitant le Service
                    </li>
                    <li>
                      <strong>« Contenu »</strong> : Tout élément (texte, image,
                      vidéo, audio) publié sur le Service
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">1.2 Objet</h4>
                  <p className="text-sm text-muted-foreground">
                    Les présentes conditions générales d'utilisation (CGU)
                    régissent l'accès et l'utilisation du service de messagerie
                    instantanée YupiChat. Elles constituent un contrat
                    juridiquement contraignant entre l'Utilisateur et l'Éditeur.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            id="article-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 2 - Acceptation des Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  L'utilisation du Service implique l'acceptation pleine et
                  entière des présentes CGU. L'Utilisateur reconnaît avoir lu,
                  compris et accepté ces conditions avant toute utilisation du
                  Service.
                </p>
                <p className="text-sm text-muted-foreground">
                  L'Éditeur se réserve le droit de modifier les présentes CGU à
                  tout moment. Les modifications prendront effet dès leur
                  publication sur le Service. L'utilisation continue du Service
                  après modification vaut acceptation des nouvelles conditions.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            id="article-3"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 3 - Conditions d'Accès</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">3.1 Âge Minimum</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>
                      Le Service est exclusivement réservé aux personnes âgées
                      de 15 ans révolus.
                    </strong>{" "}
                    Toute utilisation par une personne mineure de moins de 15
                    ans est strictement interdite et entraînera la suspension
                    immédiate du compte.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3.2 Capacité Juridique</h4>
                  <p className="text-sm text-muted-foreground">
                    L'Utilisateur déclare avoir la capacité juridique nécessaire
                    pour contracter et utiliser le Service conformément aux
                    présentes CGU.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3.3 Inscription</h4>
                  <p className="text-sm text-muted-foreground">
                    L'inscription requiert la fourniture d'informations exactes,
                    complètes et à jour. L'Utilisateur s'engage à maintenir
                    l'exactitude de ces informations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            id="article-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 4 - Obligations de l'Utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  L'Utilisateur s'engage à :
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-4">
                  <li>
                    Utiliser le Service de manière loyale et conforme à sa
                    destination
                  </li>
                  <li>
                    Respecter la législation française et internationale en
                    vigueur
                  </li>
                  <li>Ne pas porter atteinte aux droits de tiers</li>
                  <li>
                    Maintenir la confidentialité de ses identifiants de
                    connexion
                  </li>
                  <li>
                    Signaler tout dysfonctionnement ou utilisation abusive du
                    Service
                  </li>
                  <li>
                    Respecter les autres utilisateurs et maintenir un climat de
                    respect
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            id="article-5"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <span>Article 5 - Interdictions Formelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold mb-3 text-red-800 dark:text-red-400">
                    Il est strictement interdit de :
                  </h4>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside ml-4">
                    <li>
                      <strong>Contourner les mesures de sécurité</strong> du
                      Service ou tenter d'accéder à des zones non autorisées
                    </li>
                    <li>
                      <strong>Effectuer des attaques</strong> de type DDoS, DoS,
                      ou toute forme d'attaque informatique
                    </li>
                    <li>
                      <strong>Utiliser des logiciels malveillants</strong>,
                      virus, trojans ou tout code nuisible
                    </li>
                    <li>
                      <strong>Procéder à du reverse engineering</strong>,
                      décompilation ou ingénierie inverse du Service
                    </li>
                    <li>
                      <strong>Usurper l'identité</strong> d'autrui ou créer de
                      faux comptes
                    </li>
                    <li>
                      <strong>Diffuser du contenu illégal</strong> :
                      pornographique, violent, raciste, diffamatoire
                    </li>
                    <li>
                      <strong>Spammer ou harceler</strong> d'autres utilisateurs
                    </li>
                    <li>
                      <strong>Violer la propriété intellectuelle</strong> de
                      l'Éditeur ou de tiers
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Sanctions applicables :</strong> Toute violation de
                  ces interdictions entraînera la suspension immédiate du
                  compte, sans préavis ni remboursement, et pourra donner lieu à
                  des poursuites judiciaires.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 6 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            id="article-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 6 - Propriété Intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    6.1 Droits de l'Éditeur
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tous les éléments du Service (code source, design, marques,
                    logos, bases de données) sont protégés par le droit
                    d'auteur, le droit des marques et autres droits de propriété
                    intellectuelle. Ils sont la propriété exclusive de
                    l'Éditeur.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    6.2 Licence d'Utilisation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    L'Éditeur concède à l'Utilisateur une licence personnelle,
                    non-exclusive, non-transmissible et révocable d'utilisation
                    du Service, strictement limitée à l'usage personnel et
                    non-commercial.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">6.3 Protection Légale</h4>
                  <p className="text-sm text-muted-foreground">
                    Ce Service est protégé par :
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069414/LEGISCTA000006161658/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Code de la Propriété Intellectuelle (Articles L.111-1 et
                        suivants)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069414/LEGISCTA000006161635/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Loi sur les Marques (Articles L.711-1 et suivants)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070719/LEGISCTA000006165259/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Code Pénal - Contrefaçon (Articles 335-2 et suivants)
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 7 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            id="article-7"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <span>Article 7 - Protection des Données Personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Le traitement des données personnelles est régi par notre
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline mx-1"
                  >
                    Politique de Confidentialité
                  </Link>
                  et conforme au :
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4">
                  <li>
                    <a
                      href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0679"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Règlement Général sur la Protection des Données (RGPD)
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000037085952/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Loi Informatique et Libertés modifiée
                    </a>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  L'Utilisateur dispose d'un droit d'accès, de rectification,
                  d'effacement, de portabilité et d'opposition sur ses données
                  personnelles.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 8 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            id="article-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 8 - Sécurité et Sanctions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    8.1 Mesures de Sécurité
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    L'Éditeur met en place des mesures techniques et
                    organisationnelles appropriées pour assurer la sécurité du
                    Service. Toute tentative de contournement, piratage ou
                    attaque sera poursuivie au titre de :
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4 mt-2">
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006418316/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Article 323-1 du Code Pénal (Accès frauduleux)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006418320/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Article 323-2 du Code Pénal (Entrave au fonctionnement)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027811830/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Article 323-3 du Code Pénal (Introduction de données)
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    8.2 Sanctions Applicables
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    En cas de violation des présentes CGU, l'Éditeur se réserve
                    le droit d'appliquer les sanctions suivantes :
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-4 mt-2">
                    <li>Avertissement</li>
                    <li>Suspension temporaire du compte</li>
                    <li>Bannissement définitif</li>
                    <li>
                      Poursuites judiciaires et réclamation de dommages-intérêts
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 9 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            id="article-9"
          >
            <Card>
              <CardHeader>
                <CardTitle>Article 9 - Responsabilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    9.1 Responsabilité de l'Éditeur
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    L'Éditeur s'efforce d'assurer la disponibilité et la
                    sécurité du Service mais ne garantit pas un fonctionnement
                    ininterrompu. Sa responsabilité est limitée aux dommages
                    directs et prévisibles.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    9.2 Responsabilité de l'Utilisateur
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    L'Utilisateur est seul responsable de l'utilisation qu'il
                    fait du Service et des contenus qu'il diffuse. Il garantit
                    l'Éditeur contre toute réclamation de tiers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Article 10 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            id="article-10"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Article 10 - Droit Applicable et Juridictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">10.1 Droit Applicable</h4>
                  <p className="text-sm text-muted-foreground">
                    Les présentes CGU sont régies par le droit français. Toute
                    difficulté d'interprétation sera résolue conformément à la
                    législation française.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    10.2 Juridictions Compétentes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    En cas de litige, une solution amiable sera recherchée. À
                    défaut, les juridictions françaises seront seules
                    compétentes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">10.3 Médiation</h4>
                  <p className="text-sm text-muted-foreground">
                    Conformément à l'article L.616-1 du Code de la consommation,
                    l'Utilisateur peut recourir à la médiation gratuite en cas
                    de litige.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Footer légal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            <strong>Date d'entrée en vigueur :</strong> Janvier 2024
          </p>
          <p className="text-sm text-muted-foreground">
            Pour toute question relative aux présentes CGU, contactez-nous à :
            legal@yupichat.com
          </p>
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">
              Politique de Confidentialité
            </Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-primary">
              Politique des Cookies
            </Link>
            <span>•</span>
            <a href="mailto:legal@yupichat.com" className="hover:text-primary">
              Contact Légal
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
