import { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Download, Upload, LogIn, Code, LogOut, CheckCircle2, 
  AlertTriangle, Search, FileText, Check, Filter, RefreshCw, FolderDown, Edit3, Trash2, Sparkles,
  MessageSquare, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDocs, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import Header from '../components/Header';
import { contentStore, ContentItem, cleanLatexFormulas } from '../content/store';
import { SYLLABUS } from '../data/syllabus';
import { auth, db } from '../firebase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
}

const ALL_CONTENT_TYPES = ['Study Notes', 'Question Bank', 'MCQ Bank', 'Question Diagnosis', 'Random Topic Authors Think Interesting'];

export default function Admin() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'download' | 'inquiries'>('upload');

  // Upload Form State
  const [level, setLevel] = useState('CA Foundation');
  const [subject, setSubject] = useState(SYLLABUS['CA Foundation'][0].name);
  const [chapter, setChapter] = useState('');
  const [contentType, setContentType] = useState(ALL_CONTENT_TYPES[0]);
  const [body, setBody] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Quick check for existing chapter materials in Upload tab
  const [chapterExistingItems, setChapterExistingItems] = useState<ContentItem[]>([]);
  const [isLoadingChapterItems, setIsLoadingChapterItems] = useState(false);

  // Download & Browse tab State
  const [allLoadedItems, setAllLoadedItems] = useState<ContentItem[]>([]);
  const [isLoadingAllItems, setIsLoadingAllItems] = useState(false);
  const [filterLevel, setFilterLevel] = useState('All Levels');
  const [filterSubject, setFilterSubject] = useState('All Subjects');
  const [filterChapter, setFilterChapter] = useState('All Chapters');
  const [filterType, setFilterType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  // Fetch all items when opening the Download tab
  const loadAllItems = async () => {
    setIsLoadingAllItems(true);
    try {
      const items = await contentStore.getAllContent();
      setAllLoadedItems(items);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setIsLoadingAllItems(false);
    }
  };

  // Contact Inquiries State
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  const loadInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: ContactMessage[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as ContactMessage);
      });
      setInquiries(list);
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      setInquiries(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(`Failed to delete message: ${err.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'download' && allLoadedItems.length === 0) {
      loadAllItems();
    }
    if (activeTab === 'inquiries') {
      loadInquiries();
    }
  }, [activeTab]);

  // Check existing materials whenever level, subject, or chapter changes in Upload form
  useEffect(() => {
    if (level && subject && chapter.trim()) {
      setIsLoadingChapterItems(true);
      contentStore.getChapterContent(level, subject, chapter.trim()).then(items => {
        setChapterExistingItems(items);
        setIsLoadingChapterItems(false);
      }).catch(() => {
        setIsLoadingChapterItems(false);
      });
    } else {
      setChapterExistingItems([]);
    }
  }, [level, subject, chapter]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isMeetAdmin = user?.email?.toLowerCase() === 'meetp8697@gmail.com' || user?.email?.toLowerCase() === 'chartered.seed.support@gmail.com';

  const [isAuditingFormulas, setIsAuditingFormulas] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const handleAuditFormulas = async () => {
    setIsAuditingFormulas(true);
    setAuditMessage('Scanning database and auditing LaTeX formulas...');
    try {
      const items = await contentStore.getAllContent();
      let fixedCount = 0;
      for (const item of items) {
        const cleaned = cleanLatexFormulas(item.body);
        if (cleaned !== item.body) {
          fixedCount++;
          if (isMeetAdmin) {
            await setDoc(doc(db, 'content', item.id), { ...item, body: cleaned });
          }
        }
      }
      if (fixedCount > 0) {
        setAuditMessage(`Repaired formulas in ${fixedCount} materials in the database!`);
        if (activeTab === 'download') {
          loadAllItems();
        }
      } else {
        setAuditMessage(`Verified: All formulas across ${items.length} materials in the database are clean and render properly.`);
      }
    } catch (err: any) {
      setAuditMessage(`Audit notice: ${err.message || 'Check complete'}`);
    } finally {
      setIsAuditingFormulas(false);
    }
  };

  const availableSubjects = useMemo(() => {
    if (level === 'Random Topic Authors Think Interesting') {
      return [
        { name: 'Finance' },
        { name: 'Law' },
        { name: 'Corporate' },
        { name: 'Accounting' },
        { name: 'Auditing' },
        { name: 'Special Insights' }
      ];
    }
    if (level === 'News & Updates') {
      return [
        { name: 'Study Material' }, 
        { name: 'Exam Update' }, 
        { name: 'Educational Case Study' },
        { name: 'Professional Update' }
      ];
    }
    return SYLLABUS[level] || [];
  }, [level]);

  const availableChapters = useMemo(() => {
    if (level === 'News & Updates' || level === 'Random Topic Authors Think Interesting') return [];
    const currentSubject: any = availableSubjects.find(s => s.name === subject);
    if (!currentSubject || !('sections' in currentSubject)) return [];
    return currentSubject.sections.reduce((acc: string[], sec: any) => [...acc, ...sec.chapters], []);
  }, [availableSubjects, subject, level]);

  const availableContentTypes = useMemo(() => {
    if (level === 'Random Topic Authors Think Interesting') {
      return ['Article / Deep Dive', 'Random Topic Authors Think Interesting'];
    }
    if (level === 'News & Updates') {
      return ['News Article'];
    }
    if (level === 'CA Foundation') {
      return ALL_CONTENT_TYPES.filter(t => t !== 'MCQ Bank');
    }
    return ALL_CONTENT_TYPES;
  }, [level]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    setLevel(newLevel);
    
    if (newLevel === 'Random Topic Authors Think Interesting') {
      setSubject('Finance');
      setContentType('Article / Deep Dive');
      setChapter('');
    } else if (newLevel === 'News & Updates') {
      setSubject('Study Material');
      setContentType('News Article');
      setChapter('');
    } else {
      const firstSubject = SYLLABUS[newLevel]?.[0]?.name || '';
      setSubject(firstSubject);
      setChapter('');
      if (contentType === 'News Article' || contentType === 'Article / Deep Dive' || (newLevel === 'CA Foundation' && contentType === 'MCQ Bank')) {
        setContentType('Study Notes');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBody((prev) => prev + (prev ? '\n\n' : '') + content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter.trim() || !body.trim()) {
      alert('Please fill in chapter name and content body.');
      return;
    }

    if (!user) {
      alert('Please sign in with Google first.');
      return;
    }

    if (!isMeetAdmin) {
      alert(`Upload Blocked: You are logged in as ${user.email}.\n\nFirebase rules require meetp8697@gmail.com to upload content.\n\nPlease click "Switch Account" and sign in with meetp8697@gmail.com.`);
      return;
    }

    setIsUploading(true);
    try {
      await contentStore.saveContent({
        level,
        subject,
        chapter: chapter.trim(),
        contentType,
        body
      });
      setChapter('');
      setBody('');
      alert('Content uploaded successfully!');
      // Refresh items
      loadAllItems();
    } catch (error: any) {
      console.error("Upload error", error);
      if (error?.code === 'permission-denied') {
        alert(`Permission Denied: Firebase rejected the upload.\n\nCurrent signed-in user: ${user.email}\nRequired admin email: meetp8697@gmail.com\n\nPlease switch accounts using the Sign Out button.`);
      } else {
        alert(`Failed to upload content: ${error?.message || error}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to load an existing item directly into the upload form for editing
  const loadItemIntoEditor = (item: ContentItem) => {
    setLevel(item.level);
    setSubject(item.subject);
    setChapter(item.chapter);
    setContentType(item.contentType);
    setBody(item.body);
    setActiveTab('upload');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper to delete an item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await contentStore.deleteContent(id);
      setAllLoadedItems(prev => prev.filter(i => i.id !== id));
      alert('Material deleted successfully.');
    } catch (err: any) {
      alert(`Failed to delete: ${err.message || err}`);
    }
  };

  // Filter options for the Download & Browse tab
  const filterAvailableSubjects = useMemo(() => {
    if (filterLevel === 'All Levels') {
      const allSubs = new Set<string>();
      allLoadedItems.forEach(i => allSubs.add(i.subject));
      return Array.from(allSubs).sort();
    }
    if (filterLevel === 'Random Topic Authors Think Interesting') {
      return ['Finance', 'Law', 'Corporate', 'Accounting', 'Auditing', 'Special Insights'];
    }
    if (filterLevel === 'News & Updates') {
      return ['Study Material', 'Exam Update', 'Educational Case Study', 'Professional Update'];
    }
    return (SYLLABUS[filterLevel] || []).map(s => s.name);
  }, [filterLevel, allLoadedItems]);

  const filterAvailableChapters = useMemo(() => {
    const chapters = new Set<string>();
    allLoadedItems
      .filter(i => (filterLevel === 'All Levels' || i.level === filterLevel) &&
                   (filterSubject === 'All Subjects' || i.subject === filterSubject))
      .forEach(i => chapters.add(i.chapter));
    return Array.from(chapters).sort();
  }, [allLoadedItems, filterLevel, filterSubject]);

  // Filtered items list
  const filteredItems = useMemo(() => {
    return allLoadedItems.filter(item => {
      if (filterLevel !== 'All Levels' && item.level !== filterLevel) return false;
      if (filterSubject !== 'All Subjects' && item.subject !== filterSubject) return false;
      if (filterChapter !== 'All Chapters' && item.chapter !== filterChapter) return false;
      if (filterType !== 'All Types' && item.contentType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.chapter.toLowerCase().includes(q) ||
                      item.subject.toLowerCase().includes(q) ||
                      item.contentType.toLowerCase().includes(q) ||
                      item.level.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allLoadedItems, filterLevel, filterSubject, filterChapter, filterType, searchQuery]);

  // Bulk download filtered items as JSON with unrendered LaTeX
  const handleDownloadFilteredBundle = () => {
    if (filteredItems.length === 0) {
      alert('No materials match your current filter.');
      return;
    }
    let filename = 'chartered-seeds';
    if (filterLevel !== 'All Levels') filename += `-${filterLevel}`;
    if (filterSubject !== 'All Subjects') filename += `-${filterSubject}`;
    if (filterChapter !== 'All Chapters') filename += `-${filterChapter}`;
    if (filterType !== 'All Types') filename += `-${filterType}`;
    filename += `-${filteredItems.length}-items`;

    contentStore.downloadItemsAsJson(filteredItems, filename, { unrenderLatex: true });
  };

  // Bulk download filtered items as Markdown bundle with unrendered LaTeX
  const handleDownloadFilteredMarkdownBundle = () => {
    if (filteredItems.length === 0) {
      alert('No materials match your current filter.');
      return;
    }
    let filename = 'chartered-seeds';
    if (filterLevel !== 'All Levels') filename += `-${filterLevel}`;
    if (filterSubject !== 'All Subjects') filename += `-${filterSubject}`;
    if (filterChapter !== 'All Chapters') filename += `-${filterChapter}`;
    if (filterType !== 'All Types') filename += `-${filterType}`;
    filename += `-${filteredItems.length}-items-bundle`;

    contentStore.downloadItemsAsMarkdownBundle(filteredItems, filename, { unrenderLatex: true });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-gray-500 mb-6 text-sm">Please log in with your authorized admin account (<strong>meetp8697@gmail.com</strong>) to upload and manage content.</p>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900">
      <Header />
      
      {/* Subheader */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-10 gap-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold text-purple-900 ml-4 border-l border-gray-300 pl-4">Content Portal</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* User Account Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isMeetAdmin 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isMeetAdmin ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="truncate max-w-[150px] md:max-w-[200px]" title={user.email || ''}>
              {user.email}
            </span>
            <button 
              onClick={handleSignOut}
              title="Sign Out"
              className="ml-1 p-1 hover:bg-black/10 rounded transition-colors text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link 
            to="/tester"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs md:text-sm font-semibold transition-colors"
          >
            <Code className="w-4 h-4" />
            Tester
          </Link>

          <button 
            onClick={handleAuditFormulas}
            disabled={isAuditingFormulas}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs md:text-sm font-semibold transition-colors disabled:opacity-50"
            title="Scan database and auto-clean unrendered LaTeX formulas"
          >
            <Sparkles className={`w-4 h-4 ${isAuditingFormulas ? 'animate-spin' : ''}`} />
            {isAuditingFormulas ? 'Auditing...' : 'Audit & Fix Formulas'}
          </button>

          <button 
            onClick={() => contentStore.exportToJson({ unrenderLatex: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs md:text-sm font-semibold transition-colors cursor-pointer"
            title="Download full database backup with unrendered LaTeX ($...$)"
          >
            <Download className="w-4 h-4" />
            Full Backup (JSON)
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {/* Formula Audit Notification Banner */}
        {auditMessage && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-emerald-900 text-sm font-medium">{auditMessage}</p>
            </div>
            <button
              onClick={() => setAuditMessage(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-white border border-emerald-200 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Warning if signed in with wrong account */}
        {!isMeetAdmin && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-base">Unauthorized Google Account: {user.email}</h3>
              <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                You are currently signed in with <strong>{user.email}</strong>. Firebase database security rules only allow <strong>meetp8697@gmail.com</strong> to upload content.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out to Switch Account
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs md:text-sm font-bold transition-colors"
                >
                  Sign In as meetp8697@gmail.com
                </button>
              </div>
            </div>
          </div>
        )}

        {isMeetAdmin && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-6 flex items-center gap-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Authenticated as <strong>meetp8697@gmail.com</strong>. Full download, edit, and upload permissions active.</span>
          </div>
        )}

        {/* Tab Switcher Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2.5 ${
              activeTab === 'upload'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            Upload New Material
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2.5 ${
              activeTab === 'download'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <FolderDown className="w-4 h-4 md:w-5 md:h-5" />
            Download & Browse
            {allLoadedItems.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'download' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                {allLoadedItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2.5 ${
              activeTab === 'inquiries'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            Inquiries
            {inquiries.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'inquiries' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                {inquiries.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: UPLOAD MATERIAL */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Upload Study Content</h2>
              <p className="text-gray-500 text-sm mt-1">Select the target level, subject, and chapter to upload or modify materials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Level</label>
                <select 
                  value={level} 
                  onChange={handleLevelChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  {Object.keys(SYLLABUS).map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                  <option value="News & Updates">News & Updates</option>
                  <option value="Random Topic Authors Think Interesting">Random Topic Authors Think Interesting (Beyond CA Syllabus)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {level === 'Random Topic Authors Think Interesting'
                    ? 'Topic Domain (Finance, Law, Corporate, etc.)'
                    : level === 'News & Updates' 
                    ? 'Category' 
                    : 'Subject'}
                </label>
                <select 
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setChapter('');
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub.name} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {level === 'News & Updates' || level === 'Random Topic Authors Think Interesting' 
                    ? 'Article / Topic Title' 
                    : 'Chapter Name'}
                </label>
                <input 
                  type="text" 
                  list="chapter-suggestions"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder={
                    level === 'Random Topic Authors Think Interesting'
                      ? "e.g. Cross-Border M&A Valuation, Forensic Audit of Off-Balance Sheet Entities, Corporate Governance..."
                      : level === 'News & Updates' 
                      ? (subject === 'Educational Case Study' ? "e.g. Issue: Forensic Financial Teardown..." : "e.g. ICAI releases RTPs...") 
                      : "e.g. Introduction to Accounting"
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
                {level !== 'News & Updates' && level !== 'Random Topic Authors Think Interesting' && (
                  <datalist id="chapter-suggestions">
                    {availableChapters.map(ch => (
                      <option key={ch} value={ch} />
                    ))}
                  </datalist>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Content Type</label>
                <select 
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  {availableContentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Chapter Material Downloader & Inspector */}
            {chapter.trim() && (
              <div className="mb-6 p-4 rounded-xl bg-purple-50/60 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    Materials in Database for this Chapter:
                  </span>
                  {isLoadingChapterItems && (
                    <span className="text-xs text-purple-600 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  )}
                </div>

                {chapterExistingItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {chapterExistingItems.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-purple-100 flex items-center justify-between shadow-xs">
                        <div>
                          <span className="font-bold text-sm text-gray-900 block">{item.contentType}</span>
                          <span className="text-[11px] text-gray-500">
                            {(item.body.length / 1024).toFixed(1)} KB • {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => contentStore.downloadItem(item, { format: 'md', unrenderLatex: true })}
                            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download as Markdown (.md) with unrendered LaTeX ($...$)"
                          >
                            <Download className="w-3 h-3" />
                            .md
                          </button>
                          <button
                            type="button"
                            onClick={() => contentStore.downloadItem(item, { format: 'html', unrenderLatex: true })}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-purple-200 cursor-pointer"
                            title="Download clean HTML (.html) with unrendered LaTeX"
                          >
                            <Download className="w-3 h-3" />
                            .html
                          </button>
                          <button
                            type="button"
                            onClick={() => contentStore.downloadItem(item, { format: 'json', unrenderLatex: true })}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download as JSON record with unrendered LaTeX"
                          >
                            JSON
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBody(item.body);
                              setContentType(item.contentType);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Load content into editor"
                          >
                            <Edit3 className="w-3 h-3" />
                            Load
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isLoadingChapterItems ? (
                  <p className="text-xs text-gray-500 italic mt-1">No material uploaded yet for this chapter. You are creating a new entry.</p>
                ) : null}
              </div>
            )}

            <div className="space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Content Body (Paste your content here or upload a file)
                  </label>
                  <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-semibold rounded-md">Markdown, HTML, LaTeX Supported</span>
                </div>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  Upload File (.docx, .md, .txt)
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt,.md,.csv,.html"
                />
              </div>
              
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start typing your content, paste markdown/latex, or upload a file..."
                className="w-full h-64 border border-gray-300 rounded-xl p-4 font-mono text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-y"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 bg-[#e50914] hover:bg-[#b20710] disabled:bg-red-400 text-white font-bold rounded-xl text-lg transition-colors shadow-sm"
            >
              {isUploading ? 'Uploading...' : 'Upload Content'}
            </button>
          </form>
        )}

        {/* TAB 2: DOWNLOAD & BROWSE MATERIALS */}
        {activeTab === 'download' && (
          <div className="space-y-6">
            {/* Filter Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-700" />
                  <h2 className="text-lg font-bold text-gray-900">Filter & Select Materials to Download</h2>
                </div>
                <button
                  onClick={loadAllItems}
                  disabled={isLoadingAllItems}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAllItems ? 'animate-spin' : ''}`} />
                  Refresh List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Level Filter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Level</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => {
                      setFilterLevel(e.target.value);
                      setFilterSubject('All Subjects');
                      setFilterChapter('All Chapters');
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="All Levels">All Levels</option>
                    {Object.keys(SYLLABUS).map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                    <option value="News & Updates">News & Updates</option>
                    <option value="Random Topic Authors Think Interesting">Random Topic Authors Think Interesting</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => {
                      setFilterSubject(e.target.value);
                      setFilterChapter('All Chapters');
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="All Subjects">All Subjects</option>
                    {filterAvailableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Chapter</label>
                  <select
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="All Chapters">All Chapters</option>
                    {filterAvailableChapters.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                {/* Content Type Filter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Study Notes">Study Notes</option>
                    <option value="Question Bank">Question Bank</option>
                    <option value="MCQ Bank">MCQ Bank</option>
                    <option value="Question Diagnosis">Question Diagnosis</option>
                    <option value="Random Topic Authors Think Interesting">Random Topic Authors Think Interesting</option>
                    <option value="News Article">News Article</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mt-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by chapter title, subject, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Results Header & Batch Download Action */}
            <div className="bg-purple-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-purple-200">Selection Summary</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    LaTeX Unrendered ($...$)
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1">
                  {isLoadingAllItems ? 'Loading materials...' : `${filteredItems.length} Materials Found`}
                </h3>
                <p className="text-xs text-purple-200 mt-1">
                  Filters: {filterLevel} • {filterSubject} • {filterChapter} • {filterType}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  onClick={handleDownloadFilteredMarkdownBundle}
                  disabled={filteredItems.length === 0 || isLoadingAllItems}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 disabled:bg-gray-400 text-purple-900 rounded-xl font-bold text-xs md:text-sm transition-colors shadow-sm cursor-pointer"
                  title="Download all filtered materials combined into a single Markdown document with unrendered LaTeX ($...$)"
                >
                  <FileText className="w-4 h-4 text-purple-700" />
                  Download Markdown Bundle ({filteredItems.length})
                </button>

                <button
                  onClick={handleDownloadFilteredBundle}
                  disabled={filteredItems.length === 0 || isLoadingAllItems}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 text-white rounded-xl font-bold text-xs md:text-sm transition-colors shadow-sm cursor-pointer"
                  title="Download all filtered records as JSON with unrendered LaTeX ($...$)"
                >
                  <Download className="w-4 h-4" />
                  Download JSON ({filteredItems.length})
                </button>
              </div>
            </div>

            {/* Materials List */}
            {isLoadingAllItems ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Fetching materials from Firestore...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-gray-800">No materials match your filters</h4>
                <p className="text-sm text-gray-500 mt-1">Try resetting your filters or selecting a different level/subject.</p>
                <button
                  onClick={() => {
                    setFilterLevel('All Levels');
                    setFilterSubject('All Subjects');
                    setFilterChapter('All Chapters');
                    setFilterType('All Types');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                          {item.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {item.subject}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          item.contentType === 'Study Notes' ? 'bg-pink-50 text-pink-700 border border-pink-100' :
                          item.contentType === 'Question Bank' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          item.contentType === 'MCQ Bank' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          item.contentType === 'Question Diagnosis' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          item.contentType === 'Random Topic Authors Think Interesting' || item.contentType === 'Random Topics Authors Think Interesting' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {item.contentType}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base leading-snug break-words">
                        {item.chapter}
                      </h4>

                      <p className="text-xs text-gray-500">
                        Size: <strong className="text-gray-700">{(item.body.length / 1024).toFixed(1)} KB</strong> • Uploaded: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Action Buttons for this item */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => contentStore.downloadItem(item, { format: 'md', unrenderLatex: true })}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="Download Markdown (.md) with unrendered LaTeX ($...$)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .md
                      </button>

                      <button
                        onClick={() => contentStore.downloadItem(item, { format: 'html', unrenderLatex: true })}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download clean HTML (.html) with unrendered LaTeX"
                      >
                        <Download className="w-3.5 h-3.5" />
                        .html
                      </button>

                      <button
                        onClick={() => contentStore.downloadItem(item, { format: 'json', unrenderLatex: true })}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download as JSON record with unrendered LaTeX"
                      >
                        JSON
                      </button>

                      <button
                        onClick={() => loadItemIntoEditor(item)}
                        className="p-2 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                        title="Load into Editor to Edit/Update"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {isMeetAdmin && (
                        <button
                          onClick={() => handleDeleteItem(item.id, `${item.chapter} (${item.contentType})`)}
                          className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                          title="Delete this material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student & Visitor Inquiries</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Messages submitted by students and users through the Contact Us form on Chartered Seeds.
                </p>
              </div>
              <button
                onClick={loadInquiries}
                disabled={isLoadingInquiries}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoadingInquiries ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700 text-base mb-1">No Inquiries Received Yet</h4>
                <p className="text-sm text-gray-400">
                  When visitors submit inquiries on the Contact Us page, they will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all space-y-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-base">{inq.name}</h4>
                          <span className="text-xs text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md font-medium">
                            {inq.email}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Received on {new Date(inq.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${inq.email}?subject=${encodeURIComponent('Re: Inquiry on Chartered Seeds')}`}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reply via Email
                        </a>
                        {isMeetAdmin && (
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
