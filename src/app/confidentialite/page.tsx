import Link from 'next/link'
import { LegalPageLayout } from '@/components/legal'

const toc = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'responsable', title: 'Responsable du traitement' },
  { id: 'donnees-collectees', title: 'Données collectées' },
  { id: 'finalites', title: 'Finalités du traitement' },
  { id: 'base-legale', title: 'Base légale' },
  { id: 'destinataires', title: 'Destinataires des données' },
  { id: 'transferts', title: 'Transferts hors UE' },
  { id: 'conservation', title: 'Durée de conservation' },
  { id: 'droits', title: 'Vos droits' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'securite', title: 'Sécurité' },
  { id: 'modifications', title: 'Modifications' },
  { id: 'contact', title: 'Contact' },
]

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de Confidentialité"
      lastUpdated="[À COMPLÉTER: date]"
      toc={toc}
    >
      {/* Section 1 */}
      <section id="introduction">
        <h2>1. Introduction</h2>
        <p>
          La présente politique de confidentialité décrit comment{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> ("nous", "notre",
          "BILANTIA") collecte, utilise et protège vos données personnelles lorsque vous utilisez
          notre plateforme.
        </p>
        <p>
          Nous nous engageons à respecter votre vie privée et à protéger vos données conformément au
          Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et
          Libertés.
        </p>
      </section>

      {/* Section 2 */}
      <section id="responsable">
        <h2>2. Responsable du traitement</h2>
        <p>Le responsable du traitement des données est :</p>
        <p>
          <strong>
            <span className="placeholder">[À COMPLÉTER: nom de la société]</span>
          </strong>
          <br />
          <span className="placeholder">[À COMPLÉTER: adresse complète]</span>
          <br />
          Email : <span className="placeholder">[À COMPLÉTER: email DPO ou contact]</span>
        </p>
      </section>

      {/* Section 3 */}
      <section id="donnees-collectees">
        <h2>3. Données collectées</h2>

        <h3>3.1 Données que vous nous fournissez</h3>
        <ul>
          <li>
            <strong>Données d'identification</strong> : nom, prénom, adresse email
          </li>
          <li>
            <strong>Données professionnelles</strong> : fonction, nom de l'entreprise/cabinet
          </li>
          <li>
            <strong>Données de connexion</strong> : mot de passe (stocké de manière chiffrée)
          </li>
          <li>
            <strong>Données d'entreprise</strong> : SIREN, raison sociale, secteur d'activité
          </li>
          <li>
            <strong>Documents importés</strong> : liasses fiscales, FEC, bilans comptables
          </li>
        </ul>

        <h3>3.2 Données collectées automatiquement</h3>
        <ul>
          <li>
            <strong>Données de connexion</strong> : adresse IP, type de navigateur, système
            d'exploitation
          </li>
          <li>
            <strong>Données d'utilisation</strong> : pages visitées, fonctionnalités utilisées,
            horodatage
          </li>
          <li>
            <strong>Cookies</strong> : voir section 10
          </li>
        </ul>

        <h3>3.3 Données issues de sources externes</h3>
        <ul>
          <li>
            <strong>API SIRENE (INSEE)</strong> : informations publiques sur les entreprises
          </li>
          <li>
            <strong>API INPI</strong> : informations du registre national des entreprises
          </li>
          <li>
            <strong>API BODACC</strong> : publications légales (procédures collectives)
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="finalites">
        <h2>4. Finalités du traitement</h2>
        <p>Nous utilisons vos données pour :</p>
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Fourniture du service</strong>
              </td>
              <td>Analyser vos documents, calculer votre score, générer des alertes</td>
            </tr>
            <tr>
              <td>
                <strong>Gestion de compte</strong>
              </td>
              <td>Créer et gérer votre compte utilisateur</td>
            </tr>
            <tr>
              <td>
                <strong>Communication</strong>
              </td>
              <td>Vous envoyer des alertes, notifications et informations sur le service</td>
            </tr>
            <tr>
              <td>
                <strong>Facturation</strong>
              </td>
              <td>Gérer vos abonnements et paiements</td>
            </tr>
            <tr>
              <td>
                <strong>Amélioration</strong>
              </td>
              <td>Analyser l'utilisation pour améliorer nos services</td>
            </tr>
            <tr>
              <td>
                <strong>Support</strong>
              </td>
              <td>Répondre à vos demandes d'assistance</td>
            </tr>
            <tr>
              <td>
                <strong>Obligations légales</strong>
              </td>
              <td>Respecter nos obligations légales et réglementaires</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 5 */}
      <section id="base-legale">
        <h2>5. Base légale</h2>
        <p>Nos traitements de données reposent sur les bases légales suivantes :</p>
        <ul>
          <li>
            <strong>Exécution du contrat</strong> : pour la fourniture du service que vous avez
            souscrit
          </li>
          <li>
            <strong>Consentement</strong> : pour l'envoi de communications marketing (révocable à
            tout moment)
          </li>
          <li>
            <strong>Intérêt légitime</strong> : pour l'amélioration de nos services et la prévention
            de la fraude
          </li>
          <li>
            <strong>Obligation légale</strong> : pour respecter nos obligations comptables et
            fiscales
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="destinataires">
        <h2>6. Destinataires des données</h2>
        <p>Vos données peuvent être partagées avec :</p>

        <h3>6.1 Nos sous-traitants</h3>
        <table>
          <thead>
            <tr>
              <th>Prestataire</th>
              <th>Finalité</th>
              <th>Localisation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>Hébergement base de données</td>
              <td>UE</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Hébergement application</td>
              <td>USA (clauses contractuelles types)</td>
            </tr>
            <tr>
              <td>Google (Gemini)</td>
              <td>Extraction IA des documents</td>
              <td>USA (clauses contractuelles types)</td>
            </tr>
            <tr>
              <td>
                <span className="placeholder">[À COMPLÉTER: prestataire paiement]</span>
              </td>
              <td>Paiement</td>
              <td>
                <span className="placeholder">[À COMPLÉTER]</span>
              </td>
            </tr>
          </tbody>
        </table>

        <h3>6.2 Partage autorisé</h3>
        <p>
          Si vous êtes dirigeant et invitez votre expert-comptable (ou inversement), les données de
          l'entreprise concernée seront partagées avec l'utilisateur invité.
        </p>

        <h3>6.3 Obligations légales</h3>
        <p>
          Nous pouvons être amenés à communiquer vos données aux autorités compétentes sur demande
          légale.
        </p>
      </section>

      {/* Section 7 */}
      <section id="transferts">
        <h2>7. Transferts hors UE</h2>
        <p>
          Certains de nos prestataires sont situés en dehors de l'Union Européenne. Dans ce cas,
          nous nous assurons que des garanties appropriées sont en place :
        </p>
        <ul>
          <li>Clauses contractuelles types approuvées par la Commission Européenne</li>
          <li>Certification du prestataire (si applicable)</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section id="conservation">
        <h2>8. Durée de conservation</h2>
        <table>
          <thead>
            <tr>
              <th>Type de données</th>
              <th>Durée de conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Données de compte</td>
              <td>Durée de la relation + 3 ans</td>
            </tr>
            <tr>
              <td>Documents importés</td>
              <td>Durée de la relation + 30 jours après résiliation</td>
            </tr>
            <tr>
              <td>Données de facturation</td>
              <td>10 ans (obligation légale)</td>
            </tr>
            <tr>
              <td>Logs de connexion</td>
              <td>12 mois</td>
            </tr>
            <tr>
              <td>Cookies</td>
              <td>Voir section 10</td>
            </tr>
          </tbody>
        </table>
        <p>À l'issue de ces durées, vos données sont supprimées ou anonymisées.</p>
      </section>

      {/* Section 9 */}
      <section id="droits">
        <h2>9. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <table>
          <thead>
            <tr>
              <th>Droit</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Accès</strong>
              </td>
              <td>Obtenir une copie de vos données personnelles</td>
            </tr>
            <tr>
              <td>
                <strong>Rectification</strong>
              </td>
              <td>Corriger des données inexactes ou incomplètes</td>
            </tr>
            <tr>
              <td>
                <strong>Effacement</strong>
              </td>
              <td>Demander la suppression de vos données</td>
            </tr>
            <tr>
              <td>
                <strong>Limitation</strong>
              </td>
              <td>Limiter le traitement de vos données</td>
            </tr>
            <tr>
              <td>
                <strong>Portabilité</strong>
              </td>
              <td>Recevoir vos données dans un format structuré</td>
            </tr>
            <tr>
              <td>
                <strong>Opposition</strong>
              </td>
              <td>Vous opposer au traitement de vos données</td>
            </tr>
            <tr>
              <td>
                <strong>Retrait du consentement</strong>
              </td>
              <td>Retirer votre consentement à tout moment</td>
            </tr>
          </tbody>
        </table>

        <h3>Comment exercer vos droits</h3>
        <p>Vous pouvez exercer vos droits :</p>
        <ul>
          <li>
            <strong>Par email</strong> : <span className="placeholder">[À COMPLÉTER: email]</span>
          </li>
          <li>
            <strong>Par courrier</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: adresse]</span>
          </li>
          <li>
            <strong>Depuis votre compte</strong> : section Paramètres &gt; Mes données
          </li>
        </ul>
        <p>Nous répondrons à votre demande dans un délai d'un mois.</p>

        <h3>Réclamation</h3>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
          réclamation auprès de la CNIL :
        </p>
        <p>
          <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong>
          <br />
          3 Place de Fontenoy, TSA 80715
          <br />
          75334 Paris Cedex 07
          <br />
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
        </p>
      </section>

      {/* Section 10 */}
      <section id="cookies">
        <h2>10. Cookies</h2>

        <h3>10.1 Qu'est-ce qu'un cookie ?</h3>
        <p>
          Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur
          notre site.
        </p>

        <h3>10.2 Cookies que nous utilisons</h3>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Type</th>
              <th>Finalité</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Session</td>
              <td>Essentiel</td>
              <td>Maintenir votre connexion</td>
              <td>Session</td>
            </tr>
            <tr>
              <td>Préférences</td>
              <td>Fonctionnel</td>
              <td>Mémoriser vos préférences (thème, langue)</td>
              <td>1 an</td>
            </tr>
            <tr>
              <td>Analytique</td>
              <td>Performance</td>
              <td>Comprendre l'utilisation du site</td>
              <td>13 mois</td>
            </tr>
          </tbody>
        </table>

        <h3>10.3 Gestion des cookies</h3>
        <p>Vous pouvez gérer vos préférences de cookies :</p>
        <ul>
          <li>Depuis le bandeau de consentement lors de votre première visite</li>
          <li>Depuis les paramètres de votre navigateur</li>
        </ul>
        <p>
          Le refus des cookies essentiels peut empêcher l'utilisation de certaines fonctionnalités.
        </p>
      </section>

      {/* Section 11 */}
      <section id="securite">
        <h2>11. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos
          données :
        </p>
        <ul>
          <li>
            <strong>Chiffrement</strong> : Toutes les données sont chiffrées en transit (HTTPS) et
            au repos
          </li>
          <li>
            <strong>Authentification</strong> : Mots de passe hashés, possibilité d'authentification
            à deux facteurs
          </li>
          <li>
            <strong>Accès restreint</strong> : Accès aux données limité aux personnes habilitées
          </li>
          <li>
            <strong>Sauvegardes</strong> : Sauvegardes régulières et sécurisées
          </li>
          <li>
            <strong>Monitoring</strong> : Surveillance des accès et détection des anomalies
          </li>
        </ul>
      </section>

      {/* Section 12 */}
      <section id="modifications">
        <h2>12. Modifications</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout moment. En cas de
          modification substantielle, nous vous en informerons par email et/ou par une notification
          sur le site.
        </p>
        <p>La date de dernière mise à jour est indiquée en haut de ce document.</p>
      </section>

      {/* Section 13 */}
      <section id="contact">
        <h2>13. Contact</h2>
        <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
        <p>
          <strong>
            <span className="placeholder">[À COMPLÉTER: nom de la société]</span>
          </strong>
          <br />
          Email : <span className="placeholder">[À COMPLÉTER: email]</span>
          <br />
          Adresse : <span className="placeholder">[À COMPLÉTER: adresse]</span>
        </p>
      </section>
    </LegalPageLayout>
  )
}
