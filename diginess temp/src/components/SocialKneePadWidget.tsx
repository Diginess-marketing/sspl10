import { useLocation } from 'react-router-dom';
import { SOCIALS } from '@/components/FooterSection';
import './SocialKneePadWidget.css';

// Same 5 primary channels as the footer/header drawer, just the compact set for this widget
const PRIMARY = SOCIALS.filter((s) =>
  ['Facebook', 'Instagram', 'X (Twitter)', 'YouTube', 'LinkedIn'].includes(s.label),
);

const SocialKneePadWidget = () => {
  const { pathname } = useLocation();
  // Not on the admin panel, where it covers table actions
  if (pathname.startsWith('/admin')) return null;

  return (
    <aside className="knee-widget" aria-label="Follow SSPL on social media">
      <div className="knee-widget__pad">
        <ul className="knee-widget__list">
          {PRIMARY.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <img src={s.icon} alt="" width={22} height={22} loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SocialKneePadWidget;
