import './NavCricketIcon.css';

/**
 * Tiny bat + ball glyph shown next to each nav link. Idle by default; on hover/focus
 * of the parent nav item (.nav-cricket-icon is a sibling, parent gets .group / :hover)
 * the bat swings and the ball hops, via NavCricketIcon.css.
 */
const NavCricketIcon = () => (
  <span className="nav-cricket-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" className="nav-cricket-icon__bat">
      <path
        d="M6.5 17.5 15 9c1-1 1-2.5 0-3.5S12.5 4.5 11.5 5.5L3 14l3.5 3.5Z"
        fill="currentColor"
      />
      <rect x="2.2" y="15.8" width="4" height="4" rx="1" transform="rotate(-45 4.2 17.8)" fill="currentColor" opacity="0.85" />
    </svg>
    <svg viewBox="0 0 24 24" className="nav-cricket-icon__ball">
      <circle cx="12" cy="12" r="5" fill="var(--brand-lime, #dffc35)" />
      <path d="M8 9c1.5 1 1.5 5 0 6M16 9c-1.5 1-1.5 5 0 6" stroke="#0a1240" strokeWidth="0.8" fill="none" />
    </svg>
  </span>
);

export default NavCricketIcon;
