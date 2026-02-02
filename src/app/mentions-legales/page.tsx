import Link from 'next/link'
import { LegalPageLayout } from '@/components/legal'

const toc = [
  { id: 'editeur', title: 'Éditeur du site' },
  { id: 'hebergement', title: 'Hébergement' },
  { id: 'propriete-intellectuelle', title: 'Propriété intellectuelle' },
  { id: 'donnees-personnelles', title: 'Données personnelles' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'responsabilite', title: 'Limitation de responsabilité' },
  { id: 'liens', title: 'Liens hypertextes' },
  { id: 'droit-applicable', title: 'Droit applicable' },
  { id: 'contact', title: 'Contact' },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      title="Mentions Légales"
      lastUpdated="[À COMPLÉTER: date]"
      toc={toc}
    >
      {/* Section 1 */}
      <section id="editeur">
        <h2>1. Éditeur du site</h2>
        <p>
          <strong>BILANTIA</strong> est édité par :
        </p>
        <ul>
          <li>
            <strong>Raison sociale</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: nom de la société]</span>
          </li>
          <li>
            <strong>Forme juridique</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: SAS, SARL, etc.]</span>
          </li>
          <li>
            <strong>Capital social</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: montant]</span> €
          </li>
          <li>
            <strong>Siège social</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: adresse complète]</span>
          </li>
          <li>
            <strong>SIREN</strong> : <span className="placeholder">[À COMPLÉTER: numéro]</span>
          </li>
          <li>
            <strong>SIRET</strong> : <span className="placeholder">[À COMPLÉTER: numéro]</span>
          </li>
          <li>
            <strong>RCS</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: ville d'immatriculation]</span>
          </li>
          <li>
            <strong>Numéro TVA</strong> :{' '}
            <span className="placeholder">[À COMPLÉTER: numéro intracommunautaire]</span>
          </li>
        </ul>
        <p>
          <strong>Directeur de la publication</strong> :{' '}
          <span className="placeholder">[À COMPLÉTER: nom et prénom]</span>
        </p>
        <p>
          <strong>Contact</strong> :{' '}
          <span className="placeholder">[À COMPLÉTER: email de contact]</span>
        </p>
      </section>

      {/* Section 2 */}
      <section id="hebergement">
        <h2>2. Hébergement</h2>
        <p>Le site BILANTIA est hébergé par :</p>
        <ul>
          <li>
            <strong>Hébergeur</strong> : Vercel Inc.
          </li>
          <li>
            <strong>Adresse</strong> : 340 S Lemon Ave #4133, Walnut, CA 91789, USA
          </li>
          <li>
            <strong>Site web</strong> :{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              https://vercel.com
            </a>
          </li>
        </ul>
        <p>Les données sont stockées par :</p>
        <ul>
          <li>
            <strong>Fournisseur</strong> : Supabase Inc.
          </li>
          <li>
            <strong>Localisation des données</strong> : Union Européenne
          </li>
          <li>
            <strong>Site web</strong> :{' '}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              https://supabase.com
            </a>
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="propriete-intellectuelle">
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu du site BILANTIA (textes, images, graphismes, logo, icônes,
          logiciels, etc.) est la propriété exclusive de{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> ou de ses
          partenaires, et est protégé par les lois françaises et internationales relatives à la
          propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou
          partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
          sans autorisation écrite préalable.
        </p>
        <p>
          La marque <strong>BILANTIA</strong> et le logo associé sont des marques déposées. Toute
          utilisation non autorisée est constitutive de contrefaçon.
        </p>
      </section>

      {/* Section 4 */}
      <section id="donnees-personnelles">
        <h2>4. Données personnelles</h2>
        <p>
          Pour toute information concernant le traitement de vos données personnelles, veuillez
          consulter notre{' '}
          <Link href="/confidentialite">Politique de Confidentialité</Link>.
        </p>
      </section>

      {/* Section 5 */}
      <section id="cookies">
        <h2>5. Cookies</h2>
        <p>
          Le site utilise des cookies pour améliorer l'expérience utilisateur. Pour plus
          d'informations, consultez notre{' '}
          <Link href="/confidentialite">Politique de Confidentialité</Link>.
        </p>
      </section>

      {/* Section 6 */}
      <section id="responsabilite">
        <h2>6. Limitation de responsabilité</h2>
        <p>
          Les informations fournies sur le site BILANTIA le sont à titre indicatif.{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> ne saurait garantir
          l'exactitude, la complétude ou l'actualité des informations diffusées.
        </p>
        <p>
          L'utilisation des informations et contenus disponibles sur le site se fait sous la
          responsabilité pleine et entière de l'utilisateur.
        </p>
        <p>
          Le score de santé financière fourni par BILANTIA est un outil d'aide à la décision et ne
          constitue en aucun cas un conseil financier, juridique ou comptable professionnel.
        </p>
      </section>

      {/* Section 7 */}
      <section id="liens">
        <h2>7. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers d'autres sites internet.{' '}
          <span className="placeholder">[À COMPLÉTER: nom de la société]</span> n'exerce aucun
          contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>
      </section>

      {/* Section 8 */}
      <section id="droit-applicable">
        <h2>8. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les
          tribunaux français seront seuls compétents.
        </p>
      </section>

      {/* Section 9 */}
      <section id="contact">
        <h2>9. Contact</h2>
        <p>Pour toute question concernant ces mentions légales, vous pouvez nous contacter :</p>
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
