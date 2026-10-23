import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import AdUnit from '../components/AdUnit';
import { contentStore, ContentItem } from '../content/store';
import { ArrowLeft, Search, ChevronDown, MessageCircle, Send, Link as LinkIcon, FileText, HelpCircle, CheckSquare, Activity } from 'lucide-react';
import { SYLLABUS } from '../data/syllabus';
import { cn } from '../lib/utils';
import { slugify } from '../lib/slugs';

export default function Level() {
  const { levelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Normalized level name for matching
  const formattedLevelName = useMemo(() => {
    if (levelId === 'foundation') return 'CA Foundation';
    if (levelId === 'intermediate') return 'CA Intermediate';
    if (levelId === 'final') return 'CA Final';
    return '';
  }, [levelId]);

  const levelSyllabus = SYLLABUS[formattedLevelName] || [];

  const subjectParam = searchParams.get('subject');
  const initialSubject = useMemo(() => {
    if (subjectParam && levelSyllabus.length > 0) {
      const found = levelSyllabus.find(s => slugify(s.name) === subjectParam || s.name.toLowerCase() === subjectParam.toLowerCase());
      if (found) return found.name;
    }
    return levelSyllabus[0]?.name || '';
  }, [subjectParam, levelSyllabus]);

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelContent, setLevelContent] = useState<ContentItem[]>([]);
  const navigate = useNavigate();

  const getSubjectChapterCount = (subjName: string) => {
    const matching = levelContent.filter(c => c.subject === subjName);
    return new Set(matching.map(c => c.chapter)).size;
  };

  useEffect(() => {
    const paramSubject = searchParams.get('subject');
    if (paramSubject && levelSyllabus.length > 0) {
      const found = levelSyllabus.find(s => slugify(s.name) === paramSubject || s.name.toLowerCase() === paramSubject.toLowerCase());
      if (found) {
        setSelectedSubject(found.name);
      } else {
        setSelectedSubject(levelSyllabus[0]?.name || '');
      }
    } else {
      setSelectedSubject(levelSyllabus[0]?.name || '');
    }
    setExpandedChapter(null);
    setSearchQuery('');
    
    if (formattedLevelName) {
      contentStore.getContentByLevel(formattedLevelName).then((items) => {
        setLevelContent(items);
        if (!paramSubject && items.length > 0) {
          const firstWithContent = levelSyllabus.find(s => items.some(c => c.subject === s.name));
          if (firstWithContent) {
            setSelectedSubject(firstWithContent.name);
          }
        }
      });
    }
  }, [levelId, formattedLevelName, levelSyllabus, searchParams]);

  const currentSubjectData = levelSyllabus.find(s => s.name === selectedSubject);

  const toggleChapter = (chapter: string) => {
    setExpandedChapter(prev => prev === chapter ? null : chapter);
  };

  const getContentItem = (chapter: string, type: string) => {
    return levelContent.find(c => c.subject === selectedSubject && c.chapter === chapter && c.contentType === type);
  };

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'link', chapterName: string) => {
    const text = `Hey, found really good study material for ${chapterName}`;
    const chapterUrl = `${window.location.origin}/study/${levelId}/${slugify(selectedSubject)}/${slugify(chapterName)}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + chapterUrl)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(chapterUrl)}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      navigator.clipboard.writeText(chapterUrl);
      alert('Link copied to clipboard!');
    }
  };

  const levelTitle = useMemo(() => {
    if (levelId === 'intermediate') {
      return selectedSubject
        ? `${selectedSubject} CA Inter Notes & Taxation PYQ - Chartered Seeds`
        : 'CA Inter Free Study Material, Chapter-Wise Free Notes & PYQ | Chartered Seeds';
    }
    if (levelId === 'foundation') {
      return selectedSubject
        ? `${selectedSubject} - Free CA Foundation Question Bank & MCQs | Chartered Seeds`
        : 'Free CA Foundation Question Bank with Answers & Notes | Chartered Seeds';
    }
    return selectedSubject
      ? `${selectedSubject} - CA Final Free Study Material & PYQs | Chartered Seeds`
      : 'CA Final Free Study Material, Revision Notes & PYQ | Chartered Seeds';
  }, [levelId, selectedSubject]);

  const levelDescription = useMemo(() => {
    if (levelId === 'intermediate') {
      return `Free CA Inter study material for ${selectedSubject || 'all subjects'}. Access chapter-wise free CA Inter notes, CA Inter Taxation PYQ, Advanced Accounting notes, and Corporate & Other Laws summary.`;
    }
    if (levelId === 'foundation') {
      return `Free CA Foundation question bank with answers for ${selectedSubject || 'all papers'}. Practice chapter-wise notes, Business Economics MCQs, and detailed step-by-step solutions.`;
    }
    return `Complete CA Final study resources for ${selectedSubject || 'all subjects'}. Practice past year questions (PYQs), RTPs, MTPs, and advanced revision notes.`;
  }, [levelId, selectedSubject]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Helmet>
        <title>{levelTitle}</title>
        <meta name="description" content={levelDescription} />
        <meta property="og:title" content={levelTitle} />
        <meta property="og:description" content={levelDescription} />
        {formattedLevelName && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": levelTitle,
              "description": levelDescription,
              "publisher": {
                "@type": "Organization",
                "name": "Chartered Seeds"
              }
            })}
          </script>
        )}
      </Helmet>
      <Header />
      
      {/* Sub Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search active chapters..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-[180px] md:w-[280px] transition-all"
          />
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {formattedLevelName} {levelId === 'intermediate' ? '(New Scheme)' : ''}
          </h1>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            Select a paper below to view chapter-wise study notes and question banks.
          </p>
          <p className="mt-4 text-sm md:hidden bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 font-medium flex items-center gap-2">
            <span className="text-lg">💡</span> For the best reading experience, we recommend switching to "Desktop site" in your browser menu.
          </p>
        </div>

        {/* Subjects List with Material Badges */}
        {levelSyllabus.length > 0 && (
          <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 mb-10 bg-white shadow-sm">
            {levelSyllabus.map(subject => {
              const chapterCount = getSubjectChapterCount(subject.name);
              const isSelected = selectedSubject === subject.name;
              return (
                <button
                  key={subject.name}
                  className={cn(
                    "text-left px-5 md:px-6 py-4 font-bold text-sm md:text-base border-b border-gray-100 last:border-b-0 transition-all flex items-center justify-between",
                    isSelected 
                      ? "bg-[#8b5cf6] text-white" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    setSearchParams({ subject: slugify(subject.name) });
                  }}
                >
                  <span>{subject.name}</span>
                  {chapterCount > 0 ? (
                    <span className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-semibold",
                      isSelected ? "bg-white/20 text-white" : "bg-purple-50 text-purple-700 border border-purple-100"
                    )}>
                      {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  ) : (
                    <span className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-medium",
                      isSelected ? "bg-white/10 text-purple-100" : "bg-gray-100 text-gray-400"
                    )}>
                      In Preparation
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Catalog High-Yield Leaderboard Ad */}
        <AdUnit slot="levelTopLeaderboard" className="mb-8" />

        {/* Chapters Accordion - Only renders chapters with verified uploaded material */}
        {currentSubjectData && (
          <div className="space-y-6">
            {(() => {
              let totalVisibleChapters = 0;
              const renderedSections = currentSubjectData.sections.map((section, secIdx) => {
                // Filter chapters: must match search query AND have at least one uploaded document in levelContent
                const filteredChapters = section.chapters.filter(ch => {
                  const matchesSearch = ch.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return false;
                  
                  const hasContent = levelContent.some(c => c.subject === selectedSubject && c.chapter === ch);
                  return hasContent;
                });

                if (filteredChapters.length === 0) return null;
                totalVisibleChapters += filteredChapters.length;

                return (
                  <div key={secIdx}>
                    {section.title && (
                      <h3 className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase mt-8 mb-4 px-2">
                        {section.title}
                      </h3>
                    )}
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      {filteredChapters.map((chapter) => {
                        const isExpanded = expandedChapter === chapter;
                        
                        const studyNotes = getContentItem(chapter, 'Study Notes');
                        const questionBank = getContentItem(chapter, 'Question Bank');
                        const mcqBank = getContentItem(chapter, 'MCQ Bank') || getContentItem(chapter, 'Multiple Choice');
                        const questionDiagnosis = getContentItem(chapter, 'Question Diagnosis');

                        return (
                          <div key={chapter} className="border-b last:border-b-0 border-gray-100">
                            <button 
                              onClick={() => toggleChapter(chapter)} 
                              className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 pr-4 flex-wrap">
                                <span className="font-bold text-gray-800 text-sm md:text-base leading-snug">{chapter}</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {studyNotes && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-100">Notes</span>
                                  )}
                                  {questionBank && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">Questions</span>
                                  )}
                                  {mcqBank && formattedLevelName !== 'CA Foundation' && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">MCQ</span>
                                  )}
                                  {questionDiagnosis && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Diagnosis</span>
                                  )}
                                </div>
                              </div>
                              <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform shrink-0", isExpanded && "rotate-180")} />
                            </button>
                            
                            {/* Expanded Content View */}
                            {isExpanded && (
                              <div className="p-4 md:p-6 bg-[#fafafa] border-t border-gray-100 flex flex-col gap-5">
                                
                                {/* Share Row */}
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Share:</span>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleShare('whatsapp', chapter)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-500 hover:border-green-200 shadow-sm transition-colors">
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleShare('telegram', chapter)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 shadow-sm transition-colors">
                                      <Send className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleShare('link', chapter)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-purple-500 hover:border-purple-200 shadow-sm transition-colors">
                                      <LinkIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Action Cards - ONLY SHOW OPTIONS THAT HAVE MATERIAL UPLOADED */}
                                <div className="flex flex-col gap-3 mt-2">
                                  {/* Study Notes Card */}
                                  {studyNotes && (
                                    <div 
                                      onClick={() => navigate(`/study/${levelId}/${slugify(selectedSubject)}/${slugify(chapter)}#study-notes`)}
                                      className="relative p-4 md:p-5 rounded-2xl border transition-all flex items-center gap-4 text-left cursor-pointer bg-white border-purple-100 hover:border-purple-300 hover:shadow-sm"
                                    >
                                      <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                                        <FileText className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">Study Notes</h4>
                                        <p className="text-xs md:text-sm text-gray-500">Comprehensive study material and summaries</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Question Bank Card */}
                                  {questionBank && (
                                    <div 
                                      onClick={() => navigate(`/study/${levelId}/${slugify(selectedSubject)}/${slugify(chapter)}#question-bank`)}
                                      className="relative p-4 md:p-5 rounded-2xl border transition-all flex items-center gap-4 text-left cursor-pointer bg-white border-orange-100 hover:border-orange-300 hover:shadow-sm"
                                    >
                                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                        <HelpCircle className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">Question Bank</h4>
                                        <p className="text-xs md:text-sm text-gray-500">Practice questions with detailed solutions</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* In-Between Dropdown Sponsor Ad Unit */}
                                  {(studyNotes || questionBank) && (
                                    <AdUnit slot="chapterDropdownInBetween" className="my-1" />
                                  )}

                                  {/* MCQ Bank Card */}
                                  {mcqBank && formattedLevelName !== 'CA Foundation' && (
                                    <div 
                                      onClick={() => navigate(`/study/${levelId}/${slugify(selectedSubject)}/${slugify(chapter)}#mcq-bank`)}
                                      className="relative p-4 md:p-5 rounded-2xl border transition-all flex items-center gap-4 text-left cursor-pointer bg-white border-blue-100 hover:border-blue-300 hover:shadow-sm"
                                    >
                                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <CheckSquare className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">Multiple Choice</h4>
                                        <p className="text-xs md:text-sm text-gray-500">Test your knowledge with MCQs</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Question Diagnosis Card */}
                                  {questionDiagnosis && (
                                    <div 
                                      onClick={() => navigate(`/study/${levelId}/${slugify(selectedSubject)}/${slugify(chapter)}#question-diagnosis`)}
                                      className="relative p-4 md:p-5 rounded-2xl border transition-all flex items-center gap-4 text-left cursor-pointer bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-sm"
                                    >
                                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                        <Activity className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">Question Diagnosis</h4>
                                        <p className="text-xs md:text-sm text-gray-500">Detailed question breakdowns</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });

              if (totalVisibleChapters === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {searchQuery ? 'No matching chapters found' : 'Study Materials in Editorial Curation'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                      {searchQuery 
                        ? `No uploaded materials match "${searchQuery}". Try searching for another chapter keyword.`
                        : `Comprehensive notes and question banks for ${selectedSubject} are currently being curated and verified by qualified rankers. Please explore our other active subjects above.`
                      }
                    </p>
                  </div>
                );
              }

              return renderedSections;
            })()}
          </div>
        )}

        {/* In-Feed Chapter Directory Ad */}
        <AdUnit slot="levelInFeed" className="mt-10" />
      </main>
    </div>
  );
}
