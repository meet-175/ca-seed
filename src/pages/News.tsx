import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { contentStore, ContentItem } from '../content/store';
import { Bell, Calendar, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function News() {
  const [newsItems, setNewsItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    contentStore.getContentByLevel('News & Updates').then((content) => {
      const sorted = content.sort((a, b) => b.createdAt - a.createdAt);
      setNewsItems(sorted);
      setIsLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = newsItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Study Material': return 'text-purple-700 bg-purple-50 border-purple-100';
      case 'Exam Update': return 'text-red-700 bg-red-50 border-red-100';
      case 'Syllabus': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Professional Update': return 'text-indigo-700 bg-indigo-50 border-indigo-100';
      default: return 'text-blue-700 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Helmet>
        <title>News & Updates - CA Seed</title>
        <meta name="description" content="Stay up-to-date with the latest exam announcements, study material updates, and syllabus changes for CA students." />
        <meta property="og:title" content="News & Updates - CA Seed" />
        <meta property="og:description" content="Stay up-to-date with the latest exam announcements, study material updates, and syllabus changes for CA students." />
      </Helmet>
      <Header />
      
      <main className="flex-1 py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">News & Updates</h1>
            <p className="text-gray-500 font-medium mt-1">Latest announcements, study materials, and exam schedules.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            Loading updates...
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Bell className="w-10 h-10 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-lg font-medium text-gray-900 mb-1">No Updates Yet</p>
            <p>Check back later for new announcements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentNews.map((news) => (
              <Link 
                key={news.id || news.createdAt} 
                to={`/read/News & Updates?subject=${encodeURIComponent(news.subject)}&chapter=${encodeURIComponent(news.chapter)}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border", getCategoryColor(news.subject))}>
                      {news.subject}
                    </span>
                    <span className="flex items-center text-sm font-medium text-gray-500">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {news.chapter}
                  </h3>
                </div>
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
