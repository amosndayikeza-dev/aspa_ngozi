import { Children, forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

//les variantes visuelles du bouton
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?:React.ReactNode;
}

//style par variante
const variantStyle: Record<ButtonVariant, string> = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs border border-emerald-600/90 focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.99] cursor-pointer',
    secondary: 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs focus:ring-2 focus:ring-slate-200 active:scale-[0.99] cursor-pointer',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs border border-rose-600/90 focus:ring-2 focus:ring-rose-500/20 active:scale-[0.99] cursor-pointer',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 cursor-pointer',
};

//style par taille
const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-7 px-2.5 text-[11px] gap-1 font-semibold rounded-lg',
    md: 'h-8 px-3 text-xs gap-1.5 font-semibold rounded-lg',
    lg: 'h-9 px-4 text-xs gap-2 font-semibold rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base commune
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors focus:outline-none focus:ring-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variante + taille
          variantStyle[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';