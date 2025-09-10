import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative h-16 overflow-hidden font-mono text-xs tracking-wide text-slate-400">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
        <div className="flex items-center gap-5 text-center whitespace-nowrap">

          {/* Brand */}
          <span className="text-xs font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-widest">
            PHYSIQUE 57 INDIA
          </span>

          {/* Divider */}
          <div className="w-px h-3 bg-slate-600" />

          {/* Copyright */}
          <span className="tracking-widest">© 2025 ALL RIGHTS RESERVED</span>

          <div className="w-px h-3 bg-slate-600" />

          {/* Dashboard Label */}
          <span className="tracking-widest">BUSINESS INTELLIGENCE DASHBOARD</span>

          <div className="w-px h-3 bg-slate-600" />

          {/* Creator Tag */}
          <div className="flex items-center gap-1">
            <span className="tracking-widest">PROJECT BY</span>
            <span className="text-white bg-gradient-to-r from-blue-500 to-purple-600 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wider">
              JIMMEEY
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};
