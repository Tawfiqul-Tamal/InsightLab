'use client';

import React, { useState } from 'react';
import { ColumnMetadata } from '../types';
import { Cpu, Play, Sparkles, Loader2, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TrainPanelProps {
  columns: ColumnMetadata[];
  onTrain: (targetColumn: string) => void;
  isTraining: boolean;
}

export const TrainPanel: React.FC<TrainPanelProps> = ({
  columns,
  onTrain,
  isTraining,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(
    columns[columns.length - 1]?.name || columns[0]?.name || ''
  );
  const { isDark } = useTheme();

  const selectedColMeta = columns.find((c) => c.name === selectedTarget);
  const detectedTask =
    selectedColMeta &&
    selectedColMeta.type === 'numeric' &&
    selectedColMeta.uniqueCount > 10
      ? 'Regression'
      : 'Classification';

  const handleTrainClick = () => {
    if (!selectedTarget) return;
    onTrain(selectedTarget);
  };

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-violet-900/30 via-slate-900/40 to-cyan-900/30 border-white/20 hover:border-white/35'
          : 'bg-gradient-to-r from-violet-100/80 via-white/80 to-cyan-100/80 border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:border-indigo-300'
      }`}
    >
      {/* Decorative ambient lights */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${
              isDark
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                : 'bg-cyan-100 border-cyan-300 text-cyan-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Automated In-Memory ML Training
          </div>
          <h3
            className={`text-2xl font-extrabold flex items-center gap-2.5 ${
              isDark ? 'text-white/95' : 'text-slate-900'
            }`}
          >
            <Cpu className="w-6 h-6 text-cyan-500" />
            Train & Benchmark Machine Learning Models
          </h3>
          <p
            className={`text-sm mt-1.5 leading-relaxed ${
              isDark ? 'text-white/60' : 'text-slate-600'
            }`}
          >
            Select a target feature to predict. InsightLab automatically handles deduplication,
            missing value imputation (mean/mode), categorical one-hot encoding, 80/20 seeded train/test
            splits, and benchmarks 3 distinct algorithms concurrently.
          </p>
        </div>

        <div
          className={`w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3 rounded-2xl border backdrop-blur-md ${
            isDark
              ? 'bg-white/10 border-white/20'
              : 'bg-white/80 border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex flex-col gap-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-white/60' : 'text-slate-500'
              }`}
            >
              <Target className="w-3 h-3 text-cyan-500" />
              Target Column
            </span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              disabled={isTraining}
              className={`px-3 py-2 rounded-xl border text-sm font-semibold backdrop-blur-md focus:outline-none focus:border-cyan-400 transition min-w-[200px] ${
                isDark
                  ? 'bg-slate-900/80 border-white/25 text-white'
                  : 'bg-white border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              {columns.map((c) => (
                <option
                  key={c.name}
                  value={c.name}
                  className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                >
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
            <span
              className={`text-[10px] mt-0.5 ${
                isDark ? 'text-cyan-300/80' : 'text-cyan-700'
              }`}
            >
              Task: <strong>{detectedTask}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleTrainClick}
            disabled={isTraining || !selectedTarget}
            className="sm:self-end flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] disabled:opacity-50 h-[42px]"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Training 3 Models...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                Train Models
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
