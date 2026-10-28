import { collection, doc, setDoc, getDocs, getDocsFromCache, query, where, orderBy, Query, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ContentItem {
  id: string;
  level: string;
  subject: string;
  chapter: string;
  contentType: string;
  body: string;
  createdAt: number;
}

export interface DownloadItemOptions {
  format?: 'html' | 'md' | 'json';
  unrenderLatex?: boolean;
  standardizeDelimiters?: boolean;
}

const cache: {
  allContent: ContentItem[] | null;
  levelContent: Record<string, ContentItem[]>;
  chapterContent: Record<string, ContentItem[]>;
  specificContent: Record<string, ContentItem | undefined>;
} = {
  allContent: null,
  levelContent: {},
  chapterContent: {},
  specificContent: {},
};

// Helper function to handle fallback to cache when quota is exceeded
const fetchWithCacheFallback = async (q: Query) => {
  try {
    return await getDocs(q);
  } catch (error: any) {
    console.warn("Network request failed (possibly quota exceeded), falling back to local cache.", error);
    try {
      return await getDocsFromCache(q);
    } catch (cacheError) {
      console.error("Cache fallback also failed:", cacheError);
      throw error; // Throw original error if cache also fails
    }
  }
};

/**
 * Decodes standard HTML entities commonly found inside TeX and formula tags.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Accurately extracts matching balanced HTML tags to handle deeply nested KaTeX and MathJax DOM trees.
 */
function extractBalancedTag(str: string, startIndex: number, tagName: string): { fullMatch: string, endIndex: number } | null {
  const openTagRegex = new RegExp('^<' + tagName + '(\\s+[^>]*)?>', 'i');
  const match = str.slice(startIndex).match(openTagRegex);
  if (!match) return null;
  
  let depth = 1;
  const currentIndex = startIndex + match[0].length;
  const tagSearch = new RegExp('</?' + tagName + '(\\s+[^>]*)?>', 'gi');
  tagSearch.lastIndex = currentIndex;
  
  let m;
  while ((m = tagSearch.exec(str)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        return {
          fullMatch: str.slice(startIndex, tagSearch.lastIndex),
          endIndex: tagSearch.lastIndex
        };
      }
    } else if (!m[0].endsWith('/>')) {
      depth++;
    }
  }
  return null;
}

/**
 * Unrenders LaTeX:
 * 1. Accurately converts pre-rendered KaTeX spans (inline & display) back to raw $...$ and $$...$$.
 * 2. Converts MathJax v3 <mjx-container> back to raw $...$ and $$...$$.
 * 3. Converts MathJax v2 elements and <script type="math/tex"> back to raw LaTeX.
 * 4. Converts MathML <annotation encoding="application/x-tex"> back to raw LaTeX.
 * 5. Completely removes MathJax and KaTeX scripts, configs, and stylesheets so opening the file doesn't render into graphical elements.
 * 6. Restores readable currency symbols and standardizes delimiters.
 */
export function unrenderLatex(content: string, options?: { standardizeDelimiters?: boolean }): string {
  if (!content) return '';
  let res = content;

  // 1. Remove MathJax and KaTeX rendering scripts, configs, and stylesheets
  res = res.replace(/<script\b[^>]*?(?:mathjax|katex)[^>]*?>[\s\S]*?<\/script>/gi, '');
  res = res.replace(/<script\b[^>]*?>[\s\S]*?(?:renderMathInElement|window\.MathJax|MathJax\s*=)[\s\S]*?<\/script>/gi, '');
  res = res.replace(/<link\b[^>]*?(?:katex|mathjax)[^>]*?\/?>/gi, '');

  // 2. Remove MathJax preview elements
  res = res.replace(/<span\b[^>]*class=[\"'][^\"']*MathJax_Preview[^\"']*[\"'][^>]*>[\s\S]*?<\/span>/gi, '');

  // 3. Process KaTeX spans using balanced matching (handles nested <span> tags cleanly)
  let safetyLimit = 3000;
  let katexIdx: number;
  while ((katexIdx = res.search(/<span\b[^>]*class=[\"'][^\"']*(?:katex-display|katex)[^\"']*[\"']/i)) !== -1 && safetyLimit-- > 0) {
    const balanced = extractBalancedTag(res, katexIdx, 'span');
    if (!balanced) {
      res = res.slice(0, katexIdx) + res.slice(katexIdx + 1);
      continue;
    }
    
    const block = balanced.fullMatch;
    const isDisplay = /class=[\"'][^\"']*katex-display/i.test(block);
    
    // Extract annotation
    const annotMatch = block.match(/<annotation\b[^>]*encoding=[\"'](?:application\/x-tex|application\/x-latex)[\"'][^>]*>([\s\S]*?)<\/annotation>/i);
    let tex = annotMatch ? annotMatch[1] : '';
    
    if (tex) {
      tex = decodeHtmlEntities(tex).trim();
      const replacement = isDisplay ? ('\n\n$$\n' + tex + '\n$$\n\n') : ('$' + tex + '$');
      res = res.slice(0, katexIdx) + replacement + res.slice(balanced.endIndex);
    } else {
      res = res.slice(0, katexIdx) + res.slice(balanced.endIndex);
    }
  }

  // 4. Process MathJax <mjx-container> using balanced matching
  safetyLimit = 3000;
  let mjxIdx: number;
  while ((mjxIdx = res.search(/<mjx-container\b/i)) !== -1 && safetyLimit-- > 0) {
    const balanced = extractBalancedTag(res, mjxIdx, 'mjx-container');
    if (!balanced) {
      res = res.slice(0, mjxIdx) + res.slice(mjxIdx + 1);
      continue;
    }

    const block = balanced.fullMatch;
    const isDisplay = /display=[\"']true[\"']/i.test(block) || /class=[\"'][^\"']*display/i.test(block);
    
    let tex = '';
    const texAttrMatch = block.match(/data-tex=[\"']([\s\S]*?)[\"']/i);
    if (texAttrMatch) {
      tex = texAttrMatch[1];
    } else {
      const annotMatch = block.match(/<annotation\b[^>]*encoding=[\"'](?:application\/x-tex|application\/x-latex)[\"'][^>]*>([\s\S]*?)<\/annotation>/i);
      if (annotMatch) tex = annotMatch[1];
    }

    if (tex) {
      tex = decodeHtmlEntities(tex).trim();
      const replacement = isDisplay ? ('\n\n$$\n' + tex + '\n$$\n\n') : ('$' + tex + '$');
      res = res.slice(0, mjxIdx) + replacement + res.slice(balanced.endIndex);
    } else {
      res = res.slice(0, mjxIdx) + res.slice(balanced.endIndex);
    }
  }

  // 5. Standalone MathML <math> tags with annotation
  res = res.replace(/<math\b([^>]*)>[\s\S]*?<annotation\b[^>]*encoding=[\"'](?:application\/x-tex|application\/x-latex)[\"'][^>]*>([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/gi, (_match, attrs, tex) => {
    const isDisplay = /display=[\"']block[\"']/i.test(attrs);
    const cleanTex = decodeHtmlEntities(tex).trim();
    return isDisplay ? ('\n\n$$\n' + cleanTex + '\n$$\n\n') : ('$' + cleanTex + '$');
  });

  // 6. MathJax script tags like <script type="math/tex; mode=display">...</script>
  res = res.replace(/<script\b[^>]*type=[\"']math\/tex(?:;\s*mode=display)?[\"'][^>]*>([\s\S]*?)<\/script>/gi, (match, tex) => {
    const isDisplay = /mode=display/i.test(match);
    const cleanTex = decodeHtmlEntities(tex).trim();
    return isDisplay ? ('\n\n$$\n' + cleanTex + '\n$$\n\n') : ('$' + cleanTex + '$');
  });

  // 7. Replace KaTeX bounding box fixes like \text{Rs. } back to ₹
  res = res.replace(/\\text\{\s*Rs\.\s*\}/g, '₹');

  // 8. Standardize LaTeX delimiters \( ... \) -> $ ... $ and \[ ... \] -> $$ ... $$ if requested
  if (options?.standardizeDelimiters) {
    res = res.replace(/\\\(([\s\S]*?)\\\)/g, (_match, p1) => '$' + p1 + '$');
    res = res.replace(/\\\[([\s\S]*?)\\\]/g, (_match, p1) => '\n\n$$\n' + p1 + '\n$$\n\n');
  }

  return res;
}

/**
 * Converts HTML content to clean Markdown/plain text while keeping LaTeX formulas intact.
 */
export function htmlToMarkdownWithLatex(html: string): string {
  let md = html;
  md = md.replace(/<head[\s\S]*?<\/head>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');

  md = md.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_m, p1) => '\n\n# ' + p1 + '\n\n');
  md = md.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_m, p1) => '\n\n## ' + p1 + '\n\n');
  md = md.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_m, p1) => '\n\n### ' + p1 + '\n\n');
  md = md.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (_m, p1) => '\n\n#### ' + p1 + '\n\n');
  md = md.replace(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi, (_m, p1) => '\n\n##### ' + p1 + '\n\n');
  md = md.replace(/<h6\b[^>]*>([\s\S]*?)<\/h6>/gi, (_m, p1) => '\n\n###### ' + p1 + '\n\n');

  md = md.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_m, p1) => '**' + p1 + '**');
  md = md.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_m, p1) => '*' + p1 + '*');

  md = md.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, p1) => '\n- ' + p1);
  md = md.replace(/<\/?(?:ul|ol)\b[^>]*>/gi, '\n');

  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_m, p1) => '\n\n' + p1 + '\n\n');
  md = md.replace(/<div\b[^>]*>([\s\S]*?)<\/div>/gi, (_m, p1) => '\n' + p1 + '\n');

  md = md.replace(/<th\b[^>]*>([\s\S]*?)<\/th>/gi, (_m, p1) => ' | ' + p1);
  md = md.replace(/<td\b[^>]*>([\s\S]*?)<\/td>/gi, (_m, p1) => ' | ' + p1);
  md = md.replace(/<\/tr>/gi, ' |\n');
  md = md.replace(/<\/?(?:table|tbody|thead|tr)\b[^>]*>/gi, '');

  md = md.replace(/<[^>]+>/g, '');

  md = decodeHtmlEntities(md);
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

/**
 * Automatically cleans and repairs unrendered or malformed LaTeX formulas:
 * - Escapes unescaped % inside $$...$$, $...$, and \(...\) to prevent TeX comment truncations
 * - Protects currency dollar signs from interfering with TeX parsing
 */
export function cleanLatexFormulas(body: string): string {
  if (!body) return '';
  let res = body;

  // 1. In $$ ... $$ display blocks
  res = res.replace(/\$\$([\s\S]*?)\$\$/g, (_match, mathContent) => {
    const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
    return `$$${fixedMath}$$`;
  });

  // 2. In \( ... \) inline blocks
  res = res.replace(/\\\(([\s\S]*?)\\\)/g, (_match, mathContent) => {
    const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
    return `\\(${fixedMath}\\)`;
  });

  // 3. In $ ... $ inline blocks
  res = res.replace(/(?<!\$)\$([^$\n\r]+)\$(?!\$)/g, (_match, mathContent) => {
    const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
    return `$${fixedMath}$`;
  });

  // 4. Normalize legacy PYP tags to standard PYQ
  res = res.replace(/\bPYP\b/g, 'PYQ');

  // 5. Remove any legacy old SM, new sm, and old & new SM tags
  res = res
    .replace(/([/·•|,;\-])\s*\b(?:old\s*(?:&|and|\/|\+)?\s*new|new\s*(?:&|and|\/|\+)?\s*old|old|new)\s+sm\b\s*([/·•|,;\-])/gi, '$1 ')
    .replace(/\b(?:old\s*(?:&|and|\/|\+)?\s*new|new\s*(?:&|and|\/|\+)?\s*old|old|new)\s+sm\b\s*([/·•|,;\-])\s*/gi, '')
    .replace(/\s*([/·•|,;\-])\s*\b(?:old\s*(?:&|and|\/|\+)?\s*new|new\s*(?:&|and|\/|\+)?\s*old|old|new)\s+sm\b/gi, '')
    .replace(/\b(?:old\s*(?:&|and|\/|\+)?\s*new|new\s*(?:&|and|\/|\+)?\s*old|old|new)\s+sm\b/gi, '')
    .replace(/<span\b[^>]*>\s*<\/span>/gi, '');

  return res;
}

// Helper to clear all Chartered Seeds session cache keys
const clearSessionCache = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('cs_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {}
};

// In-flight query deduplication map to prevent duplicate parallel requests
const inFlightQueries = new Map<string, Promise<any>>();
function dedupeQuery<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
  if (inFlightQueries.has(key)) {
    return inFlightQueries.get(key) as Promise<T>;
  }
  const promise = queryFn().finally(() => {
    inFlightQueries.delete(key);
  });
  inFlightQueries.set(key, promise);
  return promise;
}

export const contentStore = {
  saveContent: async (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    let targetId = Math.random().toString(36).substr(2, 9);
    try {
      const q = query(
        collection(db, 'content'),
        where('level', '==', item.level),
        where('subject', '==', item.subject),
        where('chapter', '==', item.chapter),
        where('contentType', '==', item.contentType)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetId = snap.docs[0].id;
      }
    } catch (e) {}

    const cleanedBody = cleanLatexFormulas(item.body);
    const newItem: ContentItem = {
      ...item,
      body: cleanedBody,
      id: targetId,
      createdAt: Date.now(),
    };
    
    await setDoc(doc(db, 'content', targetId), newItem);
    
    // Invalidate caches
    cache.allContent = null;
    cache.levelContent = {};
    cache.chapterContent = {};
    cache.specificContent = {};
    clearSessionCache();
    
    return newItem;
  },
  
  getAllContent: async (): Promise<ContentItem[]> => {
    if (cache.allContent) return cache.allContent;

    // Check sessionStorage cache (1 hour TTL)
    try {
      const cached = sessionStorage.getItem('cs_all_content');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          cache.allContent = parsed.data;
          return parsed.data;
        }
      }
    } catch (e) {}

    return dedupeQuery('all_content', async () => {
      try {
        const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
        const snapshot = await fetchWithCacheFallback(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentItem));
        cache.allContent = data;
        try {
          sessionStorage.setItem('cs_all_content', JSON.stringify({ timestamp: Date.now(), data }));
        } catch (e) {}
        return data;
      } catch (error) {
        console.error("Error getting content:", error);
        return [];
      }
    });
  },

  getContentByLevel: async (levelId: string): Promise<ContentItem[]> => {
    if (cache.levelContent[levelId]) return cache.levelContent[levelId];

    const formattedLevelId = 
      levelId === 'News & Updates' ? 'News & Updates' :
      (levelId === 'foundation' || levelId === 'CA Foundation') ? 'CA Foundation' :
      (levelId === 'intermediate' || levelId === 'CA Intermediate') ? 'CA Intermediate' :
      (levelId === 'final' || levelId === 'CA Final') ? 'CA Final' : levelId;

    // Check sessionStorage to reduce Firebase read quota consumption
    try {
      const cached = sessionStorage.getItem(`cs_lvl_${formattedLevelId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) { // 1 hour TTL
          const rawCached = parsed.data || [];
          // Deduplicate cached data by subject and chapter to ensure zero duplicates
          const seenKeys = new Set<string>();
          const deduped: ContentItem[] = [];
          for (const item of rawCached) {
            const key = `${(item.subject || '').trim().toLowerCase()}:::${(item.chapter || '').trim().toLowerCase()}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              deduped.push(item);
            }
          }
          cache.levelContent[levelId] = deduped;
          return deduped;
        }
      }
    } catch (e) {}

    return dedupeQuery(`lvl_${formattedLevelId}`, async () => {
      try {
        const q = query(collection(db, 'content'), where('level', '==', formattedLevelId));
        const snapshot = await fetchWithCacheFallback(q);
        const rawDocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentItem));
        // Sort newest first
        rawDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        // Deduplicate by ID and subject+chapter
        const seenIds = new Set<string>();
        const seenKeys = new Set<string>();
        const data: ContentItem[] = [];
        for (const item of rawDocs) {
          const key = `${(item.subject || '').trim().toLowerCase()}:::${(item.chapter || '').trim().toLowerCase()}`;
          if (!seenIds.has(item.id) && !seenKeys.has(key)) {
            seenIds.add(item.id);
            seenKeys.add(key);
            data.push(item);
          }
        }
        cache.levelContent[levelId] = data;
        try {
          sessionStorage.setItem(`cs_lvl_${formattedLevelId}`, JSON.stringify({ timestamp: Date.now(), data }));
        } catch (e) {}
        return data;
      } catch (error) {
        console.error("Error getting content by level:", error);
        return [];
      }
    });
  },

  getChapterContent: async (level: string, subject: string, chapter: string): Promise<ContentItem[]> => {
    const cacheKey = `${level}-${subject}-${chapter}`;
    if (cache.chapterContent[cacheKey]) return cache.chapterContent[cacheKey];

    // Check sessionStorage
    try {
      const cached = sessionStorage.getItem(`cs_chap_${cacheKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          cache.chapterContent[cacheKey] = parsed.data;
          return parsed.data;
        }
      }
    } catch (e) {}

    return dedupeQuery(`chap_${cacheKey}`, async () => {
      try {
        const q = query(
          collection(db, 'content'),
          where('level', '==', level),
          where('subject', '==', subject),
          where('chapter', '==', chapter)
        );
        const snapshot = await fetchWithCacheFallback(q);
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentItem));
        // Group by contentType and return the most recent of each type
        const grouped = items.reduce((acc, item) => {
          if (!acc[item.contentType] || acc[item.contentType].createdAt < item.createdAt) {
            acc[item.contentType] = item;
          }
          return acc;
        }, {} as Record<string, ContentItem>);
        const result = Object.values(grouped);
        cache.chapterContent[cacheKey] = result;
        try {
          sessionStorage.setItem(`cs_chap_${cacheKey}`, JSON.stringify({ timestamp: Date.now(), data: result }));
        } catch (e) {}
        return result;
      } catch (error) {
        console.error("Error getting chapter content:", error);
        return [];
      }
    });
  },

  getContent: async (level: string, subject: string, chapter: string, contentType: string): Promise<ContentItem | undefined> => {
    const cacheKey = `${level}-${subject}-${chapter}-${contentType}`;
    if (cacheKey in cache.specificContent) return cache.specificContent[cacheKey];

    return dedupeQuery(`item_${cacheKey}`, async () => {
      try {
        const q = query(
          collection(db, 'content'),
          where('level', '==', level),
          where('subject', '==', subject),
          where('chapter', '==', chapter),
          where('contentType', '==', contentType)
        );
        const snapshot = await fetchWithCacheFallback(q);
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContentItem));
        // Return most recent if multiple
        const result = items.sort((a, b) => b.createdAt - a.createdAt)[0];
        cache.specificContent[cacheKey] = result;
        return result;
      } catch (error) {
        console.error("Error getting specific content:", error);
        return undefined;
      }
    });
  },

  deleteContent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', id));
      
      // Invalidate caches
      cache.allContent = null;
      cache.levelContent = {};
      cache.chapterContent = {};
      cache.specificContent = {};
      clearSessionCache();
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  },

  exportToJson: async (options?: { unrenderLatex?: boolean }) => {
    const data = await contentStore.getAllContent();
    const shouldUnrender = options?.unrenderLatex !== false;
    const finalData = shouldUnrender 
      ? data.map(item => ({ ...item, body: unrenderLatex(item.body, { standardizeDelimiters: true }) }))
      : data;
    const blob = new Blob([JSON.stringify(finalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = shouldUnrender ? 'chartered-seeds-content-unrendered-latex.json' : 'chartered-seeds-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadItem: (item: ContentItem, options: DownloadItemOptions | 'html' | 'md' | 'json' = {}) => {
    const opts: DownloadItemOptions = typeof options === 'string' 
      ? { format: options, unrenderLatex: true, standardizeDelimiters: true } 
      : { unrenderLatex: true, standardizeDelimiters: true, ...options };

    const format = opts.format || 'html';
    const shouldUnrender = opts.unrenderLatex !== false;

    let processedBody = shouldUnrender 
      ? unrenderLatex(item.body, { standardizeDelimiters: opts.standardizeDelimiters !== false }) 
      : item.body;

    let content: string;
    let mimeType: string;
    let extension: string;

    const sanitizeFilename = (name: string) => {
      return name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
    };

    const baseName = sanitizeFilename(`${item.level} - ${item.subject} - ${item.chapter} - ${item.contentType}`);

    if (format === 'json') {
      const exportItem = shouldUnrender ? { ...item, body: processedBody } : item;
      content = JSON.stringify(exportItem, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else if (format === 'md') {
      const isHtml = processedBody.trim().toLowerCase().startsWith('<!doctype html>') || processedBody.trim().toLowerCase().startsWith('<html');
      content = isHtml ? htmlToMarkdownWithLatex(processedBody) : processedBody;
      mimeType = 'text/markdown;charset=utf-8';
      extension = 'md';
    } else {
      content = processedBody;
      const isHtml = content.trim().toLowerCase().startsWith('<!doctype html>') || content.trim().toLowerCase().startsWith('<html');
      mimeType = isHtml ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8';
      extension = isHtml ? 'html' : 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadItemsAsJson: (items: ContentItem[], filename: string, options?: { unrenderLatex?: boolean }) => {
    const sanitizeFilename = (name: string) => {
      return name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
    };
    const shouldUnrender = options?.unrenderLatex !== false;
    const finalItems = shouldUnrender
      ? items.map(item => ({ ...item, body: unrenderLatex(item.body, { standardizeDelimiters: true }) }))
      : items;
    const blob = new Blob([JSON.stringify(finalItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(filename)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadItemsAsMarkdownBundle: (items: ContentItem[], filename: string, options?: { unrenderLatex?: boolean }) => {
    const sanitizeFilename = (name: string) => {
      return name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
    };
    const shouldUnrender = options?.unrenderLatex !== false;

    const sections = items.map(item => {
      const cleanBody = shouldUnrender ? unrenderLatex(item.body, { standardizeDelimiters: true }) : item.body;
      const isHtml = cleanBody.trim().toLowerCase().startsWith('<!doctype html>') || cleanBody.trim().toLowerCase().startsWith('<html');
      const mdBody = isHtml ? htmlToMarkdownWithLatex(cleanBody) : cleanBody;

      return `# ${item.level} > ${item.subject} > ${item.chapter}\n### ${item.contentType}\n*Uploaded: ${new Date(item.createdAt).toLocaleDateString()}*\n\n${mdBody}\n\n---\n`;
    });

    const bundleContent = sections.join('\n\n');
    const blob = new Blob([bundleContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(filename)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
