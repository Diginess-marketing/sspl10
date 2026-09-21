import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Cpu, TrendingUp, UserPlus, MapPin, ClipboardCheck, Gavel, Trophy, ArrowRight } from 'lucide-react';
import './StreetToStadium.css';

const VALUES = [
  { icon: Users, title: 'Inclusivity', text: 'Breaking barriers and bringing together players from every corner of the country.' },
  { icon: Cpu, title: 'Innovation', text: 'Leveraging modern formats to revolutionize how tennis ball cricket is played.' },
  { icon: TrendingUp, title: 'Growth', text: 'Providing a clear roadmap for players to scale their skills to professional benchmarks.' },
];

const STEPS = [
  { icon: UserPlus, title: 'Register Online', text: 'Sign up and create your profile on our digital platform.' },
  { icon: MapPin, title: 'City Trials', text: 'Showcase your skills at trial locations across major cities.' },
  { icon: ClipboardCheck, title: 'Player Selection', text: 'Top performers are allocated for the professional draft.' },
  { icon: Gavel, title: 'SSPL Auction', text: 'Selected players are picked by franchise teams in a live auction.' },
  { icon: Trophy, title: 'Finals at Sharjah', text: 'Compete at the world-class Sharjah Cricket Stadium for the ultimate glory.' },
];

/**
 * "Street to Stadium" — reference section for the brand guide (docs/BRAND_GUIDE.md).
 * Same live content as before: intro + 3 values, the 5-step player journey, and the Spirit block with the anthem video.
 */
const StreetToStadium: React.FC = () => (
  <>
    <section className="brand-section brand-section--tint sts" id="street-to-stadium" aria-labelledby="sts-title">
      <div className="brand-container">
        <header className="sts__intro">
          <p className="brand-eyebrow">India&rsquo;s Premier T10 Tennis Ball Cricket League</p>
          <h2 className="brand-h2" id="sts-title">
            Street to <span className="brand-accent">Stadium</span>
          </h2>
          <p className="brand-lead">Empowering grassroots talent to shine on the national stage.</p>
        </header>

        <ul className="sts__values">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="brand-card sts__value">
              <span className="brand-icon" aria-hidden="true"><Icon size={26} strokeWidth={2} /></span>
              <h3 className="brand-h3">{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="brand-section sts-journey" aria-labelledby="sts-journey-title">
      <div className="brand-container">
        <h2 className="brand-h2" id="sts-journey-title">
          SSPL <span className="brand-accent">Player Journey</span>
        </h2>

        <ol className="sts-steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="sts-step">
              <span className="sts-step__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="brand-icon sts-step__icon" aria-hidden="true"><Icon size={28} strokeWidth={1.9} /></span>
              <div className="sts-step__body">
                <h3 className="brand-h3">{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="brand-section brand-section--tint sts-spirit" aria-labelledby="sts-spirit-title">
      <div className="brand-container sts-spirit__grid">
        <div className="sts-spirit__copy">
          <h2 className="brand-h2" id="sts-spirit-title">
            The spirit of <span className="brand-accent">street cricket</span>
          </h2>
          <p className="brand-lead">SSPL preserves the raw energy of street cricket while providing the professional platform you deserve.</p>
          <Link to="/register" className="brand-btn brand-btn--primary sts-spirit__cta">
            Register Now <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>

        <div className="sts-spirit__video brand-card">
          <iframe
            src="https://www.youtube.com/embed/QrBQAv3D1cU"
            title="SSPL Anthem"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  </>
);

export default StreetToStadium;
