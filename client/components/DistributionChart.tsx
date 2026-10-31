'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ColumnMetadata, NumericDistribution, CategoricalDistribution } from '../types';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DistributionChartProps {
  columns: ColumnMetadata[];
  distributions: Record<string, NumericDistribution | CategoricalDistribution>;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  columns,
  distributions,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>(
    columns[0]?.name || ''
  );
  const { isDark } = useTheme();

  const activeColMeta = columns.find((c) => c.name === selectedColumn);
  const activeDist = distributions[selectedColumn];

  // Prepare chart data
  let chartData: { name: string; count: number }[] = [];

  if (activeDist) {
    if (activeDist.type === 'numeric') {
      chartData = activeDist.bins.map((b) => ({
        name: `${b.binStart} - ${b.binEnd}`,
        count: b.count,
      }));
    } else {
      chartData = activeDist.counts.map((c) => ({
        name: c.category,
        count: c.count,
      }));
    }
  }

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border p-6 transition-all duration-300 ${
        isDark
          ? 'bg-white/10 border-white/20 shadow-xl hover:border-white/30'
          : 'bg-white/75 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3
            className={`text-xl font-bold flex items-center gap-2 ${
              isDark ? 'text-white/95' : 'text-slate-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Column Value Distribution
          </h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            Histogram bins for numeric features or frequency counts for categorical features.
          </p>
        </div>

        {/* Column Picker Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label
            htmlFor="col-select"
            className={`text-xs font-semibold whitespace-nowrap ${
              isDark ? 'text-white/70' : 'text-slate-600'
            }`}
          >
            Select Feature:
          </label>
          <select
            id="col-select"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className={`w-full sm:w-48 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md focus:outline-none focus:border-cyan-400 transition ${
              isDark
                ? 'bg-slate-900/80 border-white/20 text-white'
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
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div
            className={`h-full flex items-center justify-center text-sm ${
              isDark ? 'text-white/50' : 'text-slate-400'
            }`}
          >
            No distribution data available for this column.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
              />
              <XAxis
                dataKey="name"
                stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(71, 85, 105, 0.5)'}
                tick={{ fill: isDark ? 'rgba(255, 255, 255, 0.7)' : '#334155', fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(71, 85, 105, 0.5)'}
                tick={{ fill: isDark ? 'rgba(255, 255, 255, 0.7)' : '#334155', fontSize: 11 }}
                allowDecimals={false}
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
                itemStyle={{ color: '#0284c7' }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {activeColMeta && (
        <div
          className={`mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-xs ${
            isDark ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-500'
          }`}
        >
          <span>
            Type: <strong className={isDark ? 'text-white/80' : 'text-slate-800'}>{activeColMeta.type}</strong>
          </span>
          <span>
            Unique values:{' '}
            <strong className={isDark ? 'text-white/80' : 'text-slate-800'}>
              {activeColMeta.uniqueCount}
            </strong>
          </span>
          {activeColMeta.mean !== undefined && (
            <span>
              Mean: <strong className={isDark ? 'text-white/80' : 'text-slate-800'}>{activeColMeta.mean}</strong>
            </span>
          )}
          {activeColMeta.min !== undefined && (
            <span>
              Min: <strong className={isDark ? 'text-white/80' : 'text-slate-800'}>{activeColMeta.min}</strong>
            </span>
          )}
          {activeColMeta.max !== undefined && (
            <span>
              Max: <strong className={isDark ? 'text-white/80' : 'text-slate-800'}>{activeColMeta.max}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
