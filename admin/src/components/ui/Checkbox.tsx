"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, ...props }, ref) => {
	return (
		<label className="inline-flex items-center gap-2 text-sm font-medium text-admin-label">
			<input
				type="checkbox"
				ref={ref}
				className={cn('h-4 w-4 rounded border-admin-border text-gold accent-gold', className)}
				{...props}
			/>
			{label}
		</label>
	);
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
