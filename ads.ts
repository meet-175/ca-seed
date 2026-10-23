/**
 * Ad Configuration & Management for Chartered Seeds
 * Configured for maximum viewability, high eCPM, and full Google AdSense / AdManager compliance.
 */

export interface AdSlotConfig {
  id: string;
  name: string;
  format: 'leaderboard' | 'billboard' | 'rectangle' | 'half-page' | 'in-content' | 'sidebar-sticky' | 'mobile-banner' | 'dropdown-card';
  dimensions: {
    width: number | string;
    height: number;
  };
  description: string;
}

export const ADS_CONFIG = {
  // Master toggle to enable/disable all ads
  enabled: true,

  // Replace with your real Google AdSense Publisher ID (e.g., 'ca-pub-1234567890123456')
  // or provide VITE_ADSENSE_CLIENT_ID in your environment variables.
  clientId: ((import.meta as any).env?.VITE_ADSENSE_CLIENT_ID as string) || '',

  // If true, shows high-converting, realistic sponsor placeholders when no live AdSense ID is active.
  showFallbackPreviews: true,

  // High-Yield Standard Slots
  slots: {
    readerTopLeaderboard: {
      id: 'ca-seed-reader-top',
      name: 'Reader Top Leaderboard',
      format: 'leaderboard',
      dimensions: { width: '100%', height: 90 },
      description: 'High viewability banner directly above study chapter content'
    },
    readerStickySidebar: {
      id: 'ca-seed-reader-sidebar',
      name: 'Reader Sticky Half-Page / Rail',
      format: 'sidebar-sticky',
      dimensions: { width: 300, height: 600 },
      description: 'Maximum CPM sticky rail that stays in view throughout 15-30m study sessions'
    },
    readerInContent: {
      id: 'ca-seed-reader-incontent',
      name: 'Reader Mid-Article In-Content',
      format: 'in-content',
      dimensions: { width: '100%', height: 180 },
      description: 'High CTR native break placed between Study Notes and Question Banks'
    },
    readerBottomBanner: {
      id: 'ca-seed-reader-bottom',
      name: 'Reader End-of-Chapter Banner',
      format: 'billboard',
      dimensions: { width: '100%', height: 120 },
      description: 'Conversion slot at chapter completion before next chapter navigation'
    },
    levelTopLeaderboard: {
      id: 'ca-seed-level-top',
      name: 'Level Catalog Header Banner',
      format: 'leaderboard',
      dimensions: { width: '100%', height: 90 },
      description: 'Above-the-fold catalog banner below syllabus subject navigation'
    },
    levelInFeed: {
      id: 'ca-seed-level-infeed',
      name: 'Level In-Feed Sponsor Card',
      format: 'in-content',
      dimensions: { width: '100%', height: 100 },
      description: 'Native card placed amidst chapter listings'
    },
    chapterDropdownInBetween: {
      id: 'ca-seed-chapter-dropdown-inbetween',
      name: 'Chapter Dropdown In-Between Sponsor Card',
      format: 'dropdown-card',
      dimensions: { width: '100%', height: 80 },
      description: 'Native in-between card placed inside the chapter material dropdown between study materials and question diagnosis'
    },
    homeBillboard: {
      id: 'ca-seed-home-billboard',
      name: 'Homepage Featured Billboard',
      format: 'billboard',
      dimensions: { width: '100%', height: 120 },
      description: 'Prominent banner between Exam Level selectors and study resources'
    },
    newsTopBanner: {
      id: 'ca-seed-news-top',
      name: 'News & Updates Top Banner',
      format: 'leaderboard',
      dimensions: { width: '100%', height: 90 },
      description: 'Top placement on high-frequency news updates page'
    }
  } as Record<string, AdSlotConfig>
};
