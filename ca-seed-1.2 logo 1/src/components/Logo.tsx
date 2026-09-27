import React from 'react';

interface LogoProps {
  variant?: 'white' | 'light';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  variant = 'white',
  showTagline = true,
  className = '',
}: LogoProps) {
  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 72 72"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoEmblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? "#581c87" : "#7e22ce"} />
              <stop offset="100%" stopColor={isWhite ? "#3b0764" : "#581c87"} />
            </linearGradient>
            <linearGradient id="logoEmblemLeaf" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>

          {/* Squircle Background */}
          <rect
            width="72"
            height="72"
            rx="18"
            fill="url(#logoEmblemGrad)"
            stroke={isWhite ? "rgba(255,255,255,0.25)" : "none"}
            strokeWidth="1.5"
          />

          {/* Touch of Red: Bookmark Ribbon */}
          <path d="M 34 42 L 34 56 L 36.5 53.5 L 39 56 L 39 42 Z" fill="#ef4444" />

          {/* Open Book White Pages */}
          <path
            d="M 36 46 C 28 43 17 42 11 44 C 10 35 10 26 11 20 C 18 18 28 19 36 23 Z"
            fill="#ffffff"
          />
          <path
            d="M 36 46 C 44 43 55 42 61 44 C 62 35 62 26 61 20 C 54 18 44 19 36 23 Z"
            fill={isWhite ? "#f8fafc" : "#ffffff"}
          />
          <path d="M 35 23 L 37 23 L 37 46 L 35 46 Z" fill="#cbd5e1" opacity="0.8" />

          {/* Growing Sprout */}
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
            fill="url(#logoEmblemLeaf)"
          />
          <path
            d="M 36 15 C 42 12 46 16 45 21 C 40 22 37 17 36 15 Z"
            fill="url(#logoEmblemLeaf)"
          />
          <circle cx="36" cy="28" r="1.8" fill="#4ade80" />
        </svg>
      </div>

      {/* Typography: CA Seed & Tagline */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-xl font-extrabold tracking-tight ${
              isWhite ? 'text-white' : 'text-gray-900'
            }`}
          >
            CA
          </span>
          <span
            className={`text-xl font-extrabold tracking-tight ${
              isWhite ? 'text-emerald-300' : 'text-purple-700'
            }`}
          >
            Seed
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
              isWhite ? 'text-purple-200' : 'text-gray-500'
            }`}
          >
            Grow Your Concepts
          </span>
        )}
      </div>
    </div>
  );
}
