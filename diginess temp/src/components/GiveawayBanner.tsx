import React from 'react';
import { UserPlus, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import './GiveawayBanner.css';

const ART = '/assets/giveaway';

const STEPS = [
  { icon: UserPlus, title: 'Follow', text: 'Follow our page' },
  { icon: ThumbsUp, title: 'Like', text: 'Like our posts' },
  { icon: MessageCircle, title: 'Comment', text: 'Comment on the content' },
  { icon: Share2, title: 'Share', text: 'Share with your friends' },
];

interface PicProps {
  name: string;
  widths: number[];
  sizes: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}

const Pic: React.FC<PicProps> = ({ name, widths, sizes, alt, className, width, height }) => {
  const set = (ext: string) => widths.map((w) => `${ART}/${name}-${w}w.${ext} ${w}w`).join(', ');
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img src={`${ART}/${name}-${widths[widths.length - 1]}w.webp`} srcSet={set('webp')} sizes={sizes} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </picture>
  );
};

/**
 * Homepage "SSPL T10 Mega Engagement Giveaway" banner. Replaces the flat voucher_banner.jpg with a
 * layered section: user-supplied stadium background, title art, grand-prize card and "how to win" heading;
 * the four steps and the Linktree QR (same link/QR as the footer) are live HTML.
 */
const GiveawayBanner: React.FC = () => (
  <section className="gwy" id="giveaway" aria-labelledby="gwy-title">
    <div className="gwy__card">
      <Pic name="giveaway-bg" widths={[768, 1280, 1672]} sizes="(min-width: 1480px) 1480px, 100vw" alt="" className="gwy__bg" width={1672} height={941} />

      <h2 className="gwy__title" id="gwy-title">
        <Pic name="giveaway-title" widths={[480, 768]} sizes="(min-width: 1100px) 340px, 300px" alt="SSPL T10 Mega Engagement Giveaway" width={1209} height={1300} />
      </h2>
      <p className="gwy__tag" aria-hidden="true">#GullyCricketKingdom</p>

      <div className="gwy__prize">
        <Pic name="giveaway-prize" widths={[480, 768]} sizes="(min-width: 1100px) 380px, 320px" alt="Grand prize: ₹10,000 cash prize" width={1244} height={1264} />
      </div>

      <div className="gwy__how">
        <div className="gwy__steps-wrap">
          <Pic name="giveaway-how-to-win" widths={[480, 768, 1024]} sizes="(min-width: 1100px) 400px, 300px" alt="How to win?" className="gwy__how-title" width={2171} height={724} />
          <ul className="gwy__steps">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="gwy__step">
                <span className="gwy__ico"><Icon size={22} strokeWidth={2.2} aria-hidden="true" /></span>
                <span className="gwy__step-txt"><b>{title}</b>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <a className="gwy__qr" href="https://linktr.ee/SSPLT10" target="_blank" rel="noopener noreferrer" aria-label="Follow us on social media — scan or tap the QR code">
          <span className="gwy__qr-head">Follow us on social media</span>
          <img src="/images/linktree-qr.png" alt="QR code to follow SSPL T10 on social media" width={150} height={150} loading="lazy" decoding="async" />
          <span className="gwy__qr-foot">Scan &amp; Follow</span>
        </a>
      </div>

      <p className="gwy__more">More likes, more comments, more shares = more chance to win</p>
    </div>
  </section>
);

export default GiveawayBanner;
