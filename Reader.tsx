import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, CheckSquare, FileText, Send, Link as LinkIcon, Activity, Trash2, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '../lib/libraryStore';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import 'katex/dist/katex.min.css';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

import { unslugifySubject, unslugifyChapter, slugify } from '../lib/slugs';

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
import AdUnit from '../components/AdUnit';
import { ADS_CONFIG } from '../config/ads';
import { contentStore, ContentItem } from '../content/store';
import { SYLLABUS } from '../data/syllabus';

const SECTION_CONFIG = [
  { id: 'news-article', type: 'News Article', icon: FileText, colorClass: 'bg-blue-50 text-blue-600' },
  { id: 'study-notes', type: 'Study Notes', icon: FileText, colorClass: 'bg-pink-50 text-pink-600' },
  { id: 'question-bank', type: 'Question Bank', icon: HelpCircle, colorClass: 'bg-orange-50 text-orange-600' },
  { id: 'mcq-bank', type: 'MCQ Bank', altType: 'Multiple Choice', icon: CheckSquare, colorClass: 'bg-blue-50 text-blue-600' },
  { id: 'question-diagnosis', type: 'Question Diagnosis', icon: Activity, colorClass: 'bg-emerald-50 text-emerald-600' }
];

const ContentSection = ({ item, config, chapter, isAdmin, onDelete }: { item: ContentItem; config: any; chapter: string; isAdmin?: boolean; onDelete?: (id: string) => void }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this ${config.type}?`)) {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(item.id);
      }
      setIsDeleting(false);
    }
  };

  const cleanBody = useMemo(() => {
    let str = (item.body || '').trim();
    if (str.startsWith('```html')) {
      str = str.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    return str;
  }, [item.body]);

  const isHtmlContent = useMemo(() => {
    const text = cleanBody.toLowerCase();
    return text.startsWith('<!doctype html>') || text.startsWith('<html') || text.startsWith('<!doctype');
  }, [cleanBody]);

  const normalizedMarkdownBody = useMemo(() => {
    if (!cleanBody) return '';
    return cleanBody
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  }, [cleanBody]);

  const injectedHtml = useMemo(() => {
    if (!isHtmlContent) return '';

    const getInjectedQuestionAd = (adIndex: number) => {
      const isAdSense = Boolean(ADS_CONFIG.clientId && ADS_CONFIG.clientId.startsWith('ca-pub-'));
      if (isAdSense) {
        return `
          <div class="cs-injected-question-ad" style="margin: 36px 0; clear: both; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 12px 12px 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; user-select: none;">
              <span>ADVERTISEMENT</span>
              <span style="font-size: 9px; opacity: 0.8;">In-Question Break</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; padding: 12px; text-align: center; min-height: 100px;">
              <ins class="adsbygoogle"
                   style="display:block; text-align:center;"
                   data-ad-layout="in-article"
                   data-ad-format="fluid"
                   data-ad-client="${ADS_CONFIG.clientId}"
                   data-ad-slot="question-break-${adIndex}"></ins>
              <script>(window.adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>
          </div>
        `;
      }

      return `
        <div class="cs-injected-question-ad" style="margin: 36px 0; clear: both; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 12px 12px 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; user-select: none;">
            <span>ADVERTISEMENT</span>
            <span style="font-size: 9px; opacity: 0.8;">In-Question Break</span>
          </div>
          <div style="background: linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #1e1b4b 100%); color: #ffffff; border: 1px solid rgba(147, 51, 234, 0.4); border-radius: 0 0 12px 12px; padding: 18px 22px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 250px; flex: 1;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(147, 51, 234, 0.35); border: 1px solid rgba(168, 85, 247, 0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
                ✨
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                  <span style="background: #fbbf24; color: #3b0764; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Featured Partner</span>
                  <span style="font-size: 11px; color: #cbd5e1;">All India CA Test Series</span>
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.35;">
                  Practice Exam-Pattern Questions with Step-by-Step Evaluated Answers
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Benchmark your preparation against ICAI suggested answers and ranker notes.
                </div>
              </div>
            </div>
            <div>
              <a href="#" onclick="window.top.location.href='/library'; return false;" style="display: inline-block; background: #ffffff; color: #3b0764; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap;">
                Open Library →
              </a>
            </div>
          </div>
        </div>
      `;
    };

    // Find questions starting with <h3> tag and inject an ad after every 2 questions
    let processedBody = cleanBody;
    let questionH3Count = 0;
    processedBody = processedBody.replace(/(<h3\b[^>]*>)/gi, (match) => {
      questionH3Count++;
      // Inject ad after every 2 questions (before question 3, 5, 7, 9...)
      if (questionH3Count > 1 && (questionH3Count - 1) % 2 === 0) {
        return getInjectedQuestionAd(Math.floor(questionH3Count / 2)) + match;
      }
      return match;
    });

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
        img {
          -webkit-user-drag: none !important;
          user-select: none !important;
        }
        @media print {
          html, body {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
        }
      </style>
      <script>
        const wipeClipboard = () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText('⚠️ Screenshots of Chartered Seeds study materials are prohibited.').catch(() => {});
            }
          } catch (err) {}
        };
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('cut', e => e.preventDefault());
        document.addEventListener('dragstart', e => e.preventDefault());
        document.addEventListener('keydown', e => {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
          const key = (e.key || '').toLowerCase();
          if (
            e.key === 'PrintScreen' ||
            e.keyCode === 44 ||
            (cmdOrCtrl && ['c', 'a', 'u', 'p', 's'].includes(key)) ||
            (e.shiftKey && (cmdOrCtrl || e.metaKey) && key === 's') ||
            (isMac && e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) ||
            e.key === 'F12' ||
            (cmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key))
          ) {
            e.preventDefault();
            e.stopPropagation();
            wipeClipboard();
          }
        }, true);
        document.addEventListener('keyup', e => {
          if (e.key === 'PrintScreen' || e.keyCode === 44) {
            wipeClipboard();
          }
        }, true);

        // Fast KaTeX auto-render + MathJax configuration
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
          }
        };
      </script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <script>
        function renderMath() {
          try {
            if (window.renderMathInElement) {
              window.renderMathInElement(document.body, {
                delimiters: [
                  { left: '$$', right: '$$', display: true },
                  { left: '\\\\[', right: '\\\\]', display: true },
                  { left: '$', right: '$', display: false },
                  { left: '\\\\(', right: '\\\\)', display: false }
                ],
                throwOnError: false,
                strict: false
              });
            }
          } catch (e) {}
          try {
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise().catch(function() {});
            }
          } catch (e) {}
        }
        document.addEventListener('DOMContentLoaded', renderMath);
        window.addEventListener('load', renderMath);
        setTimeout(renderMath, 40);
        setTimeout(renderMath, 200);
        setTimeout(renderMath, 800);
      </script>
    `;
    if (processedBody.toLowerCase().includes('</head>')) {
      return processedBody.replace(/<\/head>/i, `${injection}</head>`);
    }
    return `<head>${injection}</head>${processedBody}`;
  }, [cleanBody, isHtmlContent]);

  useEffect(() => {
    if (iframeRef.current && isHtmlContent) {
      const updateHeight = () => {
        if (iframeRef.current?.contentWindow) {
          try {
            const doc = iframeRef.current.contentWindow.document;
            const height = Math.max(
              doc.body?.scrollHeight || 0,
              doc.documentElement?.scrollHeight || 0
            );
            if (height > 100) {
              iframeRef.current.style.height = `${height + 60}px`;
            }
          } catch (e) {}
        }
      };

      const handleLoad = () => {
        updateHeight();
        try {
          const win = iframeRef.current?.contentWindow as any;
          if (win?.MathJax?.typesetPromise) {
            win.MathJax.typesetPromise().then(updateHeight).catch(() => {});
          }
          if (win?.renderMath) {
            win.renderMath();
          }
        } catch (e) {}
        setTimeout(updateHeight, 300);
        setTimeout(updateHeight, 800);
        setTimeout(updateHeight, 1800);
      };

      const iframe = iframeRef.current;
      iframe.addEventListener('load', handleLoad);
      return () => iframe?.removeEventListener('load', handleLoad);
    }
  }, [cleanBody, isHtmlContent]);

  let mdH3Count = 0;

  return (
    <div id={config.id} className="scroll-mt-48 mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.colorClass}`}>
            <config.icon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{config.type}</h2>
        </div>
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
              components={{
                h3: ({ node, ...props }) => {
                  mdH3Count++;
                  const showAd = mdH3Count > 1 && (mdH3Count - 1) % 2 === 0;
                  return (
                    <>
                      {showAd && (
                        <div className="not-prose my-8">
                          <AdUnit slot="readerInContent" />
                        </div>
                      )}
                      <h3 {...props} />
                    </>
                  );
                }
              }}
            >
              {normalizedMarkdownBody}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Reader() {
  const { levelId, subjectSlug, chapterSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  const rawSubject = searchParams.get('subject') || '';
  const rawChapter = searchParams.get('chapter') || '';

  const subject = subjectSlug && levelId 
    ? (unslugifySubject(levelId, subjectSlug) || rawSubject) 
    : rawSubject;
    
  const chapter = chapterSlug && levelId && subjectSlug
    ? (unslugifyChapter(levelId, subjectSlug, chapterSlug) || rawChapter)
    : rawChapter;

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formattedLevelName = levelId === 'News & Updates'
    ? 'News & Updates'
    : levelId === 'foundation' 
    ? 'CA Foundation' 
    : levelId === 'intermediate' 
      ? 'CA Intermediate' 
      : 'CA Final';

  const { count: libraryCount, toggle, checkBookmarked } = useBookmarks();
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  const isBookmarked = checkBookmarked(levelId || '', subject, chapter);

  const handleToggleBookmark = () => {
    if (!levelId || !subject || !chapter) return;
    const isNowSaved = toggle({
      levelId,
      levelName: formattedLevelName,
      subject,
      chapter
    });
    setBookmarkToast(isNowSaved ? 'Chapter saved to My Library!' : 'Chapter removed from My Library');
    setTimeout(() => {
      setBookmarkToast(null);
    }, 2800);
  };

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

  const handleDeleteArticle = async (id: string) => {
    try {
      if (!formattedLevelName) return;
      await contentStore.deleteContent(id);
      
      if (formattedLevelName === 'News & Updates') {
        navigate('/news');
        return;
      }
      
      // Refetch the content to ensure state is accurate
      if (subject && chapter) {
        const updatedContent = await contentStore.getChapterContent(formattedLevelName, subject, chapter);
        setContentItems(updatedContent);
        
        // If we deleted the last item in this chapter, redirect back to subject level
        if (updatedContent.length === 0) {
          navigate(`/level/${levelId}`);
        }
      }
    } catch (error: any) {
      console.error("Error deleting article:", error);
      alert(`Failed to delete article: ${error.message}`);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out study materials for ${chapter} - ${subject} on Chartered Seeds!`;
    
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

  const [availableSubjectChapters, setAvailableSubjectChapters] = useState<string[]>([]);

  useEffect(() => {
    if (formattedLevelName && subject && formattedLevelName !== 'News & Updates') {
      contentStore.getContentByLevel(formattedLevelName).then(items => {
        const matchingChapters = items
          .filter(c => c.subject === subject)
          .map(c => c.chapter);
        setAvailableSubjectChapters(Array.from(new Set(matchingChapters)));
      });
    }
  }, [formattedLevelName, subject]);

  const { prevChapter, nextChapter } = useMemo(() => {
    if (formattedLevelName === 'News & Updates') return { prevChapter: null, nextChapter: null };
    
    const levelData = SYLLABUS[formattedLevelName];
    if (!levelData) return { prevChapter: null, nextChapter: null };
    
    const subjectData = levelData.find(s => s.name === subject);
    if (!subjectData) return { prevChapter: null, nextChapter: null };
    
    const allChapters = subjectData.sections
      .flatMap(sec => sec.chapters)
      .filter(ch => availableSubjectChapters.length === 0 || availableSubjectChapters.includes(ch));
      
    const currentIndex = allChapters.indexOf(chapter);
    
    return {
      prevChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      nextChapter: currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null,
    };
  }, [formattedLevelName, subject, chapter, availableSubjectChapters]);

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

  const handleNavigateChapter = (newChapter: string) => {
    if (levelId === 'News & Updates') {
      setSearchParams({ subject, chapter: newChapter });
    } else {
      navigate(`/study/${levelId}/${slugify(subject)}/${slugify(newChapter)}`);
    }
  };

  const scrollToSection = (id: string) => {
    window.location.hash = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const isFoundation = formattedLevelName === 'CA Foundation' || levelId === 'foundation';

  const visibleConfigs = useMemo(() => {
    return SECTION_CONFIG.filter(config => {
      if (isFoundation && (config.id === 'mcq-bank' || config.type === 'MCQ Bank')) {
        return false;
      }
      return true;
    });
  }, [isFoundation]);

  const activeSections = visibleConfigs.map(config => {
    const item = contentItems.find(c => c.contentType === config.type || c.contentType === config.altType);
    return { config, item };
  }).filter(section => section.item !== undefined);

  const readerTitle = useMemo(() => {
    if (!chapter) return 'Free CA Study Material & Question Bank - Chartered Seeds';
    if (formattedLevelName === 'CA Intermediate') {
      return `${chapter} - Chapter-Wise Free CA Inter Notes & Question Bank | Chartered Seeds`;
    }
    if (formattedLevelName === 'CA Foundation') {
      return `${chapter} - Free CA Foundation Question Bank with Answers & Notes | Chartered Seeds`;
    }
    return `${chapter} - CA Final Free Study Material & PYQs | Chartered Seeds`;
  }, [chapter, formattedLevelName]);

  const readerDescription = useMemo(() => {
    if (!chapter || !subject) return 'Access free CA study materials, chapter-wise notes, and question banks.';
    if (formattedLevelName === 'CA Intermediate') {
      return `Free CA Inter study material for ${chapter} (${subject}). Study chapter-wise free CA Inter notes, CA Inter Taxation PYQs, Advanced Accounting notes, and practice question bank with answers.`;
    }
    if (formattedLevelName === 'CA Foundation') {
      return `Free CA Foundation question bank with answers for ${chapter} (${subject}). Access chapter-wise notes, Business Economics MCQs, and step-by-step solutions.`;
    }
    return `Complete CA Final study material for ${chapter} (${subject}). Download comprehensive notes, case studies, and previous year question bank with answers.`;
  }, [chapter, subject, formattedLevelName]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Helmet>
        <title>{readerTitle}</title>
        <meta name="description" content={readerDescription} />
        <meta property="og:title" content={readerTitle} />
        <meta property="og:description" content={readerDescription} />
        <meta property="og:type" content="article" />
        {chapter && subject && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": readerTitle,
              "description": readerDescription,
              "author": {
                "@type": "Organization",
                "name": "Chartered Seeds"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Chartered Seeds"
              }
            })}
          </script>
        )}
      </Helmet>
      <Header />

      {/* Sub-Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 shadow-sm gap-3">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <button 
            onClick={() => navigate(levelId === 'News & Updates' ? '/news' : `/level/${levelId}`)} 
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleToggleBookmark}
            title={isBookmarked ? "Chapter saved in My Library (Click to remove)" : "Save chapter to My Library"}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border shadow-xs cursor-pointer",
              isBookmarked
                ? "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/30"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5 transition-transform", isBookmarked ? "fill-amber-500 text-amber-500 scale-105" : "text-gray-400")} />
            <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* Placement 1: Top High-Viewability Leaderboard Banner */}
        <AdUnit slot="readerTopLeaderboard" className="mb-6" />

        {/* Desktop Split Grid: Reading Content + Sticky Monetization Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Reading Column */}
          <div className="lg:col-span-8 w-full min-w-0">
            {/* Title, Bookmark & Share */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight max-w-3xl">
                  {chapter}
                </h1>

                {/* Quick Actions Bar: Bookmark Button & My Library Link */}
                <div className="flex items-center gap-3 mt-3.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border shadow-sm cursor-pointer",
                      isBookmarked
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/25"
                        : "bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-800 border-gray-200 hover:border-purple-200"
                    )}
                    title={isBookmarked ? "Chapter saved in My Library. Click to remove." : "Save chapter to My Library for quick access"}
                  >
                    <Bookmark className={cn(
                      "w-4 h-4 md:w-4.5 md:h-4.5 transition-transform",
                      isBookmarked ? "fill-amber-500 text-amber-500 scale-110" : "text-gray-400"
                    )} />
                    <span>{isBookmarked ? 'Saved in My Library' : 'Bookmark Chapter'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/library')}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 transition-colors py-1"
                  >
                    <span>View My Library ({libraryCount})</span>
                  </button>
                </div>

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
              <div className="space-y-6">
                {activeSections.map(({ config, item }, index) => (
                  <React.Fragment key={config.id}>
                    <ContentSection item={item!} config={config} chapter={chapter} isAdmin={!!user} onDelete={handleDeleteArticle} />
                    
                    {/* Placement 2: High CTR In-Content Native Ad between Section 1 & 2 */}
                    {index === 0 && activeSections.length > 1 && (
                      <AdUnit slot="readerInContent" className="my-8" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Study Material in Editorial Curation</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
                  Comprehensive notes and questions for <strong className="text-gray-700 font-semibold">{chapter}</strong> are currently being curated and verified by qualified CA rankers.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(levelId === 'News & Updates' ? '/news' : `/level/${levelId}?subject=${encodeURIComponent(slugify(subject))}`)}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Browse Available Chapters in {subject}
                </button>
              </div>
            )}

            {/* Placement 3: Bottom High-Impact Billboard Ad */}
            {activeSections.length > 0 && (
              <AdUnit slot="readerBottomBanner" className="mt-8 mb-4" />
            )}

            {/* Bottom Share */}
            {activeSections.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                 <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Share:</span>
                 {renderShareButtons()}
              </div>
            )}

            {/* Prev / Next Pagination */}
            <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-8 mb-12">
              {prevChapter ? (
                <button 
                  onClick={() => handleNavigateChapter(prevChapter)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev Chapter
                </button>
              ) : <div />}

              {nextChapter ? (
                 <button 
                   onClick={() => handleNavigateChapter(nextChapter)}
                   className="flex items-center gap-2 px-6 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                 >
                   Next Chapter
                   <ChevronRight className="w-4 h-4" />
                 </button>
              ) : <div />}
            </div>
          </div>

          {/* Placement 4: Sticky Monetization Sidebar Rail (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            {/* Quick Section Navigator Card */}
            {activeSections.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-600" />
                  <span>On This Page</span>
                </h3>
                <nav className="space-y-1.5">
                  {activeSections.map(({ config }) => (
                    <button
                      key={config.id}
                      onClick={() => scrollToSection(config.id)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate">{config.type}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* High CPM 300x600 Half-Page Sticky Rail Ad */}
            <AdUnit slot="readerStickySidebar" />
          </aside>
        </div>

        {/* Floating Bookmark Toast */}
        {bookmarkToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span>{bookmarkToast}</span>
            <button
              onClick={() => navigate('/library')}
              className="ml-2 text-xs text-amber-300 hover:text-amber-200 underline font-bold"
            >
              Open Library
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
