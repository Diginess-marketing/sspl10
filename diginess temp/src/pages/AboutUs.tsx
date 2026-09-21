import React from 'react';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { Trophy, Target, User } from 'lucide-react';
import './AboutUs.css';

const ABOUT_ART = '/assets/about-section';

interface TeamMember {
    name: string;
    role: string;
    subRole?: string;
    bio: string;
    image?: string;
}

// The supplied portraits are 1920px canvases with a black frame baked in; tools/build-team-assets.mjs writes tight square crops to /Team-Advisors/sq/.
const SQ_PHOTOS = new Set(['Nawab', 'ravi-mohan', 'Lt-anand', 'Dilip-Narayanan', 'cp-rao', 'Pugazhendi', 'Adv-Sheela']);
const squareBase = (src?: string) => {
    const m = src?.match(/^\/Team-Advisors\/([^/]+)\.avif$/);
    return m && SQ_PHOTOS.has(m[1]) ? `/Team-Advisors/sq/${m[1]}` : null;
};

const MemberCard = ({ member, compact = false }: { member: TeamMember; compact?: boolean }) => {
    const base = squareBase(member.image);
    const sizes = compact ? '(min-width: 1000px) 22vw, (min-width: 640px) 44vw, 92vw' : '(min-width: 1000px) 30vw, (min-width: 640px) 44vw, 92vw';
    return (
        <li className={`brand-card abt-member${compact ? ' abt-member--compact' : ''}`}>
            <div className="abt-member__photo">
                {base ? (
                    <picture>
                        <source type="image/avif" srcSet={`${base}-480w.avif 480w, ${base}-880w.avif 880w`} sizes={sizes} />
                        <source type="image/webp" srcSet={`${base}-480w.webp 480w, ${base}-880w.webp 880w`} sizes={sizes} />
                        <img src={`${base}-880w.webp`} alt={member.name} width={880} height={880} loading="lazy" decoding="async" />
                    </picture>
                ) : member.image ? (
                    <img src={member.image} alt={member.name} loading="lazy" decoding="async" />
                ) : (
                    <span className="abt-member__ph" aria-hidden="true"><User size={56} strokeWidth={1.6} /></span>
                )}
            </div>
            <div className="abt-member__body">
                <h3 className="brand-h3">{member.name}</h3>
                <p className="brand-label abt-member__role">{member.role}</p>
                {member.subRole && <p className="brand-body abt-member__sub">{member.subRole}</p>}
                <p className="brand-body abt-member__bio">{member.bio}</p>
            </div>
        </li>
    );
};

const AboutUs = () => {
    const { getContent } = useWebsiteContent();
    const dbContent = getContent('about');

    // Default content provided by user
    const content = {
        title: dbContent.title || "One Nation United",
        tagline: dbContent.tagline || "Together We Play, Together We Rise.",
        description: dbContent.description || `
            <p class="mb-4">A revolutionary T-10 tennis ball cricket tournament that aims to bring the passion of street cricket to professional stadiums.</p>
            <p>A unique format and emphasis to provide a mega platform to untapped talent and foster future cricketing stars. Revolutionizing tennis ball cricket league using patented technology at the selections.</p>
        `,
        heroImage: dbContent.heroImage || "/image_30.png",
        vision: dbContent.vision || "Elevate the potential of street cricket to form the next generation of game-changers. Officially standardize gully cricket and take it to next level.",
        mission: dbContent.mission || "Scouting street champs. Launching future stars.",
        committee: dbContent.committee || [
            {
                name: "Nawabzada Mohammed Asif Ali",
                role: "CHAIRMAN",
                subRole: "Dewan to the Prince of Arcot",
                bio: "A philanthropist and a passionate cricketer. Nawabzada sees the league as a platform offering opportunities to cricket enthusiasts across South India and as an evolution of the T10 cricket format.",
                image: "/Team-Advisors/Nawab.avif"
            },
            {
                name: "Mr. Ravi Mohan",
                role: "STAR PATRON",
                subRole: "Indian Actor / Passionate Cricketer",
                bio: "He strengthens the league's vision of merging sports, entertainment, and culture to create a one-of-a-kind cricketing experience.",
                image: "/Team-Advisors/ravi-mohan.avif"
            },
            {
                name: "Loganathan Thangapazham Anand",
                role: "MANAGING DIRECTOR",
                subRole: "",
                bio: "A core part of the league's leadership, he brings decades of expertise in finance, governance, and strategy. His insight ensures stability, compliance, and sustained growth, making him vital to the league's long-term success.",
                image: "/Team-Advisors/Lt-anand.avif"
            }
        ],
        advisors: dbContent.advisors || [
            {
                name: "Dilip Narayanan",
                role: "Strategic Advisor",
                bio: "Senior corporate executive with extensive experience in strategic planning, business development, and organizational leadership across diverse industries.",
                image: "/Team-Advisors/Dilip-Narayanan.avif"
            },
            {
                name: "Mr. C.P.Rao",
                role: "Former Principal Chief Commissioner, GST & Customs",
                subRole: "Vice Chairman, Settlement Commission (Retd.)",
                bio: "Veteran IRS officer with leadership roles across key Government of India departments. Expert in public affairs, fiscal policy, and regulatory administration.",
                image: "/Team-Advisors/cp-rao.avif"
            },
            {
                name: "Mr.Puhazhendi Kaliyappan",
                role: "Advisor",
                bio: "Former Quality Leader, South Asia at GE Healthcare and SVP, Global Operations at Standard Chartered Bank. Brings extensive global experience in business process and program management.",
                image: "/Team-Advisors/Pugazhendi.avif"
            },
            {
                name: "Adv Sheela",
                role: "Legal Advisor",
                bio: "Experienced legal professional providing strategic legal counsel and ensuring compliance across all league operations and activities.",
                image: "/Team-Advisors/Adv-Sheela.avif"
            }
        ]
    };

    const titleWords = String(content.title).trim().split(/\s+/);
    const titleAccent = titleWords.length > 1 ? titleWords.pop() : '';
    const titleRest = titleWords.join(' ');

    return (
        <>
            {/* Hero band (redesigned) */}
            <section className="brand-section brand-section--tint abt-hero" aria-labelledby="abt-title">
                <div className="brand-container abt-hero__grid">
                    <header className="abt-hero__copy">
                        <p className="abt-hero__kicker">
                            <picture>
                                <source type="image/avif" srcSet={`${ABOUT_ART}/about-title-full.avif`} />
                                <img src={`${ABOUT_ART}/about-title-full.webp`} alt="About Us" width={1193} height={454} decoding="async" />
                            </picture>
                        </p>
                        <h1 className="brand-h2 abt-hero__title" id="abt-title">
                            {titleAccent ? (
                                <>
                                    <span className="abt-hero__line">{titleRest}</span>
                                    <span className="abt-hero__line"><span className="brand-accent abt-hero__accent">{titleAccent}</span></span>
                                </>
                            ) : content.title}
                        </h1>
                        {content.tagline && <p className="brand-lead abt-hero__lead">{content.tagline}</p>}
                        <div className="brand-body abt-hero__desc" dangerouslySetInnerHTML={{ __html: content.description }} />
                    </header>

                    <figure className="abt-hero__motto">
                        <picture>
                            <source type="image/avif" srcSet="/ourMoto-480w.avif 480w, /ourMoto.avif 700w" sizes="(min-width: 1000px) 45vw, 92vw" />
                            <source type="image/webp" srcSet="/ourMoto-480w.webp 480w, /ourMoto.webp 700w" sizes="(min-width: 1000px) 45vw, 92vw" />
                            <img src="/ourMoto.webp" alt="One Nation One Sport - a 2.5 billion global family" width={700} height={467} decoding="async" />
                        </picture>
                    </figure>
                </div>
            </section>

            {/* Vision & Mission (redesigned) */}
            <section className="brand-section abt-vm" aria-label="Vision and mission">
                <div className="brand-container">
                    <ul className="abt-vm__grid">
                        {[
                            { icon: Target, title: 'Our Vision', text: content.vision },
                            { icon: Trophy, title: 'Our Mission', text: content.mission },
                        ].map(({ icon: Icon, title, text }) => (
                            <li key={title} className="brand-card abt-vm__card">
                                <span className="abt-vm__ico" aria-hidden="true"><Icon size={28} strokeWidth={2.1} /></span>
                                <h2 className="brand-h3 abt-vm__title">{title}</h2>
                                <p className="brand-body abt-vm__text">{text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Core Committee (redesigned) */}
            <section className="brand-section brand-section--tint abt-team" aria-labelledby="abt-committee-title">
                <div className="brand-container">
                    <header className="abt-team__head">
                        <h2 className="brand-h2" id="abt-committee-title">
                            <span className="abt-hero__line">Our Core</span>
                            <span className="abt-hero__line"><span className="brand-accent abt-hero__accent">Committee</span></span>
                        </h2>
                        <p className="brand-lead abt-team__lead">
                            The core committee leads the planning and execution of the league at every level. Their dedication ensures smooth operations and impactful player experiences.
                        </p>
                    </header>
                    <ul className="abt-team__grid">
                        {(content.committee as TeamMember[]).map((member: TeamMember) => (
                            <MemberCard key={member.name} member={member} />
                        ))}
                    </ul>
                </div>
            </section>

            {/* Board of Advisors (redesigned) */}
            <section className="brand-section abt-team abt-team--advisors" aria-labelledby="abt-advisors-title">
                <div className="brand-container">
                    <header className="abt-team__head">
                        <h2 className="brand-h2" id="abt-advisors-title">
                            <span className="abt-hero__line">Our Board of</span>
                            <span className="abt-hero__line"><span className="brand-accent abt-hero__accent">Advisors</span></span>
                        </h2>
                        <p className="brand-lead abt-team__lead">
                            Our Board of Advisors includes experienced professionals who guide the league with their knowledge.
                        </p>
                    </header>
                    <ul className="abt-team__grid abt-team__grid--advisors">
                        {(content.advisors as TeamMember[]).map((member: TeamMember) => (
                            <MemberCard key={member.name} member={member} compact />
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
};

export default AboutUs;
