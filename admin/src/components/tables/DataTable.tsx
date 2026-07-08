// admin/src/components/tables/DataTable.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export type DataTableColumn<T> = ColumnDef<T> & {
  id?: string;
  accessorKey?: keyof T | string;
  header?: string | ((props: any) => React.ReactNode);
  cell?: (props: any) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
};

export interface DataTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Total number of items (for pagination) */
  totalItems?: number;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Callback when search changes */
  onSearch?: (query: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Selected row IDs */
  selectedRowIds?: string[];
  /** Callback when selection changes */
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
  /** Row ID accessor (for selection) */
  getRowId?: (row: T) => string;
  /** Bulk actions */
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'danger' | 'success';
  }[];
  /** Additional className */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: React.ReactNode;
  /** Loading skeleton row count */
  skeletonRows?: number;
}

// ============================================================
// Sorting Header Component
// ============================================================
function SortableHeader<T>({
  column,
  label,
}: {
  column: any;
  label: string | React.ReactNode;
}) {
  const isSorted = column.getIsSorted();

  return (
    <button
      className="flex items-center gap-1 hover:text-gold-dark dark:hover:text-gold transition-colors group"
      onClick={column.getToggleSortingHandler()}
    >
      <span>{label}</span>
      {column.getCanSort() && (
        <span className="text-brown-light/50 group-hover:text-gold-dark dark:text-ivory/40 dark:group-hover:text-gold">
          {isSorted === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : isSorted === 'desc' ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronsUpDown className="w-4 h-4" />
          )}
        </span>
      )}
    </button>
  );
}

// ============================================================
// DataTable Component
// ============================================================
export function DataTable<T>({
  data = [],
  columns,
  isLoading = false,
  error = null,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchPlaceholder = 'Search...',
  enableRowSelection = false,
  selectedRowIds = [],
  onRowSelectionChange,
  getRowId = (row: any) => row.id || row._id || '',
  bulkActions = [],
  className,
  emptyMessage = 'No data found',
  emptyIcon,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => {
      const selection: Record<string, boolean> = {};
      selectedRowIds.forEach((id) => {
        selection[id] = true;
      });
      return selection;
    }
  );

  // Table instance
  const table = useReactTable({
    data,
    columns: columns as ColumnDef<any>[],
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    getRowId: (row: any) => getRowId(row),
    enableSortingRemoval: true,
  });

  // Sync row selection with parent
  const handleRowSelectionChange = useCallback(() => {
    if (onRowSelectionChange) {
      const selectedIds = Object.keys(rowSelection).filter(
        (id) => rowSelection[id]
      );
      onRowSelectionChange(selectedIds);
    }
  }, [rowSelection, onRowSelectionChange]);

  // Effect to sync external selection changes
  useMemo(() => {
    if (selectedRowIds.length > 0) {
      const newSelection: Record<string, boolean> = {};
      selectedRowIds.forEach((id) => {
        newSelection[id] = true;
      });
      setRowSelection(newSelection);
    } else {
      setRowSelection({});
    }
  }, [selectedRowIds]);

  // Handle search
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  // Handle bulk action click
  const handleBulkAction = (action: (typeof bulkActions)[0]) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    if (selectedRows.length > 0) {
      action.onClick(selectedRows);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Loading state
  if (isLoading) {
    return (
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30">
                {columns.map((col, idx) => {
                  const width = col.size ? `${col.size}px` : 'auto';
                  return (
                    <th
                      key={idx}
                      style={{ width }}
                      className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider"
                    >
                      <div className="h-3 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5 dark:border-gold/5">
                  {columns.map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className="h-4 w-full bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassCard className="p-8 text-center border-red-200 dark:border-red-800">
        <p className="text-red-500 dark:text-red-400">Failed to load data</p>
        <p className="text-sm text-brown-light dark:text-ivory/50 mt-1">
          {error.message}
        </p>
      </GlassCard>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        {emptyIcon ? (
          <div className="text-4xl opacity-20 mb-3">{emptyIcon}</div>
        ) : (
          <div className="w-16 h-16 mx-auto bg-sand/30 dark:bg-brown/30 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl opacity-20">📊</span>
          </div>
        )}
        <p className="text-brown-light dark:text-ivory/50">{emptyMessage}</p>
      </GlassCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        {(onSearch || true) && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
            <Input
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-brown-dark border-gold/10 rounded-full text-sm"
            />
            {globalFilter && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light/50 hover:text-brown dark:hover:text-ivory transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {bulkActions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-brown-light dark:text-ivory/50">
              {Object.keys(rowSelection).filter((id) => rowSelection[id]).length} selected
            </span>
            {bulkActions.map((action, idx) => {
              const variantClasses = {
                default: 'border border-gold/20 text-brown-light hover:bg-gold/10',
                danger: 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20',
                success: 'border border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20',
              };
              return (
                <button
                  key={idx}
                  onClick={() => handleBulkAction(action)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    variantClasses[action.variant || 'default']
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30"
                >
                  {headerGroup.headers.map((header) => {
                    const width = header.column.getSize
                      ? `${header.column.getSize()}px`
                      : 'auto';
                    return (
                      <th
                        key={header.id}
                        style={{ width }}
                        className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <SortableHeader
                            column={header.column}
                            label={flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors',
                      isSelected && 'bg-gold/5 dark:bg-gold/10'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-3 px-4 text-brown-light dark:text-ivory/70"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 border-t border-gold/10 dark:border-gold/5">
            {/* Item count */}
            <p className="text-xs text-brown-light dark:text-ivory/50">
              Showing {startIndex} to {endIndex} of {totalItems} items
            </p>

            <div className="flex items-center gap-3">
              {/* Page size selector */}
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brown-light dark:text-ivory/50">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="text-xs bg-white dark:bg-brown-dark border border-gold/10 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-brown-light dark:text-ivory/50"
                >
                  <ChevronsUpDown className="w-4 h-4 rotate-90" />
                </button>
                <span className="text-xs text-brown-light dark:text-ivory/50 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-brown-light dark:text-ivory/50"
                >
                  <ChevronsUpDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================
// Column helper for common patterns
// ============================================================
export function createColumnHelper<T>() {
  return {
    accessor: <K extends keyof T,>(key: K, options?: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
      accessorKey: key as string,
      id: key as string,
      header: String(key),
      ...options,
    }),
    display: <K extends keyof T,>(id: string, options?: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
      id,
      header: '',
      ...options,
    }),
  };
}

// ============================================================
// Column builder for common column types
// ============================================================
export const columnHelpers = {
  /**
   * Create a text column
   */
  text: <T,>(key: keyof T, label: string, options?: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
    accessorKey: key as string,
    id: key as string,
    header: label,
    enableSorting: true,
    ...options,
  }),

  /**
   * Create a number column (right-aligned)
   */
  number: <T,>(key: keyof T, label: string, options?: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
    accessorKey: key as string,
    id: key as string,
    header: label,
    enableSorting: true,
    cell: ({ getValue }: any) => {
      const value = getValue();
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return value;
    },
    ...options,
  }),

  /**
   * Create a date column
   */
  date: <T,>(key: keyof T, label: string, options?: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
    accessorKey: key as string,
    id: key as string,
    header: label,
    enableSorting: true,
    cell: ({ getValue }: any) => {
      const value = getValue();
      if (value) {
        return new Date(value).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return '-';
    },
    ...options,
  }),

  /**
   * Create a currency column (right-aligned)
   */
  currency: <T,>(
    key: keyof T,
    label: string,
    currency: string = '₹',
    options?: Partial<DataTableColumn<T>>
  ): DataTableColumn<T> => ({
    accessorKey: key as string,
    id: key as string,
    header: label,
    enableSorting: true,
    cell: ({ getValue }: any) => {
      const value = getValue();
      if (typeof value === 'number') {
        return `${currency}${value.toLocaleString('en-IN')}`;
      }
      return value;
    },
    ...options,
  }),

  /**
   * Create a badge column (for statuses)
   */
  badge: <T,>(
    key: keyof T,
    label: string,
    colorMap?: Record<string, { bg: string; text: string; label: string }>,
    options?: Partial<DataTableColumn<T>>
  ): DataTableColumn<T> => ({
    accessorKey: key as string,
    id: key as string,
    header: label,
    enableSorting: true,
    cell: ({ getValue }: any) => {
      const value = getValue();
      const colors: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
        processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Processing' },
        shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Shipped' },
        delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Delivered' },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
        active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Active' },
        inactive: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Inactive' },
      };
      const style = (colorMap && colorMap[value]) || colors[value] || {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-400',
        label: String(value || 'Unknown'),
      };
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      );
    },
    ...options,
  }),
};

// ============================================================
// Default export
// ============================================================
export default DataTable;