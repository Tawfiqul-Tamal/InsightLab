'use client';

import React, { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { StatCard } from '../components/StatCard';
import { ColumnTable } from '../components/ColumnTable';
import { CorrelationHeatmap } from '../components/CorrelationHeatmap';
import { DistributionChart } from '../components/DistributionChart';
import { TrainPanel } from '../components/TrainPanel';
import { ModelResults } from '../components/ModelResults';
import { Toast } from '../components/Toast';
import { AnalysisSkeleton } from '../components/Skeleton';
import { AnalyzeResponse, TrainResponse } from '../types';
import {
  Database,
  Columns,
  AlertCircle,
  Binary,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardPage() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResponse | null>(null);
  const [trainData, setTrainData] = useState<TrainResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');

  const triggerToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    setTrainData(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Analysis failed with status ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      setAnalyzeData(data);
      triggerToast(`Successfully analyzed "${file.name}" (${data.rowCount} rows)`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze CSV file';
      triggerToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTrain = async (targetColumn: string) => {
    if (!currentFile) {
      triggerToast('Please upload a dataset first', 'error');
      return;
    }

    setIsTraining(true);

    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      formData.append('targetColumn', targetColumn);

      const res = await fetch(`${API_BASE}/api/train`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Training failed with status ${res.status}`);
      }

      const data: TrainResponse = await res.json();
      setTrainData(data);
      triggerToast(
        `Models trained! Best algorithm: ${data.bestModel} (${data.taskType})`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Training failed';
      triggerToast(msg, 'error');
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setAnalyzeData(null);
    setTrainData(null);
  };

  // Compute total missing cells across all columns
  const totalMissing =
    analyzeData?.columns.reduce((sum, c) => sum + c.missingCount, 0) ?? 0;
  const numericCount =
    analyzeData?.columns.filter((c) => c.type === 'numeric').length ?? 0;

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-[#060814] via-[#0b0f2a] to-[#041c24] text-white p-4 sm:p-6 md:p-10 overflow-hidden">
      {/* 3 Blurred Floating Gradient Orbs */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-purple-700/30 to-indigo-600/30 blur-[130px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-teal-500/25 to-cyan-600/25 blur-[140px] animate-float-reverse"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-700/20 to-fuchsia-600/20 blur-[130px] animate-float-drift"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Navigation & Brand Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full rounded-2xl bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white/95">
                  Insight<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Lab</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/15">
                  Glassmorphism MVP
                </span>
              </div>
              <p className="text-xs text-white/60">
                Automated tabular intelligence, live distributions & ML benchmarking
              </p>
            </div>
          </div>

          {analyzeData && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Upload New CSV
            </button>
          )}
        </header>

        {/* Upload Zone */}
        {!analyzeData && (
          <section className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Zero-config in-memory analysis
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white/95 tracking-tight">
                Analyze & Benchmark Datasets{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300">
                  in Real Time
                </span>
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Drop your CSV dataset below or test instantly with our curated student performance sample.
                Get automated column profiling, correlation analysis, and train multi-model benchmarks.
              </p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              isLoading={isAnalyzing}
              selectedFileName={currentFile?.name}
            />

            {isAnalyzing && <AnalysisSkeleton />}
          </section>
        )}

        {/* Active Analysis Dashboard */}
        {analyzeData && (
          <section className="space-y-8 animate-fade-in">
            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Records"
                value={analyzeData.rowCount.toLocaleString()}
                icon={Database}
                subtext="Rows processed in-memory"
                gradient="from-violet-600/30 to-indigo-600/30"
              />
              <StatCard
                label="Total Columns"
                value={analyzeData.columns.length}
                icon={Columns}
                subtext={`${numericCount} numeric, ${analyzeData.columns.length - numericCount} categorical`}
                gradient="from-cyan-600/30 to-teal-600/30"
              />
              <StatCard
                label="Missing Cells"
                value={totalMissing}
                icon={AlertCircle}
                subtext={totalMissing === 0 ? 'Clean dataset (100% complete)' : 'Auto-imputed on train'}
                gradient="from-amber-600/30 to-rose-600/30"
              />
              <StatCard
                label="Numeric Features"
                value={numericCount}
                icon={Binary}
                subtext="Eligible for Pearson correlation"
                gradient="from-emerald-600/30 to-cyan-600/30"
              />
            </div>

            {/* Column Schema & Preview Table */}
            <ColumnTable
              columns={analyzeData.columns}
              topRows={analyzeData.topRows}
            />

            {/* Heatmap & Distribution Visualizers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorrelationHeatmap
                correlationMatrix={analyzeData.correlationMatrix}
              />
              <DistributionChart
                columns={analyzeData.columns}
                distributions={analyzeData.distributions}
              />
            </div>

            {/* Machine Learning Training Panel */}
            <TrainPanel
              columns={analyzeData.columns}
              onTrain={handleTrain}
              isTraining={isTraining}
            />

            {/* Model Benchmark Results */}
            {trainData && <ModelResults results={trainData} />}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-12 pb-6 border-t border-white/10 text-center text-xs text-white/40">
          <p>InsightLab — Glassmorphism Tabular Analytics & Machine Learning Sandbox</p>
        </footer>
      </div>

      {/* Floating Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
}
