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

interface ModelResultsProps {
  results: TrainResponse;
}

export const ModelResults: React.FC<ModelResultsProps> = ({ results }) => {
  const { taskType, targetColumn, bestModel, models, trainRows, testRows } = results;

  // Prepare data for Recharts bar chart
  const metricKeys = Object.keys(models[0]?.metrics || {});

  const chartData = models.map((m) => {
    const item: Record<string, string | number> = { name: m.name.replace(' Regression', '').replace(' Classifier', '') };
    for (const k of metricKeys) {
      item[k] = m.metrics[k] ?? 0;
    }
    return item;
  });

  const isRegression = taskType === 'regression';

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl space-y-6 transition-all duration-300 hover:border-white/35">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white/95 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Model Benchmark Results
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {taskType}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Predicting target <strong className="text-cyan-300 font-semibold">{targetColumn}</strong> | Split:{' '}
            <span className="text-white/80">{trainRows} train</span> /{' '}
            <span className="text-white/80">{testRows} test</span> (80/20 seeded).
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-200/80">Top Performer</p>
            <p className="text-sm font-extrabold text-white">{bestModel}</p>
          </div>
        </div>
      </div>

      {/* Comparison Glass Table */}
      <div className="overflow-x-auto rounded-xl border border-white/15">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-slate-900/80 backdrop-blur-xl text-white/90 text-xs uppercase tracking-wider border-b border-white/20">
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
          <tbody className="divide-y divide-white/10">
            {models.map((m) => {
              const isBest = m.name === bestModel;
              return (
                <tr
                  key={m.name}
                  className={`transition-colors duration-200 ${
                    isBest
                      ? 'bg-amber-400/10 font-medium text-white shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]'
                      : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <td className="px-4 py-3.5 flex items-center gap-2 text-white/95">
                    {isBest ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Layers className="w-4 h-4 text-white/40 shrink-0" />
                    )}
                    {m.name}
                  </td>
                  {metricKeys.map((k) => {
                    const val = m.metrics[k];
                    return (
                      <td key={k} className="px-4 py-3.5 font-mono text-cyan-200 font-semibold">
                        {val !== undefined ? val.toFixed(4) : '—'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-right">
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.7)]">
                        <Award className="w-3.5 h-3.5" /> Best
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs">Evaluated</span>
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
        <h4 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Comparative Benchmark Visualizer
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }} />
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
