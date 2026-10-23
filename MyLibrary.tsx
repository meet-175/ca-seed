import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { useBookmarks } from '../lib/libraryStore';
import { 
  Bookmark, 
  Trash2, 
  BookOpen, 
  ArrowRight, 
  Search, 
  ArrowLeft, 
  Sparkles,
  FileText,
  HelpCircle,
  CheckSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function MyLibrary() {
  const { bookmarks, count, remove, clear } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'All' | 'CA Foundation' | 'CA Intermediate' | 'CA Final'>('All');
  const navigate = useNavigate();

  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    if (selectedLevelFilter !== 'All') {
      result = result.filter(b => b.levelName === selectedLevelFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.chapter.toLowerCase().includes(q) || 
        b.subject.toLowerCase().includes(q) ||
        b.levelName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [bookmarks, selectedLevelFilter, searchQuery]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved chapters from your library?')) {
      clear();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Helmet>
        <title>My Library - Saved Chapters | Chartered Seeds</title>
        <meta name="description" content="Access your saved chapters and bookmarked study materials on Chartered Seeds." />
      </Helmet>

      <Header />

      {/* Breadcrumb / Top Bar */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              My Library ({count})
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 md:p-10 mb-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-300 border border-white/10 mb-3">
                <Bookmark className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Personal Revision Hub</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                My Saved Chapters
              </h1>
              <p className="mt-2 text-white/80 text-sm md:text-base max-w-xl font-light">
                Quickly resume your study sessions with your bookmarked chapters, questions, and notes.
              </p>
            </div>

            {count > 0 && (
              <button
                onClick={handleClearAll}
                className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-200 rounded-xl text-xs md:text-sm font-semibold transition-colors border border-white/15"
              >
                <Trash2 className="w-4 h-4" />
                Clear Library
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Controls (if bookmarks exist) */}
        {count > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search within bookmarks */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved chapters..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900"
              />
            </div>

            {/* Level Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['All', 'CA Foundation', 'CA Intermediate', 'CA Final'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all",
                    selectedLevelFilter === lvl
                      ? "bg-purple-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {lvl === 'All' ? 'All Levels' : lvl.replace('CA ', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks List or Empty State */}
        {count === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 md:p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Bookmark className="w-8 h-8 fill-amber-500/20 text-amber-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Your Library is Empty
            </h3>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
              You haven&apos;t saved any chapters to your library yet. While reading any chapter, tap the bookmark icon to save it here for fast revision!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/level/foundation"
                className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs md:text-sm rounded-xl transition-colors border border-blue-200"
              >
                Browse CA Foundation
              </Link>
              <Link
                to="/level/intermediate"
                className="px-5 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs md:text-sm rounded-xl transition-colors border border-purple-200"
              >
                Browse CA Intermediate
              </Link>
              <Link
                to="/level/final"
                className="px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs md:text-sm rounded-xl transition-colors border border-red-200"
              >
                Browse CA Final
              </Link>
            </div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-gray-700 font-bold mb-1">No matching saved chapters</p>
            <p className="text-xs text-gray-500 mb-4">No bookmarks matched your search &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedLevelFilter('All'); }}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookmarks.map((item) => {
              const levelBadgeClass = 
                item.levelId === 'foundation' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                item.levelId === 'intermediate' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                'bg-red-100 text-red-800 border-red-200';

              const readerUrl = `/study/${item.levelId}/${item.subjectSlug}/${item.chapterSlug}`;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Level Badge, Subject, and Remove Button */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", levelBadgeClass)}>
                          {item.levelName}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {item.subject}
                        </span>
                      </div>

                      <button
                        onClick={() => remove(item.id)}
                        title="Remove from My Library"
                        className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Chapter Title */}
                    <Link
                      to={readerUrl}
                      className="block text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-4"
                    >
                      {item.chapter}
                    </Link>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`${readerUrl}#study-notes`}
                        className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold rounded-lg transition-colors border border-pink-200"
                        title="Open Study Notes"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Notes</span>
                      </Link>
                      <Link
                        to={`${readerUrl}#question-bank`}
                        className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg transition-colors border border-orange-200"
                        title="Open Question Bank"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Questions</span>
                      </Link>
                      {item.levelName !== 'CA Foundation' && (
                        <Link
                          to={`${readerUrl}#mcq-bank`}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
                          title="Open MCQs"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">MCQ</span>
                        </Link>
                      )}
                    </div>

                    <Link
                      to={readerUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm group-hover:scale-105"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
