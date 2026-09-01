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

export function unslugifySubject(levelId: string, subjectSlug: string): string | null {
  const level = SYLLABUS[levelId as keyof typeof SYLLABUS];
  if (!level) return null;
  const match = level.find(s => slugify(s.name) === subjectSlug);
  return match ? match.name : null;
}

export function unslugifyChapter(levelId: string, subjectSlug: string, chapterSlug: string): string | null {
  const level = SYLLABUS[levelId as keyof typeof SYLLABUS];
  if (!level) return null;
  const subject = level.find(s => slugify(s.name) === subjectSlug);
  if (!subject) return null;
  
  for (const section of subject.sections) {
    const chapterMatch = section.chapters.find(c => slugify(c) === chapterSlug);
    if (chapterMatch) return chapterMatch;
  }
  return null;
}
