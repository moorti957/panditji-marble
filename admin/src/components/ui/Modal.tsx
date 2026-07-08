"use client";

import * as React from 'react';

export interface ModalProps {
	open?: boolean;
	isOpen?: boolean;
	title?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	onClose?: () => void;
	children?: React.ReactNode;
}

export function Modal({ open = false, isOpen, onClose, children }: ModalProps) {
	const shouldOpen = isOpen ?? open;
	if (!shouldOpen) return null;
	return (
		<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-admin-border bg-white p-6 text-admin-text shadow-xl">
				{children}
				{onClose && (
					<button
						type="button"
						className="mt-4 rounded-lg border border-admin-border px-4 py-2 text-sm text-admin-secondary-text hover:bg-admin-hover"
						onClick={onClose}
					>
						Close
					</button>
				)}
			</div>
		</div>
	);
}

export default Modal;
