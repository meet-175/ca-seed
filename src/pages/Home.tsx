import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import AdUnit from '../components/AdUnit';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Send, 
  Link as LinkIcon, 
  Book, 
  Layers, 
  Target, 
  ArrowRight,
  Info,
  Bell,
  Bookmark
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useBookmarks } from '../lib/libraryStore';

export default function Home() {
  const { count: libraryCount } = useBookmarks();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = "Hey, found really good study material";
  // Fallback to window.location.href in the handlers
  
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelOptions = [
    { label: 'CA Foundation', path: '/level/foundation' },
    { label: 'CA Intermediate', path: '/level/intermediate' },
    { label: 'CA Final', path: '/level/final' }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Helmet>
        <title>CA Inter Free Study Material, CA Foundation Question Bank & Notes | Chartered Seeds</title>
        <meta name="description" content="Access free CA Foundation question bank with answers, chapter-wise free CA Inter notes, CA Inter Taxation PYQ, Advanced Accounting CA Inter notes, and Corporate & Other Laws summary." />
        <meta name="keywords" content="CA Inter free study material, free CA Foundation question bank with answers, Chapter-wise free CA Inter notes, CA Inter Taxation PYQ, Advanced Accounting CA Inter notes, CA Foundation Business Economics MCQs, Corporate and Other Laws summary notes" />
        <meta property="og:title" content="CA Inter Free Study Material, CA Foundation Question Bank & Notes | Chartered Seeds" />
        <meta property="og:description" content="Access free CA Foundation question bank with answers, chapter-wise free CA Inter notes, CA Inter Taxation PYQ, Advanced Accounting CA Inter notes, and Corporate & Other Laws summary." />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="CA Inter Free Study Material, CA Foundation Question Bank & Notes | Chartered Seeds" />
        <meta name="twitter:description" content="Access free CA Foundation question bank with answers, chapter-wise free CA Inter notes, CA Inter Taxation PYQ, Advanced Accounting CA Inter notes, and Corporate & Other Laws summary." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Chartered Seeds",
            "url": "https://chartered-seed.online/",
            "description": "Free CA Inter study material, chapter-wise free CA Inter notes, and free CA Foundation question bank with answers.",
            "publisher": {
              "@type": "Organization",
              "name": "Chartered Seeds"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Where can I get CA Inter free study material and chapter-wise notes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chartered Seeds provides 100% free chapter-wise CA Inter notes, Advanced Accounting study material, Corporate and Other Laws summary notes, and Taxation PYQs."
                }
              },
              {
                "@type": "Question",
                "name": "How to access free CA Foundation question bank with answers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Browse our dedicated CA Foundation portal for complete question banks with verified step-by-step solutions and Business Economics MCQs based on ICAI past papers."
                }
              },
              {
                "@type": "Question",
                "name": "Are CA Inter Taxation PYQs and Advanced Accounting notes updated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all CA Inter Taxation PYQs, Corporate and Other Laws summaries, and Advanced Accounting question banks reflect the latest ICAI syllabus and statutory updates."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 px-6 flex flex-col items-center text-center overflow-hidden"
        style={{ backgroundColor: '#4c1d95' }} // dark purple
      >
        {/* Plus pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 19V5h2v14h14v2H21v14h-2V21H5v-2h14z' fill='%23ffffff'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* High-Intent Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs md:text-sm font-semibold mb-6">
            <span>✨ Free CA Foundation, Inter & Final Resources</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-2 leading-tight">
            Your Ultimate Resource for <br />
            <span style={{ color: '#ff7043' }}>Chartered Accountancy</span>
          </h1>
          
          <p className="mt-4 text-base md:text-xl text-white/90 max-w-2xl font-light mb-8">
            Access <strong className="font-semibold text-white">CA Inter free study material</strong>, <strong className="font-semibold text-white">free CA Foundation question banks with answers</strong>, and chapter-wise revision notes.
          </p>

          {/* Global Search Bar */}
          <GlobalSearchBar />

          {/* High-Value Intent & Subject Keyword Quick Pills */}
          <div className="mt-4 mb-8 max-w-3xl flex flex-wrap items-center justify-center gap-2 px-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1 mr-1">
              Popular Searches:
            </span>
            <Link
              to="/level/intermediate?subject=taxation"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              CA Inter Taxation PYQ
            </Link>
            <Link
              to="/level/intermediate?subject=advanced-accounting"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              Advanced Accounting CA Inter Notes
            </Link>
            <Link
              to="/level/intermediate?subject=corporate-and-other-laws"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              Corporate & Other Laws Summary
            </Link>
            <Link
              to="/level/foundation?subject=business-economics"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              CA Foundation Business Economics MCQs
            </Link>
            <Link
              to="/level/intermediate"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              Chapter-Wise Free CA Inter Notes
            </Link>
            <Link
              to="/level/foundation"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105"
            >
              Free CA Foundation Question Bank with Answers
            </Link>
          </div>

          <div className="relative mb-12 flex flex-col items-center">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#d32f2f] hover:bg-red-700 text-white rounded-full font-semibold text-lg transition-colors shadow-lg cursor-pointer"
            >
              Select Your Level
              {isDropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-3 w-64 bg-white rounded-2xl shadow-xl py-2 overflow-hidden z-20 border border-gray-100">
                {levelOptions.map((opt) => (
                  <Link
                    key={opt.label}
                    to={opt.path}
                    className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-700 text-center transition-colors"
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">
              Share Chartered Seeds
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleWhatsAppShare}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={handleTelegramShare}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
                aria-label="Share on Telegram"
              >
                <Send className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors border border-white/10",
                  copied ? "bg-green-500/80 hover:bg-green-500/90" : "bg-white/10 hover:bg-white/20"
                )}
                aria-label="Copy Link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 inline-block relative">
            Select Your Level
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-red-600 rounded-full" />
          </h2>
        </div>
        {libraryCount > 0 && (
          <div className="mb-12 max-w-4xl mx-auto p-5 bg-gradient-to-r from-purple-50 via-white to-amber-50 border border-purple-200/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bookmark className="w-6 h-6 fill-amber-300 text-amber-300" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-gray-900 text-base">
                  Continue where you left off
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  You have <strong className="text-purple-700">{libraryCount} saved chapter{libraryCount > 1 ? 's' : ''}</strong> in My Library for fast revision.
                </p>
              </div>
            </div>
            <Link
              to="/library"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow shrink-0"
            >
              <span>Open My Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Foundation Card */}
          <Link to="/level/foundation" className="group flex flex-col bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">CA Foundation</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-10 flex-1">
              Access <strong className="text-gray-700 font-semibold">free CA Foundation question bank with answers</strong>, chapter-wise notes, and <strong className="text-gray-700 font-semibold">Business Economics MCQs</strong>.
            </p>
            <div className="flex items-center text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
              View Resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Intermediate Card */}
          <Link to="/level/intermediate" className="group flex flex-col bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">CA Intermediate</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-10 flex-1">
              Get <strong className="text-gray-700 font-semibold">chapter-wise free CA Inter notes</strong>, <strong className="text-gray-700 font-semibold">CA Inter Taxation PYQ</strong>, <strong className="text-gray-700 font-semibold">Advanced Accounting notes</strong>, and Corporate Laws.
            </p>
            <div className="flex items-center text-sm font-bold text-gray-600 group-hover:text-purple-600 transition-colors">
              View Resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Final Card */}
          <Link to="/level/final" className="group flex flex-col bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">CA Final</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-10 flex-1">
              Comprehensive <strong className="text-gray-700 font-semibold">CA Final free study material</strong>, Advanced Auditing, Direct Tax PYQs, and Integrated Business Solutions.
            </p>
            <div className="flex items-center text-sm font-bold text-gray-600 group-hover:text-red-500 transition-colors">
              View Resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* News & Updates Card */}
          <Link to="/news" className="group flex flex-col bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-6">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">News & Updates</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-10 flex-1">
              Stay up-to-date with the latest exam announcements and syllabus changes.
            </p>
            <div className="flex items-center text-sm font-bold text-gray-600 group-hover:text-yellow-600 transition-colors">
              View Updates
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* High-Impact Homepage Billboard Banner */}
        <div className="mt-16">
          <AdUnit slot="homeBillboard" />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-20 px-6 flex-1 border-t border-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">About Chartered Seeds</h2>
          </div>
          <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-lg">
            <p>
              Welcome to Chartered Seeds, your most trusted partner in the journey of becoming a Chartered Accountant. We believe that high-quality education should be accessible to everyone, which is why we've created a comprehensive repository of study materials, notes, and question banks.
            </p>
            <p>
              Navigating the vast syllabus of CA Foundation, Intermediate, and Final can be overwhelming. Chartered Seeds aims to simplify this process by organizing content logically, ensuring you can find exactly what you need, exactly when you need it. From the latest taxation limits to detailed accounting standard summaries, we keep our content updated in alignment with the ICAI syllabus.
            </p>
            <p>
              Whether you're starting your journey with CA Foundation or in the final stretch of your CA Final preparations, Chartered Seeds is here to plant the seeds of your success. Start exploring our resources today and take a confident step towards your professional goals.
            </p>
            <div className="mt-8 p-6 bg-purple-50 rounded-2xl text-purple-900 italic font-semibold border border-purple-100">
              "Our comprehensive question bank is meticulously curated based on Revision Test Papers (RTP), Mock Test Papers (MTP), and Previous Year Questions (PYQ) spanning from the May 2018 attempt to the latest attempt."
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
