import { useMemo } from 'react';
import { BookOpen, CreditCard, FileSearch, HelpCircle, Layers, Trophy, UserPlus } from 'lucide-react';
import { faqData as builtInFaq, type FAQCategory, type Language } from '@/data/faqData';
import { FAQ_LANGUAGES } from './schema';
import { useCmsCollection } from './useCmsCollection';

/** One FAQ question as stored in cms_items (collection "faq"). */
export interface FaqRow {
  language: Language;
  categoryId: string;
  categoryTitle: string;
  icon: string;
  question: string;
  answer: string;
  videoId?: string;
}

const ICONS = { BookOpen, CreditCard, FileSearch, HelpCircle, Layers, Trophy, UserPlus };

const iconName = (icon: unknown) =>
  Object.entries(ICONS).find(([, component]) => component === icon)?.[0] ?? 'HelpCircle';

export const flattenFaq = (data: Record<Language, FAQCategory[]>): FaqRow[] =>
  FAQ_LANGUAGES.flatMap((language) =>
    (data[language] || []).flatMap((category) =>
      category.items.map((item) => ({
        language,
        categoryId: category.id,
        categoryTitle: category.title,
        icon: iconName(category.icon),
        question: item.question,
        answer: item.answer,
        ...(item.videoId ? { videoId: item.videoId } : {}),
      })),
    ),
  );

/** Rebuilds the per-language category structure the FAQ components consume. */
export const groupFaq = (rows: FaqRow[]): Record<Language, FAQCategory[]> => {
  const grouped = Object.fromEntries(FAQ_LANGUAGES.map((lang) => [lang, [] as FAQCategory[]])) as Record<Language, FAQCategory[]>;
  for (const row of rows) {
    const categories = grouped[row.language];
    if (!categories) {
      continue;
    }
    let category = categories.find((c) => c.id === row.categoryId);
    if (!category) {
      category = { id: row.categoryId, title: row.categoryTitle, icon: ICONS[row.icon as keyof typeof ICONS] ?? HelpCircle, items: [] };
      categories.push(category);
    }
    category.items.push({ question: row.question, answer: row.answer, ...(row.videoId ? { videoId: row.videoId } : {}) });
  }
  // A language with no rows in the database keeps its built-in questions.
  for (const lang of FAQ_LANGUAGES) {
    if (!grouped[lang].length) {
      grouped[lang] = builtInFaq[lang];
    }
  }
  return grouped;
};

export const FAQ_FALLBACK_ROWS = flattenFaq(builtInFaq);

/** FAQ data from the CMS, in the same shape as the built-in `faqData`. */
export function useFaqData(): Record<Language, FAQCategory[]> {
  const rows = useCmsCollection<FaqRow>('faq', FAQ_FALLBACK_ROWS);
  return useMemo(() => (rows === FAQ_FALLBACK_ROWS ? builtInFaq : groupFaq(rows)), [rows]);
}
