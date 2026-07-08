"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={cn(
				'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-admin-hover disabled:text-admin-description',
				className
			)}
			{...props}
		/>
	);
});

Input.displayName = 'Input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, ...props }, ref) => {
	return <textarea ref={ref} {...props} />;
});

Textarea.displayName = 'Textarea';

export default Input;
