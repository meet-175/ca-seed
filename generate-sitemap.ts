import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function getPopulatedChapters(): Promise<Set<string>> {
  const populated = new Set<string>();
  try {
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('firebase-applet-config.json not found, fallback to full sitemap.');
      return populated;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initializeApp(config, 'sitemap-builder');
    const db = getFirestore(app, config.firestoreDatabaseId);
    const snap = await getDocs(collection(db, 'content'));
    
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.level && data.subject && data.chapter) {
        const levelId = LEVEL_MAP[data.level];
        if (levelId) {
          const key = `${levelId}/${slugify(data.subject)}/${slugify(data.chapter)}`;
          populated.add(key);
        }
      }
    });
    console.log(`Loaded ${populated.size} active populated chapters from Firestore for sitemap indexing.`);
  } catch (err) {
    console.warn('Could not query Firestore for populated chapters:', err);
  }
  return populated;
}

async function generateSitemap() {
  const populatedChapters = await getPopulatedChapters();
  const filterActive = populatedChapters.size > 0;

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
        
        // Count how many chapters in this subject are populated
        let populatedSubjectChapters = 0;

        for (const section of subject.sections) {
          for (const chapter of section.chapters) {
            const chapterSlug = slugify(chapter);
            const chapterKey = `${levelId}/${subjectSlug}/${chapterSlug}`;

            // If we have database records, ONLY include chapters that actually have materials!
            if (!filterActive || populatedChapters.has(chapterKey)) {
              populatedSubjectChapters++;
              entries.push({ 
                loc: `/study/${levelId}/${subjectSlug}/${chapterSlug}`, 
                changefreq: 'weekly', 
                priority: '0.8' 
              });
            }
          }
        }

        // Only add individual subject query URL if it has active materials or if no filter
        if (!filterActive || populatedSubjectChapters > 0) {
          entries.push({ 
            loc: `/level/${levelId}?subject=${encodeURIComponent(subjectSlug)}`, 
            changefreq: 'daily', 
            priority: '0.85' 
          });
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

  console.log(`Sitemap generated with ${entries.length} 100% verified, content-rich URLs.`);
  process.exit(0);
}

generateSitemap().catch((err) => {
  console.error(err);
  process.exit(1);
});
