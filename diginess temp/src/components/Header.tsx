import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { googleAnalytics } from '@/utils/googleAnalytics';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/hooks/useAuth';
import NavCricketIcon from '@/components/NavCricketIcon';
import { SITE_NAV, type SiteNavSection } from '@/config/siteNav';
import './Header.css';

const YOUTUBE_URL = 'https://www.youtube.com/@Southernstreetpremierleague';

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/p/1Fk3RpvGMW/?mibextid=wwXIfr', icon: '/assets/img/social-media-F.png' },
  { label: 'X', href: 'https://x.com/ssplt10/', icon: '/assets/img/social-media-X.png' },
  { label: 'Instagram', href: 'https://instagram.com/ssplt10', icon: '/assets/img/social-media-inst.png' },
  { label: 'YouTube', href: YOUTUBE_URL, icon: '/assets/img/social-media-you.png' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ssplt10/posts/?feedView=all', icon: '/assets/img/social-media-in.png' },
  { label: 'ShareChat', href: 'https://sharechat.com/profile/ssplt10?d=n', icon: '/assets/img/social-media-share chat.png' },
  { label: 'Moj', href: 'https://mojapp.in/@ssplsouthern?referrer=V7hedHR-1fORME9', icon: '/assets/img/social-media-moj.png' },
];

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, clearAuthState } = useAuth();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  // True when the desktop menu is wider than the space left beside the logo and buttons
  // (depends on screen width, zoom and font), so it hides and the slide-in menu is used.
  const [navOverflows, setNavOverflows] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    const list = navListRef.current;
    if (!nav || !list || typeof ResizeObserver === 'undefined') return;
    const measure = () => setNavOverflows(list.scrollWidth > nav.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Only show auth options if running inside the Android App WebView
  const isAndroidApp = navigator.userAgent.includes('SSPL-Android-App');

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // shadow once the page has scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // menu open: lock page scroll, Escape closes, focus moves in and returns on close
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    // Aggressively clear local and session storage synchronously
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) sessionStorage.removeItem(key);
      });
    } catch (err) {
      /* storage unavailable */
    }
    // Force redirect after 500ms even if clearAuthState hangs
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
    clearAuthState().finally(() => {
      window.location.href = '/';
    });
  };

  // Full site map lives in src/config/siteNav.ts; desktop shows the main sections plus "More"
  const nav = SITE_NAV;
  const primaryNav = SITE_NAV.filter((section) => !section.inMore);
  const moreNav = SITE_NAV.filter((section) => section.inMore);

  const path = location.pathname;
  const isActive = (item: SiteNavSection) =>
    item.end
      ? path === item.to
      : path === item.to || path.startsWith(`${item.to  }/`) || Boolean(item.children?.some((c) => path === c.to || path.startsWith(`${c.to  }/`)));
  const moreActive = moreNav.some(isActive);

  const resultsActive = path === '/trial-results';
  const registerActive = path === '/register';

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${navOverflows ? ' is-nav-overflowing' : ''}`}>
        <div className="site-header__bar">
          <Link to="/" className="site-header__logo" aria-label="SSPL T10 – go to homepage">
            <img src="/assets/img/sspl-logo-color.png" alt="SSPL – Southern Street Premier League" width={188} height={200} />
          </Link>

          <nav ref={navRef} className="site-header__nav" aria-label="Primary" aria-hidden={navOverflows || undefined}>
            <ul ref={navListRef} className="site-nav">
              {primaryNav.map((item) => (
                <li key={item.label} className={`site-nav__item${item.children ? ' has-menu' : ''}`}>
                  <Link to={item.to} className={`site-nav__link${isActive(item) ? ' is-active' : ''}`} aria-current={isActive(item) ? 'page' : undefined}>
                    <NavCricketIcon />
                    {item.label}
                    {item.children && <span className="site-nav__chevron" aria-hidden="true" />}
                  </Link>
                  {item.children && (
                    <ul className="site-nav__menu">
                      {item.children.map((child) => (
                        <li key={child.to + child.label}>
                          <Link to={child.to} aria-current={path === child.to ? 'page' : undefined}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {moreNav.length > 0 && (
                <li className="site-nav__item has-menu site-nav__item--more">
                  <button type="button" className={`site-nav__link site-nav__more-btn${moreActive ? ' is-active' : ''}`} aria-haspopup="true">
                    <NavCricketIcon />
                    More
                    <span className="site-nav__chevron" aria-hidden="true" />
                  </button>
                  <div className="site-nav__menu site-nav__mega">
                    {moreNav.map((section) => (
                      <div key={section.label} className="site-nav__mega-col">
                        <Link to={section.to} className="site-nav__mega-title">{section.label}</Link>
                        <ul>
                          {(section.children ?? []).map((child) => (
                            <li key={child.to + child.label}>
                              <Link to={child.to} aria-current={path === child.to ? 'page' : undefined}>
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              )}
              {isAndroidApp &&
                (user ? (
                  <li className="site-nav__item has-menu">
                    <Link to="/dashboard" className={`site-nav__link${path === '/dashboard' ? ' is-active' : ''}`}>
                      My Profile
                      <span className="site-nav__chevron" aria-hidden="true" />
                    </Link>
                    <ul className="site-nav__menu">
                      <li><Link to="/dashboard">Dashboard</Link></li>
                      <li><a href="#" onClick={handleSignOut}>Sign Out</a></li>
                    </ul>
                  </li>
                ) : (
                  <li className="site-nav__item">
                    <Link to="/auth" className={`site-nav__link${path === '/auth' ? ' is-active' : ''}`}>Sign In</Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <a className="site-header__youtube" href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="SSPL on YouTube">
              <svg viewBox="0 0 32 24" aria-hidden="true" focusable="false">
                <rect width="32" height="24" rx="7" fill="#FF0000" />
                <path d="M13 7.2v9.6l8.4-4.8z" fill="#fff" />
              </svg>
            </a>

            <Link
              to="/trial-results"
              className={`site-btn site-btn--outline${resultsActive ? ' is-active' : ''}`}
              onClick={() => googleAnalytics.trackButtonClick('results', 'header')}
            >
              Results
            </Link>
            <Link
              to="/register"
              className={`site-btn site-btn--primary${registerActive ? ' is-active' : ''}`}
              onClick={() => googleAnalytics.trackButtonClick('register_now', 'header')}
            >
              <span className="site-btn__long">Registration</span>
              <span className="site-btn__short">Register</span>
            </Link>

            <img
              className="site-header__partner-logo"
              src="/Our-Sponsors/Royal-Peacocks-.png"
              alt="Royal Peacocks League"
              width={40}
              height={40}
              loading="lazy"
            />

            <button
              ref={menuButtonRef}
              type="button"
              className="site-header__burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="site-drawer"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in menu: full page list, language, all social channels */}
      <div className={`site-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="site-drawer__backdrop" onClick={closeMenu} />
        <aside id="site-drawer" className="site-drawer__panel" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="site-drawer__top">
            <img src="/assets/img/sspl-logo-color.png" alt="" width={188} height={200} />
            <button ref={closeButtonRef} type="button" className="site-drawer__close" onClick={closeMenu} aria-label="Close menu">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <nav className="site-drawer__nav" aria-label="Menu">
            <ul>
              {nav.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    // Accordion: 11 sections with ~60 links would be too long fully expanded
                    <details className="site-drawer__group" open={isActive(item)}>
                      <summary className={isActive(item) ? 'is-active' : ''} tabIndex={menuOpen ? 0 : -1}>
                        <NavCricketIcon />
                        {item.label}
                        <span className="site-nav__chevron" aria-hidden="true" />
                      </summary>
                      <ul className="site-drawer__sub">
                        {item.children.map((child) => (
                          <li key={child.to + child.label}>
                            <Link
                              to={child.to}
                              onClick={closeMenu}
                              className={path === child.to ? 'is-current' : ''}
                              tabIndex={menuOpen ? 0 : -1}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link to={item.to} className={isActive(item) ? 'is-active' : ''} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
                      <NavCricketIcon />
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              {isAndroidApp && (
                <li>
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>My Profile</Link>
                      <ul className="site-drawer__sub">
                        <li><Link to="/dashboard" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Dashboard</Link></li>
                        <li><a href="#" onClick={handleSignOut} tabIndex={menuOpen ? 0 : -1}>Sign Out</a></li>
                      </ul>
                    </>
                  ) : (
                    <Link to="/auth" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>Sign In</Link>
                  )}
                </li>
              )}
            </ul>
          </nav>

          <div className="site-drawer__cta">
            <Link to="/trial-results" className="site-btn site-btn--outline" onClick={() => { googleAnalytics.trackButtonClick('results_menu', 'header'); closeMenu(); }} tabIndex={menuOpen ? 0 : -1}>Results</Link>
            <Link to="/register" className="site-btn site-btn--primary" onClick={() => { googleAnalytics.trackButtonClick('register_menu', 'header'); closeMenu(); }} tabIndex={menuOpen ? 0 : -1}>Registration</Link>
          </div>

          <div className="site-drawer__section">
            <span className="site-drawer__label">Language</span>
            <LanguageSelector mobile textColor="#0a1240" />
          </div>

          <div className="site-drawer__section">
            <span className="site-drawer__label">Follow us</span>
            <div className="site-drawer__social">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} tabIndex={menuOpen ? 0 : -1}>
                  <img src={s.icon} alt="" width={36} height={36} loading="lazy" />
                </a>
              ))}
            </div>
          </div>

          <div className="site-drawer__initiative">
            <span>An initiative by</span>
            <img src="/Our-Sponsors/rpl-logo-final.png" alt="Royal Peacocks League Limited" width={140} height={54} loading="lazy" />
          </div>
        </aside>
      </div>
    </>
  );
};

export default Header;
