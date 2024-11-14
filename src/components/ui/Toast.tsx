import React from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  children: React.ReactNode;
}

export function Toast({ children }: ToastProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-2 flex items-center justify-between">
      {children}
    </div>
  );
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {children}
    </div>,
    document.body
  );
}