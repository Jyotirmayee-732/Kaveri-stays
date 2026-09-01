import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const showError = useCallback((msg) => addToast(msg, "error", 5000), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, "info"), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, "warning"), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = "bg-stone-900 border-stone-800 text-white";
          let IconComponent = Info;
          let iconColor = "text-sky-400";

          if (toast.type === "success") {
            bgColor = "bg-emerald-950 border-emerald-800 text-emerald-50";
            IconComponent = CheckCircle2;
            iconColor = "text-emerald-400";
          } else if (toast.type === "error") {
            bgColor = "bg-rose-950 border-rose-800 text-rose-50";
            IconComponent = AlertCircle;
            iconColor = "text-rose-400";
          } else if (toast.type === "warning") {
            bgColor = "bg-amber-950 border-amber-800 text-amber-50";
            IconComponent = AlertTriangle;
            iconColor = "text-amber-400";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${bgColor}`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-800 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
