"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let addToast: (toast: Omit<ToastItem, "id">) => void;
let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toastState: ToastItem[] = [];

function notifyListeners() {
  for (const l of toastListeners) l([...toastState]);
}

export function toast(type: ToastItem["type"], message: string) {
  const id = Math.random().toString(36).slice(2);
  toastState = [...toastState, { id, type, message }];
  notifyListeners();
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const remove = (id: string) => {
    toastState = toastState.filter((t) => t.id !== id);
    notifyListeners();
  };

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-blue-600 text-white",
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right-2",
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}