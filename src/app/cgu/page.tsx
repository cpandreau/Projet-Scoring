import Link from 'next/link'
import { LegalPageLayout } from '@/components/legal'

const toc = [
  { id: 'objet', title: 'Objet' },
  { id: 'acceptation', title: 'Acceptation des CGU' },
  { id: 'description', title: 'Description du service' },
  { id: 'acces', title: 'Accès au service' },
  { id: 'inscription', title: 'Inscription et compte utilisateur' },
  { id: 'obligations', title: 'Obligations de l\'utilisateur' },
  { id: 'propriete', title: 'Propriété intellectuelle' },
  { id: 'donnees', title: 'Données personnelles' },
  { id: 'responsabilite', title: 'Responsabilité' },
  { id: 'tarifs', title: 'Tarifs et paiement' },
  { id: 'resiliation', title: 'Résiliation' },
  { id: 'modification', title: 'Modification des CGU' },
  { id: 'droit', title: 'Droit applicable et litiges' },
  { id: 'contact', title: 'Contact' },
]

export default function CguPage() {
  return (
    <LegalPageLayout
      title="Conditions Générales d'Utilisation"
      lastUpdated="[À COMPLÉTER: date]"
      toc={toc}
    >
      {/* Section 1 */}
      <section id="objet">
        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les
          conditions d'accès et d'utilisation de la plateforme BILANTIA, accessible à l'adresse{' '}
          <span className="placeholder">[À COMPLÉTER: URL du site]</span>.
        </p>
        <p>
          BILANTIA est une plateforme d'analyse de santé financière destinée aux dirigeants de
          TPE/PME et aux experts-comptables.
        </p>
      </section>

      {/* Section 2 */}
      <section id="acceptation">
        <h2>2. Acceptation des CGU</h2>
        <p>
          L'utilisation de BILANTIA implique l'acceptation pleine et entière des présentes CGU. En
          créant un compte ou en utilisant le service, vous reconnaissez avoir lu, compris et
          accepté ces conditions.
        </p>
        <p>Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.</p>
      </section>

      {/* Section 3 */}
      <section id="description">
        <h2>3. Description du service</h2>
        <p>BILANTIA propose les services suivants :</p>
        <ul>
          <li>
            <strong>Analyse financière</strong> : Extraction et analyse automatisée des données
            issues des liasses fiscales
          </li>
          <li>
            <strong>Score de santé</strong> : Calcul d'un score de santé financière basé sur plus de
            30 ratios
          </li>
          <li>
            <strong>Alertes</strong> : Notifications en cas de variation significative des
            indicateurs
          </li>
          <li>
            <strong>Comparaison sectorielle</strong> : Benchmark par rapport aux moyennes du secteur
            d'activité
          </li>
          <li>
            <strong>Collaboration</strong> : Partage d'accès entre dirigeants et experts-comptables
          </li>
        </ul>
        <p>Les fonctionnalités disponibles varient selon le plan d'abonnement souscrit.</p>
      </section>

      {/* Section 4 */}
      <section id="acces">
        <h2>4. Accès au service</h2>
        <p>
          Le service est accessible 24h/24 et 7j/7, sous réserve des interruptions pour maintenance
          ou cas de force majeure.
        </p>
        <p>
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> se réserve le droit
          de suspendre ou d'interrompre temporairement l'accès au service pour des raisons
          techniques, sans que cela n'ouvre droit à une quelconque indemnisation.
        </p>
      </section>

      {/* Section 5 */}
      <section id="inscription">
        <h2>5. Inscription et compte utilisateur</h2>

        <h3>5.1 Création de compte</h3>
        <p>Pour utiliser BILANTIA, vous devez créer un compte en fournissant :</p>
        <ul>
          <li>Une adresse email valide</li>
          <li>Un mot de passe sécurisé</li>
          <li>Les informations relatives à votre entreprise ou cabinet</li>
        </ul>
        <p>Vous vous engagez à fournir des informations exactes et à les maintenir à jour.</p>

        <h3>5.2 Sécurité du compte</h3>
        <p>
          Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute
          activité réalisée depuis votre compte est réputée avoir été effectuée par vous.
        </p>
        <p>
          En cas de suspicion d'utilisation non autorisée, vous devez nous en informer immédiatement
          à <span className="placeholder">[À COMPLÉTER: email]</span>.
        </p>

        <h3>5.3 Types de comptes</h3>
        <ul>
          <li>
            <strong>Compte Dirigeant</strong> : Pour les dirigeants d'entreprise souhaitant analyser
            leur propre société
          </li>
          <li>
            <strong>Compte Expert-Comptable</strong> : Pour les professionnels du chiffre gérant
            plusieurs dossiers clients
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="obligations">
        <h2>6. Obligations de l'utilisateur</h2>
        <p>En utilisant BILANTIA, vous vous engagez à :</p>
        <ul>
          <li>Utiliser le service conformément à sa destination</li>
          <li>Ne pas tenter d'accéder aux données d'autres utilisateurs</li>
          <li>Ne pas perturber le fonctionnement du service</li>
          <li>Respecter les droits de propriété intellectuelle</li>
          <li>Fournir des documents authentiques et non falsifiés</li>
          <li>Ne pas utiliser le service à des fins illégales</li>
        </ul>
        <p>
          Tout manquement à ces obligations peut entraîner la suspension ou la résiliation de votre
          compte.
        </p>
      </section>

      {/* Section 7 */}
      <section id="propriete">
        <h2>7. Propriété intellectuelle</h2>

        <h3>7.1 Propriété de BILANTIA</h3>
        <p>
          L'ensemble des éléments de la plateforme (logiciels, algorithmes, interface, contenus,
          marques) sont la propriété exclusive de{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span>.
        </p>
        <p>
          L'utilisation du service ne confère aucun droit de propriété intellectuelle sur ces
          éléments.
        </p>

        <h3>7.2 Vos données</h3>
        <p>
          Vous restez propriétaire des documents et données que vous importez sur BILANTIA. Vous
          nous accordez une licence limitée pour traiter ces données dans le cadre de la fourniture
          du service.
        </p>
      </section>

      {/* Section 8 */}
      <section id="donnees">
        <h2>8. Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est décrit dans notre{' '}
          <Link href="/confidentialite">Politique de Confidentialité</Link>.
        </p>
      </section>

      {/* Section 9 */}
      <section id="responsabilite">
        <h2>9. Responsabilité</h2>

        <h3>9.1 Nature du service</h3>
        <p>
          BILANTIA est un outil d'aide à la décision. Le score de santé financière et les analyses
          fournies :
        </p>
        <ul>
          <li>Ne constituent pas un conseil financier, juridique ou comptable</li>
          <li>Ne remplacent pas l'avis d'un professionnel qualifié</li>
          <li>Sont fournis à titre indicatif</li>
        </ul>

        <h3>9.2 Limitation de responsabilité</h3>
        <p>
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> ne saurait être
          tenue responsable :
        </p>
        <ul>
          <li>Des décisions prises sur la base des informations fournies par le service</li>
          <li>Des erreurs d'extraction ou d'interprétation des documents importés</li>
          <li>Des dommages indirects, pertes de profits ou de données</li>
          <li>Des interruptions de service indépendantes de sa volonté</li>
        </ul>
        <p>
          La responsabilité de <span className="placeholder">[À COMPLÉTER: nom de la société]</span>{' '}
          est limitée au montant des sommes effectivement versées par l'utilisateur au cours des 12
          derniers mois.
        </p>
      </section>

      {/* Section 10 */}
      <section id="tarifs">
        <h2>10. Tarifs et paiement</h2>

        <h3>10.1 Plans et tarifs</h3>
        <p>
          Les tarifs en vigueur sont disponibles sur la page <Link href="/tarifs">Tarifs</Link>.{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> se réserve le droit
          de modifier ses tarifs à tout moment, les nouveaux tarifs s'appliquant aux nouvelles
          souscriptions.
        </p>

        <h3>10.2 Paiement</h3>
        <p>
          Le paiement s'effectue par carte bancaire via notre prestataire de paiement sécurisé.
          L'abonnement est prélevé mensuellement à la date anniversaire de la souscription.
        </p>

        <h3>10.3 Plan gratuit</h3>
        <p>
          Le plan gratuit est proposé sans limitation de durée mais avec des fonctionnalités
          restreintes. <span className="placeholder">[À COMPLÉTER: nom de la société]</span> se
          réserve le droit de modifier ou supprimer cette offre.
        </p>
      </section>

      {/* Section 11 */}
      <section id="resiliation">
        <h2>11. Résiliation</h2>

        <h3>11.1 Par l'utilisateur</h3>
        <p>
          Vous pouvez résilier votre abonnement à tout moment depuis les paramètres de votre compte.
          La résiliation prend effet à la fin de la période en cours.
        </p>

        <h3>11.2 Par BILANTIA</h3>
        <p>
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> peut suspendre ou
          résilier votre compte en cas de :
        </p>
        <ul>
          <li>Violation des présentes CGU</li>
          <li>Utilisation frauduleuse du service</li>
          <li>Non-paiement des sommes dues</li>
        </ul>

        <h3>11.3 Conséquences</h3>
        <p>
          À la résiliation, vous conservez l'accès à vos données pendant 30 jours. Passé ce délai,
          vos données seront supprimées conformément à notre politique de confidentialité.
        </p>
      </section>

      {/* Section 12 */}
      <section id="modification">
        <h2>12. Modification des CGU</h2>
        <p>
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> se réserve le droit
          de modifier les présentes CGU. Les utilisateurs seront informés par email de toute
          modification substantielle.
        </p>
        <p>L'utilisation du service après notification vaut acceptation des nouvelles conditions.</p>
      </section>

      {/* Section 13 */}
      <section id="droit">
        <h2>13. Droit applicable et litiges</h2>
        <p>Les présentes CGU sont soumises au droit français.</p>
        <p>
          En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les
          tribunaux de <span className="placeholder">[À COMPLÉTER: ville]</span> seront seuls
          compétents.
        </p>
      </section>

      {/* Section 14 */}
      <section id="contact">
        <h2>14. Contact</h2>
        <p>Pour toute question relative aux présentes CGU :</p>
        <ul>
          <li>
            <strong>Email</strong> : <span className="placeholder">[À COMPLÉTER: email]</span>
          </li>
          <li>
            <strong>Adresse</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: adresse postale]</span>
          </li>
        </ul>
      </section>
    </LegalPageLayout>
  )
}
