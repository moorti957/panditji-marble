"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption { value: string; label: string }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	options?: SelectOption[];
	placeholder?: string;
	error?: string;
	success?: string;
	label?: string;
	labelClassName?: string;
	helpText?: string;
	required?: boolean;
	loading?: boolean;
	triggerClassName?: string;
	contentClassName?: string;
	onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ options = [], children, placeholder, onValueChange, onChange, className, ...props }, ref) => {
		const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
			onChange?.(event);
			onValueChange?.(event.target.value);
		};

		return (
			<select
				ref={ref}
				onChange={handleChange}
				className={cn(
					'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-admin-hover disabled:text-admin-description',
					className
				)}
				{...props}
			>
				{placeholder ? (
					<option value="" disabled hidden>
						{placeholder}
					</option>
				) : null}
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
				{children}
			</select>
		);
	}
);

Select.displayName = 'Select';

export default Select;
