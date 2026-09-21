
export const CITIES = [
    {
        id: 'mumbai',
        name: 'Mumbai',
        slug: 'mumbai',
        tier: 'Metro',
        venue: 'Shivaji Park',
        coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
        id: 'delhi',
        name: 'Delhi',
        slug: 'delhi',
        tier: 'Metro',
        venue: 'Feroz Shah Kotla Ground (Annex)',
        coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    {
        id: 'bangalore',
        name: 'Bangalore',
        slug: 'bangalore',
        tier: 'Metro',
        venue: 'Chinnaswamy Stadium (Nets)',
        coordinates: { lat: 12.9716, lng: 77.5946 }
    }
];

export const YEARS = [2026, 2027];

export const ROLES = [
    { id: 'batsman', name: 'Batsman', slug: 'batsman' },
    { id: 'bowler', name: 'Bowler', slug: 'bowler' },
    { id: 'all-rounder', name: 'All-Rounder', slug: 'all-rounder' },
    { id: 'wicket-keeper', name: 'Wicket Keeper', slug: 'wicket-keeper' }
];

export const EVENTS = [
    {
        cityId: 'mumbai',
        year: 2026,
        date: '2026-02-28',
        type: 'Trial',
        registrationCount: 1240
    },
    {
        cityId: 'delhi',
        year: 2026,
        date: '2026-03-05',
        type: 'Trial',
        registrationCount: 850
    }
];
