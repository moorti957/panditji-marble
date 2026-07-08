// admin/src/components/dashboard/StatsCards.tsx

'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export interface StatCardData {
  /** Label for the stat card */
  label: string;
  /** Main value (number or string) */
  value: number | string;
  /** Formatted value (optional) */
  formatted?: string;
  /** Percentage change (positive or negative) */
  change?: number;
  /** Icon component */
  icon?: React.ReactNode;
  /** Background color class for the icon container */
  iconBgColor?: string;
  /** Icon color class */
  iconColor?: string;
  /** Additional info or subtitle */
  subtitle?: string;
  /** Loading state for individual card */
  loading?: boolean;
}

export interface StatsCardsProps {
  /** Array of stat card data */
  stats: StatCardData[];
  /** Whether all cards are loading */
  isLoading?: boolean;
  /** Whether there was an error */
  error?: Error | null;
  /** Additional className for the grid container */
  className?: string;
  /** Number of columns (default: 4) */
  columns?: 2 | 3 | 4 | 5;
}

// ============================================================
// Individual Stat Card
// ============================================================
function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  const { label, value, formatted, change, icon, iconBgColor, iconColor, subtitle, loading } = stat;

  // Determine if change is positive, negative, or neutral
  const changeType = change !== undefined ? (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral') : 'neutral';
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  // Default colors
  const defaultIconBg = iconBgColor || 'bg-gold/10';
  const defaultIconColor = iconColor || 'text-gold-dark dark:text-gold';

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-sand/50 dark:bg-brown/50 rounded" />
            <div className="h-8 w-24 bg-sand/50 dark:bg-brown/50 rounded" />
          </div>
          <div className="w-10 h-10 bg-sand/50 dark:bg-brown/50 rounded-xl" />
        </div>
        <div className="mt-3 h-4 w-16 bg-sand/30 dark:bg-brown/30 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brown-light dark:text-ivory/50 uppercase tracking-wider">
            {label}
          </p>
          <p className="font-cinzel text-2xl font-bold text-brown dark:text-ivory mt-1 truncate">
            {formatted || (typeof value === 'number' ? value.toLocaleString() : value)}
          </p>
          {subtitle && (
            <p className="text-xs text-brown-light dark:text-ivory/40 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-xl shrink-0', defaultIconBg)}>
            <div className={cn('w-5 h-5', defaultIconColor)}>{icon}</div>
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {changeType !== 'neutral' && (
            <ChangeIcon className={cn('w-3.5 h-3.5', isPositive ? 'text-green-500' : 'text-red-500')} />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-green-500' : changeType === 'negative' ? 'text-red-500' : 'text-brown-light dark:text-ivory/50'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-brown-light dark:text-ivory/40">
            from last period
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// StatsCards Component
// ============================================================
export function StatsCards({
  stats,
  isLoading = false,
  error = null,
  className,
  columns = 4,
}: StatsCardsProps) {
  // Column classes
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  };

  // If error, show error state
  if (error) {
    return (
      <div className="bg-white dark:bg-brown-dark rounded-2xl p-6 border border-red-200 dark:border-red-800 text-center">
        <p className="text-red-500 dark:text-red-400">Failed to load statistics</p>
        <p className="text-sm text-brown-light dark:text-ivory/50 mt-1">{error.message}</p>
      </div>
    );
  }

  // If loading and no stats, show skeletons
  if (isLoading && (!stats || stats.length === 0)) {
    const skeletonStats = Array.from({ length: 4 }, (_, i) => ({
      label: 'Loading...',
      value: '---',
      loading: true,
    }));
    return (
      <div className={cn('grid gap-4', columnClasses[columns], className)}>
        {skeletonStats.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </div>
    );
  }

  // Ensure stats is an array
  if (!stats || stats.length === 0) {
    return (
      <div className="bg-white dark:bg-brown-dark rounded-2xl p-6 border border-gold/5 text-center">
        <p className="text-brown-light dark:text-ivory/50">No statistics available</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default StatsCards;