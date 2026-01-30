"use client";
import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-3 min-w-80 max-w-md">
        <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={24} className="text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Added to Cart!</p>
          <p className="text-xs text-gray-600 mt-0.5">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}
