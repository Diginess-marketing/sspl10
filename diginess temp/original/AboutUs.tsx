import React from 'react';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Target, User } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    subRole?: string;
    bio: string;
    image?: string;
}

const AboutUs = () => {
    const { getContent, loading } = useWebsiteContent();
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

    return (
        <div className="min-h-screen bg-transparent relative z-10 py-12 md:py-20 px-4">
            
            {/* Unified Main Container in Cobalt Blue */}
            <main className="max-w-[1440px] mx-auto bg-[#0047AB] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden pb-16 md:pb-24">
                
                {/* Mission Section Area (Now at the top) */}
                <section className="px-6 sm:px-10 lg:px-12 py-16 bg-white/5">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
                        <div className="flex-1 text-left">
                            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300">
                                <div className="prose prose-lg text-white" 
                                     dangerouslySetInnerHTML={{ __html: content.description }} />
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center md:justify-end">
                            <img
                                src="/ourMoto.avif"
                                alt="One Nation United - Our Moto"
                                className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Vision / Mission Cards Area */}
                <section className="px-6 sm:px-10 lg:px-12 py-16 md:py-20 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-white/5 transition-all flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#CCFF00]/20 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-[#CCFF00]" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">Our Vision</h3>
                            <p className="text-white/80 leading-relaxed text-base">
                                {content.vision}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-white/5 transition-all flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#CCFF00]/20 rounded-xl flex items-center justify-center mb-6">
                                <Trophy className="w-8 h-8 text-[#CCFF00]" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">Our Mission</h3>
                            <p className="text-white/80 leading-relaxed text-base">
                                {content.mission}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Committee Area */}
                <section className="px-6 sm:px-10 lg:px-12 py-12 md:py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-wider">Our Core Committee</h2>
                        <p className="text-white/85 max-w-2xl mx-auto text-base italic">
                            The core committee leads the planning and execution of the league at every level. Their dedication ensures smooth operations and impactful player experiences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {(content.committee as TeamMember[]).map((member: TeamMember) => (
                            <div key={member.name} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center group hover:bg-white/15 transition-all shadow-lg">
                                <div className="w-64 h-64 mb-8 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 bg-transparent">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-contain bg-transparent rounded-2xl shadow-xl" />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                                            <User className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wide">{member.name}</h3>
                                <div className="text-[#CCFF00] font-bold text-base tracking-widest uppercase mb-4">{member.role}</div>
                                {member.subRole && <div className="text-sm text-white/80 font-medium mb-4 italic p-2 bg-white/5 rounded-lg w-full">{member.subRole}</div>}
                                <p className="text-base text-white/80 leading-relaxed font-light">
                                    {member.bio}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Advisors Area */}
                <section className="px-6 sm:px-10 lg:px-12 py-12 md:py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-wider">Our Board of Advisors</h2>
                        <p className="text-white/85 max-w-2xl mx-auto text-base italic">
                            Our Board of Advisors includes experienced professionals who guide the league with their knowledge.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {(content.advisors as TeamMember[]).map((member: TeamMember) => (
                            <div key={member.name} className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/15 transition-all shadow-lg">
                                <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-100 bg-transparent">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-contain bg-transparent rounded-2xl shadow-md" />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                                            <User className="w-12 h-12 text-white/50" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wide">{member.name}</h3>
                                    <div className="text-[#CCFF00] font-bold text-sm mb-3 tracking-wide uppercase">{member.role}</div>
                                    {member.subRole && <div className="text-xs text-white/75 mb-3 italic font-medium">{member.subRole}</div>}
                                    <p className="text-sm text-white/85 leading-relaxed font-light">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutUs;
