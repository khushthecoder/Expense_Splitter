import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from './index';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up",
      type === 'success' ? "bg-white border-green-100 text-green-800" : "bg-white border-red-100 text-red-800"
    )}>
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-500" />
      ) : (
        <XCircle size={20} className="text-red-500" />
      )}
      <p className="font-medium text-sm">{message}</p>
      <button 
        onClick={onClose}
        className={cn(
          "ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors",
          type === 'success' ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}
