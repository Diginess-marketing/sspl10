import SEO from '@/components/SEO';

const DugoutCodeOfConduct = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <SEO
                config={{
                    title: 'Dugouts Code of Conduct - SSPL T10',
                    description: 'Read the Dugouts Code of Conduct for participating teams in the Southern Street Premier League T10.',
                    keywords: ['SSPL dugouts', 'code of conduct', 'cricket rules', 'SSPL T10'],
                    ogType: 'website',
                    twitterCard: 'summary',
                    robots: 'index, follow',
                }}
                canonical="https://ssplt10.com/dugout-code-of-conduct"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.com/dugout-code-of-conduct' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.com/dugout-code-of-conduct' },
                ]}
                includeOrganizationSchema={true}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl policy-container">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                            Dugouts Code of Conduct
                        </h1>
                        <div className="w-24 h-1.5 bg-sspl-tennis-ball-green mx-auto rounded-full"></div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <div className="bg-sspl-blue/5 p-6 rounded-xl border border-sspl-blue/10 mb-8">
                            <p className="font-bold text-sspl-blue mb-2 uppercase tracking-wide text-sm">
                                To the teams participating in the Southern Street Premier League T10
                            </p>
                            <p className="text-slate-700 font-medium">
                                Dear Team Operators,
                            </p>
                        </div>

                        <div className="space-y-6 text-slate-600 leading-relaxed">
                            <p>
                                Please find below the dug outs rules which need to be followed and complied with:
                            </p>
                            
                            <p>
                                The player <strong>“dug out”</strong> forms part of the Players and Match Officials area which is the subject of certain important guidelines.
                            </p>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-8 my-8 shadow-sm">
                                <p className="text-slate-800 italic leading-relaxed text-lg">
                                    "A list of persons who may join the players from each team in their dug out will be attached to the dug out for each match. No-one whose name does not appear in this sheet may join the players in the dug-out at any time during any innings. For the sake of clarity, up to 12 Team officials may sit in the dug-out: being the coach, assistant coach, manager, trainer, physiotherapist and analyst. No person performing any other role may sit in the dug-out."
                                </p>
                            </div>

                            <p className="font-medium text-slate-700">
                                Your co-operation and understanding is appreciated.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-2">Best Regards,</p>
                            <p className="text-slate-900 font-bold text-xl">SSPL Team Management</p>
                            <p className="text-sspl-blue font-medium">Southern Street Premier League</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DugoutCodeOfConduct;
