import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <SEO
                config={{
                    title: 'Privacy Policy - SSPL T10',
                    description: 'Read the Privacy Policy for the Southern Street Premier League (SSPL T10) to understand how we collect, use, and protect your information.',
                    keywords: ['SSPL privacy policy', 'data protection', 'privacy', 'SSPL T10'],
                    ogType: 'website',
                    twitterCard: 'summary',
                    robots: 'index, follow',
                }}
                canonical="https://ssplt10.com/privacy-policy"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.com/privacy-policy' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.com/privacy-policy' },
                ]}
                includeOrganizationSchema={true}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl policy-container">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Privacy Policy
                        </h1>
                        <div className="w-24 h-1.5 bg-sspl-tennis-ball-green mx-auto rounded-full"></div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        {/* Section 1 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">1. Information We Collect</h3>
                            <p className="text-slate-600 mb-4">
                                We collect information you provide directly to us, such as when you register for the tournament, contact us, or use our services.
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth</li>
                                <li><strong>Location Information:</strong> State, city, and PIN code for tournament organization</li>
                                <li><strong>Player Information:</strong> Playing position, preferred trial times, team preferences</li>
                                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we don't store card details)</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">2. How We Use Your Information</h3>
                            <p className="text-slate-600 mb-4">
                                We use the information we collect for the following purposes:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li>Process tournament registrations and manage player data</li>
                                <li>Communicate important tournament updates and information</li>
                                <li>Organize matches, schedules, and team formations</li>
                                <li>Process payments and maintain financial records</li>
                                <li>Ensure fair play and maintain tournament integrity</li>
                                <li>Provide customer support and respond to inquiries</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">3. Information Sharing</h3>
                            <p className="text-slate-600 mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li><strong>Service Providers:</strong> Payment processors, IT services, and tournament management tools</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Tournament Operations:</strong> Sharing necessary information with umpires, scorers, and officials</li>
                                <li><strong>Media Partners:</strong> With your consent for promotional purposes</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">4. Data Security</h3>
                            <p className="text-slate-600 mb-4">
                                We implement appropriate security measures to protect your personal information:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li>SSL/TLS encryption for all data transmission</li>
                                <li>Secure cloud storage with access controls</li>
                                <li>Regular security audits and updates</li>
                                <li>Limited access to personal information on a need-to-know basis</li>
                                <li>Secure payment processing through certified partners</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">5. Data Retention</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Tournament data may be retained for historical and statistical purposes. You may request deletion of your data by contacting us.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">6. Your Rights</h3>
                            <p className="text-slate-600 mb-4">
                                You have the following rights regarding your personal information:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li><strong>Access:</strong> Request information about what data we hold about you</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                            </ul>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">7. Cookies & Tracking</h3>
                            <p className="text-slate-600 mb-4">
                                We use cookies and similar tracking technologies to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li>Remember your preferences and settings</li>
                                <li>Analyze website traffic and usage patterns</li>
                                <li>Improve website functionality and user experience</li>
                                <li>Provide targeted content and advertisements</li>
                            </ul>
                            <p className="text-slate-600 mt-4">
                                You can control cookie settings through your browser preferences.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">8. Third-Party Services</h3>
                            <p className="text-slate-600 mb-4">
                                Our website may contain links to third-party websites or integrate with third-party services:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li><strong>Payment Processing:</strong> Razorpay for secure payment handling</li>
                                <li><strong>Analytics:</strong> Google Analytics for website performance monitoring</li>
                                <li><strong>Social Media:</strong> Links to official social media accounts</li>
                                <li><strong>Sponsors:</strong> Links to tournament sponsors and partners</li>
                            </ul>
                            <p className="text-slate-600 mt-4">
                                These third parties have their own privacy policies, and we encourage you to review them.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">9. Children's Privacy</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">10. Changes to This Policy</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or prominent notice on our website.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section className="mb-10">
                            <h3 className="text-2xl font-bold mb-4">11. Contact Us</h3>
                            <p className="text-slate-600 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="text-slate-700 mb-2"><strong>Phone:</strong> +91 88077 75960</p>
                                <p className="text-slate-700 mb-2"><strong>Email:</strong> info@ssplt10.co.in</p>
                                <p className="text-slate-700"><strong>Address:</strong> Chennai, Tamil Nadu</p>
                            </div>
                        </section>

                        <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 text-center font-medium">
                                Last updated: 14/01/2026
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
