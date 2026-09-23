import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LanguageSelector = ({
  mobile = false,
  textColor = '#f8fbff',
}: {
  mobile?: boolean;
  textColor?: string;
}) => {
  const [lang, setLang] = useState('en');

  const languages = [
    { code: 'en', label: 'English', char: 'E' },
    { code: 'hi', label: 'Hindi', char: '\u0939' },
    { code: 'ta', label: 'Tamil', char: '\u0BA4' },
    { code: 'te', label: 'Telugu', char: '\u0C24' },
    { code: 'ml', label: 'Malayalam', char: '\u0D2E' },
    { code: 'kn', label: 'Kannada', char: '\u0C95' },
    { code: 'ur', label: 'Urdu', char: '\u0627' },
  ];

  useEffect(() => {
    const styleId = 'google-translate-custom-styles-v2';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc,
        .goog-te-gadget-icon,
        .goog-te-gadget-simple,
        #google_translate_element,
        #goog-gt-tt,
        #goog-gt-tt * {
          display: none !important;
        }
        .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
        body {
          top: 0px !important;
          margin-top: 0px !important;
          position: relative !important;
        }
        html {
          top: 0px !important;
        }
        body > div.skiptranslate:not(.goog-te-spinner-pos) {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    let currentLang = 'en';
    const googTrans = getCookie('googtrans');
    if (googTrans) {
      const parts = googTrans.split('/');
      if (parts.length > 2) currentLang = parts[2];
    }
    setLang(currentLang);

    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element',
          );
        }
      };

      const gtScript = document.createElement('script');
      gtScript.type = 'text/javascript';
      gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      gtScript.async = true;
      document.body.appendChild(gtScript);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setLang(value);

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;

    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/en/${value}; path=/`;
      document.cookie = `googtrans=/en/${value}; domain=.${window.location.hostname}; path=/`;
      window.location.reload();
    }
  };

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="flex flex-col" style={{ overflow: 'hidden' }}>
      <div id="google_translate_element" className="hidden" />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflow: 'hidden',
          padding: '2px 0',
          gap: isMobileScreen ? '7px' : '3px',
          justifyContent: mobile ? 'flex-start' : (isMobileScreen ? 'flex-start' : 'center'),
          marginLeft: mobile ? '4px' : '0px',
        }}
      >
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleLanguageChange(l.code)}
            title={l.label}
            translate="no"
            className={cn(
              'notranslate font-bold transition-colors',
              lang === l.code ? 'font-extrabold relative z-10' : 'opacity-70 hover:opacity-100',
            )}
            style={{
              fontSize: mobile ? '14px' : (isMobileScreen ? '12px' : '13px'),
              padding: '2px 0',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transform: lang === l.code ? 'scale(1.07)' : 'none',
              minWidth: 0,
              minHeight: 0,
              color: textColor,
            }}
          >
            <span className="notranslate" translate="no" style={{ whiteSpace: 'nowrap', color: 'inherit' }}>
              {l.char}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
