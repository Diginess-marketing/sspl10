import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Zap } from 'lucide-react';
import selectedPlayers from '@/data/selectedPlayers.json';
import selectedPlayers2 from '@/data/selectedPlayers2.json';
import './PlayerCarousel.css';

/**
 * Homepage "Featured selected players" strip: a hand-picked set of 12 from the full auction list
 * (spread across states, mixed roles). Everyone else lives on /auction ("Many more talents" card).
 */
const FEATURED_IMAGES = [
  '/assets/players/ashish-yadav.webp',
  '/assets/players/balaji-s-srinivasan.webp',
  '/assets/players/david.webp',
  '/assets/players/dharshan-d.webp',
  '/assets/players/varun-suri.webp',
  '/assets/players/vijendra-kumar.webp',
  '/assets/players/pranav-jadav.webp',
  '/assets/players/sooraj-pk.webp',
  '/assets/players/kunchapa-narashima.webp',
  '/assets/players/md-shakir-khan.webp',
  '/assets/players2/miriyala-ravi-chandra.webp',
  '/assets/players/vipin-verma.webp',
];

// A few source rows spell states without a space; show them the way the reference does.
const STATE_FIX: Record<string, string> = {
  TAMILNADU: 'TAMIL NADU',
  MAHARASTRA: 'MAHARASHTRA',
  UTTARPRADESH: 'UTTAR PRADESH',
  ANDHRAPRADESH: 'ANDHRA PRADESH',
  MADHYAPRADESH: 'MADHYA PRADESH',
};

type Role = 'Bowler' | 'Batting' | 'All-rounder';

const roleOf = (raw: string): Role => {
  const r = (raw || '').toUpperCase();
  if (r.startsWith('BOWL')) return 'Bowler';
  if (r === 'AR') return 'All-rounder';
  return 'Batting';
};

const stateOf = (location: string) => {
  const s = (location || '').split(',').pop()?.trim().toUpperCase() ?? '';
  return STATE_FIX[s] ?? s;
};

const byImage = new Map(
  [...selectedPlayers, ...selectedPlayers2].map((p) => [p.image, p] as const),
);

const FEATURED = FEATURED_IMAGES.flatMap((image) => {
  const p = byImage.get(image);
  if (!p) return [];
  return [{
    name: p.name.split('-')[0].trim(),
    state: stateOf(p.location),
    role: roleOf(p.role),
    image,
    // Balaji stands to the right of frame in his source photo
    position: p.name.includes('BALAJI') ? 'right top' : '50% 0%',
  }];
});

const BallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M6 5.5c3.4 3 3.4 10 0 13M18 5.5c-3.4 3-3.4 10 0 13" />
  </svg>
);

const BatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g transform="rotate(45 12 12)">
      <rect x="8.5" y="8" width="7" height="14" rx="2" />
      <path d="M12 8V2" />
    </g>
  </svg>
);

const ROLE_ICON: Record<Role, React.ReactNode> = {
  Bowler: <BallIcon />,
  Batting: <BatIcon />,
  'All-rounder': <Zap aria-hidden="true" />,
};

const AUTOPLAY_MS = 3200;
const RESUME_AFTER_TOUCH_MS = 6000;

const PlayerCarousel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const touchTimer = useRef<number>();
  const [edge, setEdge] = useState({ start: true, end: false });

  const updateEdge = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  // distance of one card (card width + gap)
  const stepOf = (el: HTMLElement) => {
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    if (!first) return el.clientWidth;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  };

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * stepOf(el), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    updateEdge();
    window.addEventListener('resize', updateEdge);
    return () => window.removeEventListener('resize', updateEdge);
  }, [updateEdge]);

  // Gentle auto-scroll: only while visible, paused on hover / focus / touch, off for reduced motion.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let visible = false;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.3 });
    io.observe(section);

    const timer = window.setInterval(() => {
      if (!visible || pausedRef.current || document.hidden) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: stepOf(track), behavior: 'smooth' });
    }, AUTOPLAY_MS);

    return () => { io.disconnect(); window.clearInterval(timer); window.clearTimeout(touchTimer.current); };
  }, []);

  const pause = () => { pausedRef.current = true; window.clearTimeout(touchTimer.current); };
  const resume = () => { pausedRef.current = false; };
  const pauseForTouch = () => {
    pause();
    touchTimer.current = window.setTimeout(resume, RESUME_AFTER_TOUCH_MS);
  };

  return (
    <section ref={sectionRef} className="fps brand-section brand-section--tint" id="auction-results" aria-labelledby="fps-title">
      <div className="brand-container">
        <div className="fps__row">
          {/* Title panel (supplied artwork carries the lettering) */}
          <div className="fps__panel">
            <h2 id="fps-title" className="sr-only">Featured selected players</h2>
            <picture>
              <source type="image/avif" srcSet="/assets/featured/featured-selected-players-480w.avif 480w, /assets/featured/featured-selected-players-768w.avif 768w" sizes="(min-width: 700px) 280px, 100vw" />
              <source type="image/webp" srcSet="/assets/featured/featured-selected-players-480w.webp 480w, /assets/featured/featured-selected-players-768w.webp 768w" sizes="(min-width: 700px) 280px, 100vw" />
              <img
                src="/assets/featured/featured-selected-players-768w.webp"
                alt=""
                width={768}
                height={859}
                decoding="async"
                loading="lazy"
                draggable={false}
              />
            </picture>
            <p className="fps__tagline">Different cities.<br />Same dream.</p>
          </div>

          {/* Scrolling players */}
          <div
            className="fps__stage"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocus={pause}
            onBlur={resume}
            onTouchStart={pauseForTouch}
          >
            <button
              type="button"
              className="fps__nav fps__nav--prev"
              onClick={() => scrollByCard(-1)}
              disabled={edge.start}
              aria-label="Previous players"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="fps__nav fps__nav--next"
              onClick={() => scrollByCard(1)}
              disabled={edge.end}
              aria-label="Next players"
            >
              <ChevronRight aria-hidden="true" />
            </button>

            <ul
              ref={trackRef}
              className="fps__track"
              onScroll={updateEdge}
              tabIndex={0}
              aria-label="Featured selected players, scrollable"
            >
              {FEATURED.map((player, i) => (
                <li className="fps-card" key={player.image}>
                  <div className="fps-card__in">
                    <div className="fps-card__photo">
                      <img
                        src={player.image}
                        alt={player.name}
                        width={500}
                        height={600}
                        loading={i < 4 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        style={{ objectPosition: player.position }}
                      />
                      <span className="fps-card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="fps-card__body">
                      <h3 className="fps-card__name">{player.name}</h3>
                      <p className="fps-card__meta"><MapPin aria-hidden="true" /><span>{player.state}</span></p>
                      <p className="fps-card__meta">{ROLE_ICON[player.role]}<span>{player.role}</span></p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Full list lives on its own page */}
          <Link to="/auction" className="fps__more" aria-label="Many more talents — view all selected players">
            <span className="fps__more-in">
              <span className="fps__more-text">Many more<br />talents</span>
              <span className="fps__more-btn"><ChevronRight aria-hidden="true" /></span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlayerCarousel;
