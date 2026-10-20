import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, EyeOff, Lock } from 'lucide-react';

export default function AntiScreenshotShield() {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [showCaptureWarning, setShowCaptureWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Clear system clipboard with copyright notice
  const wipeClipboard = useCallback(() => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⚠️ Screenshots and unauthorized duplication of Chartered Seeds study materials are strictly prohibited.'
        ).catch(() => {});
      }
    } catch {
      // Clipboard access might be denied in some iframe sandbox contexts
    }
  }, []);

  const triggerSecurityAlert = useCallback((message: string) => {
    wipeClipboard();
    setWarningMessage(message);
    setShowCaptureWarning(true);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowCaptureWarning(false);
    }, 3000);
  }, [wipeClipboard]);

  useEffect(() => {
    // 1. Window Blur & Visibility Change Handler
    // (Snipping tools like Win+Shift+S, Lightshot, ShareX, and Mac capture cause window blur)
    const handleBlur = () => {
      // Small timeout to prevent false positives when clicking inside inputs
      setTimeout(() => {
        if (!document.hasFocus()) {
          setIsWindowBlurred(true);
        }
      }, 50);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // 2. Keyboard Interception for Screenshot, Print, and DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : '';

      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('PrintScreen attempt blocked. Screenshots are prohibited.');
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if ((e.shiftKey && (cmdOrCtrl || e.metaKey) && (key === 's' || e.code === 'KeyS'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('Screen capture shortcut blocked.');
        return;
      }

      // Mac Screenshot Shortcuts: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
      if (isMac && e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('macOS screen capture shortcut blocked.');
        return;
      }

      // Print Page (Ctrl + P / Cmd + P)
      if (cmdOrCtrl && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('Printing and exporting to PDF is disabled.');
        return;
      }

      // Save Webpage (Ctrl + S / Cmd + S)
      if (cmdOrCtrl && !e.shiftKey && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('Saving webpage is disabled.');
        return;
      }

      // Developer Tools / Inspect Shortcuts: F12, Ctrl/Cmd + Shift + I/J/C
      if (e.key === 'F12' || (cmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert('Developer tools access is restricted.');
        return;
      }

      // View Source (Ctrl/Cmd + U)
      if (cmdOrCtrl && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Select All (Ctrl/Cmd + A) & Copy (Ctrl/Cmd + C)
      const target = e.target as HTMLElement;
      const isInputField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!isInputField && cmdOrCtrl && ['a', 'c'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 3. KeyUp handler to catch PrintScreen on release and instantly overwrite clipboard
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        wipeClipboard();
        triggerSecurityAlert('Screenshot detected. Clipboard cleared.');
      }
    };

    // 4. Before Print Event
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      triggerSecurityAlert('Printing is disabled.');
    };

    // 5. Prevent Drag and Drop of Images and Content
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('beforeprint', handleBeforePrint);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('beforeprint', handleBeforePrint);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [triggerSecurityAlert, wipeClipboard]);

  return (
    <>
      {/* 1. Subtle, continuous anti-capture security watermark overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.035]"
        aria-hidden="true"
      >
        <div 
          className="w-[200vw] h-[200vh] -translate-x-1/4 -translate-y-1/4 rotate-[-25deg] flex flex-wrap gap-24 items-center justify-around font-mono text-xs font-black tracking-widest text-purple-950 uppercase"
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap select-none">
              CHARTERED SEEDS • PROTECTED STUDY MATERIAL • DO NOT DISTRIBUTE
            </span>
          ))}
        </div>
      </div>

      {/* 2. Window Blur Shield Overlay (activates when Snipping Tool, Win+Shift+S, Lightshot, or screenshot utility steals focus) */}
      {isWindowBlurred && (
        <div 
          onClick={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all duration-150 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Screen capture protection active"
        >
          <div className="max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 animate-pulse">
              <EyeOff className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Content Shield Active
            </h3>

            <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6">
              To protect copyrighted study materials, display contents are shielded while the window is inactive or screen recording/capturing tools are active.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsWindowBlurred(false);
              }}
              className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Click Anywhere to Resume Reading
            </button>
          </div>
        </div>
      )}

      {/* 3. Screenshot Intercept Toast / Alert */}
      {showCaptureWarning && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-red-500 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 font-bold text-sm mb-0.5">
              <Lock className="w-4 h-4" />
              <span>Capture Blocked</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {warningMessage || 'Screenshots and screen recording of study materials are strictly prohibited.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
