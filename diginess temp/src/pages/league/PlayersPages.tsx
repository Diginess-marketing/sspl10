import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import { featuredPlayers as builtInFeatured, type FeaturedPlayer } from '@/data/featuredPlayers';
import { Card, COLORS, EmptyState, PageShell } from '@/components/league/PageShell';


/** Featured SSPL players (Admin → Content → Featured players). */
export const PlayerProfilesPage = () => {
  const players = useCmsCollection<FeaturedPlayer>('featured_players', builtInFeatured);
  const [q, setQ] = useState('');
  const shown = players.filter((p) => `${p.name} ${p.state}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <PageShell eyebrow="Players" title="Player Profiles" intro="Meet the players coming through SSPL." path="/players/profiles">
      <label className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: '#fff' }}>
        <Search className="h-4 w-4" style={{ color: COLORS.MUTED }} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or place" aria-label="Search players"
          className="w-full bg-transparent outline-none" style={{ color: COLORS.NAVY }} />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {shown.map((p) => (
          <figure key={p.name} className="overflow-hidden rounded-2xl" style={{ background: '#fff' }}>
            <img src={p.image} alt={p.name} loading="lazy" className="aspect-[3/4] w-full object-cover" style={{ objectPosition: p.position || '50% 0%' }} />
            <figcaption className="p-3">
              <p className="text-sm font-bold" style={{ color: COLORS.NAVY }}>{p.name}</p>
              <p className="text-xs" style={{ color: COLORS.MUTED }}>{[p.role, p.state].filter(Boolean).join(' · ')}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      {shown.length === 0 && <EmptyState title="No players match" text="Try a different name or place." />}
    </PageShell>
  );
};

interface SelectedRow { candidate_id: string; name: string | null; state: string | null; proficiency: string | null }

/** Players whose final trial status is SELECTED (trial results in the database). */
export const SelectedPlayersPage = () => {
  const [q, setQ] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-selected-players'],
    queryFn: async () => {
      const rows: SelectedRow[] = [];
      for (let from = 0; ; from += 1000) {
        const { data: page, error } = await (supabase as any)
          .from('trial_view')
          .select('candidate_id,name,state,proficiency')
          .eq('final_status', 'SELECTED')
          .order('name', { ascending: true })
          .order('candidate_id', { ascending: true })
          .range(from, from + 999);
        if (error) throw error;
        rows.push(...(page || []));
        if (!page || page.length < 1000) break;
      }
      return rows;
    },
    staleTime: 10 * 60 * 1000,
  });
  const shown = useMemo(
    () => (data || []).filter((p) => `${p.name} ${p.state}`.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );

  return (
    <PageShell eyebrow="Players" title="Selected Players" intro="Players who have cleared the SSPL trials." path="/players/selected">
      {isLoading && <Card><p style={{ color: COLORS.MUTED }}>Loading players…</p></Card>}
      {isError && <EmptyState title="Players could not be loaded" text="Please try again in a moment." />}
      {data && data.length === 0 && <EmptyState title="No final selections yet" text="Players appear here once they clear the final trial level." action={{ to: '/trial-results', label: 'Check your result' }} />}
      {data && data.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-full px-4 py-2.5" style={{ background: '#fff' }}>
              <Search className="h-4 w-4" style={{ color: COLORS.MUTED }} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or state" aria-label="Search selected players"
                className="w-full bg-transparent outline-none" style={{ color: COLORS.NAVY }} />
            </label>
            <span className="text-sm font-semibold" style={{ color: '#dffc35' }}>{data.length} players selected</span>
          </div>
          <Card className="!p-0 overflow-hidden">
            <ul className="divide-y" style={{ borderColor: '#e3e8f4' }}>
              {shown.map((p) => (
                <li key={p.candidate_id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="font-semibold" style={{ color: COLORS.NAVY }}>{p.name}</span>
                  <span className="text-right text-sm" style={{ color: COLORS.MUTED }}>{[p.proficiency, p.state].filter((x) => x && x !== 'Unknown').join(' · ')}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </PageShell>
  );
};
