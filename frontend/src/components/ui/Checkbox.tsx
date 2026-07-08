// frontend/src/components/ui/Checkbox.tsx

'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// Checkbox Variants
// ============================================================
const checkboxVariants = cva(
  // Base styles
  'peer shrink-0 rounded-md border border-gold/30 bg-white dark:bg-brown-dark text-brown dark:text-ivory transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white dark:data-[state=checked]:border-gold dark:data-[state=checked]:bg-gold',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 [&>svg]:h-3 [&>svg]:w-3',
        default: 'h-5 w-5 [&>svg]:h-4 [&>svg]:w-4',
        lg: 'h-6 w-6 [&>svg]:h-5 [&>svg]:w-5',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
      variant: {
        default: '',
        error: 'border-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500',
        success: 'border-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500',
      },
    },
    defaultVariants: {
      size: 'default',
      rounded: 'default',
      variant: 'default',
    },
  }
);

// ============================================================
// Types
// ============================================================
export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild'>,
    VariantProps<typeof checkboxVariants> {
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Help text */
  helpText?: string;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Label className */
  labelClassName?: string;
}

// ============================================================
// Checkbox Component
// ============================================================
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      label,
      labelPosition = 'right',
      error,
      success,
      helpText,
      required = false,
      disabled = false,
      size,
      rounded,
      variant,
      checked,
      defaultChecked,
      onCheckedChange,
      id,
      ...props
    },
    ref
  ) => {
    // Determine variant based on error/success
    let checkboxVariant = variant;
    if (error) {
      checkboxVariant = 'error';
    } else if (success) {
      checkboxVariant = 'success';
    }

    // Generate unique ID
    const generatedCheckboxId = React.useId();
    const checkboxId = id || `checkbox-${generatedCheckboxId}`;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        <div className="flex items-start gap-2">
          {label && labelPosition === 'left' && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium text-brown dark:text-ivory pt-0.5 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                required && 'after:content-["*"] after:ml-1 after:text-red-500',
                labelClassName
              )}
            >
              {label}
            </label>
          )}

          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            className={cn(
              checkboxVariants({ size, rounded, variant: checkboxVariant }),
              className
            )}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined
            }
            {...props}
          >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
              <Check className="h-full w-full" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          {label && labelPosition === 'right' && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium text-brown dark:text-ivory pt-0.5 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                required && 'after:content-["*"] after:ml-1 after:text-red-500',
                labelClassName
              )}
            >
              {label}
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && !error && (
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
            {success}
          </p>
        )}

        {/* Help text */}
        {helpText && !error && !success && (
          <p id={`${checkboxId}-help`} className="text-xs text-brown-light/60 dark:text-ivory/40">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================
// CheckboxGroup Component
// ============================================================
export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Label for the group */
  label?: string;
  /** Options array */
  options: CheckboxGroupOption[];
  /** Selected values (controlled) */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Callback when selection changes */
  onValueChange?: (values: string[]) => void;
  /** Error message */
  error?: string;
  /** Help text */
  helpText?: string;
  /** Required flag */
  required?: boolean;
  /** Disabled flag */
  disabled?: boolean;
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Gap between items */
  gap?: string;
  /** Container className */
  className?: string;
  /** Label className */
  labelClassName?: string;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
      options,
      value,
      defaultValue = [],
      onValueChange,
      error,
      helpText,
      required = false,
      disabled = false,
      orientation = 'vertical',
      gap = 'gap-2',
      className,
      labelClassName,
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      defaultValue || value || []
    );

    // Sync with controlled value
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
      }
    }, [value]);

    const handleCheckboxChange = (checkboxValue: string, checked: boolean) => {
      const newValues = checked
        ? [...selectedValues, checkboxValue]
        : selectedValues.filter((v) => v !== checkboxValue);
      
      setSelectedValues(newValues);
      if (onValueChange) {
        onValueChange(newValues);
      }
    };

    const orientationClasses = {
      horizontal: 'flex flex-row flex-wrap',
      vertical: 'flex flex-col',
    };

    return (
      <div className={cn('w-full space-y-1.5', className)} ref={ref}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-brown dark:text-ivory',
              required && 'after:content-["*"] after:ml-1 after:text-red-500',
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <div className={cn(orientationClasses[orientation], gap)}>
          {options.map((option) => (
            <Checkbox
              key={option.value}
              id={`${label}-${option.value}`}
              label={option.label}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option.value, checked === true)
              }
              disabled={disabled || option.disabled}
              error={error}
              size="default"
            />
          ))}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {helpText && !error && <p className="text-xs text-brown-light/60">{helpText}</p>}
      </div>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

// ============================================================
// Exports
// ============================================================
export { Checkbox, CheckboxGroup, checkboxVariants };

export default Checkbox;