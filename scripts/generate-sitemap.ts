import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SYLLABUS } from '../src/data/syllabus';
import { slugify } from '../src/lib/slugs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://chartered-seed.online';

// Map SYLLABUS keys to URL level IDs
const LEVEL_MAP: Record<string, string> = {
  'CA Foundation': 'foundation',
  'CA Intermediate': 'intermediate',
  'CA Final': 'final',
};

interface SitemapEntry {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

async function generateSitemap() {
  const entries: SitemapEntry[] = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/library', changefreq: 'weekly', priority: '0.8' },
    { loc: '/news', changefreq: 'daily', priority: '0.8' },
    { loc: '/about-us', changefreq: 'monthly', priority: '0.5' },
    { loc: '/contact-us', changefreq: 'monthly', priority: '0.5' },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.4' },
    { loc: '/terms-conditions', changefreq: 'monthly', priority: '0.4' },
    { loc: '/disclaimer', changefreq: 'monthly', priority: '0.4' },
  ];

  // Add Level and individual Level/Subject paths
  for (const levelName of Object.keys(LEVEL_MAP)) {
    const levelId = LEVEL_MAP[levelName];
    entries.push({ loc: `/level/${levelId}`, changefreq: 'daily', priority: '0.9' });

    // Add subject and chapter pages
    const subjects = SYLLABUS[levelName];
    if (subjects) {
      for (const subject of subjects) {
        const subjectSlug = slugify(subject.name);
        
        // Individual level/subject path
        entries.push({ 
          loc: `/level/${levelId}?subject=${encodeURIComponent(subjectSlug)}`, 
          changefreq: 'daily', 
          priority: '0.85' 
        });

        for (const section of subject.sections) {
          for (const chapter of section.chapters) {
            const chapterSlug = slugify(chapter);
            entries.push({ 
              loc: `/study/${levelId}/${subjectSlug}/${chapterSlug}`, 
              changefreq: 'weekly', 
              priority: '0.8' 
            });
          }
        }
      }
    }
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (item) => `  <url>
    <loc>${BASE_URL}${item.loc}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // Write to public directory (served statically by Vite/Cloudflare Pages)
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf8');

  // Write to project root for direct visibility
  const rootFile = path.resolve(__dirname, '../sitemap.xml');
  fs.writeFileSync(rootFile, sitemapContent, 'utf8');
  
  // Write to dist directly if already built
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf8');
  }

  console.log(`Sitemap generated with ${entries.length} URLs (including /library, level & subject routes).`);
}

generateSitemap().catch(console.error);
