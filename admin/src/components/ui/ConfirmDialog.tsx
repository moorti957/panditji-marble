"use client";

import * as React from 'react';

export interface ConfirmDialogProps {
	open?: boolean;
	isOpen?: boolean;
	title?: React.ReactNode;
	message?: React.ReactNode;
	onConfirm?: () => void;
	onCancel?: () => void;
	onClose?: () => void;
	confirmLabel?: string;
	variant?: 'default' | 'danger' | 'success' | 'primary';
	isLoading?: boolean;
}

export function ConfirmDialog({
	open = false,
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	onClose,
	confirmLabel = 'Confirm',
	variant = 'primary',
	isLoading = false,
}: ConfirmDialogProps) {
	const shouldOpen = isOpen ?? open;
	if (!shouldOpen) return null;
	return (
		<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-xl border border-admin-border bg-white p-6 text-admin-text shadow-xl">
				<h3 className="text-lg font-semibold text-admin-text">{title}</h3>
				<p className="mt-2 text-sm text-admin-description">{message}</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						className="rounded-lg border border-admin-border px-4 py-2 text-sm text-admin-secondary-text hover:bg-admin-hover"
						onClick={onCancel || onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className={
							variant === 'danger'
								? 'rounded-lg bg-admin-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60'
								: variant === 'success'
									? 'rounded-lg bg-admin-success px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60'
									: 'rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-60'
						}
						disabled={isLoading}
						onClick={onConfirm}
					>
						{isLoading ? 'Please wait...' : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmDialog;
