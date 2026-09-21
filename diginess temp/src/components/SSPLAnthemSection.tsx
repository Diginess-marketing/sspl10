import React from 'react';
import LiteYouTube from '@/components/LiteYouTube';
import './SSPLAnthemSection.css';

const ART = '/assets/anthem';

/**
 * Homepage "SSPL T10 Anthem" band. Same live content (heading, tagline, anthem video, "Official Sound of Victory").
 * Art is AI-generated (Higgsfield gpt_image_2_5): brush lettering for the title + a light stadium backdrop; see tools/build-anthem-assets.mjs.
 */
const SSPLAnthemSection: React.FC = () => (
  <section className="anth" id="anthem" aria-labelledby="anth-title">
    <picture className="anth__bg" aria-hidden="true">
      <source type="image/avif" srcSet={`${ART}/anthem-bg-768w.avif 768w, ${ART}/anthem-bg-1344w.avif 1344w`} sizes="100vw" />
      <source type="image/webp" srcSet={`${ART}/anthem-bg-768w.webp 768w, ${ART}/anthem-bg-1344w.webp 1344w`} sizes="100vw" />
      <img src={`${ART}/anthem-bg-1344w.webp`} alt="" width={1344} height={752} loading="lazy" decoding="async" />
    </picture>

    <div className="brand-container anth__wrap">
      <header className="anth__head">
        <h2 className="anth__title" id="anth-title">
          <picture>
            <source type="image/avif" srcSet={`${ART}/anthem-title-full.avif`} />
            <img src={`${ART}/anthem-title-full.webp`} alt="SSPL T10 Anthem" width={1057} height={519} loading="lazy" decoding="async" />
          </picture>
        </h2>
        <p className="anth__lead">Feel the heartbeat of the league. The rhythm of glory.</p>
      </header>

      <div className="anth__player">
        <div className="anth__video">
          <LiteYouTube id="QrBQAv3D1cU" title="SSPL T10 Official Anthem" className="rounded-2xl" />
        </div>
      </div>

      <p className="anth__badge">
        <span className="anth__bars" aria-hidden="true"><i /><i /><i /><i /></span>
        Official Sound of Victory
      </p>
    </div>
  </section>
);

export default SSPLAnthemSection;
