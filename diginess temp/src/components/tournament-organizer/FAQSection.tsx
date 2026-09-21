import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "Who is eligible to register their tournament?",
            answer: "Any local cricket tournament organiser, cricket club, community league, or school/college hosting a tennis ball, leather ball, or box cricket tournament in India is eligible."
        },
        {
            question: "How many tennis balls will I receive?",
            answer: "The allocation of free tennis balls depends on the scale of your tournament (number of teams, matches). Once approved, our team will communicate the exact quantity allotted to your event."
        },
        {
            question: "Is there any registration fee?",
            answer: "No, registering your tournament for the free tennis ball sponsorship is completely free of charge. SSPL T10 aims to support local cricket across India."
        },
        {
            question: "How long does the approval process take?",
            answer: "Our team typically reviews and approves tournament registrations within 48 to 72 hours. You will be notified via email and WhatsApp regarding your status."
        },
        {
            question: "Do I need to pay for shipping?",
            answer: "No, the cricket balls will be shipped to your registered tournament address at no additional cost to you."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-[64px] lg:py-[96px] bg-[#F5F7FA] font-body">
            <div className="max-w-[800px] mx-auto px-5 lg:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-[28px] leading-[36px] font-semibold text-[#111827]">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-[16px] text-[#6B7280] mt-3">
                        Everything you need to know about the SSPL T10 sponsorship program.
                    </p>
                </div>

                <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] overflow-hidden">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border-b border-[#E5E7EB] last:border-b-0 transition-colors duration-200 ${openIndex === index ? 'bg-[#F5F7FA]/50' : 'bg-white'
                                }`}
                        >
                            <button
                                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                                onClick={() => toggleFaq(index)}
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-medium text-[16px] text-[#111827] pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`text-[#6B7280] flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#0B1F3B]' : 'rotate-0'
                                        }`}
                                    size={20}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 pt-0 text-[16px] text-[#6B7280] leading-[24px]">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
