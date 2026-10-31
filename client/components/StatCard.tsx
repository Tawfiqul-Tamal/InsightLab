'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  gradient = 'from-violet-500/20 to-cyan-500/20',
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl backdrop-blur-xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? 'bg-white/10 border-white/20 shadow-xl hover:border-white/40 hover:bg-white/[0.14]'
          : 'bg-white/75 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-300 hover:bg-white/95'
      }`}
    >
      {/* Background glow */}
      <div
        className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p
            className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
              isDark ? 'text-white/60' : 'text-slate-500'
            }`}
          >
            {label}
          </p>
          <h3
            className={`text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white/95' : 'text-slate-900'
            }`}
          >
            {value}
          </h3>
          {subtext && (
            <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border group-hover:scale-110 transition-all ${
            isDark
              ? 'bg-white/10 border-white/20 text-cyan-300 group-hover:bg-white/20'
              : 'bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:bg-indigo-100/80 shadow-sm'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
