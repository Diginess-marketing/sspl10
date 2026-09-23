import { Users, Club, Trophy, School } from 'lucide-react';

const EligibilitySection = () => {
    const eligibleEntities = [
        {
            icon: <Users size={32} className="text-[#F5C542]" />,
            title: 'Local Organisers',
            subtitle: 'Gully & Society Tournaments',
        },
        {
            icon: <Club size={32} className="text-[#F5C542]" />,
            title: 'Cricket Clubs',
            subtitle: 'Registered and Private Clubs',
        },
        {
            icon: <Trophy size={32} className="text-[#F5C542]" />,
            title: 'Community Leagues',
            subtitle: 'Corporate & Weekend Leagues',
        },
        {
            icon: <School size={32} className="text-[#F5C542]" />,
            title: 'Schools & Colleges',
            subtitle: 'Inter-school and Varsity Events',
        },
    ];

    return (
        <section className="py-[64px] lg:py-[96px] bg-white font-body">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-[28px] leading-[36px] font-semibold text-[#111827]">
                        Who Is Eligible?
                    </h2>
                    <p className="text-[16px] text-[#6B7280] mt-3">
                        Open to all levels of tennis ball cricket tournaments across India.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {eligibleEntities.map((entity, index) => (
                        <div
                            key={index}
                            className="bg-[#0B1F3B] rounded-[16px] p-6 text-center hover:-translate-y-1 transition-transform duration-300 shadow-lg border border-[#0B1F3B]/10 group"
                        >
                            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                                {entity.icon}
                            </div>
                            <h3 className="text-[20px] font-medium text-white mb-2">
                                {entity.title}
                            </h3>
                            <p className="text-[14px] text-[#E5E7EB]">
                                {entity.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EligibilitySection;
