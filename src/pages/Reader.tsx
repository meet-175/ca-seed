import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, CheckSquare, FileText, Send, Link as LinkIcon, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import 'katex/dist/katex.min.css';

const remarkReplaceRupee = () => {
  return (tree: any) => {
    visit(tree, ['math', 'inlineMath'], (node: any) => {
      if (node.value) {
        // Replace ₹ with \text{Rs. } to fix KaTeX bounding box overlaps
        node.value = node.value.replace(/₹/g, '\\text{Rs. }');
      }
    });
  };
};
import Header from '../components/Header';
import { contentStore, ContentItem } from '../content/store';
import { SYLLABUS } from '../data/syllabus';

const SECTION_CONFIG = [
  { id: 'news-article', type: 'News Article', icon: FileText, colorClass: 'bg-blue-50 text-blue-600' },
  { id: 'study-notes', type: 'Study Notes', icon: FileText, colorClass: 'bg-pink-50 text-pink-600' },
  { id: 'question-bank', type: 'Question Bank', icon: HelpCircle, colorClass: 'bg-orange-50 text-orange-600' },
  { id: 'mcq-bank', type: 'MCQ Bank', altType: 'Multiple Choice', icon: CheckSquare, colorClass: 'bg-blue-50 text-blue-600' },
  { id: 'question-diagnosis', type: 'Question Diagnosis', icon: Activity, colorClass: 'bg-emerald-50 text-emerald-600' }
];

const ContentSection = ({ item, config, chapter }: { item: ContentItem; config: any; chapter: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isHtmlContent = useMemo(() => {
    const text = item.body.trim().toLowerCase();
    return text.startsWith('<!doctype html>') || text.startsWith('<html');
  }, [item]);

  const injectedHtml = useMemo(() => {
    if (!isHtmlContent) return '';
    const injection = `
      <style>
        body, body * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        input, textarea {
          -webkit-user-select: auto !important;
          -khtml-user-select: auto !important;
          -moz-user-select: auto !important;
          -ms-user-select: auto !important;
          user-select: auto !important;
        }
      </style>
      <script>
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('cut', e => e.preventDefault());
        document.addEventListener('keydown', e => {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
          if (e.key === 'F12' || (cmdOrCtrl && ['c', 'a', 'u'].includes(e.key.toLowerCase()))) {
            e.preventDefault();
          }
        });
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
          }
        };
      </script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    `;
    if (item.body.toLowerCase().includes('</head>')) {
      return item.body.replace(/<\/head>/i, `${injection}</head>`);
    }
    return `<head>${injection}</head>${item.body}`;
  }, [item, isHtmlContent]);

  useEffect(() => {
    if (iframeRef.current && isHtmlContent) {
      const handleLoad = () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.style.height = '800px'; 
          try {
            const height = iframeRef.current.contentWindow.document.documentElement.scrollHeight;
            iframeRef.current.style.height = `${height}px`;
          } catch (e) {}
        }
      };
      iframeRef.current.addEventListener('load', handleLoad);
      return () => iframeRef.current?.removeEventListener('load', handleLoad);
    }
  }, [item, isHtmlContent]);

  return (
    <div id={config.id} className="scroll-mt-48 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.colorClass}`}>
          <config.icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{config.type}</h2>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm min-h-[200px]">
        {isHtmlContent ? (
          <iframe 
            ref={iframeRef}
            srcDoc={injectedHtml}
            className="w-full border-0 min-h-[60vh]"
            title={`${chapter} - ${config.type}`}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="markdown-body max-w-none prose prose-purple">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath, remarkReplaceRupee]}
              rehypePlugins={[rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]]}
            >
              {item.body}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Reader() {
  const { levelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const subject = searchParams.get('subject') || '';
  const chapter = searchParams.get('chapter') || '';

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formattedLevelName = levelId === 'News & Updates'
    ? 'News & Updates'
    : levelId === 'foundation' 
    ? 'CA Foundation' 
    : levelId === 'intermediate' 
      ? 'CA Intermediate' 
      : 'CA Final';

  useEffect(() => {
    setLoading(true);
    
    // Check if it's a News Article
    if (formattedLevelName === 'News & Updates') {
      contentStore.getContentByLevel('News & Updates').then(items => {
        const article = items.find(item => item.subject === subject && item.chapter === chapter);
        if (article) {
          setContentItems([article]);
        } else {
          setContentItems([]);
        }
        setLoading(false);
      });
      return;
    }

    contentStore.getChapterContent(formattedLevelName, subject, chapter).then(items => {
      setContentItems(items);
      setLoading(false);
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    });
  }, [formattedLevelName, subject, chapter]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out study materials for ${chapter} - ${subject} on CA Seed!`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
        break;
    }
  };

  const { prevChapter, nextChapter } = useMemo(() => {
    if (formattedLevelName === 'News & Updates') return { prevChapter: null, nextChapter: null };
    
    const levelData = SYLLABUS[formattedLevelName];
    if (!levelData) return { prevChapter: null, nextChapter: null };
    
    const subjectData = levelData.find(s => s.name === subject);
    if (!subjectData) return { prevChapter: null, nextChapter: null };
    
    const allChapters = subjectData.sections.flatMap(sec => sec.chapters);
    const currentIndex = allChapters.indexOf(chapter);
    
    return {
      prevChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      nextChapter: currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null,
    };
  }, [formattedLevelName, subject, chapter]);

  const renderShareButtons = () => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleShare('whatsapp')} className="p-1.5 md:p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors" title="Share on WhatsApp">
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
      </button>
      <button onClick={() => handleShare('telegram')} className="p-1.5 md:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Share on Telegram">
        <Send className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button onClick={() => handleShare('copy')} className="p-1.5 md:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Copy Link">
        <LinkIcon className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );

  const scrollToSection = (id: string) => {
    window.location.hash = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSections = SECTION_CONFIG.map(config => {
    const item = contentItems.find(c => c.contentType === config.type || c.contentType === config.altType);
    return { config, item };
  }).filter(section => section.item !== undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Helmet>
        <title>{chapter ? `${chapter} - CA Seed` : 'Reader - CA Seed'}</title>
        <meta name="description" content={`Read ${subject} - ${chapter} on CA Seed. Free study materials and resources.`} />
        <meta property="og:title" content={chapter ? `${chapter} - CA Seed` : 'Reader - CA Seed'} />
        <meta property="og:description" content={`Read ${subject} - ${chapter} on CA Seed. Free study materials and resources.`} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Header />

      {/* Sub-Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 shadow-sm gap-3">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <button 
            onClick={() => navigate(`/level/${levelId}`)} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="hidden md:block text-xs font-semibold text-gray-500 tracking-wider">
            <span className="uppercase">{formattedLevelName}</span> <span className="mx-1 text-gray-300">&gt;</span> {subject}
          </div>
        </div>

        {/* Jump Links Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          {activeSections.map(({ config }) => (
            <button
              key={config.id}
              onClick={() => scrollToSection(config.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${config.colorClass.replace('text-', 'bg-opacity-20 text-')}`}
            >
              {config.type}
            </button>
          ))}
          {activeSections.length === 0 && !loading && (
             <span className="text-xs text-gray-400 font-semibold italic">No sections available</span>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        
        {/* Title and Share */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight max-w-3xl">
              {chapter}
            </h1>
            <p className="mt-3 text-sm md:hidden bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 font-medium flex items-center gap-2">
              <span className="text-lg">💡</span> For the best reading experience, we recommend switching to "Desktop site" in your browser menu.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Share:</span>
            {renderShareButtons()}
          </div>
        </div>

        {/* Content Sections */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : activeSections.length > 0 ? (
          <div className="space-y-4">
            {activeSections.map(({ config, item }) => (
              <ContentSection key={config.id} item={item!} config={config} chapter={chapter} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <p className="text-gray-800 font-medium mb-2">No content available</p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
              We couldn't find any study materials for <strong className="text-gray-700 font-semibold">{chapter}</strong>. If you are an admin, please upload the content via the Content Upload Portal.
            </p>
          </div>
        )}

        {/* Bottom Share */}
        {activeSections.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
             <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Share:</span>
             {renderShareButtons()}
          </div>
        )}

        {/* Prev / Next Pagination */}
        <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8 mb-12">
          {prevChapter ? (
            <button 
              onClick={() => setSearchParams({ subject, chapter: prevChapter })}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev Chapter
            </button>
          ) : <div />}

          {nextChapter ? (
             <button 
               onClick={() => setSearchParams({ subject, chapter: nextChapter })}
               className="flex items-center gap-2 px-6 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
             >
               Next Chapter
               <ChevronRight className="w-4 h-4" />
             </button>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
