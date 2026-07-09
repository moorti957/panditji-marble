// admin/src/components/dashboard/RevenueChart.tsx

'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '../../lib/utils';
import { cn } from '../../lib/utils';

// ============================================================
// Types
// ============================================================
export interface RevenueDataPoint {
  /** Label for the data point (e.g., date, month) */
  label: string;
  /** Revenue amount */
  revenue: number;
  /** Number of orders (optional) */
  orders?: number;
}

export interface RevenueChartProps {
  /** Array of data points for the chart */
  data: RevenueDataPoint[];
  /** Total revenue summary (optional) */
  totalRevenue?: number;
  /** Total orders summary (optional) */
  totalOrders?: number;
  /** Current selected period */
  period?: string;
  /** Callback when period changes */
  onPeriodChange?: (period: string) => void;
  /** Whether the chart is loading */
  isLoading?: boolean;
  /** Error object if any */
  error?: Error | null;
  /** Additional className for the container */
  className?: string;
  /** Height of the chart (default: 260) */
  height?: number;
  /** Currency symbol (default: ) */
  currencySymbol?: string;
  /** Whether to show the order count overlay */
  showOrders?: boolean;
}

// ============================================================
// Custom Tooltip
// ============================================================
function CustomTooltip({ active, payload, label, currencySymbol }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const revenue = data.revenue || 0;
  const orders = data.orders || 0;

  return (
    <div className="bg-white dark:bg-brown-dark rounded-xl p-4 shadow-lg border border-gold/10 dark:border-gold/5">
      <p className="text-xs text-brown-light dark:text-ivory/50 font-medium mb-1">
        {label}
      </p>
      <p className="font-cinzel text-lg font-bold text-gold-dark dark:text-gold">
        {currencySymbol}{formatPrice(revenue)}
      </p>
      {orders > 0 && (
        <p className="text-xs text-brown-light dark:text-ivory/50 mt-0.5">
          {orders} order{orders !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Chart Skeleton
// ============================================================
function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-32 bg-sand/50 dark:bg-brown/50 rounded" />
        <div className="h-4 w-20 bg-sand/30 dark:bg-brown/30 rounded" />
      </div>
      <div
        className="w-full bg-sand/30 dark:bg-brown/30 rounded-xl"
        style={{ height }}
      />
    </div>
  );
}

// ============================================================
// RevenueChart Component
// ============================================================
export function RevenueChart({
  data,
  totalRevenue,
  totalOrders,
  period,
  onPeriodChange,
  isLoading = false,
  error = null,
  className,
  height = 260,
  currencySymbol = '',
  showOrders = true,
}: RevenueChartProps) {
  // Period options
  const periods = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

  // Chart colors
  const gradientColor = '#D4AF37'; // gold
  const gradientColorDark = '#B8962E';

  // If error
  if (error) {
    return (
      <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-5 border border-red-200 dark:border-red-800', className)}>
        <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400">
          <p>Failed to load revenue data</p>
        </div>
      </div>
    );
  }

  // If loading
  if (isLoading || !data) {
    return (
      <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm', className)}>
        <ChartSkeleton height={height} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm', className)}>
        <div className="flex items-center justify-center h-32 text-brown-light dark:text-ivory/40">
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  // Calculate max value for domain
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const yAxisDomain = [0, Math.ceil(maxRevenue / 1000) * 1000 + 1000];

  // Format Y axis ticks
  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `${currencySymbol}${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${currencySymbol}${value}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-white dark:bg-brown-dark rounded-2xl p-5 border border-gold/5 shadow-sm', className)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-cinzel text-lg font-semibold text-brown dark:text-ivory">
            Revenue Overview
          </h3>
          {totalRevenue !== undefined && (
            <p className="text-2xl font-bold text-gold-dark dark:text-gold">
              {currencySymbol}{formatPrice(totalRevenue)}
            </p>
          )}
          {totalOrders !== undefined && showOrders && (
            <p className="text-sm text-brown-light dark:text-ivory/50">
              {totalOrders} total orders
            </p>
          )}
        </div>

        {/* Period selector */}
        {period && onPeriodChange && (
          <div className="flex items-center gap-1 bg-sand/30 dark:bg-brown/30 rounded-lg p-1">
            {periods.map((p) => {
              const isActive = p.toLowerCase() === period.toLowerCase();
              return (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p.toLowerCase())}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gold text-white shadow-sm'
                      : 'text-brown-light dark:text-ivory/60 hover:bg-gold/10 dark:hover:bg-gold/10'
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Revenue summary list */}
      <div className="grid gap-3" style={{ minHeight: height }}>
        {data.map((point) => (
          <div key={point.label} className="rounded-2xl border border-gold/10 bg-sand/30 dark:bg-brown/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-brown-light dark:text-ivory/70">{point.label}</span>
              <span className="text-base font-semibold text-brown dark:text-ivory">
                {currencySymbol}{formatPrice(point.revenue)}
              </span>
            </div>
            {point.orders !== undefined && (
              <p className="text-xs text-brown-light dark:text-ivory/60 mt-2">
                {point.orders} order{point.orders !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// Default export
// ============================================================
export default RevenueChart;