import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardTitle, COLORS, EmptyState, PageShell } from '@/components/league/PageShell';

// Trial dates and venues from the database (trials, trials_centers), managed in Admin → Trials.
interface Trial { trial_id: string; trial_name: string; trial_date: string; trial_time: string | null; trial_venue: string | null; trial_address: string | null; trial_batch: string | null; trial_capacity: number | null; google_map_link: string | null }
interface Centre { center_id: string; center_name: string; center_address: string | null }

const useTrialData = () =>
  useQuery({
    queryKey: ['public-trials'],
    queryFn: async () => {
      const db = supabase as any;
      const [trials, centres] = await Promise.all([
        db.from('trials').select('trial_id,trial_name,trial_date,trial_time,trial_venue,trial_address,trial_batch,trial_capacity,google_map_link').order('trial_date', { ascending: true }),
        db.from('trials_centers').select('center_id,center_name,center_address').order('center_name'),
      ]);
      if (trials.error) throw trials.error;
      return { trials: (trials.data || []) as Trial[], centres: (centres.data || []) as Centre[] };
    },
    staleTime: 5 * 60 * 1000,
  });

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

const TrialCard = ({ t, past }: { t: Trial; past?: boolean }) => (
  <Card className="!p-5 md:!p-6" >
    <div className="flex flex-wrap items-start justify-between gap-2">
      <p className="text-lg font-bold" style={{ color: COLORS.NAVY }}>{t.trial_name}</p>
      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase" style={{ background: past ? '#eef2fb' : '#e7f6ec', color: past ? COLORS.MUTED : '#1b7f3b' }}>{past ? 'Completed' : 'Upcoming'}</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm" style={{ color: COLORS.MUTED }}>
      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{fmt(t.trial_date)}</span>
      {t.trial_time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{t.trial_time}</span>}
      {t.trial_venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{t.trial_venue}</span>}
      {t.trial_capacity ? <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{t.trial_capacity} players</span> : null}
    </div>
    {t.trial_address && <p className="mt-2 text-sm" style={{ color: COLORS.NAVY }}>{t.trial_address}</p>}
    {t.google_map_link && <a href={t.google_map_link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold" style={{ color: COLORS.BLUE }}>Open in Google Maps →</a>}
  </Card>
);

const VIEWS = {
  overview: { title: 'Trials', path: '/trials', intro: 'Five levels from the nets to a ground match — here is where and when.' },
  schedule: { title: 'Trial Schedule', path: '/trials/schedule', intro: 'Upcoming and completed SSPL trials.' },
  locations: { title: 'Trial Locations', path: '/trials/locations', intro: 'Where SSPL trials are held.' },
} as const;

const TrialsPage = ({ view = 'overview' }: { view?: keyof typeof VIEWS }) => {
  const v = VIEWS[view];
  const { data, isLoading, isError } = useTrialData();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (data?.trials || []).filter((t) => t.trial_date >= today);
  const past = (data?.trials || []).filter((t) => t.trial_date < today).reverse();
  const venues = [...new Set([...(data?.centres || []).map((c) => c.center_name), ...(data?.trials || []).map((t) => t.trial_venue).filter(Boolean) as string[]])];

  const schedule = (
    <>
      {upcoming.length ? upcoming.map((t) => <TrialCard key={t.trial_id} t={t} />) : (
        <EmptyState title="New trial dates will be announced soon" text="Register now and we will share your venue, date and time about 5 days before your trial." action={{ to: '/register', label: 'Register for trials' }} />
      )}
      {past.length > 0 && (
        <>
          <p className="pt-2 text-sm font-bold uppercase tracking-[0.15em]" style={{ color: '#dffc35' }}>Completed trials</p>
          {past.map((t) => <TrialCard key={t.trial_id} t={t} past />)}
        </>
      )}
    </>
  );

  const locations = venues.length ? (
    <Card>
      <CardTitle>Trial venues</CardTitle>
      <ul className="grid gap-3 sm:grid-cols-2">
        {(data?.centres || []).map((c) => (
          <li key={c.center_id} className="rounded-xl border p-4" style={{ borderColor: '#e3e8f4' }}>
            <p className="font-bold" style={{ color: COLORS.NAVY }}>{c.center_name}</p>
            {c.center_address && <p className="mt-1 text-sm" style={{ color: COLORS.MUTED }}>{c.center_address}</p>}
          </li>
        ))}
        {venues.filter((name) => !(data?.centres || []).some((c) => c.center_name === name)).map((name) => (
          <li key={name} className="rounded-xl border p-4" style={{ borderColor: '#e3e8f4' }}><p className="font-bold" style={{ color: COLORS.NAVY }}>{name}</p></li>
        ))}
      </ul>
      <p className="mt-4 text-sm" style={{ color: COLORS.MUTED }}>You are allotted a venue near you based on the state you register in. Spot registration is available at trial venues.</p>
    </Card>
  ) : <EmptyState title="Venues will be announced soon" text="Trial venues are shared with registered players about 5 days before their trial." />;

  return (
    <PageShell eyebrow="Trials" title={v.title} intro={v.intro} path={v.path}>
      {isLoading && <Card><p style={{ color: COLORS.MUTED }}>Loading trials…</p></Card>}
      {isError && <EmptyState title="Trials could not be loaded" text="Please try again in a moment." />}
      {!isLoading && !isError && (
        <>
          {view === 'overview' && (
            <Card>
              <CardTitle>How the trials work</CardTitle>
              <ol className="grid gap-3 sm:grid-cols-3">
                {[['Levels 1–3', 'Nets trials judged by selectors'], ['Level 4', 'AI assessment of batting and bowling'], ['Level 5', 'A 10-over ground match']].map(([t, d]) => (
                  <li key={t} className="rounded-xl p-4" style={{ background: '#f7f9fd' }}>
                    <p className="font-bold" style={{ color: COLORS.NAVY }}>{t}</p>
                    <p className="mt-1 text-sm" style={{ color: COLORS.MUTED }}>{d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <Link to="/players/selection-process" style={{ color: COLORS.BLUE }}>Selection process →</Link>
                <Link to="/players/eligibility" style={{ color: COLORS.BLUE }}>Eligibility →</Link>
                <Link to="/trial-results" style={{ color: COLORS.BLUE }}>Check your results →</Link>
              </div>
            </Card>
          )}
          {view !== 'locations' && schedule}
          {view !== 'schedule' && locations}
        </>
      )}
    </PageShell>
  );
};

export default TrialsPage;
