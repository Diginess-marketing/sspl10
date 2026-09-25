import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Link2 } from 'lucide-react';
import './FooterSection.css';

// Same live links as before; icons are each platform's own brand colors (no external icon CDNs).
export const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61579163954407', icon: '/assets/img/social-color-facebook.svg' },
  { label: 'X (Twitter)', href: 'https://x.com/ssplt10/', icon: '/assets/img/social-color-x.svg' },
  { label: 'Instagram', href: 'https://instagram.com/ssplt10', icon: '/assets/img/social-color-instagram.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Southernstreetpremierleague', icon: '/assets/img/social-color-youtube.svg' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ssplt10/posts/?feedView=all', icon: '/assets/img/social-color-linkedin.svg' },
  { label: 'ShareChat', href: 'https://sharechat.com/profile/ssplt10?d=n', icon: '/assets/img/social-media-share chat.png' },
  { label: 'Moj', href: 'https://mojapp.in/@ssplt10?referrer=V8q0NIm-1fORME9', icon: '/assets/img/social-media-moj.png' },
];

const TOURNAMENT_LINKS = [
  { to: '/register', label: 'Player Registration' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/articles-blogs', label: 'News & Blog' },
  { to: '/enquiry', label: 'Enquiry' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/register-selector', label: 'Selectors Registration' },
  { to: '/tournament-organizer-registration', label: 'Tournament Organizers' },
];

const POLICY_LINKS = [
  { to: '/cancellation-refund-policy', label: 'Cancellation & Refund' },
  { to: '/dugout-code-of-conduct', label: 'Dugout Code of Conduct' },
  { to: '/commercial-guidelines', label: 'Commercial Guidelines' },
  { to: '/terms-and-conditions', label: 'Terms & Conditions' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
];

/**
 * Site footer, restyled to the brand guide: light body with brand / contact / two link columns, navy legal strip.
 * Removed vs. the old footer: the giant Royal Peacocks watermark behind the text, the duplicate SSPL logo, external CDN social icons,
 * the boxed QR and the unreadable lime hover colours. Same links, contact details and copy.
 */
const FooterSection = () => (
  <footer id="contact" className="ftr" role="contentinfo" aria-label="Site footer">
    <div className="brand-container ftr__grid">
      {/* brand */}
      <div className="ftr__brand">
        <Link to="/" className="ftr__logo" aria-label="SSPL T10 home">
          <img src="/assets/img/sspl-logo-color.png" alt="SSPL — Southern Street Premier League" width={120} height={80} loading="lazy" decoding="async" />
          <span>
            <b>SSPL T10</b>
            <i>Cricket League</i>
          </span>
        </Link>
        <p className="ftr__about">The ultimate T10 tennis ball cricket league bringing together the best talent from around the globe.</p>

        <ul className="ftr__social">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <img src={s.icon} alt="" width={40} height={40} loading="lazy" decoding="async" />
              </a>
            </li>
          ))}
        </ul>

        <a className="ftr__qr" href="https://linktr.ee/SSPLT10" target="_blank" rel="noopener noreferrer">
          <img src="/images/linktree-qr.png" alt="QR code: scan to visit our Linktree" width={150} height={150} loading="lazy" decoding="async" />
          <span>
            <b>Scan to Connect</b>
            <small><Link2 size={14} aria-hidden="true" /> All our links in one place</small>
          </span>
        </a>
      </div>

      {/* contact */}
      <div className="ftr__col">
        <h2 className="ftr__h">Contact Info</h2>
        <ul className="ftr__contact">
          <li>
            <MapPin size={20} aria-hidden="true" />
            <address>
              Royal Peacocks League Limited<br />
              Courtyard by Marriott, 1st Floor,<br />
              No.564, Anna Salai, Teynampet,<br />
              Tamilnadu Chennai - 600018
            </address>
          </li>
          <li>
            <Phone size={20} aria-hidden="true" />
            <a href="tel:+918807775960">+91 88077 75960</a>
          </li>
          <li>
            <Mail size={20} aria-hidden="true" />
            <a href="mailto:customercare@ssplt10.co.in">customercare@ssplt10.co.in</a>
          </li>
        </ul>
      </div>

      {/* links */}
      <nav className="ftr__col" aria-label="Tournament">
        <h2 className="ftr__h">Tournament</h2>
        <ul className="ftr__links">
          {TOURNAMENT_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
        </ul>
      </nav>

      <nav className="ftr__col" aria-label="Policies">
        <h2 className="ftr__h">Policies</h2>
        <ul className="ftr__links">
          {POLICY_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
        </ul>
      </nav>
    </div>

    <div className="ftr__legal">
      <div className="brand-container ftr__legal-in">
        <p>© Copyright Reserved: SSPLT10</p>
        <p className="ftr__rpl">
          All Rights Reserved: Royal Peacocks League Limited
          <img src="/assets/img/rpl-logo-trimmed.png" alt="Royal Peacocks League Limited" height={30} loading="lazy" decoding="async" />
        </p>
      </div>
    </div>
  </footer>
);

export default FooterSection;
