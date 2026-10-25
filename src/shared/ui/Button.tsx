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
    primary: 'bg-vet-green text-white hover:bg-vet-green/90 focus:ring-vet-green/40',
    secondary: 'bg-white text-vet-dark border border-gray-200 hover:bg-gray-50 focus:ring-gray-200',
    danger: 'bg-vet-danger text-white hover:bg-vet-danger/90 focus:ring-vet-danger/40',
    ghost: 'bg-transparent text-vet-dark hover:bg-gray-100 focus:ring-gray-200',
};

//style par taille
const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-sm gap-2',
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