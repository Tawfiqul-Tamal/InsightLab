'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrainResponse } from '../types';
import { Award, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ModelResultsProps {
  results: TrainResponse;
}

export const ModelResults: React.FC<ModelResultsProps> = ({ results }) => {
  const { taskType, targetColumn, bestModel, models, trainRows, testRows } = results;
  const { isDark } = useTheme();

  // Prepare data for Recharts bar chart
  const metricKeys = Object.keys(models[0]?.metrics || {});

  const chartData = models.map((m) => {
    const item: Record<string, string | number> = {
      name: m.name.replace(' Regression', '').replace(' Classifier', ''),
    };
    for (const k of metricKeys) {
      item[k] = m.metrics[k] ?? 0;
    }
    return item;
  });

  const isRegression = taskType === 'regression';

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border p-6 shadow-2xl space-y-6 transition-all duration-300 ${
        isDark
          ? 'bg-white/10 border-white/20 hover:border-white/35'
          : 'bg-white/75 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-200'
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-2xl font-black flex items-center gap-2 ${
                isDark ? 'text-white/95' : 'text-slate-900'
              }`}
            >
              <Award className="w-6 h-6 text-amber-500" />
              Model Benchmark Results
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isDark
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                  : 'bg-violet-100 text-violet-800 border-violet-300'
              }`}
            >
              {taskType}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            Predicting target{' '}
            <strong className={isDark ? 'text-cyan-300 font-semibold' : 'text-cyan-700 font-semibold'}>
              {targetColumn}
            </strong>{' '}
            | Split:{' '}
            <span className={isDark ? 'text-white/80' : 'text-slate-700'}>{trainRows} train</span> /{' '}
            <span className={isDark ? 'text-white/80' : 'text-slate-700'}>{testRows} test</span> (80/20
            seeded).
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-md ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-amber-50/90 border-amber-300 text-slate-800 shadow-[0_4px_15px_rgba(245,158,11,0.15)]'
          }`}
        >
          <Award className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-amber-200/80' : 'text-amber-800'}`}>
              Top Performer
            </p>
            <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {bestModel}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Glass Table */}
      <div
        className={`overflow-x-auto rounded-xl border ${
          isDark ? 'border-white/15' : 'border-slate-200'
        }`}
      >
        <table
          className={`w-full text-left text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}
        >
          <thead
            className={`backdrop-blur-xl text-xs uppercase tracking-wider border-b ${
              isDark
                ? 'bg-slate-900/85 text-white/90 border-white/20'
                : 'bg-slate-100/95 text-slate-800 border-slate-200'
            }`}
          >
            <tr>
              <th className="px-4 py-3 font-semibold">Model Algorithm</th>
              {metricKeys.map((k) => (
                <th key={k} className="px-4 py-3 font-semibold">
                  {k} {isRegression && k === 'R2' ? '(Higher is better)' : ''}
                  {isRegression && k === 'RMSE' ? '(Lower is better)' : ''}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200/70'}`}>
            {models.map((m) => {
              const isBest = m.name === bestModel;
              return (
                <tr
                  key={m.name}
                  className={`transition-colors duration-200 ${
                    isBest
                      ? isDark
                        ? 'bg-amber-400/10 font-medium text-white shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]'
                        : 'bg-amber-50/80 font-medium text-slate-900 border-l-4 border-l-amber-500'
                      : isDark
                      ? 'hover:bg-white/[0.05]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className={`px-4 py-3.5 flex items-center gap-2 ${
                      isDark ? 'text-white/95' : 'text-slate-900'
                    }`}
                  >
                    {isBest ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Layers className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                    )}
                    {m.name}
                  </td>
                  {metricKeys.map((k) => {
                    const val = m.metrics[k];
                    return (
                      <td
                        key={k}
                        className={`px-4 py-3.5 font-mono font-semibold ${
                          isDark ? 'text-cyan-200' : 'text-cyan-800'
                        }`}
                      >
                        {val !== undefined ? val.toFixed(4) : '—'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-right">
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                        <Award className="w-3.5 h-3.5" /> Best
                      </span>
                    ) : (
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        Evaluated
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Metric Visual Comparison Chart */}
      <div className="pt-2">
        <h4
          className={`text-sm font-bold flex items-center gap-2 mb-3 ${
            isDark ? 'text-white/90' : 'text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-500" />
          Comparative Benchmark Visualizer
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
              />
              <XAxis
                dataKey="name"
                stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(71, 85, 105, 0.5)'}
                tick={{ fill: isDark ? 'rgba(255, 255, 255, 0.8)' : '#334155', fontSize: 12 }}
              />
              <YAxis
                stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(71, 85, 105, 0.5)'}
                tick={{ fill: isDark ? 'rgba(255, 255, 255, 0.8)' : '#334155', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(203, 213, 225, 0.9)',
                  borderRadius: '12px',
                  color: isDark ? '#fff' : '#0f172a',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#334155',
                }}
              />
              {metricKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={idx === 0 ? '#38bdf8' : '#a855f7'}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
