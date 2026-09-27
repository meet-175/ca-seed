import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SYLLABUS } from '../src/data/syllabus';
import { slugify } from '../src/lib/slugs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://ca-seed.pages.dev';

// Map SYLLABUS keys to URL level IDs
const LEVEL_MAP: Record<string, string> = {
  'CA Foundation': 'foundation',
  'CA Intermediate': 'intermediate',
  'CA Final': 'final',
};

async function generateSitemap() {
  const urls: string[] = [
    '/',
    '/news',
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/terms-conditions',
    '/disclaimer',
  ];

  // Add Level pages
  for (const levelName of Object.keys(LEVEL_MAP)) {
    const levelId = LEVEL_MAP[levelName];
    urls.push(`/level/${levelId}`);

    // Add subject and chapter pages
    const subjects = SYLLABUS[levelName];
    if (subjects) {
      for (const subject of subjects) {
        const subjectSlug = slugify(subject.name);
        
        for (const section of subject.sections) {
          for (const chapter of section.chapters) {
            const chapterSlug = slugify(chapter);
            urls.push(`/study/${levelId}/${subjectSlug}/${chapterSlug}`);
          }
        }
      }
    }
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : url.startsWith('/study/') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  // Write to public directory so it gets copied to dist, and also write to dist directly if it exists
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
  }

  console.log(`Sitemap generated with ${urls.length} URLs.`);
}

generateSitemap().catch(console.error);
