import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, Download, Upload, LogIn, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import Header from '../components/Header';
import { contentStore } from '../content/store';
import { SYLLABUS } from '../data/syllabus';
import { auth } from '../firebase';

const ALL_CONTENT_TYPES = ['Study Notes', 'Question Bank', 'MCQ Bank', 'Question Diagnosis'];

export default function Admin() {
  const [level, setLevel] = useState('CA Foundation');
  const [subject, setSubject] = useState(SYLLABUS['CA Foundation'][0].name);
  const [chapter, setChapter] = useState('');
  const [contentType, setContentType] = useState(ALL_CONTENT_TYPES[0]);
  const [body, setBody] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const availableSubjects = useMemo(() => {
    if (level === 'News & Updates') {
      return [
        { name: 'Study Material' }, 
        { name: 'Exam Update' }, 
        { name: 'Syllabus' },
        { name: 'Professional Update' }
      ];
    }
    return SYLLABUS[level] || [];
  }, [level]);

  const availableChapters = useMemo(() => {
    if (level === 'News & Updates') return [];
    const currentSubject = availableSubjects.find(s => s.name === subject);
    if (!currentSubject || !('sections' in currentSubject)) return [];
    return currentSubject.sections.flatMap(sec => sec.chapters);
  }, [availableSubjects, subject, level]);

  const availableContentTypes = useMemo(() => {
    if (level === 'News & Updates') {
      return ['News Article'];
    }
    if (level === 'CA Foundation') {
      return ['Study Notes', 'Question Bank', 'Question Diagnosis'];
    }
    return ALL_CONTENT_TYPES;
  }, [level]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    setLevel(newLevel);
    
    if (newLevel === 'News & Updates') {
      setSubject('Study Material');
      setContentType('News Article');
      setChapter('');
    } else {
      const firstSubject = SYLLABUS[newLevel]?.[0]?.name || '';
      setSubject(firstSubject);
      setChapter('');
      if (newLevel === 'CA Foundation' && contentType === 'MCQ Bank') {
        setContentType('Study Notes');
      } else if (contentType === 'News Article') {
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

    setIsUploading(true);
    try {
      await contentStore.saveContent({
        level,
        subject,
        chapter,
        contentType,
        body
      });
      setChapter('');
      setBody('');
      alert('Content uploaded successfully!');
    } catch (error) {
      console.error("Upload error", error);
      alert('Failed to upload content. Please ensure you are logged in as admin.');
    } finally {
      setIsUploading(false);
    }
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
            <p className="text-gray-500 mb-8">Please log in to upload and manage content.</p>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold rounded-xl transition-colors"
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
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold text-purple-900 ml-4 border-l border-gray-300 pl-4">Content Upload Portal</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/tester"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Code className="w-4 h-4" />
            HTML/LaTeX Tester
          </Link>
          <button 
            onClick={contentStore.exportToJson}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All Data (JSON)
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-gray-600 font-medium">Upload Question Banks, Notes, and MCQs.</h2>
        </div>

        <div className="bg-[#fdf2f2] border border-[#fbd5d5] rounded-xl p-5 mb-8 text-[#9b1c1c] text-sm leading-relaxed">
          <span className="font-bold">Note:</span> Once you are finished uploading all content, you can remove the 'Admin Upload' link from the navigation bar to hide it from students.
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
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
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                {level === 'News & Updates' ? 'Category' : 'Subject'}
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
                {level === 'News & Updates' ? 'Article Title' : 'Chapter Name'}
              </label>
              <input 
                type="text" 
                list="chapter-suggestions"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder={level === 'News & Updates' ? "e.g. ICAI releases RTPs..." : "e.g. Introduction to Accounting"}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
              {level !== 'News & Updates' && (
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
      </main>
    </div>
  );
}
