/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Level from './pages/Level';
import Reader from './pages/Reader';
import News from './pages/News';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Disclaimer from './pages/Disclaimer';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ContentTester from './pages/ContentTester';

export default function App() {
  useEffect(() => {
    // 1. Right-Click (Context Menu) Disabled
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Clipboard Event Blocking
    const handleClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 3. Prevent Drag & Drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. Keyboard Shortcut Blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
      }
      // Prevent Save Page (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
      // Prevent Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
      }
      // Prevent Select All (Ctrl+A / Cmd+A)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
      }
      // Prevent View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
      }
      // Prevent DevTools (F12 or Ctrl+Shift+I / Cmd+Option+I / Cmd+Shift+C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'j'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/level/:levelId" element={<Level />} />
              {/* New Cleaner URL Route */}
              <Route path="/study/:levelId/:subjectSlug/:chapterSlug" element={<Reader />} />
              {/* Legacy fallback route */}
              <Route path="/read/:levelId" element={<Reader />} />
              <Route path="/news" element={<News />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/tester" element={<ContentTester />} />
            </Routes>
          </div>
          {/* Legal & Navigation Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <Link to="/" className="group flex items-center gap-3 select-none mb-5 hover:opacity-95 transition-opacity">
                {/* Pure Inline Vector Logo Emblem */}
                <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105">
                  <svg
                    viewBox="0 0 72 72"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="footerPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7e22ce" />
                        <stop offset="100%" stopColor="#581c87" />
                      </linearGradient>
                      <linearGradient id="footerLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#15803d" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                    </defs>

                    {/* Squircle Background */}
                    <rect
                      width="72"
                      height="72"
                      rx="18"
                      fill="url(#footerPurpleGrad)"
                    />

                    {/* Red Bookmark Ribbon */}
                    <path d="M 34 42 L 34 56 L 36.5 53.5 L 39 56 L 39 42 Z" fill="#ef4444" />

                    {/* Open Book White Pages */}
                    <path
                      d="M 36 46 C 28 43 17 42 11 44 C 10 35 10 26 11 20 C 18 18 28 19 36 23 Z"
                      fill="#ffffff"
                    />
                    <path
                      d="M 36 46 C 44 43 55 42 61 44 C 62 35 62 26 61 20 C 54 18 44 19 36 23 Z"
                      fill="#f8fafc"
                    />
                    <path d="M 35 23 L 37 23 L 37 46 L 35 46 Z" fill="#cbd5e1" opacity="0.8" />

                    {/* Sprout Stem */}
                    <path
                      d="M 36 32 Q 35 20 36 13"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Leaves */}
                    <path
                      d="M 36 19 C 30 16 26 20 28 25 C 33 26 36 21 36 19 Z"
                      fill="url(#footerLeafGrad)"
                    />
                    <path
                      d="M 36 15 C 42 12 46 16 45 21 C 40 22 37 17 36 15 Z"
                      fill="url(#footerLeafGrad)"
                    />
                    {/* Emerald Seed Node */}
                    <circle cx="36" cy="28" r="1.8" fill="#22c55e" />
                  </svg>
                </div>

                {/* Brand Text & Tagline */}
                <div className="flex flex-col justify-center leading-none">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-gray-900">
                      CA
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-purple-700">
                      Seed
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase mt-0.5 text-gray-500">
                    Grow Your Concepts
                  </span>
                </div>
              </Link>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6 text-sm font-medium text-gray-500">
                <Link to="/about-us" className="hover:text-blue-600 transition-colors">About Us</Link>
                <Link to="/contact-us" className="hover:text-blue-600 transition-colors">Contact Us</Link>
                <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                <Link to="/terms-conditions" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
                <Link to="/disclaimer" className="hover:text-blue-600 transition-colors">Disclaimer</Link>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  &copy; {new Date().getFullYear()} CA Seed. All rights reserved.
                </p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                  Reproduction or copying of content is strictly prohibited.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}
