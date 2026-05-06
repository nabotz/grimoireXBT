import type { ReactNode } from 'react';

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple';
type Size = 'sm' | 'md';

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-400/10 text-emerald-400',
  danger:  'bg-red-400/10 text-red-400',
  warning: 'bg-amber-400/10 text-amber-400',
  info:    'bg-blue-400/10 text-blue-400',
  neutral: 'bg-gray-400/10 text-gray-400',
  purple:  'bg-purple-400/10 text-purple-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-xs',
};

export default function Badge({ variant = 'neutral', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
