import React from 'react';
import { Phone, Clock, MessageCircle, ArrowRight, ChevronDown } from 'lucide-react';
import './FAQContactSection.css';

const ART = '/assets/faq-section';

// Same live FAQ preview content as before.
const FAQS = [
  {
    q: 'How to register for SSPL T10?',
    a: "You can register online through our official website by clicking on the 'Register Now' button and filling in your details.",
  },
  {
    q: 'Where will the city trials be held?',
    a: "City trials are held across major cities in India. You can find the full schedule in the 'Trials' section of our website.",
  },
  {
    q: 'What is the age limit for participation?',
    a: 'The SSPL T10 is open to players from various age groups. Specific category details are available during the registration process.',
  },
];

/**
 * Homepage FAQ preview + support contact. Same live content, links and numbers as before, restyled to the brand guide:
 * light accordion on the left, navy "Any Questions" card with generated brush art on the right (tools/build-faq-assets.mjs).
 */
const FAQContactSection: React.FC = () => (
  <section className="faqx" id="faq-contact" aria-labelledby="faqx-title">
    <div className="brand-container faqx__grid">
      {/* FAQ preview */}
      <div className="faqx__faq">
        <header className="faqx__head">
          <h2 className="faqx__title" id="faqx-title">
            <picture>
              <source type="image/avif" srcSet={`${ART}/faq-title-full.avif`} />
              <img src={`${ART}/faq-title-full.webp`} alt="FAQ Preview" width={1203} height={539} loading="lazy" decoding="async" />
            </picture>
          </h2>
          <a href="/faqs" className="faqx__all">
            View all <ArrowRight size={18} aria-hidden="true" />
          </a>
        </header>

        <div className="faqx__list">
          {FAQS.map(({ q, a }, i) => (
            <details key={q} className="faqx__item" open={i === 0}>
              <summary>
                <span className="faqx__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="faqx__q">{q}</span>
                <ChevronDown className="faqx__chev" size={22} aria-hidden="true" />
              </summary>
              <p className="faqx__a">{a}</p>
            </details>
          ))}
        </div>

        <a href="/faqs" className="brand-btn brand-btn--outline faqx__btn">
          View all questions <ArrowRight size={20} aria-hidden="true" />
        </a>
      </div>

      {/* Contact support */}
      <aside className="faqx__contact" aria-labelledby="faqx-contact-title">
        <picture className="faqx__bg" aria-hidden="true">
          <source type="image/avif" srcSet={`${ART}/faq-contact-bg-640w.avif 640w, ${ART}/faq-contact-bg-1168w.avif 1168w`} sizes="(min-width: 1000px) 50vw, 100vw" />
          <source type="image/webp" srcSet={`${ART}/faq-contact-bg-640w.webp 640w, ${ART}/faq-contact-bg-1168w.webp 1168w`} sizes="(min-width: 1000px) 50vw, 100vw" />
          <img src={`${ART}/faq-contact-bg-1168w.webp`} alt="" width={1168} height={880} loading="lazy" decoding="async" />
        </picture>

        <div className="faqx__contact-body">
          <h2 className="faqx__cta-title" id="faqx-contact-title">
            <span>Any</span>
            <span className="faqx__cta-accent">Questions</span>
          </h2>
          <h3 className="faqx__cta-sub">Contact SSPL Support</h3>
          <p className="faqx__cta-text">Have questions about SSPL trials, registration, or participation? Our team is here to help.</p>

          <ul className="faqx__info">
            <li>
              <span className="faqx__ico" aria-hidden="true"><Phone size={22} /></span>
              <div>
                <span className="faqx__info-label">Customer care number</span>
                <a className="faqx__phone" href="tel:+918807775960">+91 880 777 5960</a>
              </div>
            </li>
            <li>
              <span className="faqx__ico" aria-hidden="true"><Clock size={22} /></span>
              <div>
                <span className="faqx__info-label">Working hours</span>
                <span className="faqx__days">Monday – Saturday</span>
                <span className="faqx__hours">11 AM – 8 PM</span>
              </div>
            </li>
          </ul>

          <a className="brand-btn brand-btn--primary faqx__wa" href="https://wa.me/918807775960" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} aria-hidden="true" /> Chat on WhatsApp
          </a>
        </div>
      </aside>
    </div>
  </section>
);

export default FAQContactSection;
