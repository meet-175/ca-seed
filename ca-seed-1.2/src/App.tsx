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

    // 3. Keyboard Shortcut Interception
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + C, A, U
      if (cmdOrCtrl) {
        const key = e.key.toLowerCase();
        if (key === 'c' || key === 'a' || key === 'u') {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
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
