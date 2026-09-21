import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { googleAnalytics } from '@/utils/googleAnalytics';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/hooks/useAuth';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, clearAuthState } = useAuth();
  
  // Only show auth options if running inside the Android App WebView
  const isAndroidApp = navigator.userAgent.includes('SSPL-Android-App');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;

        // Hysteresis to avoid jitter around the threshold.
        setScrolled((prev) => {
          if (!prev && y > 56) return true;
          if (prev && y < 20) return false;
          return prev;
        });

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHomepage = location.pathname === '/';
  const isResultsPage = location.pathname === '/trial-results';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className={`header ${scrolled ? 'fixedTop' : ''}`}>
      {/* Top Header */}
      <div className="tpHeader">
        <div className="tpRightSide">
          <LanguageSelector textColor="#1f2937" />
        </div>
        <div className="tpLeftSide">
          <div className="socialBox">
            <div className="socialIcon">
              <a href="https://www.facebook.com/share/p/1Fk3RpvGMW/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-F.png" alt="Facebook" />
              </a>
              <a href="https://x.com/ssplt10/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-X.png" alt="X" />
              </a>
              <a href="https://instagram.com/ssplt10" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-inst.png" alt="Instagram" />
              </a>
              <a href="https://www.youtube.com/@Southernstreetpremierleague" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-you.png" alt="Youtube" />
              </a>
              <a href="https://www.linkedin.com/company/ssplt10/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-in.png" alt="LinkedIn" />
              </a>
              <a href="https://sharechat.com/profile/ssplt10?d=n" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-share chat.png" alt="ShareChat" />
              </a>
              <a href="https://mojapp.in/@ssplsouthern?referrer=V7hedHR-1fORME9" target="_blank" rel="noopener noreferrer">
                <img src="/assets/img/social-media-moj.png" alt="Moj" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Strip */}
      <div className="headerInner">
        <div className="headerLogo">
          <Link to="/" onClick={closeMobileMenu} aria-label="Go to homepage">
            <img className="dilLogo" src="/logo.png" alt="SSPL Logo" />
          </Link>
        </div>

        <nav className={`headerNav ${mobileMenuOpen ? 'activeMenu' : ''}`}>
          <div className="headerNabBox">
            <ul className="navUlBox">
                <li className="navLiItem">
                <Link to="/" className={isHomepage ? 'activeMenu' : ''} onClick={closeMobileMenu}>
                    <img className="homeIcon" src="/assets/img/home.png" alt="Home" />
                </Link>
                </li>
                
                <li className="navLiItem navDropdownC">
                <Link to="/about-us" onClick={closeMobileMenu}>About Us</Link><i className="fa-solid fa-angle-down"></i>
                <div className="subMenubox">
                    <ul className="submenuArea">
                    <li className="navLiItemSub"><Link to="/about-us" onClick={closeMobileMenu}>About Us</Link></li>
                    <li className="navLiItemSub"><Link to="/how-it-works" onClick={closeMobileMenu}>How It Works</Link></li>
                    <li className="navLiItemSub"><Link to="/articles-blogs" onClick={closeMobileMenu}>Blogs</Link></li>
                    <li className="navLiItemSub"><Link to="/videos" onClick={closeMobileMenu}>Videos</Link></li>
                    <li className="navLiItemSub"><Link to="/enquiry" onClick={closeMobileMenu}>Enquiry</Link></li>
                    <li className="navLiItemSub"><Link to="/faqs" onClick={closeMobileMenu}>FAQs</Link></li>
                    </ul>
                </div>
                </li>

                <li className="navLiItem navDropdownC">
                <Link to="/register-selector" onClick={closeMobileMenu}>Associates</Link><i className="fa-solid fa-angle-down"></i>
                <div className="subMenubox">
                    <ul className="submenuArea">
                    <li className="navLiItemSub"><Link to="/register-selector" onClick={closeMobileMenu}>Selectors Registration</Link></li>
                    <li className="navLiItemSub">
                        <Link to="/tournament-organizer-registration" onClick={() => {
                            closeMobileMenu();
                            googleAnalytics.trackButtonClick('header_tournament_organizer', 'header');
                        }}>
                            Tournament Organizers
                        </Link>
                    </li>
                    </ul>
                </div>
                </li>

                <li className="navLiItem">
                <Link to="/enquiry" onClick={closeMobileMenu}>Contact Us</Link>
                </li>

                {/* Only render auth options if inside the Android App */}
                {isAndroidApp && (
                  user ? (
                    <li className="navLiItem navDropdownC">
                      <Link to="/dashboard" onClick={closeMobileMenu}>My Profile</Link><i className="fa-solid fa-angle-down"></i>
                      <div className="subMenubox">
                          <ul className="submenuArea">
                            <li className="navLiItemSub"><Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link></li>
                            <li className="navLiItemSub">
                              <a href="#" onClick={(e) => { 
                                  e.preventDefault(); 
                                  closeMobileMenu();
                                  // Aggressively clear local and session storage synchronously
                                  try {
                                    Object.keys(localStorage).forEach(key => {
                                      if (key.startsWith('sb-') || key.includes('supabase')) {
                                        localStorage.removeItem(key);
                                      }
                                    });
                                    Object.keys(sessionStorage).forEach(key => {
                                      if (key.startsWith('sb-') || key.includes('supabase')) {
                                        sessionStorage.removeItem(key);
                                      }
                                    });
                                  } catch(err) {}

                                  // Force redirect after 500ms even if clearAuthState hangs
                                  setTimeout(() => { window.location.href = '/'; }, 500);
                                  clearAuthState().finally(() => {
                                      window.location.href = '/'; 
                                  });
                              }}>Sign Out</a>
                            </li>
                          </ul>
                      </div>
                    </li>
                  ) : (
                    <li className="navLiItem">
                      <Link to="/auth" onClick={closeMobileMenu}>Sign In</Link>
                    </li>
                  )
                )}
            </ul>
          </div>
        </nav>

        <div className="rightSideMenu">
          <div className="loginRegisterMobile">
            <Link 
              to="/trial-results" 
              className="mobileActionBtn mobileResultsBtn"
              onClick={() => googleAnalytics.trackButtonClick('results_mobile', 'header')}
            >
              Results
            </Link>
            <Link 
              to="/register" 
              className="mobileActionBtn mobileRegisterBtn"
              onClick={() => googleAnalytics.trackButtonClick('register_mobile', 'header')}
            >
              Register
            </Link>
          </div>

          <div className="loginRegisterB loginRegisterDesktop">
            <Link to="/register" onClick={() => googleAnalytics.trackButtonClick('register_now', 'header')}>
              <img className="loginRegisterIcon registerIcon" src="/assets/img/person.png" alt="" />
              <span className="registerText">Registration</span>
            </Link>
            
            <Link
              to="/trial-results"
              className={isResultsPage ? 'activeAction' : ''}
              onClick={() => googleAnalytics.trackButtonClick('results', 'header')}
            >
              <span className="loginText">Results</span>
            </Link>
          </div>

          <div className="searchBars">
            <button type="button" className="bars" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
                {mobileMenuOpen ? <X size={25} color="white" /> : (
                <>
                    <span className="bar1"></span>
                    <span className="bar2"></span>
                    <span className="bar3"></span>
                </>
                )}
            </button>
          </div>
        </div>

        <div className="organizerLogo">
          <p>An initiative by</p>
          <img src="/Our-Sponsors/rpl-logo-final.png" alt="Royal Peacocks" />
        </div>
      </div>
    </div>
  );
};

export default Header;
