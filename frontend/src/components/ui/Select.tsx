// frontend/src/components/ui/Select.tsx

'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// Select Variants
// ============================================================
const selectTriggerVariants = cva(
  // Base styles
  'flex w-full items-center justify-between rounded-xl border bg-white dark:bg-brown-dark text-brown dark:text-ivory placeholder:text-brown-light/50 dark:placeholder:text-ivory/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: 'border-gold/20 focus:border-gold focus:ring-gold/20',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
        ghost: 'border-transparent bg-sand/30 dark:bg-brown/30 focus:border-gold',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-base',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-lg',
        default: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  }
);

// ============================================================
// Types
// ============================================================
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, 'value' | 'onValueChange'>,
    VariantProps<typeof selectTriggerVariants> {
  /** Additional className applied to the trigger element */
  className?: string;
  /** Label for the select */
  label?: string;
  /** Label className */
  labelClassName?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Help text */
  helpText?: string;
  /** Whether the select is required */
  required?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Options array */
  options?: SelectOption[];
  /** Value of the select (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Container className */
  containerClassName?: string;
  /** Trigger className */
  triggerClassName?: string;
  /** Content className */
  contentClassName?: string;
  /** Loading state */
  loading?: boolean;
}

// ============================================================
// Select Components
// ============================================================
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      triggerClassName,
      contentClassName,
      label,
      labelClassName,
      error,
      success,
      helpText,
      required = false,
      placeholder = 'Select an option',
      options = [],
      variant,
      size,
      rounded,
      leftIcon,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine variant based on error/success
    let triggerVariant = variant;
    if (error) {
      triggerVariant = 'error';
    } else if (success) {
      triggerVariant = 'success';
    }

    // Generate unique ID
    const id = React.useId();

    // If children are provided, use them; otherwise render from options
    const triggerContent = children ? (
      children
    ) : (
      <SelectPrimitive.Value placeholder={placeholder} />
    );

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium text-brown dark:text-ivory',
              labelClassName,
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {label}
          </label>
        )}

        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled || loading}
          {...props}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            className={cn(
              selectTriggerVariants({ variant: triggerVariant, size, rounded }),
              leftIcon && 'pl-10',
              loading && 'pr-12',
              triggerClassName,
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${id}-error` : helpText ? `${id}-help` : undefined
            }
          >
            {leftIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brown-light/50 dark:text-ivory/30">
                {leftIcon}
              </span>
            )}
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-gold/10 bg-white dark:bg-brown-dark shadow-lg shadow-black/5 animate-in fade-in-80',
                contentClassName
              )}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center text-brown-light">
                <ChevronUp className="h-4 w-4" />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1">
                {options.length > 0 ? (
                  options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 text-center text-sm text-brown-light/50">
                    No options available
                  </div>
                )}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center text-brown-light">
                <ChevronDown className="h-4 w-4" />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {/* Error message */}
        {error && (
          <p
            id={`${id}-error`}
            className="text-xs text-red-500 flex items-center gap-1 mt-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && !error && (
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
            {success}
          </p>
        )}

        {/* Help text */}
        {helpText && !error && !success && (
          <p id={`${id}-help`} className="text-xs text-brown-light/60 dark:text-ivory/40 mt-1">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================
// SelectItem Component
// ============================================================
export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /** Additional className */
  className?: string;
  /** Children */
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        ref={ref}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-3 text-sm text-brown dark:text-ivory outline-none transition-colors focus:bg-gold/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4 text-gold-dark dark:text-gold" />
          </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }
);
SelectItem.displayName = 'SelectItem';

// ============================================================
// SelectGroup Component
// ============================================================
const SelectGroup = SelectPrimitive.Group;
const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-brown-light/70 dark:text-ivory/50', className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gold/10 dark:bg-gold/5', className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

// ============================================================
// Exports
// ============================================================
export {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  selectTriggerVariants,
};

export default Select;