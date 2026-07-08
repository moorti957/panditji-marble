// frontend/src/components/ui/Slider.tsx

'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// Slider Variants
// ============================================================
const sliderTrackVariants = cva(
  'relative h-1.5 w-full grow overflow-hidden rounded-full bg-sand/60 dark:bg-brown/50',
  {
    variants: {
      variant: {
        default: '',
        error: 'bg-red-200 dark:bg-red-900/30',
        success: 'bg-green-200 dark:bg-green-900/30',
      },
      size: {
        sm: 'h-1',
        default: 'h-1.5',
        lg: 'h-2',
        xl: 'h-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const sliderThumbVariants = cva(
  'block h-4 w-4 rounded-full border-2 border-gold bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
        xl: 'h-6 w-6',
      },
      variant: {
        default: '',
        error: 'border-red-500',
        success: 'border-green-500',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

// ============================================================
// Types
// ============================================================
export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange'>,
    VariantProps<typeof sliderTrackVariants> {
  /** Label for the slider */
  label?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Help text */
  helpText?: string;
  /** Whether the slider is required */
  required?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Label className */
  labelClassName?: string;
  /** Track className */
  trackClassName?: string;
  /** Thumb className */
  thumbClassName?: string;
  /** Value (controlled) */
  value?: number[];
  /** Default value (uncontrolled) */
  defaultValue?: number[];
  /** Callback when value changes */
  onValueChange?: (value: number[]) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Number of thumbs (1 for single, 2 for range) */
  thumbCount?: 1 | 2;
  /** Format the displayed value */
  formatValue?: (value: number) => string;
  /** Whether to show the value label */
  showValue?: boolean;
  /** Value label position */
  valuePosition?: 'top' | 'bottom' | 'left' | 'right';
}

// ============================================================
// Slider Component
// ============================================================
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      trackClassName,
      thumbClassName,
      label,
      error,
      success,
      helpText,
      required = false,
      variant,
      size,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      thumbCount = 1,
      formatValue = (v) => `${v}`,
      showValue = false,
      valuePosition = 'top',
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Determine variant based on error/success
    let sliderVariant = variant;
    if (error) {
      sliderVariant = 'error';
    } else if (success) {
      sliderVariant = 'success';
    }

    // Generate unique ID
    const sliderId = React.useId();

    // Ensure value is an array
    const currentValue = value || defaultValue || [0];
    const displayValue = currentValue.length > 0 ? currentValue : [0];

    // Determine value display
    const valueDisplay = displayValue.length === 1
      ? formatValue(displayValue[0])
      : `${formatValue(displayValue[0])} - ${formatValue(displayValue[1])}`;

    const valuePositionClasses = {
      top: 'mb-1.5',
      bottom: 'mt-1.5',
      left: 'mr-3',
      right: 'ml-3',
    };

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {/* Label */}
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={sliderId}
                className={cn(
                  'block text-sm font-medium text-brown dark:text-ivory',
                  required && 'after:content-["*"] after:ml-1 after:text-red-500',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                className={cn(
                  'text-sm font-medium text-brown dark:text-ivory',
                  valuePositionClasses[valuePosition]
                )}
              >
                {valueDisplay}
              </span>
            )}
          </div>
        )}

        <SliderPrimitive.Root
          ref={ref}
          id={sliderId}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            className
          )}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(
              sliderTrackVariants({ variant: sliderVariant, size }),
              trackClassName
            )}
          >
            <SliderPrimitive.Range className="absolute h-full bg-gold dark:bg-gold" />
          </SliderPrimitive.Track>

          {/* Render thumbs based on thumbCount */}
          {Array.from({ length: thumbCount }).map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                sliderThumbVariants({ variant: sliderVariant, size }),
                thumbClassName
              )}
            />
          ))}
        </SliderPrimitive.Root>

        {/* Error message */}
        {error && (
          <p
            id={`${sliderId}-error`}
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
          <p
            id={`${sliderId}-help`}
            className="text-xs text-brown-light/60 dark:text-ivory/40 mt-1"
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// ============================================================
// Exports
// ============================================================
export { Slider, sliderTrackVariants, sliderThumbVariants };

export default Slider;