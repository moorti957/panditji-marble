"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'gold' | 'dark' | 'maroon' | 'ivory';
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  radius?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  hover?: boolean;
  interactive?: boolean;
  bordered?: boolean;
  shadow?: boolean;
  glow?: boolean;
  loading?: boolean;
  loadingHeight?: number;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  padding = 'default',
  radius = 'default',
  hover = true,
  interactive = false,
  bordered = true,
  shadow = true,
  glow = false,
  loading = false,
  loadingHeight = 200,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-admin-border bg-admin-card text-admin-text shadow-sm',
        padding !== 'none' && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface GlassCardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCardHeader({ children, className, ...props }: GlassCardSectionProps) {
  return <div className={className} {...props}>{children}</div>;
}

export function GlassCardBody({ children, className, ...props }: GlassCardSectionProps) {
  return <div className={className} {...props}>{children}</div>;
}

export function GlassCardFooter({ children, className, ...props }: GlassCardSectionProps) {
  return <div className={className} {...props}>{children}</div>;
}

export default GlassCard;
