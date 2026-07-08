// frontend/src/components/ui/Input.tsx

import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// ============================================================
// Input Variants
// ============================================================
const inputVariants = cva(
  // Base styles
  'flex w-full rounded-xl border bg-white dark:bg-brown-dark text-brown dark:text-ivory placeholder:text-brown-light/50 dark:placeholder:text-ivory/30 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
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
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Left icon to display inside the input */
  leftIcon?: React.ReactNode;
  /** Right icon to display inside the input */
  rightIcon?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Whether the input is in a loading state */
  loading?: boolean;
  /** Custom class name for the container */
  containerClassName?: string;
  /** Custom class name for the icon wrapper */
  iconClassName?: string;
  /** Label text */
  label?: string;
  /** Label className */
  labelClassName?: string;
  /** Help text */
  helpText?: string;
  /** Whether the input is required */
  required?: boolean;
}

// ============================================================
// Input Component
// ============================================================
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      iconClassName,
      variant,
      size,
      rounded,
      leftIcon,
      rightIcon,
      error,
      success,
      loading = false,
      label,
      labelClassName,
      helpText,
      required = false,
      disabled = false,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    // Determine the input variant based on error/success state
    let inputVariant = variant;
    if (error) {
      inputVariant = 'error';
    } else if (success) {
      inputVariant = 'success';
    }

    // Generate a unique ID if not provided
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;

    // Determine if we need padding for icons
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon || loading;

    // Calculate padding based on icons
    const paddingLeft = hasLeftIcon ? 'pl-10' : 'pl-4';
    const paddingRight = hasRightIcon ? 'pr-10' : 'pr-4';

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-brown dark:text-ivory',
              labelClassName,
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brown-light/50 dark:text-ivory/30 transition-colors',
                error && 'text-red-500',
                success && 'text-green-500',
                iconClassName
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: inputVariant, size, rounded }),
              paddingLeft,
              paddingRight,
              loading && 'pr-12',
              className
            )}
            disabled={disabled || loading}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />

          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Right Icon */}
          {hasRightIcon && !loading && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brown-light/50 dark:text-ivory/30 transition-colors',
                error && 'text-red-500',
                success && 'text-green-500',
                iconClassName
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
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
            id={`${inputId}-help`}
            className="text-xs text-brown-light/60 dark:text-ivory/40 mt-1"
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================
// Textarea Component (extended from Input)
// ============================================================
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Label text */
  label?: string;
  /** Label className */
  labelClassName?: string;
  /** Help text */
  helpText?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Rows */
  rows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size = 'md',
      rounded = 'default',
      error,
      success,
      label,
      labelClassName,
      helpText,
      required = false,
      disabled = false,
      rows = 4,
      id,
      ...props
    },
    ref
  ) => {
    // Determine variant based on error/success
    let inputVariant = variant;
    if (error) {
      inputVariant = 'error';
    } else if (success) {
      inputVariant = 'success';
    }

    const generatedTextareaId = React.useId();
    const textareaId = id || `textarea-${generatedTextareaId}`;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-brown dark:text-ivory',
              labelClassName,
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            inputVariants({ variant: inputVariant, size, rounded }),
            'resize-y min-h-[80px]',
            className
          )}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-red-500 flex items-center gap-1 mt-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {success && !error && (
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
            {success}
          </p>
        )}

        {helpText && !error && !success && (
          <p id={`${textareaId}-help`} className="text-xs text-brown-light/60 dark:text-ivory/40 mt-1">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================
// InputGroup Component
// ============================================================
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Gap between elements */
  gap?: string;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, orientation = 'horizontal', gap = 'gap-2', children, ...props }, ref) => {
    const orientationClasses = {
      horizontal: 'flex flex-row items-center',
      vertical: 'flex flex-col',
    };

    return (
      <div
        ref={ref}
        className={cn(orientationClasses[orientation], gap, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputGroup.displayName = 'InputGroup';

// ============================================================
// PasswordInput Component (with toggle visibility)
// ============================================================
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Whether to show the visibility toggle */
  showToggle?: boolean;
  /** Custom label for show/hide */
  showLabel?: string;
  hideLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      showToggle = true,
      showLabel = 'Show',
      hideLabel = 'Hide',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-brown-light/70 dark:text-ivory/50 hover:text-brown dark:hover:text-ivory transition-colors focus:outline-none"
              aria-label={showPassword ? hideLabel : showLabel}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ============================================================
// SearchInput Component
// ============================================================
export interface SearchInputProps extends InputProps {
  /** Whether to show the search icon */
  showSearchIcon?: boolean;
  /** Custom placeholder */
  placeholder?: string;
  /** On search callback */
  onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      showSearchIcon = true,
      placeholder = 'Search...',
      onSearch,
      className,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
    };

    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        leftIcon={
          showSearchIcon ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          ) : undefined
        }
        className={className}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ============================================================
// Exports
// ============================================================
export {
  Input,
  Textarea,
  InputGroup,
  PasswordInput,
  SearchInput,
  inputVariants,
};

export default Input;