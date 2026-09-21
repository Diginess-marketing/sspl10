
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import './FooterSection.css';
import SSPLWordmark from '@/components/SSPLWordmark';

const FooterSection = () => {
  return (
    <footer
      id="contact"
      className="footer-sporty footer-animate-in border-t border-navy/10 relative overflow-hidden font-body"
      style={{ backgroundColor: '#ffffff', minHeight: '400px' }}
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Background Watermark */}
      <img src="/images/rpl blue logo.png" alt="" className="footer-watermark" aria-hidden="true" />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="space-y-4 flex flex-col items-start">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src="/blue-logo.png" 
                alt="SSPL Blue Logo" 
                className="w-28 h-28 md:w-36 md:h-36 object-contain" 
              />
              <div>
                <div className="footer-heading text-xl md:text-2xl font-black text-left font-heading uppercase tracking-wider text-[#000080]">SSPL T10</div>
                <p className="text-[#000080]/70 text-base font-heading font-semibold tracking-wide uppercase text-left">Cricket League</p>
              </div>
            </div>
            <p className="footer-body text-base font-body font-medium leading-relaxed max-w-sm text-left text-[#000080]/85">
              The ultimate T10 tennis ball cricket league bringing together the best talent from around the globe.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4 pt-4 justify-start items-center">
              {[
                { href: 'https://www.facebook.com/profile.php?id=61579163954407', img: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', label: 'Facebook' },
                { href: 'https://x.com/ssplt10/', img: 'https://cdn.simpleicons.org/x/000080', label: 'Twitter' },
                { href: 'https://instagram.com/ssplt10', img: 'https://cdn-icons-png.flaticon.com/512/733/733558.png', label: 'Instagram' },
                { href: 'https://www.youtube.com/@Southernstreetpremierleague', img: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', label: 'YouTube' },
                { href: 'https://www.linkedin.com/company/ssplt10/posts/?feedView=all', img: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', label: 'LinkedIn' },
                { href: 'https://sharechat.com/profile/ssplt10?d=n', img: '/assets/img/social-media-share chat.png', label: 'ShareChat' },
                { href: 'https://mojapp.in/@ssplt10?referrer=V8q0NIm-1fORME9', img: '/assets/img/social-media-moj.png', label: 'Moj' },
                { href: 'https://linktr.ee/SSPLT10', img: 'https://cdn.simpleicons.org/linktree/43E660', label: 'Linktree' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-12 h-12 rounded-full bg-[#000080]/5 border border-[#000080]/10 flex items-center justify-center hover:bg-[#000080]/10 hover:shadow-md transition-all group"
                >
                  <img src={social.img} alt={social.label} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>

            {/* QR Code */}
            <div className="mt-4 p-3 bg-gray-50 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 flex flex-col items-center mx-auto md:mx-0 w-fit">
              <img src="/images/linktree-qr.png" alt="Scan to visit Linktree" className="w-32 h-32 object-contain bg-white rounded p-1" />
              <p className="text-[12px] text-center text-[#000080]/75 mt-2 font-black uppercase tracking-widest">Scan to Connect</p>
            </div>
          </div>

          <div className="space-y-4 flex flex-col items-start pl-0 md:pl-8">
            <div className="footer-heading text-xl mb-4 text-left font-heading uppercase tracking-wider text-[#000080]">Contact Info</div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 justify-start">
                <MapPin className="footer-contact-icon w-5 h-5 mt-1 shrink-0 text-[#000080]" />
                <address className="footer-contact-text font-body font-medium not-italic text-base text-left text-[#000080]/85">
                  Royal Peacocks League Limited
                  <br />
                  Courtyard by Marriott, 1st Floor,
                  <br />
                  No.564, Anna Salai, Teynampet,
                  <br />
                  Tamilnadu Chennai - 600018
                </address>
              </div>
              <div className="flex items-center space-x-4 justify-start text-[#000080]/85">
                <Phone className="footer-contact-icon w-5 h-5 shrink-0 text-[#000080]" />
                <a href="tel:+918807775960" className="footer-contact-text font-body font-medium text-base text-left hover:text-[#CCFF00] transition-colors">
                  +91 88077 75960
                </a>
              </div>
              <div className="flex items-center space-x-4 justify-start text-[#000080]/85">
                <Mail className="footer-contact-icon w-5 h-5 shrink-0 text-[#000080]" />
                <a href="mailto:customercare@ssplt10.co.in" className="footer-contact-text font-body font-medium text-base text-left hover:text-[#CCFF00] transition-colors">
                  customercare@ssplt10.co.in
                </a>
              </div>
            </div>
          </div>

          {/* Social Nav Columns */}
          <div className="space-y-4 flex flex-col items-start pl-0">
            <div className="footer-heading text-xl mb-4 text-left font-heading uppercase tracking-wider text-[#000080]">Tournament</div>
            <nav className="w-full text-left">
              <ul className="space-y-3 text-left w-full">
                <li><Link to="/register" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Player Registration</Link></li>
                <li><Link to="/how-it-works" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">How It Works</Link></li>
                <li><Link to="/articles-blogs" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">News & Blog</Link></li>
                <li><Link to="/enquiry" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Enquiry</Link></li>
                <li><Link to="/faqs" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">FAQs</Link></li>
                <li><Link to="/register-selector" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Selectors Registration</Link></li>
                <li><Link to="/tournament-organizer-registration" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Tournament Organizers</Link></li>
              </ul>
            </nav>
          </div>

          <div className="space-y-4 flex flex-col items-start pl-0">
            <div className="footer-heading text-xl mb-4 text-left font-heading uppercase tracking-wider text-[#000080]">Policies</div>
            <nav className="w-full text-left">
              <ul className="space-y-3 text-left w-full">
                <li><Link to="/cancellation-refund-policy" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Cancellation & Refund</Link></li>
                <li><Link to="/dugout-code-of-conduct" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Dugout Code of Conduct</Link></li>
                <li><Link to="/commercial-guidelines" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Commercial Guidelines</Link></li>
                <li><Link to="/terms-and-conditions" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Terms & Conditions</Link></li>
                <li><Link to="/privacy-policy" className="footer-link font-body font-semibold text-base text-[#000080]/85 hover:text-[#CCFF00] hover:underline">Privacy Policy</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="footer-bottom bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-[#000080]/75">
            <div className="footer-copyright text-body font-body text-center sm:text-left text-sm w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <img src="/blue-logo.png" alt="SSPL Logo" className="h-14 w-auto object-contain" />
                <span className="font-bold">© Copy Rights Reserved: SSPLT10</span>
              </div>
              <span className="hidden sm:inline text-gray-200">|</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">All Rights Reserved: Royal Peacocks League Limited</span>
                <img src="/images/rpl blue logo.png" alt="Royal Peacocks Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default FooterSection;
