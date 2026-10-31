'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFileName?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  isLoading,
  selectedFileName,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Please upload a valid .csv file');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleUseSample = async () => {
    try {
      const res = await fetch('/sample.csv');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'student_performance_sample.csv', {
        type: 'text/csv',
      });
      onFileSelect(sampleFile);
    } catch {
      alert('Failed to load sample dataset');
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 backdrop-blur-xl ${
          isDragOver
            ? 'border-cyan-400 bg-white/30 shadow-2xl scale-[1.01]'
            : isDark
            ? 'border-white/25 bg-white/10 hover:border-white/40 hover:bg-white/[0.14] shadow-xl'
            : 'border-slate-300/80 bg-white/70 hover:border-indigo-400 hover:bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 border border-white/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
          {selectedFileName ? (
            <span className="flex items-center justify-center gap-2 text-cyan-400">
              <FileText className="w-5 h-5" />
              {selectedFileName}
            </span>
          ) : (
            'Drag and drop your CSV dataset here'
          )}
        </h3>

        <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
          Support for tabular CSV files up to 4MB. Instant profiling, automated preprocessing,
          and in-memory ML model training.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Browse CSV File'}
          </button>

          <button
            type="button"
            onClick={handleUseSample}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-300 shadow-sm disabled:opacity-50 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/25 hover:border-white/40 text-white/90'
                : 'bg-white/85 hover:bg-white border-slate-300 text-slate-800 shadow-sm'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-500" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Use Sample Dataset (Student Performance)
          </button>
        </div>
      </div>
    </div>
  );
};
