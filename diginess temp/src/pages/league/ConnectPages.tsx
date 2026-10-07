import { useEffect, useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { SOCIALS } from '@/config/socials';
import { Card, CardTitle, COLORS, PageShell } from '@/components/league/PageShell';

export const FranchisePage = () => (
  <PageShell eyebrow="Partners" title="Franchise" intro="Own a team in India's street cricket league." path="/partners/franchise">
    <Card>
      <CardTitle>Why an SSPL franchise</CardTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['One of 12 franchises', 'Each franchise represents a state and fields a squad of 25 players.'],
          ['Players from the trials', 'Squads are built at the player auction from players who clear all five trial levels.'],
          ['A national stage', 'League stage, playoffs and a final at Sharjah Stadium.'],
          ['Grassroots reach', 'Trials across the country connect your brand with street cricket fans everywhere.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border p-5" style={{ borderColor: '#e3e8f4', background: '#f7f9fd' }}>
            <p className="font-bold" style={{ color: COLORS.NAVY }}>{t}</p>
            <p className="mt-1" style={{ color: COLORS.MUTED }}>{d}</p>
          </div>
        ))}
      </div>
    </Card>
    <Card id="register">
      <CardTitle>Franchise registration</CardTitle>
      <p className="mb-6" style={{ color: COLORS.MUTED }}>Tell us about yourself and our franchise team will contact you with the details.</p>
      <EnquiryForm defaultInterest="franchise" />
    </Card>
  </PageShell>
);

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export const AppDownloadPage = () => {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPromptEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  return (
    <PageShell eyebrow="Connect" title="Get the SSPL App" intro="Results, trials and news on your home screen — no app store needed." path="/app">
      <Card className="text-center">
        <Smartphone className="mx-auto h-10 w-10" style={{ color: COLORS.BLUE }} aria-hidden="true" />
        {installed ? (
          <p className="mt-3 inline-flex items-center gap-2 text-lg font-bold" style={{ color: '#1b7f3b' }}><CheckCircle2 className="h-5 w-5" />The SSPL app is installed on this device</p>
        ) : prompt ? (
          <>
            <p className="mt-3 text-lg font-bold" style={{ color: COLORS.NAVY }}>Install SSPL on this device</p>
            <button type="button" onClick={install} className="site-btn site-btn--primary mt-5 inline-flex items-center gap-2"><Download className="h-4 w-4" />Install app</button>
          </>
        ) : (
          <p className="mt-3 text-lg font-bold" style={{ color: COLORS.NAVY }}>Add SSPL to your home screen</p>
        )}
      </Card>
      {!installed && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardTitle>Android (Chrome)</CardTitle>
            <ol className="list-decimal space-y-1.5 pl-5" style={{ color: COLORS.NAVY }}>
              <li>Open ssplt10.co.in in Chrome.</li>
              <li>Tap the ⋮ menu, then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            </ol>
          </Card>
          <Card>
            <CardTitle>iPhone (Safari)</CardTitle>
            <ol className="list-decimal space-y-1.5 pl-5" style={{ color: COLORS.NAVY }}>
              <li>Open ssplt10.co.in in Safari.</li>
              <li>Tap <Share className="inline h-4 w-4" aria-label="Share" /> then <strong>Add to Home Screen</strong> <PlusSquare className="inline h-4 w-4" aria-hidden="true" />.</li>
            </ol>
          </Card>
        </div>
      )}
    </PageShell>
  );
};

export const SocialMediaPage = () => (
  <PageShell eyebrow="Connect" title="Social Media" intro="Follow SSPL for trial updates, highlights and behind-the-scenes." path="/social">
    <div className="grid gap-3 sm:grid-cols-2">
      {SOCIALS.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5" style={{ background: '#fff' }}>
          <img src={s.icon} alt="" width={44} height={44} loading="lazy" />
          <span>
            <span className="block text-lg font-bold" style={{ color: COLORS.NAVY }}>{s.label}</span>
            <span className="block text-sm" style={{ color: COLORS.MUTED }}>Follow SSPL on {s.label} →</span>
          </span>
        </a>
      ))}
    </div>
  </PageShell>
);
