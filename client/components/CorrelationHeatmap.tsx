'use client';

import React from 'react';
import { CorrelationMatrix } from '../types';
import { Activity } from 'lucide-react';

interface CorrelationHeatmapProps {
  correlationMatrix: CorrelationMatrix;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationMatrix,
}) => {
  const { columns, matrix } = correlationMatrix;

  if (columns.length === 0) {
    return (
      <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl text-center text-white/60">
        <p>No numeric columns available for correlation analysis.</p>
      </div>
    );
  }

  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-cyan-500/80 text-white font-bold border-cyan-400';
    if (val > 0.7) return 'bg-cyan-600/60 text-white border-cyan-500/40';
    if (val > 0.4) return 'bg-teal-600/40 text-teal-200 border-teal-500/30';
    if (val > 0.1) return 'bg-blue-900/30 text-blue-200 border-blue-500/20';
    if (val >= -0.1) return 'bg-white/5 text-white/60 border-white/10';
    if (val >= -0.4) return 'bg-indigo-900/40 text-indigo-200 border-indigo-500/20';
    if (val >= -0.7) return 'bg-purple-900/50 text-purple-200 border-purple-500/30';
    return 'bg-rose-900/70 text-rose-200 border-rose-500/40';
  };

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl transition-all duration-300 hover:border-white/30">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Feature Correlation Heatmap
        </h3>
        <p className="text-xs text-white/60 mt-1">
          Pearson correlation coefficients among numeric features (-1.0 to +1.0).
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `140px repeat(${columns.length}, minmax(70px, 1fr))`,
            }}
          >
            {/* Top Header Corner */}
            <div className="p-2 text-xs font-semibold text-white/40">Feature</div>

            {/* Column Headers */}
            {columns.map((col) => (
              <div
                key={col}
                className="p-2 text-center text-xs font-semibold text-white/80 truncate border-b border-white/10"
                title={col}
              >
                {col}
              </div>
            ))}

            {/* Rows */}
            {columns.map((rowCol, rIdx) => (
              <React.Fragment key={rowCol}>
                <div
                  className="p-2 text-xs font-semibold text-white/80 truncate flex items-center border-r border-white/10"
                  title={rowCol}
                >
                  {rowCol}
                </div>
                {columns.map((colCol, cIdx) => {
                  const val = matrix[rIdx]?.[cIdx] ?? 0;
                  return (
                    <div
                      key={`${rowCol}-${colCol}`}
                      title={`${rowCol} × ${colCol}: ${val}`}
                      className={`h-12 rounded-lg flex items-center justify-center text-xs font-mono border backdrop-blur-md transition-all duration-200 hover:scale-105 hover:z-10 shadow-sm ${getCellColor(
                        val
                      )}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-white/60">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-900/70 border border-rose-500/40 inline-block" />
          Negative (-1.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/5 border border-white/10 inline-block" />
          Neutral (0.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-500/80 border border-cyan-400 inline-block" />
          Positive (+1.0)
        </span>
      </div>
    </div>
  );
};
