'use client';

import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'error' | 'success';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white max-w-md animate-fade-in">
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      )}
      <p className="text-sm font-medium text-white/90 leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
