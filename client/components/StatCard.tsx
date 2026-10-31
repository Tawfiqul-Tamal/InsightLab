'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

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
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.14]">
      {/* Subtle background glow */}
      <div
        className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold text-white/90 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-white/50 mt-1">{subtext}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-cyan-300 group-hover:scale-110 group-hover:bg-white/20 transition-all">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
