
const Footer = () => {
    return (
        <footer className="bg-[#0B1F3B] text-white pt-16 pb-8 border-t border-white/10 font-body">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Logo & About */}
                    <div className="flex flex-col gap-4">
                        <img
                            src="/blue-logo.png"
                            alt="SSPL Logo"
                            className="h-[64px] w-auto inline-block"
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/100x48/0B1F3B/FFF?text=SSPL';
                            }}
                        />
                        <p className="text-[#E5E7EB] text-[14px] leading-[22px] mt-2">
                            Transforming grassroot cricket by empowering local tournament organisers across India.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#F5C542] mb-6">Quick Links</h3>
                        <ul className="flex flex-col gap-3">
                            <li><a href="#about" className="text-[#E5E7EB] hover:text-[#B4F000] transition-colors text-[14px]">About Program</a></li>
                            <li><a href="#prize" className="text-[#E5E7EB] hover:text-[#B4F000] transition-colors text-[14px]">Prize Details</a></li>
                            <li><a href="#how-it-works" className="text-[#E5E7EB] hover:text-[#B4F000] transition-colors text-[14px]">How It Works</a></li>
                            <li><a href="#faq" className="text-[#E5E7EB] hover:text-[#B4F000] transition-colors text-[14px]">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#F5C542] mb-6">Contact Us</h3>
                        <ul className="flex flex-col gap-3">
                            <li className="text-[#E5E7EB] text-[14px]">Email: support@ssplt10.co.in</li>
                            <li className="text-[#E5E7EB] text-[14px]">Phone: +91 98765 43210</li>
                            <li className="text-[#E5E7EB] text-[14px] mt-2 group cursor-pointer hover:text-[#B4F000] transition-colors">
                                Support Hours: <br /> 10:00 AM - 6:00 PM (Mon-Sat)
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social */}
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#F5C542] mb-6">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#B4F000] hover:text-[#0B1F3B] transition-colors">
                                <span className="sr-only">Facebook</span>
                                f
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#B4F000] hover:text-[#0B1F3B] transition-colors">
                                <span className="sr-only">Twitter</span>
                                {/* X icon placeholder */}&#120143;
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#B4F000] hover:text-[#0B1F3B] transition-colors">
                                <span className="sr-only">Instagram</span>
                                in
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex border-solid flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#E5E7EB] text-[14px]">
                        &copy; {new Date().getFullYear()} SSPL T10. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="/privacy-policy" className="text-[#E5E7EB] text-[14px] hover:text-[#B4F000]">Privacy Policy</a>
                        <a href="/terms-and-conditions" className="text-[#E5E7EB] text-[14px] hover:text-[#B4F000]">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
