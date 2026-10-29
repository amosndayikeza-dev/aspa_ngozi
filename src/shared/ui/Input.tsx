// src/shared/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    // On génère un id si non fourni (pour lier label et input)
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold text-slate-700 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-8 rounded-lg border bg-white px-2.5 text-xs text-slate-900',
              'placeholder:text-slate-400',
              'transition-all focus:outline-none focus:ring-2',
              error
                ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-500',
              leftIcon && 'pl-8',
              rightIcon && 'pr-8',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-2.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[10px] text-rose-600 font-medium mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';