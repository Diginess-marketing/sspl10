import React from 'react';

const SocialProof = () => {
    const metrics = [
        { label: '10+ Cities', icon: '✔' },
        { label: '5000+ Players', icon: '✔' },
        { label: '100+ Tournaments', icon: '✔' }
    ];

    return (
        <section className="bg-[#F5F7FA] py-[24px] border-b border-[#E5E7EB] font-['Poppins',sans-serif]">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-6">
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-16">
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex items-center gap-2 text-[#111827] font-medium text-[16px] md:text-[20px]">
                            <span className="text-[#B4F000] drop-shadow-sm font-bold">{metric.icon}</span>
                            <span>{metric.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
