import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ToastContextType = {
  toasts: Toast[];
  notify: (message: string, type?: Toast['type']) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3000);
  };

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`animate-slide-up cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            t.type === 'success'
              ? 'bg-green-600'
              : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-ink-900'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Re-export for convenience in components that just need the hook
export function useToastAuto() {
  useEffect(() => {}, []);
}
