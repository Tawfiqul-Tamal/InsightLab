'use client';

import React, { useState } from 'react';
import { ColumnMetadata } from '../types';
import { Table, Eye, Hash, Tag, AlertTriangle } from 'lucide-react';

interface ColumnTableProps {
  columns: ColumnMetadata[];
  topRows: Record<string, string | number | null>[];
}

export const ColumnTable: React.FC<ColumnTableProps> = ({ columns, topRows }) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'preview'>('columns');

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl overflow-hidden transition-all duration-300 hover:border-white/30">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <Table className="w-5 h-5 text-cyan-400" />
            Dataset Schema & Data Preview
          </h3>
          <p className="text-xs text-white/60 mt-1">
            In-depth column statistics, detected types, missing values, and sample data.
          </p>
        </div>

        <div className="flex rounded-xl bg-white/10 p-1 border border-white/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('columns')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'columns'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Column Details ({columns.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Top 10 Rows
          </button>
        </div>
      </div>

      {activeTab === 'columns' ? (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-white/15">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-xl text-white/90 text-xs uppercase tracking-wider border-b border-white/20">
              <tr>
                <th className="px-4 py-3 font-semibold">Column Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Missing Values</th>
                <th className="px-4 py-3 font-semibold">Unique Values</th>
                <th className="px-4 py-3 font-semibold">Mean</th>
                <th className="px-4 py-3 font-semibold">Range (Min - Max)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {columns.map((col) => {
                const isNum = col.type === 'numeric';
                return (
                  <tr
                    key={col.name}
                    className="hover:bg-white/[0.06] transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium text-white/95 flex items-center gap-2">
                      {isNum ? (
                        <Hash className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-violet-400" />
                      )}
                      {col.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isNum
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        }`}
                      >
                        {col.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {col.missingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          {col.missingCount} missing
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-medium">0 (Complete)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">{col.uniqueCount}</td>
                    <td className="px-4 py-3 text-white/70">
                      {col.mean !== undefined ? col.mean : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {col.min !== undefined && col.max !== undefined
                        ? `${col.min} – ${col.max}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-white/15">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-xl text-white/90 uppercase tracking-wider border-b border-white/20">
              <tr>
                <th className="px-3 py-2.5 font-semibold">#</th>
                {columns.map((c) => (
                  <th key={c.name} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono">
              {topRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.06] transition-colors">
                  <td className="px-3 py-2 text-white/40">{idx + 1}</td>
                  {columns.map((c) => (
                    <td key={c.name} className="px-3 py-2 whitespace-nowrap text-white/90">
                      {row[c.name] === null || row[c.name] === undefined ? (
                        <span className="text-rose-400/80 italic">null</span>
                      ) : (
                        String(row[c.name])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
