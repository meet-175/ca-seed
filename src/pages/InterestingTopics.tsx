import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import AdUnit from '../components/AdUnit';
import { contentStore, ContentItem } from '../content/store';
import { 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  Search, 
  TrendingUp, 
  Scale, 
  Building2, 
  Calculator, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const DOMAIN_CATEGORIES = [
  { name: 'All Topics', icon: Sparkles },
  { name: 'Finance', icon: TrendingUp },
  { name: 'Law', icon: Scale },
  { name: 'Corporate', icon: Building2 },
  { name: 'Accounting', icon: Calculator },
  { name: 'Auditing', icon: ShieldCheck },
  { name: 'Special Insights', icon: Sparkles }
];

export default function InterestingTopics() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [topics, setTopics] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    // Reset to page 1 when filter or search changes
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    // Query items uploaded under 'Random Topic Authors Think Interesting'
    contentStore.getContentByLevel('Random Topic Authors Think Interesting').then((content) => {
      const sorted = content.sort((a, b) => b.createdAt - a.createdAt);
      
      // Strict deduplication by subject and chapter to prevent double-showing
      const seen = new Set<string>();
      const unique: ContentItem[] = [];
      for (const item of sorted) {
        const normKey = `${(item.subject || '').trim().toLowerCase()}:::${(item.chapter || '').trim().toLowerCase()}`;
        if (!seen.has(normKey)) {
          seen.add(normKey);
          unique.push(item);
        }
      }

      setTopics(unique);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const getDomainStyle = (domain: string) => {
    switch (domain?.toLowerCase()) {
      case 'finance':
        return 'text-[#009b88] bg-[#00FFE0]/15 border-[#00FFE0]/60';
      case 'law':
        return 'text-[#8E7618] bg-[#8E7618]/15 border-[#8E7618]/40';
      case 'corporate':
        return 'text-[#7335aa] bg-[#9966CC]/15 border-[#9966CC]/40';
      case 'accounting':
        return 'text-[#9132b0] bg-[#B666D2]/15 border-[#B666D2]/40';
      case 'auditing':
        return 'text-[#b95755] bg-[#F7CAC9]/30 border-[#F7CAC9]';
      case 'special insights':
        return 'text-[#7335aa] bg-[#9966CC]/15 border-[#9966CC]/40';
      default:
        return 'text-[#009b88] bg-[#00FFE0]/15 border-[#00FFE0]/60';
    }
  };

  const filteredTopics = useMemo(() => {
    const seen = new Set<string>();
    return topics.filter(item => {
      // Ensure absolute uniqueness
      const normKey = `${(item.subject || '').trim().toLowerCase()}:::${(item.chapter || '').trim().toLowerCase()}`;
      if (seen.has(normKey)) return false;
      seen.add(normKey);

      if (selectedCategory !== 'All Topics' && item.subject.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.chapter.toLowerCase().includes(q) ||
               item.subject.toLowerCase().includes(q) ||
               (item.body && item.body.toLowerCase().includes(q));
      }
      return true;
    });
  }, [topics, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTopics = filteredTopics.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Helmet>
        <title>Random Topics Authors Think Interesting - Beyond CA Syllabus | Chartered Seeds</title>
        <meta 
          name="description" 
          content="Explore real-world finance, corporate law, strategic accounting, M&A restructuring, and forensic auditing articles not covered in the CA syllabus." 
        />
        <meta property="og:title" content="Random Topics Authors Think Interesting - Beyond CA Syllabus" />
        <meta 
          property="og:description" 
          content="Explore real-world finance, corporate law, strategic accounting, M&A restructuring, and forensic auditing articles not covered in the CA syllabus." 
        />
      </Helmet>
      
      <Header />

      <main className="flex-1 py-10 px-4 md:px-6 max-w-5xl mx-auto w-full">
        {/* Hero Header */}
        <div 
          className="text-white rounded-3xl p-8 md:p-12 mb-8 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: '#36454F' }}
        >
          <div 
            className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: '#00FFE0' }}
          />
          <div 
            className="absolute left-0 bottom-0 -translate-x-10 translate-y-10 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: '#9966CC' }}
          />
          
          <div className="relative z-10 max-w-3xl">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: 'rgba(0, 255, 224, 0.12)', borderColor: '#00FFE0', color: '#00FFE0' }}
            >
              <Sparkles className="w-4 h-4 fill-[#00FFE0] text-[#00FFE0]" />
              <span>Beyond The Textbook</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Random Topic Authors Think Interesting
            </h1>

            <p style={{ color: '#F7CAC9' }} className="mt-4 text-sm md:text-base leading-relaxed font-normal">
              Special publication section for <strong className="text-white font-semibold">Finance, Law, Corporate Governance, Advanced Accounting & Forensic Auditing</strong> articles that go beyond what is taught in the standard CA curriculum.
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 flex-wrap text-xs md:text-sm" style={{ color: '#F7CAC9' }}>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" style={{ color: '#00FFE0' }} />
                <span>Real-World Case Studies</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4" style={{ color: '#B666D2' }} />
                <span>Statutory & Corporate Law</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" style={{ color: '#8E7618' }} />
                <span>Forensic Teardowns</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ad Placement 1 */}
        <AdUnit slot="newsTopBanner" className="mb-8" />

        {/* Search & Domain Filter Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic title, legal section, financial concept, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#9966CC] outline-none transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {DOMAIN_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer",
                    isSelected
                      ? "bg-[#00FFE0] text-[#36454F] border-[#00FFE0] shadow-xs font-extrabold"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {cat.name === 'All Topics' && topics.length > 0 && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.2 rounded-full text-[10px]",
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      {topics.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section: Gen-Z Rectangle Button / List Format (5 at a time) */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <div className="animate-spin w-8 h-8 border-4 border-[#9966CC] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading interesting topics...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No Matching Topics Found' : 'New Articles in Curation'}
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery 
                ? 'Try tweaking your search keywords or clear the category filter to explore all available topics.' 
                : 'The authors are actively writing and curating practical deep-dives on finance, law, corporate structuring, and forensic auditing.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Topics'); }}
                className="px-5 py-2 bg-[#36454F] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentTopics.map(topic => {
              const readUrl = `/read/${encodeURIComponent('Random Topic Authors Think Interesting')}?subject=${encodeURIComponent(topic.subject)}&chapter=${encodeURIComponent(topic.chapter)}`;
              return (
                <Link
                  key={topic.id}
                  to={readUrl}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#9966CC] hover:shadow-md transition-all gap-4 relative overflow-hidden"
                >
                  <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn("px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border", getDomainStyle(topic.subject))}>
                        {topic.subject}
                      </span>
                      <span className="flex items-center text-xs font-medium text-gray-400">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(topic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#7335aa] transition-colors leading-snug">
                      {topic.chapter}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      Detailed conceptual deep-dive into {topic.subject} authored beyond the CA syllabus.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7335aa] group-hover:text-[#9966CC] shrink-0 self-start sm:self-center bg-[#9966CC]/10 px-3.5 py-2 rounded-xl transition-all group-hover:bg-[#9966CC]/20">
                    <span>Read Article</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 5 Articles per Page Pagination (Same as News & Updates) */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
