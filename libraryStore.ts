import { useState, useEffect, useCallback } from 'react';
import { slugify } from './slugs';

export interface BookmarkedChapter {
  id: string;
  levelId: string;
  levelName: string;
  subject: string;
  subjectSlug: string;
  chapter: string;
  chapterSlug: string;
  savedAt: number;
}

const STORAGE_KEY = 'chartered_seeds_my_library_bookmarks_v1';
const UPDATE_EVENT = 'chartered_seeds_bookmarks_updated';

export function generateBookmarkId(levelId: string, subject: string, chapter: string): string {
  return `${slugify(levelId)}--${slugify(subject)}--${slugify(chapter)}`;
}

export function getBookmarks(): BookmarkedChapter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error reading bookmarks from localStorage:', e);
    return [];
  }
}

function saveBookmarksToStorage(items: BookmarkedChapter[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: items }));
  } catch (e) {
    console.error('Error saving bookmarks to localStorage:', e);
  }
}

export function isChapterBookmarked(levelId: string, subject: string, chapter: string): boolean {
  if (!levelId || !subject || !chapter) return false;
  const targetId = generateBookmarkId(levelId, subject, chapter);
  const all = getBookmarks();
  return all.some(b => b.id === targetId);
}

export function toggleChapterBookmark(data: {
  levelId: string;
  levelName: string;
  subject: string;
  chapter: string;
}): boolean {
  const { levelId, levelName, subject, chapter } = data;
  const id = generateBookmarkId(levelId, subject, chapter);
  const current = getBookmarks();
  const exists = current.some(b => b.id === id);

  if (exists) {
    // Remove
    const updated = current.filter(b => b.id !== id);
    saveBookmarksToStorage(updated);
    return false; // now unbookmarked
  } else {
    // Add
    const newItem: BookmarkedChapter = {
      id,
      levelId,
      levelName,
      subject,
      subjectSlug: slugify(subject),
      chapter,
      chapterSlug: slugify(chapter),
      savedAt: Date.now()
    };
    const updated = [newItem, ...current];
    saveBookmarksToStorage(updated);
    return true; // now bookmarked
  }
}

export function removeBookmark(id: string): void {
  const current = getBookmarks();
  const updated = current.filter(b => b.id !== id);
  saveBookmarksToStorage(updated);
}

export function clearAllBookmarks(): void {
  saveBookmarksToStorage([]);
}

/**
 * React hook to listen to library bookmark changes across components and tabs
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedChapter[]>(() => getBookmarks());

  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(getBookmarks());
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const toggle = useCallback((data: {
    levelId: string;
    levelName: string;
    subject: string;
    chapter: string;
  }) => {
    return toggleChapterBookmark(data);
  }, []);

  const remove = useCallback((id: string) => {
    removeBookmark(id);
  }, []);

  const clear = useCallback(() => {
    clearAllBookmarks();
  }, []);

  const checkBookmarked = useCallback((levelId: string, subject: string, chapter: string) => {
    return isChapterBookmarked(levelId, subject, chapter);
  }, []);

  return {
    bookmarks,
    count: bookmarks.length,
    toggle,
    remove,
    clear,
    checkBookmarked
  };
}
