import React from 'react';
import { Link } from 'react-router-dom';

const GrandFinalBanner = () => {
    return (
        <section className="w-full bg-sspl-navy">
            <Link to="/register" className="block w-full max-w-[1400px] mx-auto hover:opacity-95 transition-opacity">
                <picture>
                    <source
                        srcSet={`
              /assets/banners/sharjah-grand-final-480w.avif 480w,
              /assets/banners/sharjah-grand-final-768w.avif 768w,
              /assets/banners/sharjah-grand-final.avif 1080w
            `}
                        type="image/avif"
                    />
                    <source
                        srcSet={`
              /assets/banners/sharjah-grand-final-480w.webp 480w,
              /assets/banners/sharjah-grand-final-768w.webp 768w,
              /assets/banners/sharjah-grand-final.webp 1080w
            `}
                        type="image/webp"
                    />
                    <img
                        src="/assets/banners/sharjah-grand-final.webp"
                        alt="Grand Final in Sharjah - Prize Money upto 3 Crores"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        width="1280"
                        height="213"
                        style={{ minHeight: '50px', backgroundColor: '#001b69' }}
                    />
                </picture>
            </Link>
        </section>
    );
};

export default GrandFinalBanner;
