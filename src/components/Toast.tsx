import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div 
      id="portal-toast-notification"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-zinc-100 shadow-2xl text-xs font-semibold animate-fade-in"
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
