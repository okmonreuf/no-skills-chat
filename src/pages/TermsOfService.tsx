import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-white" />
                <h1 className="text-xl font-semibold text-white">
                  Conditions d'Utilisation
                </h1>
              </div>
            </div>
            <div className="text-white text-sm">
              Version 1.0 - {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">
              Conditions Générales d'Utilisation
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              <strong>No-Skills Chat - no-skills.fr</strong>
            </CardDescription>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">
                  Lecture obligatoire avant utilisation
                </span>
              </div>
              <p className="text-red-700 text-sm mt-2">
                L'utilisation de cette plateforme implique l'acceptation pleine
                et entière de ces conditions d'utilisation.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-6">
                {/* Article 1 */}
                <section>
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Article 1 - Définitions et Acceptation
                    </h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p className="text-gray-700">
                      <strong>No-Skills Chat</strong> est une plateforme de
                      messagerie instantanée exploitée sous le domaine{" "}
                      <strong>no-skills.fr</strong>.
                    </p>
                    <p className="text-gray-700">
                      En créant un compte ou en utilisant nos services, vous
                      acceptez sans réserve les présentes conditions
                      d'utilisation et vous vous engagez à les respecter
                      scrupuleusement.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                      <p className="text-blue-800 font-medium">
                        ⚠️ ATTENTION : Tout manquement à ces conditions peut
                        entraîner la suspension immédiate de votre compte et des
                        poursuites judiciaires.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Article 2 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 2 - Utilisation Autorisée et Interdictions
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-800">
                      2.1 Utilisation autorisée
                    </h4>
                    <p className="text-gray-700">
                      La plateforme est destinée exclusivement à la
                      communication légale et respectueuse entre utilisateurs
                      un minimua mature.
                    </p>

                    <h4 className="font-semibold text-gray-800 mt-4">
                      2.2 Interdictions formelles
                    </h4>
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                      <p className="text-red-800 font-semibold mb-2">
                        IL EST STRICTEMENT INTERDIT DE :
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        <li>
                          Tenter de contourner, détourner ou pirater les
                          systèmes de sécurité
                        </li>
                        <li>
                          Effectuer des attaques par déni de service (DDoS) ou
                          similaires
                        </li>
                        <li>
                          Tenter de faire dysfonctionner volontairement la
                          plateforme
                        </li>
                        <li>
                          Utiliser des outils automatisés non autorisés (bots,
                          scripts malveillants)
                        </li>
                        <li>
                          Exploiter des failles de sécurité sans autorisation
                          écrite préalable
                        </li>
                        <li>
                          Usurper l'identité d'autres utilisateurs ou
                          administrateurs
                        </li>
                        <li>
                          Diffuser du contenu illégal, haineux, diffamatoire ou
                          pornographique
                        </li>
                        <li>Violer la vie privée d'autres utilisateurs</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Article 3 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 3 - Données Personnelles et Amélioration du Service
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <p className="text-blue-800 font-semibold">
                        ENGAGEMENT UTILISATEUR
                      </p>
                      <p className="text-blue-700 mt-2">
                        En utilisant No-Skills Chat, vous vous engagez
                        explicitement et irrévocablement à :
                      </p>
                      <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
                        <li>
                          Fournir des données personnelles exactes et à jour
                        </li>
                        <li>
                          Autoriser l'utilisation de vos données pour
                          l'amélioration continue du service
                        </li>
                        <li>
                          Accepter la collecte de données d'usage et de
                          navigation
                        </li>
                        <li>
                          Permettre l'analyse de vos interactions pour optimiser
                          l'expérience utilisateur
                        </li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800">
                      3.1 Données collectées
                    </h4>
                    <p className="text-gray-700">
                      Nous collectons et traitons les données suivantes :
                      informations de profil, messages, métadonnées de
                      connexion, adresses IP, logs d'activité, données
                      techniques de votre appareil.
                    </p>

                    <h4 className="font-semibold text-gray-800">
                      3.2 Finalités du traitement
                    </h4>
                    <p className="text-gray-700">
                      Ces données sont utilisées pour : améliorer la sécurité,
                      développer de nouvelles fonctionnalités, analyser les
                      tendances d'usage, personnaliser votre expérience,
                      prévenir les abus.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Article 4 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 4 - Sanctions et Poursuites Judiciaires
                  </h3>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">
                        AVERTISSEMENT LÉGAL
                      </span>
                    </div>
                    <div className="space-y-3 text-red-700">
                      <p className="font-semibold">
                        Toute tentative de contournement, détournement ou
                        dysfonctionnement volontaire de la plateforme entraînera
                        :
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Suspension immédiate</strong> et définitive du
                          compte
                        </li>
                        <li>
                          <strong>Bannissement IP</strong> permanent de tous nos
                          services
                        </li>
                        <li>
                          <strong>Dépôt de plainte</strong> auprès des autorités
                          compétentes
                        </li>
                        <li>
                          <strong>Poursuites judiciaires</strong> pour dommages
                          et intérêts
                        </li>
                        <li>
                          <strong>Transmission des données</strong> aux
                          autorités (logs, IP, informations personnelles)
                        </li>
                      </ul>
                      <div className="bg-red-100 p-3 rounded mt-3">
                        <p className="font-bold text-red-900">
                          📋 Les infractions sont systématiquement enregistrées
                          et conservées pour constituer un dossier de preuve en
                          cas de procédure judiciaire.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Article 5 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 5 - Respect de la Législation
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p className="text-gray-700">
                      Vous vous engagez à respecter l'ensemble de la législation
                      française et européenne en vigueur, notamment :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>
                        Code pénal français (articles sur la cybercriminalité)
                      </li>
                      <li>Loi Informatique et Libertés</li>
                      <li>
                        Règlement Général sur la Protection des Données (RGPD)
                      </li>
                      <li>
                        Loi pour la Confiance dans l'Économie Numérique (LCEN)
                      </li>
                      <li>Code de la propriété intellectuelle</li>
                    </ul>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                      <p className="text-yellow-800">
                        ⚖️ Tout manquement à ces lois expose l'utilisateur aux
                        sanctions pénales et civiles prévues par les textes en
                        vigueur.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Article 6 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 6 - Modération et Surveillance
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p className="text-gray-700">
                      No-Skills Chat se réserve le droit de :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Surveiller toutes les activités sur la plateforme</li>
                      <li>Modérer et supprimer tout contenu inapproprié</li>
                      <li>Suspendre ou bannir tout compte sans préavis</li>
                      <li>Collaborer avec les autorités judiciaires</li>
                      <li>
                        Modifier ces conditions d'utilisation à tout moment
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Article 7 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 7 - Contact et Signalements
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p className="text-gray-700">
                      Pour tout signalement d'abus ou question juridique :
                    </p>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-blue-800">
                        📧 Email : admin@no-skills.fr
                        <br />
                        🌐 Site : no-skills.fr
                        <br />
                        ⚖️ Signalements : abuse@no-skills.fr
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Article 8 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Article 8 - Dispositions Finales
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p className="text-gray-700">
                      Ces conditions d'utilisation constituent l'accord complet
                      entre l'utilisateur et No-Skills Chat. En cas de conflit,
                      le droit français s'applique et les tribunaux français
                      sont seuls compétents.
                    </p>
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <p className="text-green-800 font-semibold">
                        ✅ En cliquant sur "J'accepte" ou en utilisant nos
                        services, vous reconnaissez avoir lu, compris et accepté
                        l'intégralité de ces conditions.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">
                    Déclaration de Responsabilité
                  </span>
                </div>
                <p className="text-red-700 text-sm mt-2">
                  En utilisant No-Skills Chat, je déclare avoir pris
                  connaissance de ces conditions, les accepter sans réserve, et
                  m'engage à respecter toutes les obligations qui en découlent
                  sous peine de poursuites judiciaires.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="flex-1 btn-no-skills"
                >
                  J'accepte les conditions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
