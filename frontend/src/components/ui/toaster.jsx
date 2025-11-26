import { useState, useEffect } from 'react';

// Simple Event Emitter for Toasts
const listeners = new Set();

export const toast = ({ title, description, variant = 'default' }) => {
  listeners.forEach(listener => listener({ title, description, variant, id: Math.random() }));
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    listeners.add(handleToast);
    return () => listeners.delete(handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`min-w-[300px] p-4 rounded shadow-lg border bg-white pointer-events-auto animate-in slide-in-from-right-full ${
            t.variant === 'destructive' ? 'border-red-500 text-red-700 bg-red-50' : 'border-gray-200 text-gray-800'
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm text-gray-600">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}