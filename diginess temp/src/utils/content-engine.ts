

// --- Types ---
interface CityData {
    id: string;
    name: string;
    venue: string;
}

interface RoleData {
    id: string;
    name: string;
    slug: string;
}

// --- Content Variations Library ---

const INTRO_TEMPLATES = [
    'Aspiring cricketers in **{cityName}** now have a golden opportunity to showcase their talent on a national stage. The SSPL T10 is organizing extensive selection trials to scout the best {rolePlural} from {cityName}.',
    "The search for {cityName}'s next cricket superstar begins here. Join thousands of players in the journey from gully to glory. We are specifically looking for talented {rolePlural} to join the league.",
    'Are you the next big thing in tennis ball cricket? **{cityName}** is calling! SSPL T10 is hosting official trials to find express pacers, power hitters, and agile fielders at {venue}.',
    "Cricket is more than just a game in **{cityName}**; it's a religion. SSPL T10 brings you the platform to turn your passion into a profession. Register for the {year} season trials today.",
    'Get ready, **{cityName}**! The biggest tennis ball cricket talent hunt is here. We are scouting for {rolePlural} who have the technique and temperament to succeed in the T10 format.',
];

const PROCESS_TEMPLATES = [
    'Selectors will evaluate players on basic technique, match temperament, and fitness. Top performers from {cityName} will be drafted into the auction pool.',
    'Our expert scouting team will test your skills in a simulated match environment. Impress the selectors at {venue} and earn your spot.',
    'The trial process involves three stages: 1. Basic Skill Test, 2. Nets Session, and 3. Open Wicket Match scenarios.',
    "We are looking for X-factor players. Speed, power, and accuracy are key. Show us what you've got at the {cityName} trials.",
];

const CTA_TEMPLATES = [
    'Ready to Play for {cityName}?',
    "Don't Miss Your Chance - Register Now!",
    'Join the {cityName} Revolution',
    'Your Journey to Stardom Starts Here',
    'Secure Your Spot in the {year} Season',
];

// --- FAQ Library ---

const SHARED_FAQS = [
    {
        question: 'What is the age limit for trials?',
        answer: 'The trials are open for all age groups above 14 years. There is no upper age limit.',
    },
    {
        question: 'Do I need to bring my own kit?',
        answer: 'Yes, please bring your own cricket gear. Balls will be provided by the organizers.',
    },
    {
        question: 'Is there a registration fee?',
        answer: 'Yes, there is a nominal registration fee to cover the venue and operational costs.',
    },
    {
        question: 'Will I get a certificate?',
        answer: 'All participants will receive a digital certificate of participation from SSPL T10.',
    },
    {
        question: 'When will the results be announced?',
        answer: 'Results are typically announced within 3-5 days after the trials conclude on our official website.',
    },
];

const CITY_SPECIFIC_FAQS = [
    {
        question: 'Where in {cityName} is the venue located?',
        answer: 'The trials will be held at **{venue}**. It is a centrally located ground with excellent facilities.',
    },
    {
        question: 'Are there transport facilities to the {cityName} venue?',
        answer: 'Participants are requested to arrange their own transport to {venue}. It is accessible via public transport.',
    },
];

// --- Helper Functions ---

const getRandomItem = (arr: any[], seed: number) => {
    return arr[seed % arr.length];
};

const getSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const replaceVariables = (template: string, variables: Record<string, string | number>) => {
    return template.replace(/{(\w+)}/g, (_, key) => String(variables[key] || `{${key}}`));
};

// --- Content Engine Class ---

export class ContentEngine {
    private city: CityData;
    private role: RoleData | null;
    private year: number;
    private seed: number;

    constructor(city: CityData, year: number, role: RoleData | null = null) {
        this.city = city;
        this.year = year;
        this.role = role;
        // Generate a deterministic seed based on city+year+role so content is stable per URL
        this.seed = getSeed(`${city.id}-${year}-${role?.id || 'general'}`);
    }

    getMetaTitle(): string {
        const patterns = [
            '{cityName} Cricket Trials {year} | Register Now',
            'Official SSPL T10 Trials in {cityName} {year}',
            'Join the League: {cityName} Cricket Selection {year}',
            '{roleName} Trials {cityName} {year} | SSPL T10',
        ];

        // Force specific pattern if role exists
        const pattern = this.role
            ? '{roleName} Trials {cityName} {year} | SSPL T10'
            : getRandomItem(patterns.slice(0, 3), this.seed);

        return replaceVariables(pattern, {
            cityName: this.city.name,
            year: this.year,
            roleName: this.role ? this.role.name : 'Cricket',
        });
    }

    getIntroText(): string {
        const template = getRandomItem(INTRO_TEMPLATES, this.seed);
        return replaceVariables(template, {
            cityName: this.city.name,
            year: this.year,
            venue: this.city.venue,
            rolePlural: this.role ? `${this.role.name  }s` : 'players',
        });
    }

    getProcessText(): string {
        const template = getRandomItem(PROCESS_TEMPLATES, this.seed + 1); // Different seed offset
        return replaceVariables(template, {
            cityName: this.city.name,
            venue: this.city.venue,
        });
    }

    getCTAHeading(): string {
        const template = getRandomItem(CTA_TEMPLATES, this.seed + 2);
        return replaceVariables(template, {
            cityName: this.city.name,
            year: this.year,
        });
    }

    getFAQs() {
        // Select 3 random shared FAQs
        const sharedShuffled = [...SHARED_FAQS].sort((a, b) => {
            // Deterministic shuffle logic could go here, for now simple slice based on rotational index
            const idxA = SHARED_FAQS.indexOf(a);
            const idxB = SHARED_FAQS.indexOf(b);
            return ((idxA + this.seed) % 10) - ((idxB + this.seed) % 10);
        }).slice(0, 3);

        // City specific FAQs
        const cityFaqs = CITY_SPECIFIC_FAQS.map(faq => ({
            question: replaceVariables(faq.question, { cityName: this.city.name }),
            answer: replaceVariables(faq.answer, { cityName: this.city.name, venue: this.city.venue }),
        }));

        // Interleave them: Shared, City, Shared, City, Shared
        return [
            sharedShuffled[0],
            cityFaqs[0],
            sharedShuffled[1],
            cityFaqs[1],
            sharedShuffled[2],
        ];
    }

    // Example of "Unique Stats Injection" (Simulated)
    getRegistrationStats() {
        // Generate a pseudo-random number between 500 and 5000 based on seed
        const count = 500 + (this.seed % 4500);
        return count;
    }
}
