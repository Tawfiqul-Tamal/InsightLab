'use client';

import React from 'react';

export const ShimmerCard: React.FC<{ className?: string }> = ({ className = 'h-32' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export const AnalysisSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-28" />
      </div>
      <ShimmerCard className="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShimmerCard className="h-80" />
        <ShimmerCard className="h-80" />
      </div>
    </div>
  );
};
