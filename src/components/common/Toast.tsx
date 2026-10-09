'use client';

import React from 'react';
import { usePOS } from '../../context/POSContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = usePOS();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-medium font-mono">
        <CheckCircle2 className="w-4 h-4 text-theme-teal shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
