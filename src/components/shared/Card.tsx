import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
