'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl border transition-all duration-300 shadow-md ${
        isDark
          ? 'bg-white/10 hover:bg-white/20 border-white/20 text-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'
          : 'bg-white/80 hover:bg-white border-slate-300/80 text-indigo-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
      }`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 animate-spin-slow transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform" />
        )}
      </div>
      <span className={isDark ? 'text-white/90' : 'text-slate-800'}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};
