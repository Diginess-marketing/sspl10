
const PrizeSection = () => {
    return (
        <section id="prize" className="py-[64px] lg:py-[96px] bg-white font-body">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-6 text-center">
                <h2 className="text-[28px] leading-[36px] font-semibold text-[#111827] mb-12 relative inline-block">
                    Total Rewards
                    {/* Gold accent underline bar */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-[#F5C542] rounded-full"></div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-[20px] leading-[28px] font-medium text-[#6B7280] mb-2 uppercase tracking-wider">
                            Prize Pool
                        </h3>
                        <p className="text-[36px] lg:text-[48px] font-bold text-[#0B1F3B]">
                            Up to ₹3 Crores
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-[20px] leading-[28px] font-medium text-[#6B7280] mb-2 uppercase tracking-wider">
                            Player Awards
                        </h3>
                        <p className="text-[36px] lg:text-[48px] font-bold text-[#0B1F3B]">
                            Up to ₹3 Lakhs
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrizeSection;
