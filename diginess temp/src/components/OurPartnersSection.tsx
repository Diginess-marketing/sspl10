import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { partners as builtInPartners, groupPartners, type PartnerItem } from '@/data/partners';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import './OurPartnersSection.css';

interface LogoProps {
  image: string;
  alt: string;
}

const ART = '/assets/partners-section';

const Logo = ({ partner, large }: { partner: LogoProps; large?: boolean }) => (
  <li className={`ptn__logo${large ? ' ptn__logo--lg' : ''}`}>
    <img src={partner.image} alt={partner.alt} loading="lazy" decoding="async" />
  </li>
);

/**
 * Homepage "Our Partners". Same partners, categories and contact link as before, restyled to the brand guide:
 * one card, one row per category (label | logos) instead of a long single column. Title lettering is generated art (tools/build-partners-assets.mjs).
 */
const OurPartnersSection = () => {
  const items = useCmsCollection<PartnerItem>('partners', builtInPartners);
  const categories = useMemo(() => groupPartners(items), [items]);

  return (
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
              <Logo partner={{ image: '/Our-Sponsors/RPL-blue-logo.png', alt: 'Royal Peacocks - Initiative By' }} large />
            </ul>
          </div>

          {categories.map(({ title, span, partners }) => (
            <div key={title} className={`ptn__row ptn__row--s${span}`}>
              <h3 className="ptn__label">{title}</h3>
              <ul className="ptn__logos">
                {partners.map((p) => <Logo key={p.image} partner={p} />)}
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
};

export default OurPartnersSection;
