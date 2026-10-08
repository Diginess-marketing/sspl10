import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Megaphone } from 'lucide-react';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import { highlights as builtInHighlights, type Highlight } from '@/data/highlights';
import { partners as builtInPartners, type PartnerItem } from '@/data/partners';
import { Card, CardTitle, COLORS, EmptyState, PageShell } from '@/components/league/PageShell';

interface Announcement { id: string; title: string; date: string; body: string; link?: string; linkLabel?: string; important?: boolean }

export const AnnouncementsPage = () => {
  const items = useCmsCollection<Announcement>('announcements', []).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <PageShell eyebrow="Media" title="Announcements" intro="Official notices from SSPL — trials, schedules and results." path="/media/announcements">
      {items.length ? items.map((a) => (
        <Card key={a.id} className={a.important ? 'border-l-8' : ''}>
          <div className="flex items-center gap-2 text-sm" style={{ color: a.important ? '#c62828' : COLORS.MUTED }}>
            {a.important ? <Megaphone className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            {a.important && <strong style={{ color: '#c62828' }}>Important ·</strong>}
            {new Date(`${a.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h2 className="mt-2 text-xl font-bold" style={{ color: COLORS.NAVY }}>{a.title}</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed" style={{ color: COLORS.NAVY }}>{a.body}</p>
          {a.link && (
            <a href={a.link} className="mt-4 inline-flex items-center gap-1.5 font-semibold" style={{ color: COLORS.BLUE }}
              {...(/^https?:/.test(a.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {a.linkLabel || 'Read more'} <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </Card>
      )) : (
        <EmptyState title="No announcements right now" text="Official SSPL notices will be posted here. Meanwhile, catch up on the latest news." action={{ to: '/articles-blogs', label: 'Read the news' }} />
      )}
    </PageShell>
  );
};

export const GalleryPage = () => {
  const photos = useCmsCollection<Highlight>('highlights', builtInHighlights);
  return (
    <PageShell eyebrow="Media" title="Photo Gallery" intro="Moments from SSPL trials, events and matches." path="/media/photos">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((p, i) => (
          <figure key={`${p.image}-${i}`} className="overflow-hidden rounded-2xl" style={{ background: '#fff' }}>
            <img src={p.image} alt={p.title || 'SSPL photo'} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            {(p.title || p.description) && (
              <figcaption className="p-3">
                {p.title && <p className="text-sm font-bold" style={{ color: COLORS.NAVY }}>{p.title}</p>}
                {p.description && <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: COLORS.MUTED }}>{p.description}</p>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </PageShell>
  );
};

const PARTNER_GROUPS = {
  sponsors: {
    title: 'Sponsors', path: '/partners/sponsors', intro: 'The partners who make SSPL possible.',
    match: (c: string) => !/media|franchise/i.test(c),
  },
  media: {
    title: 'Media Partners', path: '/partners/media', intro: 'Bringing SSPL to fans across the country.',
    match: (c: string) => /media/i.test(c),
  },
  franchise: {
    title: 'Franchise Partners', path: '/partners/franchise-partners', intro: 'The owners behind the SSPL franchises.',
    match: (c: string) => /franchise/i.test(c),
  },
} as const;

export const PartnersPage = ({ group }: { group: keyof typeof PARTNER_GROUPS }) => {
  const g = PARTNER_GROUPS[group];
  const all = useCmsCollection<PartnerItem>('partners', builtInPartners).filter((p) => g.match(p.category));
  const categories = [...new Set(all.map((p) => p.category))];
  return (
    <PageShell eyebrow="Partners" title={g.title} intro={g.intro} path={g.path}>
      {categories.length ? categories.map((cat) => (
        <Card key={cat}>
          <CardTitle>{cat}</CardTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {all.filter((p) => p.category === cat).map((p) => (
              <div key={p.alt} className="flex flex-col items-center gap-2 rounded-xl border p-4" style={{ borderColor: '#e3e8f4' }}>
                <img src={p.image} alt={p.alt} loading="lazy" className="h-16 w-full object-contain" />
                <span className="text-center text-sm font-semibold" style={{ color: COLORS.NAVY }}>{p.alt}</span>
              </div>
            ))}
          </div>
        </Card>
      )) : (
        <EmptyState
          title={group === 'franchise' ? 'Franchise partners will be announced soon' : 'Partners coming soon'}
          text={group === 'franchise' ? 'Interested in owning an SSPL franchise? Tell us about yourself.' : 'Want to partner with SSPL? Get in touch.'}
          action={group === 'franchise' ? { to: '/partners/franchise', label: 'Franchise enquiry' } : { to: '/enquiry', label: 'Partner with us' }}
        />
      )}
      {group === 'sponsors' && categories.length > 0 && (
        <div className="text-center">
          <Link to="/enquiry" className="site-btn site-btn--primary inline-flex">Become a sponsor</Link>
        </div>
      )}
    </PageShell>
  );
};
