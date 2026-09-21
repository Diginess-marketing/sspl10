import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronDown, ArrowRight, MapPin, Users, Medal, ShieldCheck, BarChart3, Landmark, Coins } from 'lucide-react';
import './AuctionHeroAnnouncement.css';

interface AuctionHeroAnnouncementProps {
  onScrollToResults?: () => void;
}

const STATS = [
  { icon: MapPin, label: 'Grand Finale Venue', value: 'Sharjah' },
  { icon: Users, label: 'Franchise Teams', value: '12' },
  { icon: Medal, label: 'Top Player Reward', value: 'Upto 3 Lakhs' },
];

const FEATURES = [
  { icon: Users, text: 'Get discovered by top teams' },
  { icon: BarChart3, text: 'Exclusive chance to go pro' },
  { icon: ShieldCheck, text: 'Age 12 years & Above' },
  { icon: Landmark, text: 'Play in Sharjah’s world-class stadium' },
  { icon: Coins, text: 'Massive cash prizes up for grabs' },
  { icon: Trophy, text: 'Showcase sports league' },
];

const ART = '/assets/announcement';

/**
 * Homepage "Auction Results are out!" announcement. Same live content, links and behaviour as before
 * (scroll to #auction-results, Full List -> /auction), restyled to the SSPL brand guide.
 */
const AuctionHeroAnnouncement: React.FC<AuctionHeroAnnouncementProps> = ({ onScrollToResults }) => {
  const navigate = useNavigate();

  const handleScrollDown = () => {
    if (onScrollToResults) {
      onScrollToResults();
      return;
    }
    document.getElementById('auction-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="brand-section brand-section--tint auc" id="auction-announcement" aria-labelledby="auc-title">
      <div className="brand-container auc__wrap auc__grid">
        <div className="auc__copy">
          <div className="auc__badges">
            <span className="auc__pill">
              <Trophy size={16} strokeWidth={2.4} aria-hidden="true" />
              SSPL <b>T10</b>
            </span>
            <span className="auc__rule" aria-hidden="true" />
            <p className="brand-eyebrow auc__eyebrow">Official Announcement</p>
          </div>

          <h2 className="brand-h2 auc__title" id="auc-title">
            <span className="auc__line">Auction</span>
            <span className="auc__line">Results</span>
            <picture className="auc__out">
              <source type="image/avif" srcSet={`${ART}/are-out-3d-480w.avif 480w, ${ART}/are-out-3d-768w.avif 768w, ${ART}/are-out-3d-1024w.avif 1024w`} sizes="(min-width: 1100px) 340px, 300px" />
              <source type="image/webp" srcSet={`${ART}/are-out-3d-480w.webp 480w, ${ART}/are-out-3d-768w.webp 768w, ${ART}/are-out-3d-1024w.webp 1024w`} sizes="(min-width: 1100px) 340px, 300px" />
              <img src={`${ART}/are-out-3d-768w.webp`} alt="are out!" width={2158} height={729} decoding="async" />
            </picture>
          </h2>

          <p className="brand-lead auc__lead">
            Shortlisted candidates are now live.
            <br className="auc__br" /> Scroll down to view the selected players.
          </p>

          <div className="auc__actions">
            <button type="button" className="brand-btn brand-btn--primary" onClick={handleScrollDown}>
              Scroll to Results
              <ChevronDown size={18} strokeWidth={2.6} aria-hidden="true" />
            </button>
            <button type="button" className="brand-btn brand-btn--outline" onClick={() => navigate('/auction')}>
              Full List
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="auc__prize">
          <picture>
            <source type="image/avif" srcSet={`${ART}/total-prize-pool-3crores-480w.avif 480w, ${ART}/total-prize-pool-3crores-768w.avif 768w, ${ART}/total-prize-pool-3crores-1024w.avif 1024w`} sizes="(min-width: 1100px) 40vw, 92vw" />
            <source type="image/webp" srcSet={`${ART}/total-prize-pool-3crores-480w.webp 480w, ${ART}/total-prize-pool-3crores-768w.webp 768w, ${ART}/total-prize-pool-3crores-1024w.webp 1024w`} sizes="(min-width: 1100px) 40vw, 92vw" />
            <img src={`${ART}/total-prize-pool-3crores-768w.webp`} alt="Total prize pool: up to 3 crores" width={1774} height={887} loading="lazy" decoding="async" />
          </picture>
        </div>

        <div className="auc__art" aria-hidden="true">
          <picture>
            <source type="image/avif" srcSet={`${ART}/helmet-ball-480w.avif 480w, ${ART}/helmet-ball-768w.avif 768w, ${ART}/helmet-ball-1024w.avif 1024w`} sizes="(min-width: 1100px) 30vw, 70vw" />
            <source type="image/webp" srcSet={`${ART}/helmet-ball-480w.webp 480w, ${ART}/helmet-ball-768w.webp 768w, ${ART}/helmet-ball-1024w.webp 1024w`} sizes="(min-width: 1100px) 30vw, 70vw" />
            <img src={`${ART}/helmet-ball-768w.webp`} alt="" width={1223} height={1286} loading="lazy" decoding="async" />
          </picture>
        </div>

        <ul className="auc__stats">
          {STATS.map(({ icon: Icon, label, value }) => (
            <li key={label} className="brand-card auc-stat">
              <span className="brand-icon auc-stat__icon" aria-hidden="true"><Icon size={24} strokeWidth={2} /></span>
              <span className="auc-stat__text">
                <span className="auc-stat__label">{label}</span>
                <span className="auc-stat__value">{value}</span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="auc__features">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="auc-feature">
              <Icon size={26} strokeWidth={1.9} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AuctionHeroAnnouncement;
