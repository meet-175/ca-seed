import React, { useEffect, useRef } from 'react';
import { ADS_CONFIG, AdSlotConfig } from '../config/ads';
import { ExternalLink, Sparkles, BookOpen, Award, CheckCircle } from 'lucide-react';

interface AdUnitProps {
  slot: AdSlotConfig | string;
  className?: string;
  customSlotId?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdUnit({ slot, className = '', customSlotId }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  const slotConfig: AdSlotConfig = typeof slot === 'string' 
    ? (ADS_CONFIG.slots[slot] || {
        id: slot,
        name: 'Sponsored Ad',
        format: 'in-content',
        dimensions: { width: '100%', height: 120 },
        description: 'Advertisement space'
      })
    : slot;

  const actualSlotId = customSlotId || slotConfig.id;
  const isAdSenseActive = Boolean(ADS_CONFIG.clientId && ADS_CONFIG.clientId.startsWith('ca-pub-'));

  useEffect(() => {
    if (isAdSenseActive && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }, [isAdSenseActive, actualSlotId]);

  if (!ADS_CONFIG.enabled) {
    return null;
  }

  // Pre-calculated height containers to avoid Cumulative Layout Shift (CLS)
  const getMinHeightClass = () => {
    switch (slotConfig.format) {
      case 'leaderboard':
        return 'min-h-[90px] md:min-h-[100px]';
      case 'sidebar-sticky':
        return 'min-h-[500px] lg:min-h-[600px]';
      case 'rectangle':
        return 'min-h-[250px]';
      case 'billboard':
        return 'min-h-[120px] md:min-h-[140px]';
      case 'dropdown-card':
        return 'min-h-[72px] md:min-h-[80px] my-1';
      case 'in-content':
        return 'min-h-[130px] md:min-h-[150px]';
      default:
        return 'min-h-[90px]';
    }
  };

  return (
    <div 
      className={`relative w-full my-4 overflow-hidden rounded-2xl transition-all duration-200 ${getMinHeightClass()} ${className}`}
      data-ad-slot={actualSlotId}
    >
      {/* Google AdSense Compliant Label */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50/90 border-b border-gray-100 text-[10px] font-bold tracking-wider uppercase text-gray-400 select-none">
        <span>Advertisement</span>
        <span className="text-[9px] text-gray-400/80 font-medium hidden sm:inline">Sponsored Placement</span>
      </div>

      {isAdSenseActive ? (
        <div ref={adRef} className="flex justify-center items-center py-2 bg-white">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={ADS_CONFIG.clientId}
            data-ad-slot={actualSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* High-Converting CA Educational Sponsor Fallback & Placement Showcase */
        <FallbackAdBanner format={slotConfig.format} name={slotConfig.name} slotId={actualSlotId} />
      )}
    </div>
  );
}

/**
 * High-Converting Educational Fallback Banner
 * Ensures the website looks polished, monetized, and professional while awaiting AdSense review or serving direct sponsors.
 */
function FallbackAdBanner({ format, name, slotId }: { format: string; name: string; slotId: string }) {
  if (format === 'dropdown-card') {
    return (
      <div className="relative p-3.5 md:p-4 rounded-b-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-white to-purple-50/80 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition-all select-none">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-purple-950 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-purple-950" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                Sponsored Partner
              </span>
              <h4 className="font-bold text-gray-900 text-xs md:text-sm">
                CA Test Series & Suggested Answers
              </h4>
            </div>
            <p className="text-[11px] md:text-xs text-gray-600 line-clamp-1">
              Practice chapter-wise mock questions aligned with the ICAI syllabus
            </p>
          </div>
        </div>
        <div className="shrink-0 hidden sm:block">
          <span className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer">
            <span>Explore</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  }

  if (format === 'sidebar-sticky') {
    return (
      <div className="p-5 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white flex flex-col justify-between h-full min-h-[540px] border border-purple-800/40 shadow-sm rounded-b-2xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Yield Study Partner</span>
          </div>

          <h3 className="text-xl font-extrabold leading-snug tracking-tight text-white mb-2">
            Structured Notes & Chapter Question Banks
          </h3>
          <p className="text-xs text-purple-200/90 leading-relaxed mb-6">
            Get access to 5,000+ chapter-wise practice MCQs, ICAI RTPs & MTPs with step-by-step verified solutions.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-xs text-purple-100">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Revision Notes & Summaries</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-100">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Diagnostic Assessment of Past Papers</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-100">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free on Chartered Seeds</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-800/60 flex flex-col gap-2">
          <a
            href="#chapter-top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-extrabold text-xs rounded-xl text-center shadow-md transition-all transform hover:scale-[1.02]"
          >
            Study Next Section
          </a>
          <span className="text-[10px] text-purple-300/60 text-center block font-mono">
            Slot: {slotId} (300×600)
          </span>
        </div>
      </div>
    );
  }

  if (format === 'in-content') {
    return (
      <div className="p-4 md:p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-b-2xl border border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Featured Resource</span>
              <span className="px-1.5 py-0.2 bg-purple-500/30 text-purple-200 text-[10px] rounded font-mono">In-Article Break</span>
            </div>
            <h4 className="text-sm md:text-base font-bold text-white">
              Need Chapter Revision Audio & Formula Sheets?
            </h4>
            <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
              Bookmark this chapter to your personal Library for 1-click offline revisions before exam day.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="/library"
            className="w-full sm:w-auto text-center px-4 py-2 bg-white text-purple-950 hover:bg-gray-100 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Open My Library
          </a>
        </div>
      </div>
    );
  }

  // Default Leaderboard / Billboard (728x90 desktop / 320x100 mobile)
  return (
    <div className="p-3 md:p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 rounded-b-2xl border border-purple-100 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-tight">CA Exam Preparation Partner</span>
            <span className="text-[9px] bg-purple-200/70 text-purple-800 font-mono px-1.5 py-0.2 rounded hidden sm:inline">{slotId}</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            Master Foundation, Intermediate & Final concepts with verified question banks & chapter diagnostics.
          </p>
        </div>
      </div>

      <div className="shrink-0 hidden md:block">
        <a
          href="/level/foundation"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <span>Explore Syllabus</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
