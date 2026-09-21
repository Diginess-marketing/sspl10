import SEO from '@/components/SEO';

const CancellationRefundPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <SEO
                config={{
                    title: 'Cancellation & Refund Policy - SSPL T10',
                    description: 'Read our Cancellation & Refund Policy. We are committed to providing top-notch sports management services.',
                    keywords: ['SSPL cancellation policy', 'refund policy', 'terms of service', 'SSPL T10'],
                    ogType: 'website',
                    twitterCard: 'summary',
                    robots: 'index, follow',
                }}
                canonical="https://ssplt10.com/cancellation-refund-policy"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.com/cancellation-refund-policy' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.com/cancellation-refund-policy' },
                ]}
                includeOrganizationSchema={true}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl policy-container">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Cancellation & Refund Policy
                        </h1>
                        <div className="w-24 h-1.5 bg-sspl-tennis-ball-green mx-auto rounded-full"></div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-10">
                            <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                                At SSPL T10, we are committed to providing top-notch sports management service, training, and trial services. Please read our cancellation and refund policy carefully before making a booking.
                            </p>
                        </section>

                        <section className="mb-10">
                            <div className="space-y-6">
                                <div className="flex items-start p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="mr-4 mt-1 text-sspl-blue font-bold text-xl">•</span>
                                    <span>
                                        <strong className="text-slate-900 block mb-1">No Cancellations</strong>
                                        <span className="text-slate-600">Once a booking is confirmed for any service, including trials, training, or sports management service, cancellations will not be accepted.</span>
                                    </span>
                                </div>
                                <div className="flex items-start p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="mr-4 mt-1 text-sspl-blue font-bold text-xl">•</span>
                                    <span>
                                        <strong className="text-slate-900 block mb-1">No Refunds</strong>
                                        <span className="text-slate-600">All payments made for our services are non-refundable. This includes cases of non-attendance, last-minute cancellations, or any other reason.</span>
                                    </span>
                                </div>
                                <div className="flex items-start p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="mr-4 mt-1 text-sspl-blue font-bold text-xl">•</span>
                                    <span>
                                        <strong className="text-slate-900 block mb-1">Rescheduling</strong>
                                        <span className="text-slate-600">In exceptional cases, rescheduling may be considered at the sole discretion of SSPL T10 League Administrators, subject to availability.</span>
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10 bg-sspl-blue/5 p-6 rounded-xl border border-sspl-blue/10">
                            <p className="text-slate-700 font-medium text-center">
                                By proceeding with the booking, you agree to our cancellation and refund policy. For any queries, please contact our support team.
                            </p>
                        </section>

                        <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="text-center">
                                <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-xs">For support, contact us at:</p>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                    <p className="text-slate-800 font-bold">customercare@ssplt10.co.in</p>
                                    <div className="hidden md:block w-px h-4 bg-slate-300"></div>
                                    <p className="text-slate-800 font-bold">+91 88077 75960</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CancellationRefundPolicy;
