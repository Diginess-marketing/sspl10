import SEO from '@/components/SEO';

const CommercialGuidelines: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <SEO
                config={{
                    title: 'Commercial Guidelines - SSPL T10',
                    description: 'Read the Commercial Guidelines for SSPL T10 to understand sponsorship, branding, and media rights.',
                    keywords: ['SSPL commercial guidelines', 'sponsorship', 'branding', 'media rights', 'SSPL T10'],
                    ogType: 'website',
                    twitterCard: 'summary',
                    robots: 'index, follow',
                }}
                canonical="https://ssplt10.com/commercial-guidelines"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.com/commercial-guidelines' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.com/commercial-guidelines' },
                ]}
                includeOrganizationSchema={true}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl policy-container">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Commercial Guidelines
                        </h1>
                        <div className="w-24 h-1.5 bg-sspl-tennis-ball-green mx-auto rounded-full"></div>
                        <p className="mt-6 text-xl text-sspl-blue font-bold tracking-tight">
                            SSPL T10 (SSPLT10.co.in)
                        </p>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-10 shadow-sm">
                            <p className="leading-relaxed text-lg text-slate-700 m-0">
                                SSPL T10 ("SSPL / League / Organiser") is committed to maintaining a transparent, professional and fair commercial ecosystem for teams, players, sponsors, partners and all stakeholders. These Commercial Guidelines govern sponsorships, branding rights, media usage, and commercial conduct for SSPL T10 events.
                            </p>
                            <p className="leading-relaxed font-bold mt-4 text-sspl-blue m-0">
                                By registering, participating, sponsoring, or associating with SSPL T10 in any manner, you agree to comply with the guidelines below.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                1. Ownership of League Rights
                            </h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-600">
                                <li>All commercial rights related to SSPL T10, including but not limited to the league name, logo, tournament format, match presentation, media content, sponsor inventory and brand assets are the exclusive property of SSPL / the Organiser.</li>
                                <li>SSPL reserves the right to grant, restrict, modify or withdraw commercial rights at its sole discretion.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                2. Sponsorship & Branding Rights
                            </h2>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">2.1 League-Level Sponsorships (Organiser Controlled)</h3>
                                <p className="mb-4 text-slate-600">The following are reserved as League-level assets and may be sold/allocated only by SSPL:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'Title Sponsor / Naming Rights',
                                        'Powered By / Co-Sponsors',
                                        'Official Partners (category-based)',
                                        'Ground branding (boundary boards, pitch)',
                                        'Umpire branding',
                                        'Scoreboard / live stream overlays',
                                        'Official social media promotions',
                                        'Press & media coverage rights'
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                            <span className="w-1.5 h-1.5 bg-sspl-blue rounded-full"></span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">2.2 Team-Level Sponsorships (Team Controlled)</h3>
                                <p className="mb-4 text-slate-600">Teams may onboard sponsors for their own team brand assets such as:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
                                    <li>Team jersey sponsorship (subject to approval)</li>
                                    <li>Team banners/flags (subject to venue rules)</li>
                                    <li>Team social media promotions</li>
                                    <li>Team support staff branding</li>
                                </ul>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/50 flex items-start space-x-3">
                                    <span className="text-amber-600 mt-0.5">⚠️</span>
                                    <p className="font-bold text-amber-900 text-sm m-0">
                                        Important: Team sponsors must not conflict with league sponsors or reserved categories.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                3. Reserved Categories & Conflict Policy
                            </h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-600">
                                <li>To protect sponsor commitments and maintain fairness, SSPL may reserve exclusive sponsorship categories each season (example: beverage, banking, apparel, etc.).</li>
                                <li>Teams and participants must not sign or promote sponsors that conflict with SSPL's official partners.</li>
                                <li>Any conflict must be disclosed to SSPL for approval in writing before promotion/branding.</li>
                                <li>SSPL's decision on conflicts and approvals shall be final and binding.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                4. Prohibited Sponsorships / Advertisements
                            </h2>
                            <p className="mb-4 text-slate-600 font-medium">SSPL does not permit association with brands or promotions involving:</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[
                                    'Betting / Gambling', 'Tobacco / Nicotine', 'Narcotics', 
                                    'Adult Content', 'Hate Speech', 'Unlawful Activities'
                                ].map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-600">SSPL reserves the right to remove any such branding immediately and impose penalties.</p>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                5. Use of SSPL Name, Logo & Identity
                            </h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-600">
                                <li>The SSPL name, logo, and official brand elements must not be used without written approval.</li>
                                <li>No one may create unofficial merchandise, posters, or advertisements using SSPL branding.</li>
                                <li>Teams may use SSPL branding only for match participation and promotions approved by SSPL.</li>
                                <li>Misuse, alteration, or misleading representation of SSPL branding is strictly prohibited.</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                6. Media Rights & Content Usage
                            </h2>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">6.1 Official Media Rights</h3>
                                <ul className="list-disc pl-5 space-y-3 text-slate-600">
                                    <li>All match videos, live streams, highlights, score graphics, and league content are owned by SSPL.</li>
                                    <li>SSPL may publish and monetize such content on digital platforms (YouTube, Instagram, OTT, etc.).</li>
                                </ul>
                            </div>

                            <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-3">6.2 Participant Consent</h3>
                                <p className="mb-3 text-slate-600">By participating, players and teams grant SSPL the right to use their:</p>
                                <div className="flex flex-wrap gap-4 text-sspl-blue font-bold text-sm">
                                    {['NAMES', 'PHOTOGRAPHS', 'VIDEOS', 'PERFORMANCE CLIPS', 'INTERVIEWS'].map((item, idx) => (
                                        <span key={idx} className="flex items-center">
                                            <span className="mr-2 text-xs">●</span> {item}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-4 text-slate-500 text-sm m-0 italic">for league promotions and commercial communication.</p>
                            </div>

                            <div className="p-4 bg-red-50/30 rounded-xl border border-red-100/50">
                                <h3 className="text-lg font-bold text-red-900 mb-2">6.3 Unauthorized Streaming</h3>
                                <p className="text-red-800/80 text-sm m-0">Unauthorized live streaming or commercial broadcasting of SSPL matches is strictly prohibited.</p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                7. Stall & Sales Policy
                            </h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-600">
                                <li>Commercial sales within the venue are permitted only with written SSPL approval.</li>
                                <li>SSPL may charge stall fees, commissions, or allocate stalls to sponsors.</li>
                                <li>Vendors must follow hygiene, safety and local compliance norms.</li>
                            </ul>
                        </section>

                        {/* Section 9/10 Conduct & Penalties combined */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                                8. Conduct & Penalties
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3">Prohibited Conduct:</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                        <li>Defamatory statements against SSPL</li>
                                        <li>Misrepresentation of policies</li>
                                        <li>Unauthorized promotions</li>
                                        <li>Reputational damage</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3">Potential Penalties:</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                        <li>Monetary fines</li>
                                        <li>Suspension / Disqualification</li>
                                        <li>Termination of association</li>
                                        <li>Legal action</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 12-Contact */}
                        <div className="mt-16 p-8 bg-sspl-blue rounded-3xl text-white shadow-xl shadow-sspl-blue/20">
                            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/20 pb-4 font-heading">
                                Contact for Commercial Approvals
                            </h2>
                            <p className="mb-6 text-white/90">For sponsorship approvals, team sponsor conflicts, or branding permissions, please contact:</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-sspl-tennis-ball-green mb-1 uppercase tracking-wider">SSPL Commercial Desk</h3>
                                    <p className="text-white/70 text-sm">Managing Sponsorships & Media Rights</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="flex items-center space-x-3">
                                        <span className="bg-white/10 p-2 rounded-lg text-sspl-tennis-ball-green">📧</span>
                                        <a href="mailto:info@ssplt10.co.in" className="font-bold hover:text-sspl-tennis-ball-green transition-colors">info@ssplt10.co.in</a>
                                    </p>
                                    <p className="flex items-center space-x-3">
                                        <span className="bg-white/10 p-2 rounded-lg text-sspl-tennis-ball-green">📱</span>
                                        <a href="tel:+918887705960" className="font-bold hover:text-sspl-tennis-ball-green transition-colors">+91 88877 05960</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
                            SSPL reserves the right to amend these guidelines at any time.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CommercialGuidelines;
