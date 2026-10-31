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
    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl transition-all duration-300 hover:border-white/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Column Value Distribution
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Histogram bins for numeric features or frequency counts for categorical features.
          </p>
        </div>

        {/* Column Picker Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="col-select" className="text-xs font-semibold text-white/70 whitespace-nowrap">
            Select Feature:
          </label>
          <select
            id="col-select"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/20 text-white text-xs font-medium backdrop-blur-md focus:outline-none focus:border-cyan-400 transition"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/50 text-sm">
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.5)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#38bdf8' }}
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
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/60">
          <span>Type: <strong className="text-white/80">{activeColMeta.type}</strong></span>
          <span>Unique values: <strong className="text-white/80">{activeColMeta.uniqueCount}</strong></span>
          {activeColMeta.mean !== undefined && (
            <span>Mean: <strong className="text-white/80">{activeColMeta.mean}</strong></span>
          )}
          {activeColMeta.min !== undefined && (
            <span>Min: <strong className="text-white/80">{activeColMeta.min}</strong></span>
          )}
          {activeColMeta.max !== undefined && (
            <span>Max: <strong className="text-white/80">{activeColMeta.max}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};
