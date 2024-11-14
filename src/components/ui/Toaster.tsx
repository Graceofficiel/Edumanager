import React from 'react';
import { X } from 'lucide-react';
import { Toast, ToastViewport } from './Toast';
import { useToast } from './useToast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastViewport>
      {toasts.map(({ id, title, description, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <div className="font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" />
        </Toast>
      ))}
    </ToastViewport>
  );
}