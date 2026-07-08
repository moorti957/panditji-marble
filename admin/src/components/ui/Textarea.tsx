"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export function Textarea({ label, className, ...props }: TextareaProps) {
	return (
		<textarea
			className={cn(
				'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-admin-hover disabled:text-admin-description',
				className
			)}
			{...props}
		/>
	);
}

export default Textarea;
