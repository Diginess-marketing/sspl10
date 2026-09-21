import React from 'react';
import './HeroBanner.css';

interface HeroBannerProps {
  /** Photo layer. Replace the file at this path to swap the hero image (keep the 1342:474 aspect ratio). */
  backgroundSrc?: string;
  /** Where the "Watch the journey" control goes (video section, YouTube link, etc.). */
  watchHref?: string;
  onWatchClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Homepage hero, built on a 1342 x 474 design canvas. Every measurement in HeroBanner.css is
 * expressed in canvas pixels and scaled with container-query units, so the hero stays
 * proportionally identical at any viewport width.
 */
const HeroBanner: React.FC<HeroBannerProps> = ({
  backgroundSrc = '/assets/hero/hero-bg.png',
  watchHref = '#watch-the-journey',
  onWatchClick,
}) => (
  <section className="hero-banner" aria-label="SSPL T10 introduction">
    <div className="hero-banner__stage">
      {/* Photo + brush art layer (desktop: fills the canvas; mobile: cropped block under the copy) */}
      <div className="hero-banner__art" aria-hidden="true">
        <img className="hero-banner__bg" src={backgroundSrc} alt="" width={1342} height={474} {...{ fetchpriority: 'high' }} decoding="async" />
        <img className="hero-banner__swoosh" src="/assets/hero/hero-swoosh.png" alt="" width={342} height={314} decoding="async" />
        <img className="hero-banner__script" src="/assets/hero/hero-script.png" alt="" width={156} height={174} decoding="async" />
      </div>

      <div className="hero-banner__copy">
        {/* Real heading for screen readers / SEO; the visible lettering is decorative to avoid global h1 styles */}
        <h1 className="hero-banner__sr">From the street. To the stage. India&rsquo;s Grassroots Cricket Movement. Real Players. Real Stories. Bigger Dreams.</h1>

        <div className="hero-banner__title" aria-hidden="true">
          <span className="hero-banner__line1">From the street.</span>
          <img className="hero-banner__stage-title" src="/assets/hero/hero-stage-title.png" alt="" width={650} height={152} decoding="async" />
        </div>

        <p className="hero-banner__tagline" aria-hidden="true">India&rsquo;s Grassroots Cricket Movement</p>

        <a className="hero-banner__watch" href={watchHref} onClick={onWatchClick}>
          <span className="hero-banner__play" aria-hidden="true">
            <svg viewBox="0 0 57 57" focusable="false">
              <path d="M22.5 17.5v22l19-11z" fill="#f2f4fa" />
            </svg>
          </span>
          <span className="hero-banner__watch-label">Watch the journey</span>
          <svg className="hero-banner__arrow" viewBox="0 0 47 11" aria-hidden="true" focusable="false">
            <path d="M0.7 5.5h45.6M41 0.8l5.3 4.7-5.3 4.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  </section>
);

export default HeroBanner;
