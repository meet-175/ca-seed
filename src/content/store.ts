import { collection, doc, setDoc, getDocs, getDocsFromCache, query, where, orderBy, limit, Query } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ContentItem {
  id: string;
  level: string;
  subject: string;
  chapter: string;
  contentType: string;
  body: string;
  createdAt: number;
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

export const contentStore = {
  saveContent: async (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem: ContentItem = {
      ...item,
      id: newId,
      createdAt: Date.now(),
    };
    
    await setDoc(doc(db, 'content', newId), newItem);
    
    // Invalidate caches
    cache.allContent = null;
    cache.levelContent = {};
    cache.chapterContent = {};
    cache.specificContent = {};
    
    return newItem;
  },
  
  getAllContent: async (): Promise<ContentItem[]> => {
    if (cache.allContent) return cache.allContent;
    try {
      const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
      const snapshot = await fetchWithCacheFallback(q);
      const data = snapshot.docs.map(doc => doc.data() as ContentItem);
      cache.allContent = data;
      return data;
    } catch (error) {
      console.error("Error getting content:", error);
      return [];
    }
  },

  getContentByLevel: async (levelId: string): Promise<ContentItem[]> => {
    if (cache.levelContent[levelId]) return cache.levelContent[levelId];
    
    const formattedLevelId = 
      levelId === 'News & Updates' ? 'News & Updates' :
      levelId === 'foundation' ? 'CA Foundation' :
      levelId === 'intermediate' ? 'CA Intermediate' :
      levelId === 'final' ? 'CA Final' : '';
      
    try {
      const q = query(collection(db, 'content'), where('level', '==', formattedLevelId));
      const snapshot = await fetchWithCacheFallback(q);
      const data = snapshot.docs.map(doc => doc.data() as ContentItem);
      cache.levelContent[levelId] = data;
      return data;
    } catch (error) {
      console.error("Error getting content by level:", error);
      return [];
    }
  },

  getChapterContent: async (level: string, subject: string, chapter: string): Promise<ContentItem[]> => {
    const cacheKey = `${level}-${subject}-${chapter}`;
    if (cache.chapterContent[cacheKey]) return cache.chapterContent[cacheKey];

    try {
      const q = query(
        collection(db, 'content'),
        where('level', '==', level),
        where('subject', '==', subject),
        where('chapter', '==', chapter)
      );
      const snapshot = await fetchWithCacheFallback(q);
      const items = snapshot.docs.map(doc => doc.data() as ContentItem);
      // Group by contentType and return the most recent of each type
      const grouped = items.reduce((acc, item) => {
        if (!acc[item.contentType] || acc[item.contentType].createdAt < item.createdAt) {
          acc[item.contentType] = item;
        }
        return acc;
      }, {} as Record<string, ContentItem>);
      const result = Object.values(grouped);
      cache.chapterContent[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("Error getting chapter content:", error);
      return [];
    }
  },

  getContent: async (level: string, subject: string, chapter: string, contentType: string): Promise<ContentItem | undefined> => {
    const cacheKey = `${level}-${subject}-${chapter}-${contentType}`;
    if (cacheKey in cache.specificContent) return cache.specificContent[cacheKey];

    try {
      const q = query(
        collection(db, 'content'),
        where('level', '==', level),
        where('subject', '==', subject),
        where('chapter', '==', chapter),
        where('contentType', '==', contentType)
      );
      const snapshot = await fetchWithCacheFallback(q);
      const items = snapshot.docs.map(doc => doc.data() as ContentItem);
      // Return most recent if multiple
      const result = items.sort((a, b) => b.createdAt - a.createdAt)[0];
      cache.specificContent[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("Error getting specific content:", error);
      return undefined;
    }
  },

  exportToJson: async () => {
    const data = await contentStore.getAllContent();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ca-seed-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

