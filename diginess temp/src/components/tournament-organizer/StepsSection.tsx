import React from 'react';
import { ClipboardCheck, CheckCircle, PackageOpen } from 'lucide-react';

const StepsSection = () => {
    const steps = [
        {
            icon: <ClipboardCheck size={48} className="text-[#0B1F3B]" />,
            title: "Register Tournament",
            description: "Fill out the registration form with your expected teams and dates."
        },
        {
            icon: <CheckCircle size={48} className="text-[#0B1F3B]" />,
            title: "Get Approved",
            description: "Our team verifies your tournament details usually within 48 hours."
        },
        {
            icon: <PackageOpen size={48} className="text-[#0B1F3B]" />,
            title: "Receive Free Tennis Balls",
            description: "We dispatch premium tennis balls to your tournament venue."
        }
    ];

    return (
        <section id="how-it-works" className="py-[64px] lg:py-[96px] bg-[#F5F7FA] font-body">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[28px] leading-[36px] font-semibold text-[#111827]">
                        How It Works
                    </h2>
                    <p className="text-[16px] text-[#6B7280] mt-4 max-w-2xl mx-auto">
                        A simple 3-step process to get sponsored high-quality tennis balls for your upcoming cricket tournaments.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden lg:block absolute top-[64px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#B4F000] via-[#F5C542] to-[#B4F000] opacity-50 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center relative z-10 group bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-8 lg:p-0 shadow-sm lg:shadow-none border border-[#E5E7EB] lg:border-none">
                            <div className="w-[128px] h-[128px] rounded-full bg-white flex items-center justify-center shadow-lg border border-[#E5E7EB] mb-6 group-hover:scale-105 transition-transform duration-300 relative">
                                {/* Step Number Badge */}
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#B4F000] text-[#0B1F3B] rounded-full flex items-center justify-center font-bold text-[16px] border border-[#0B1F3B]/10 shadow-sm">
                                    {index + 1}
                                </div>
                                {step.icon}
                            </div>
                            <h3 className="text-[20px] leading-[28px] font-semibold text-[#111827] mb-3">
                                {step.title}
                            </h3>
                            <p className="text-[16px] leading-[24px] text-[#6B7280]">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StepsSection;
