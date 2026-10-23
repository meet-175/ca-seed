import { SYLLABUS } from '../data/syllabus';

export function slugify(text: string): string {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeLevelKey(levelId: string): keyof typeof SYLLABUS | null {
  if (!levelId) return null;
  const lower = levelId.toLowerCase();
  if (lower === 'foundation' || lower === 'ca foundation') return 'CA Foundation';
  if (lower === 'intermediate' || lower === 'ca intermediate') return 'CA Intermediate';
  if (lower === 'final' || lower === 'ca final') return 'CA Final';
  if (levelId in SYLLABUS) return levelId as keyof typeof SYLLABUS;
  return null;
}

export function unslugifySubject(levelId: string, subjectSlug: string): string | null {
  const levelKey = normalizeLevelKey(levelId);
  if (!levelKey) return null;
  const level = SYLLABUS[levelKey];
  if (!level) return null;
  const match = level.find(s => slugify(s.name) === subjectSlug);
  return match ? match.name : null;
}

export function unslugifyChapter(levelId: string, subjectSlug: string, chapterSlug: string): string | null {
  const levelKey = normalizeLevelKey(levelId);
  if (!levelKey) return null;
  const level = SYLLABUS[levelKey];
  if (!level) return null;
  const subject = level.find(s => slugify(s.name) === subjectSlug);
  if (!subject) return null;
  
  for (const section of subject.sections) {
    const chapterMatch = section.chapters.find(c => slugify(c) === chapterSlug);
    if (chapterMatch) return chapterMatch;
  }
  return null;
}
