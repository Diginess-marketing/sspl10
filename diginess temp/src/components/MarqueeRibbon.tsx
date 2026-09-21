import { Mail, Phone, MessageCircle } from 'lucide-react';
import './MarqueeRibbon.css';

const MarqueeRibbon = () => {
  const contactInfo = [
    {
      icon: Mail,
      text: 'Email: customercare@ssplt10.co.in',
      type: 'email',
    },
    {
      icon: Phone,
      text: 'Phone: +91 88077 75960',
      type: 'phone',
    },
    {
      icon: MessageCircle,
      text: 'WhatsApp: +91 88077 75960 (Support: 10:00 AM - 07:00 PM)',
      type: 'whatsapp',
    },
  ];

  return (
    <div className="marquee-ribbon-container bg-[#C1E303] text-black py-1 px-4 overflow-hidden font-bold">
      <div className="marquee-scroll-content">
        <div className="marquee-track">
          {/* First set of contact info */}
          {contactInfo.map((info, index) => (
            <div key={`first-${index}`} className="marquee-item">
              <info.icon className="w-2 h-2 shrink-0" />
              <span className="marquee-ribbon-text">{info.text}</span>
            </div>
          ))}

          {/* Duplicate set for seamless scrolling */}
          {contactInfo.map((info, index) => (
            <div key={`second-${index}`} className="marquee-item">
              <info.icon className="w-2 h-2 shrink-0" />
              <span className="marquee-ribbon-text">{info.text}</span>
            </div>
          ))}

          {/* Third set for extra smooth loop */}
          {contactInfo.map((info, index) => (
            <div key={`third-${index}`} className="marquee-item">
              <info.icon className="w-2 h-2 shrink-0" />
              <span className="marquee-ribbon-text">{info.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeRibbon;