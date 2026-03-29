// Composant Badge réutilisable
import React from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'europcar'
  | 'goldcar'
  | 'maintenance'
  | 'buyback'
  | 'neige'
  | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-gray-200',
  success: 'bg-green-900/60 text-green-400 border border-green-800',
  warning: 'bg-yellow-900/60 text-yellow-400 border border-yellow-800',
  danger: 'bg-red-900/60 text-red-400 border border-red-800',
  info: 'bg-blue-900/60 text-blue-400 border border-blue-800',
  europcar: 'bg-green-900/40 text-green-400 border border-green-700',
  goldcar: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
  maintenance: 'bg-red-900/60 text-red-300 border border-red-700',
  buyback: 'bg-purple-900/60 text-purple-300 border border-purple-700',
  neige: 'bg-blue-900/60 text-blue-300 border border-blue-700',
  muted: 'bg-gray-800 text-gray-400 border border-gray-700',
};

export function Badge({ variant = 'default', children, className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
