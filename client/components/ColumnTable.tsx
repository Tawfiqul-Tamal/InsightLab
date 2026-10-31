'use client';

import React, { useState } from 'react';
import { ColumnMetadata } from '../types';
import { Table, Eye, Hash, Tag, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ColumnTableProps {
  columns: ColumnMetadata[];
  topRows: Record<string, string | number | null>[];
}

export const ColumnTable: React.FC<ColumnTableProps> = ({ columns, topRows }) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'preview'>('columns');
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border p-6 transition-all duration-300 ${
        isDark
          ? 'bg-white/10 border-white/20 shadow-xl hover:border-white/30'
          : 'bg-white/75 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-200'
      }`}
    >
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3
            className={`text-xl font-bold flex items-center gap-2 ${
              isDark ? 'text-white/95' : 'text-slate-900'
            }`}
          >
            <Table className="w-5 h-5 text-cyan-500" />
            Dataset Schema & Data Preview
          </h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            In-depth column statistics, detected types, missing values, and sample data.
          </p>
        </div>

        <div
          className={`flex rounded-xl p-1 border backdrop-blur-md ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('columns')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'columns'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : isDark
                ? 'text-white/70 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Column Details ({columns.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : isDark
                ? 'text-white/70 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Top 10 Rows
          </button>
        </div>
      </div>

      {activeTab === 'columns' ? (
        <div
          className={`overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border ${
            isDark ? 'border-white/15' : 'border-slate-200'
          }`}
        >
          <table
            className={`w-full text-left text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}
          >
            <thead
              className={`sticky top-0 backdrop-blur-xl text-xs uppercase tracking-wider border-b ${
                isDark
                  ? 'bg-slate-900/85 text-white/90 border-white/20'
                  : 'bg-slate-100/95 text-slate-800 border-slate-200'
              }`}
            >
              <tr>
                <th className="px-4 py-3 font-semibold">Column Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Missing Values</th>
                <th className="px-4 py-3 font-semibold">Unique Values</th>
                <th className="px-4 py-3 font-semibold">Mean</th>
                <th className="px-4 py-3 font-semibold">Range (Min - Max)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200/70'}`}>
              {columns.map((col) => {
                const isNum = col.type === 'numeric';
                return (
                  <tr
                    key={col.name}
                    className={`transition-colors duration-150 ${
                      isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td
                      className={`px-4 py-3 font-medium flex items-center gap-2 ${
                        isDark ? 'text-white/95' : 'text-slate-900'
                      }`}
                    >
                      {isNum ? (
                        <Hash className="w-3.5 h-3.5 text-cyan-500" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-violet-500" />
                      )}
                      {col.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isNum
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : isDark
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                            : 'bg-violet-50 text-violet-700 border-violet-200'
                        }`}
                      >
                        {col.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {col.missingCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                            isDark
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {col.missingCount} missing
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-medium ${
                            isDark ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        >
                          0 (Complete)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{col.uniqueCount}</td>
                    <td className="px-4 py-3">
                      {col.mean !== undefined ? col.mean : '—'}
                    </td>
                    <td className="px-4 py-3">
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
        <div
          className={`overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border ${
            isDark ? 'border-white/15' : 'border-slate-200'
          }`}
        >
          <table
            className={`w-full text-left text-xs ${isDark ? 'text-white/80' : 'text-slate-700'}`}
          >
            <thead
              className={`sticky top-0 backdrop-blur-xl uppercase tracking-wider border-b ${
                isDark
                  ? 'bg-slate-900/85 text-white/90 border-white/20'
                  : 'bg-slate-100/95 text-slate-800 border-slate-200'
              }`}
            >
              <tr>
                <th className="px-3 py-2.5 font-semibold">#</th>
                {columns.map((c) => (
                  <th key={c.name} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y font-mono ${
                isDark ? 'divide-white/10' : 'divide-slate-200/70'
              }`}
            >
              {topRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className={`px-3 py-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    {idx + 1}
                  </td>
                  {columns.map((c) => (
                    <td
                      key={c.name}
                      className={`px-3 py-2 whitespace-nowrap ${
                        isDark ? 'text-white/90' : 'text-slate-800'
                      }`}
                    >
                      {row[c.name] === null || row[c.name] === undefined ? (
                        <span className="text-rose-500 italic">null</span>
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
