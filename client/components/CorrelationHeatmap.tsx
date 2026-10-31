'use client';

import React from 'react';
import { CorrelationMatrix } from '../types';
import { Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CorrelationHeatmapProps {
  correlationMatrix: CorrelationMatrix;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationMatrix,
}) => {
  const { columns, matrix } = correlationMatrix;
  const { isDark } = useTheme();

  if (columns.length === 0) {
    return (
      <div
        className={`rounded-2xl backdrop-blur-xl border p-6 text-center ${
          isDark
            ? 'bg-white/10 border-white/20 text-white/60 shadow-xl'
            : 'bg-white/75 border-slate-200 text-slate-500 shadow-md'
        }`}
      >
        <p>No numeric columns available for correlation analysis.</p>
      </div>
    );
  }

  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-cyan-500 text-white font-bold border-cyan-400';
    if (val > 0.7) return 'bg-cyan-600/75 text-white border-cyan-500/40';
    if (val > 0.4) return isDark ? 'bg-teal-600/50 text-teal-200 border-teal-500/30' : 'bg-teal-500/25 text-teal-900 border-teal-300';
    if (val > 0.1) return isDark ? 'bg-blue-900/40 text-blue-200 border-blue-500/20' : 'bg-blue-50 text-blue-900 border-blue-200';
    if (val >= -0.1) return isDark ? 'bg-white/5 text-white/60 border-white/10' : 'bg-slate-100/80 text-slate-600 border-slate-200';
    if (val >= -0.4) return isDark ? 'bg-indigo-900/40 text-indigo-200 border-indigo-500/20' : 'bg-indigo-50 text-indigo-900 border-indigo-200';
    if (val >= -0.7) return isDark ? 'bg-purple-900/50 text-purple-200 border-purple-500/30' : 'bg-purple-100 text-purple-900 border-purple-200';
    return isDark ? 'bg-rose-900/70 text-rose-200 border-rose-500/40' : 'bg-rose-500/30 text-rose-900 border-rose-300';
  };

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border p-6 transition-all duration-300 ${
        isDark
          ? 'bg-white/10 border-white/20 shadow-xl hover:border-white/30'
          : 'bg-white/75 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-200'
      }`}
    >
      <div className="mb-4">
        <h3
          className={`text-xl font-bold flex items-center gap-2 ${
            isDark ? 'text-white/95' : 'text-slate-900'
          }`}
        >
          <Activity className="w-5 h-5 text-cyan-500" />
          Feature Correlation Heatmap
        </h3>
        <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
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
            <div className={`p-2 text-xs font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Feature
            </div>

            {/* Column Headers */}
            {columns.map((col) => (
              <div
                key={col}
                className={`p-2 text-center text-xs font-semibold truncate border-b ${
                  isDark ? 'text-white/80 border-white/10' : 'text-slate-700 border-slate-200'
                }`}
                title={col}
              >
                {col}
              </div>
            ))}

            {/* Rows */}
            {columns.map((rowCol, rIdx) => (
              <React.Fragment key={rowCol}>
                <div
                  className={`p-2 text-xs font-semibold truncate flex items-center border-r ${
                    isDark ? 'text-white/80 border-white/10' : 'text-slate-700 border-slate-200'
                  }`}
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
      <div className={`mt-4 flex items-center justify-center gap-4 text-[11px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-600/70 border border-rose-400 inline-block" />
          Negative (-1.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded border inline-block ${isDark ? 'bg-white/5 border-white/20' : 'bg-slate-100 border-slate-300'}`} />
          Neutral (0.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-500 border border-cyan-400 inline-block" />
          Positive (+1.0)
        </span>
      </div>
    </div>
  );
};
