import { Link, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { SITE_NAV, findNavLink } from '@/config/siteNav';

// Shared page for every menu link whose page isn't built yet (see src/config/siteNav.ts)
const ComingSoon = () => {
  const { pathname } = useLocation();
  const link = findNavLink(pathname);
  const title = link?.label ?? 'Coming Soon';
  const section = SITE_NAV.find((s) => s.label === link?.section);
  const available = (section?.children ?? []).filter((c) => !c.comingSoon && c.to !== pathname);

  return (
    <div className="min-h-[70vh] bg-[#001b69] relative z-10 flex items-center">
      <section className="w-full max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
        {link?.section && (
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#dffc35' }}>
            {link.section}
          </p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold uppercase text-white mb-6">{title}</h1>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-6">
          <Clock className="h-4 w-4 text-[#dffc35]" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>Coming Soon</span>
        </div>

        <p className="text-base md:text-lg max-w-xl mx-auto mb-10" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          We're putting this page together. Check back soon for the latest from the Southern Street Premier League.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link to="/" className="site-btn site-btn--light">Back to Home</Link>
          <Link to="/register" className="site-btn site-btn--primary">Register Now</Link>
        </div>

        {available.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Available in {link?.section}
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              {available.map((c) => (
                <li key={c.to}>
                  <Link
                    to={c.to}
                    className="inline-block rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default ComingSoon;
