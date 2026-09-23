import { ArrowRight } from 'lucide-react';
import './OurPartnersSection.css';

interface Partner {
  src: string;
  alt: string;
  isSimple?: boolean; // served as-is (png/jpeg) instead of the optimised .avif
  ext?: string;
}

const ART = '/assets/partners-section';

// Same partners and grouping as the live site.
// span = width in the 6-column desktop grid (order is the live site's)
const CATEGORIES: { title: string; span: 2 | 4; partners: Partner[] }[] = [
  {
    title: 'Media Partners',
    span: 4,
    partners: [
      { src: '/Our-Sponsors/Radio-city', alt: 'Radio City' },
      { src: '/Our-Sponsors/Edge-media', alt: 'Edge Media' },
      { src: '/Our-Sponsors/Malai-Murasu', alt: 'Maalai Murasu' },
    ],
  },
  { title: 'Match Ball Partner', span: 2, partners: [{ src: '/Our-Sponsors/Sixit', alt: 'Sixit Sports' }] },
  { title: 'Banking Partner', span: 2, partners: [{ src: '/Our-Sponsors/Equitas-Bank', alt: 'Equitas Bank' }] },
  {
    title: 'Sports Partners',
    span: 4,
    partners: [
      { src: '/images/zportify-logo', alt: 'Zportify', isSimple: true },
      { src: '/Our-Sponsors/Odi-Vilayadu-Papa', alt: 'OVP' },
      { src: '/Our-Sponsors/Football-Makka', alt: 'Football Makka' },
    ],
  },
  { title: 'Community Partners', span: 2, partners: [{ src: '/Our-Sponsors/Lions-International-', alt: 'Lions Club International' }] },
  {
    title: 'Associate Partners',
    span: 2,
    partners: [
      { src: '/Our-Sponsors/Astro-Messiah', alt: 'Astro Messiah - SSPL Partner', isSimple: true, ext: '.jpeg' },
      { src: '/Our-Sponsors/Reflect-Media', alt: 'Reflect Media - SSPL Partner' },
    ],
  },
];

const Logo = ({ partner, large }: { partner: Partner; large?: boolean }) => (
  <li className={`ptn__logo${large ? ' ptn__logo--lg' : ''}`}>
    <img src={partner.isSimple ? partner.src + (partner.ext || '.png') : `${partner.src  }.avif`} alt={partner.alt} loading="lazy" decoding="async" />
  </li>
);

/**
 * Homepage "Our Partners". Same partners, categories and contact link as before, restyled to the brand guide:
 * one card, one row per category (label | logos) instead of a long single column. Title lettering is generated art (tools/build-partners-assets.mjs).
 */
const OurPartnersSection = () => (
  <section className="ptn" id="partners" aria-labelledby="ptn-title">
    <div className="brand-container">
      <header className="ptn__head">
        <h2 className="ptn__title" id="ptn-title">
          <picture>
            <source type="image/avif" srcSet={`${ART}/pt-title-full.avif`} />
            <img src={`${ART}/pt-title-full.webp`} alt="Our Partners" width={1221} height={512} loading="lazy" decoding="async" />
          </picture>
        </h2>
        <p className="ptn__lead">The SSPL ecosystem is powered by media, technology, and community partners who build this platform with us.</p>
      </header>

      <div className="ptn__card">
        <div className="ptn__row ptn__row--initiative">
          <h3 className="ptn__label">An Initiative By</h3>
          <ul className="ptn__logos">
            <Logo partner={{ src: '/Our-Sponsors/RPL-blue-logo', alt: 'Royal Peacocks - Initiative By', isSimple: true }} large />
          </ul>
        </div>

        {CATEGORIES.map(({ title, span, partners }) => (
          <div key={title} className={`ptn__row ptn__row--s${span}`}>
            <h3 className="ptn__label">{title}</h3>
            <ul className="ptn__logos">
              {partners.map((p) => <Logo key={p.src} partner={p} />)}
            </ul>
          </div>
        ))}

        <div className="ptn__cta">
          <p>Interested in partnering with us?</p>
          <a className="brand-btn brand-btn--primary" href="mailto:info@ssplt10.co.in">
            Get in touch <ArrowRight size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default OurPartnersSection;
