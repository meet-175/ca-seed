import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  Layers,
  ChevronRight,
  Filter,
  Bookmark,
  Activity
} from 'lucide-react';
import { SYLLABUS, SyllabusSubject } from '../data/syllabus';
import { slugify } from '../lib/slugs';
import { contentStore, ContentItem } from '../content/store';
import { cn } from '../lib/utils';
import { useBookmarks } from '../lib/libraryStore';

export interface SearchResultItem {
  id: string;
  type: 'subject' | 'chapter';
  levelName: 'CA Foundation' | 'CA Intermediate' | 'CA Final';
  levelSlug: 'foundation' | 'intermediate' | 'final';
  subjectName: string;
  subjectSlug: string;
  chapterName?: string;
  chapterSlug?: string;
  sectionTitle?: string;
  hasNotes?: boolean;
  hasQuestions?: boolean;
  hasMcq?: boolean;
  hasDiagnosis?: boolean;
  hasRandomTopics?: boolean;
}

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'All' | 'CA Foundation' | 'CA Intermediate' | 'CA Final'>('All');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [storeContent, setStoreContent] = useState<ContentItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { checkBookmarked } = useBookmarks();

  const hasLoadedContent = useRef(false);
  const loadStoreContent = () => {
    if (hasLoadedContent.current) return;
    hasLoadedContent.current = true;
    contentStore.getAllContent().then(items => {
      if (items) {
        setStoreContent(items);
      }
    }).catch(() => {
      // Syllabus fallback works completely offline
    });
  };

  // Global keyboard shortcut (Ctrl+K or Cmd+K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if (target === inputRef.current && e.key === 'Escape') {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        loadStoreContent();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        loadStoreContent();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build index from SYLLABUS + Firestore content
  const allIndexItems = useMemo(() => {
    const items: SearchResultItem[] = [];
    const levels: Array<{ name: 'CA Foundation' | 'CA Intermediate' | 'CA Final'; slug: 'foundation' | 'intermediate' | 'final' }> = [
      { name: 'CA Foundation', slug: 'foundation' },
      { name: 'CA Intermediate', slug: 'intermediate' },
      { name: 'CA Final', slug: 'final' }
    ];

    levels.forEach(lvl => {
      const subjects: SyllabusSubject[] = SYLLABUS[lvl.name] || [];
      subjects.forEach(subj => {
        const subjectSlug = slugify(subj.name);

        // Add Subject item
        items.push({
          id: `subj-${lvl.slug}-${subjectSlug}`,
          type: 'subject',
          levelName: lvl.name,
          levelSlug: lvl.slug,
          subjectName: subj.name,
          subjectSlug
        });

        // Add each chapter
        subj.sections.forEach(sec => {
          sec.chapters.forEach(chap => {
            const chapterSlug = slugify(chap);
            
            // Check if uploaded content exists
            const hasNotes = storeContent.some(c => 
              c.level === lvl.name && 
              c.subject === subj.name && 
              c.chapter === chap && 
              (c.contentType === 'Study Notes' || c.contentType === 'notes')
            );
            const hasQuestions = storeContent.some(c => 
              c.level === lvl.name && 
              c.subject === subj.name && 
              c.chapter === chap && 
              (c.contentType === 'Question Bank' || c.contentType === 'question-bank')
            );
            const hasMcq = storeContent.some(c => 
              c.level === lvl.name && 
              c.subject === subj.name && 
              c.chapter === chap && 
              (c.contentType === 'MCQ Bank' || c.contentType === 'mcq-bank' || c.contentType === 'Multiple Choice')
            );
            const hasDiagnosis = storeContent.some(c => 
              c.level === lvl.name && 
              c.subject === subj.name && 
              c.chapter === chap && 
              c.contentType === 'Question Diagnosis'
            );
            const hasRandomTopics = storeContent.some(c => 
              c.level === lvl.name && 
              c.subject === subj.name && 
              c.chapter === chap && 
              (c.contentType === 'Random Topic Authors Think Interesting' || c.contentType === 'Random Topics Authors Think Interesting')
            );

            // Hide chapters with no materials from the search index
            if (!hasNotes && !hasQuestions && !hasMcq && !hasDiagnosis && !hasRandomTopics) {
              return;
            }

            items.push({
              id: `chap-${lvl.slug}-${subjectSlug}-${chapterSlug}`,
              type: 'chapter',
              levelName: lvl.name,
              levelSlug: lvl.slug,
              subjectName: subj.name,
              subjectSlug,
              chapterName: chap,
              chapterSlug,
              sectionTitle: sec.title || undefined,
              hasNotes,
              hasQuestions,
              hasMcq,
              hasDiagnosis,
              hasRandomTopics
            });
          });
        });
      });
    });

    return items;
  }, [storeContent]);

  // Filtered & ranked results
  const searchResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    let filtered = allIndexItems.filter(item => {
      if (selectedLevelFilter !== 'All' && item.levelName !== selectedLevelFilter) {
        return false;
      }

      const subjectText = item.subjectName.toLowerCase();
      const chapterText = (item.chapterName || '').toLowerCase();
      const sectionText = (item.sectionTitle || '').toLowerCase();
      const levelText = item.levelName.toLowerCase();

      const combinedText = `${levelText} ${subjectText} ${sectionText} ${chapterText}`;

      // All tokens in query must match
      return queryWords.every(word => combinedText.includes(word));
    });

    // Score & Sort: Exact title match > startsWith > contains > subjects first if subject query
    filtered.sort((a, b) => {
      const aTitle = (a.type === 'subject' ? a.subjectName : a.chapterName || '').toLowerCase();
      const bTitle = (b.type === 'subject' ? b.subjectName : b.chapterName || '').toLowerCase();

      const aExact = aTitle === cleanQuery ? 1 : 0;
      const bExact = bTitle === cleanQuery ? 1 : 0;
      if (bExact !== aExact) return bExact - aExact;

      const aStarts = aTitle.startsWith(cleanQuery) ? 1 : 0;
      const bStarts = bTitle.startsWith(cleanQuery) ? 1 : 0;
      if (bStarts !== aStarts) return bStarts - aStarts;

      // If user typed a subject name, show subject first
      if (a.type === 'subject' && b.type !== 'subject') return -1;
      if (b.type === 'subject' && a.type !== 'subject') return 1;

      return 0;
    });

    return filtered.slice(0, 20); // Cap at top 20 relevant items
  }, [query, allIndexItems, selectedLevelFilter]);

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  const handleSelectResult = (item: SearchResultItem, hash?: string) => {
    setIsOpen(false);
    if (item.type === 'subject') {
      navigate(`/level/${item.levelSlug}?subject=${item.subjectSlug}`);
    } else {
      const destination = `/study/${item.levelSlug}/${item.subjectSlug}/${item.chapterSlug}${hash ? `#${hash}` : ''}`;
      navigate(destination);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetItem = selectedIndex >= 0 ? searchResults[selectedIndex] : searchResults[0];
      if (targetItem) {
        handleSelectResult(targetItem);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string, queryStr: string) => {
    if (!queryStr.trim()) return text;
    const words = queryStr.trim().split(/\s+/).filter(Boolean);
    const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, i) => 
      pattern.test(part) ? (
        <span key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const popularSearches = [
    'Depreciation',
    'Contract Act',
    'Final Accounts',
    'Taxation',
    'GST',
    'Company Accounts',
    'Auditing',
    'Ratio and Proportion'
  ];

  return (
    <div ref={containerRef} className="w-full max-w-3xl relative z-30 mb-8 px-2 sm:px-0">
      {/* Outer Glow & Main Search Bar Container */}
      <div 
        className={cn(
          "relative flex items-center bg-white rounded-2xl transition-all duration-200 border-2 shadow-xl",
          isOpen ? "border-amber-400 ring-4 ring-amber-400/20 shadow-2xl" : "border-white/20 hover:border-white/40"
        )}
      >
        <div className="pl-4 sm:pl-5 text-gray-400 flex items-center pointer-events-none">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            loadStoreContent();
          }}
          onFocus={() => {
            setIsOpen(true);
            loadStoreContent();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search topics, chapters, or subjects (e.g. Depreciation, Contract Act, Taxation)..."
          className="w-full py-4 sm:py-4.5 pl-3 sm:pl-4 pr-24 text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base bg-transparent focus:outline-none"
          aria-label="Search study materials by topic or subject"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results-list"
        />

        {/* Right side controls: Clear button + Keyboard shortcut indicator */}
        <div className="absolute right-3 sm:right-4 flex items-center gap-2">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200/80">
              <kbd>Ctrl</kbd>
              <span>+</span>
              <kbd>K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Popular Search Suggestions (shown when search is not open or empty) */}
      {!isOpen && (
        <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs text-white/80">
          <span className="font-semibold text-amber-300 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5" /> Popular:
          </span>
          {popularSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 hover:text-white text-white/90 rounded-full transition-colors border border-white/15"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Results Box */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Level Filter Tabs Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>Filter Level:</span>
            </div>
            <div className="flex items-center gap-1">
              {(['All', 'CA Foundation', 'CA Intermediate', 'CA Final'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all text-xs",
                    selectedLevelFilter === lvl
                      ? "bg-purple-700 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  )}
                >
                  {lvl === 'All' ? 'All Levels' : lvl.replace('CA ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div 
            ref={listRef}
            id="search-results-list"
            role="listbox"
            className="max-h-[60vh] sm:max-h-[460px] overflow-y-auto divide-y divide-gray-100 p-1.5 focus:outline-none"
          >
            {query.trim() === '' ? (
              // Empty query state in open dropdown
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Quick Search Study Materials</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Type any chapter, subject name, or CA topic to instantly find study notes, question banks, and solutions.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-purple-100 hover:text-purple-800 text-gray-700 rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              // No results state
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1">
                  No materials found for &ldquo;{query}&rdquo;
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Try checking your spelling or search by general subject names like &ldquo;Accounting&rdquo;, &ldquo;Taxation&rdquo;, or &ldquo;Business Laws&rdquo;.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLevelFilter('All')}
                    className="text-xs text-purple-700 font-semibold hover:underline"
                  >
                    Reset filters
                  </button>
                  <span className="text-gray-300">•</span>
                  <Link
                    to="/level/foundation"
                    className="text-xs text-blue-600 font-semibold hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse CA Foundation
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to="/level/intermediate"
                    className="text-xs text-purple-600 font-semibold hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse CA Inter
                  </Link>
                </div>
              </div>
            ) : (
              // Results items
              searchResults.map((item, index) => {
                const isSelected = selectedIndex === index;
                const isSubject = item.type === 'subject';

                const levelBadgeClass = 
                  item.levelSlug === 'foundation' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  item.levelSlug === 'intermediate' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  'bg-red-100 text-red-800 border-red-200';

                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectResult(item)}
                    className={cn(
                      "p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                      isSelected ? "bg-purple-50 ring-1 ring-purple-300" : "hover:bg-gray-50"
                    )}
                  >
                    {/* Left Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        isSubject ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {isSubject ? <Layers className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Breadcrumbs: Level & Subject */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", levelBadgeClass)}>
                            {item.levelName}
                          </span>
                          
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                            {item.subjectName}
                          </span>

                          {item.sectionTitle && (
                            <span className="text-[11px] text-gray-400 hidden md:inline truncate max-w-[200px]">
                              • {item.sectionTitle}
                            </span>
                          )}

                          {isSubject && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                              Complete Subject
                            </span>
                          )}

                          {!isSubject && checkBookmarked(item.levelSlug, item.subjectName, item.chapterName || '') && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded flex items-center gap-1">
                              <Bookmark className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>Saved</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h5 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-purple-900 transition-colors truncate">
                          {isSubject 
                            ? highlightMatch(item.subjectName, query) 
                            : highlightMatch(item.chapterName || '', query)}
                        </h5>
                      </div>
                    </div>

                    {/* Right side: Quick deep actions */}
                    <div 
                      className="flex items-center gap-1.5 shrink-0 pl-12 sm:pl-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSubject ? (
                        <button
                          type="button"
                          onClick={() => handleSelectResult(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold text-xs rounded-lg transition-colors"
                        >
                          View Subject
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.hasNotes && (
                            <button
                              type="button"
                              onClick={() => handleSelectResult(item, 'study-notes')}
                              title="Open Study Notes"
                              className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold text-xs rounded-lg border border-pink-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Notes</span>
                            </button>
                          )}

                          {item.hasQuestions && (
                            <button
                              type="button"
                              onClick={() => handleSelectResult(item, 'question-bank')}
                              title="Open Question Bank"
                              className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs rounded-lg border border-orange-200 transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Questions</span>
                            </button>
                          )}

                          {item.hasMcq && item.levelName !== 'CA Foundation' && (
                            <button
                              type="button"
                              onClick={() => handleSelectResult(item, 'mcq-bank')}
                              title="Open MCQs"
                              className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 transition-colors"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>MCQ</span>
                            </button>
                          )}

                          {item.hasDiagnosis && (
                            <button
                              type="button"
                              onClick={() => handleSelectResult(item, 'question-diagnosis')}
                              title="Open Question Diagnosis"
                              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-200 transition-colors"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Diagnosis</span>
                            </button>
                          )}

                          {item.hasRandomTopics && (
                            <button
                              type="button"
                              onClick={() => handleSelectResult(item, 'random-topics')}
                              title="Open Random Topic Authors Think Interesting"
                              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs rounded-lg border border-violet-200 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Interesting</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectResult(item)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Open in Reader"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note & count */}
          {searchResults.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>
                Showing <strong className="text-gray-800">{searchResults.length}</strong> matching materials
              </span>
              <span className="hidden sm:inline text-gray-400">
                Use <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">↑</kbd> <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">Enter</kbd> to open
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
