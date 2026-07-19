import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import baseToast, { type Toast, type Renderable } from 'react-hot-toast';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessageOptions {
  duration?: number;
  icon?: Renderable;
  id?: string;
  [key: string]: unknown;
}

interface ToastCardProps {
  t: Toast;
  variant: ToastVariant;
  title: string;
  description?: string;
  icon?: ReactNode;
}

const variantStyles: Record<ToastVariant, { container: string; icon: string; title: string; description: string }> = {
  success: {
    container: 'border-emerald-200/70 bg-emerald-50/95 text-emerald-900',
    icon: 'bg-emerald-100 text-emerald-700',
    title: 'text-emerald-900',
    description: 'text-emerald-700',
  },
  error: {
    container: 'border-rose-200/70 bg-rose-50/95 text-rose-900',
    icon: 'bg-rose-100 text-rose-700',
    title: 'text-rose-900',
    description: 'text-rose-700',
  },
  info: {
    container: 'border-sky-200/70 bg-sky-50/95 text-sky-900',
    icon: 'bg-sky-100 text-sky-700',
    title: 'text-sky-900',
    description: 'text-sky-700',
  },
  warning: {
    container: 'border-amber-200/70 bg-amber-50/95 text-amber-900',
    icon: 'bg-amber-100 text-amber-700',
    title: 'text-amber-900',
    description: 'text-amber-700',
  },
};

function resolveToastArgs(message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) {
  if (typeof descriptionOrOptions === 'string') {
    return { title: message, description: descriptionOrOptions, options: options ?? {} };
  }

  return {
    title: message,
    description: undefined,
    options: descriptionOrOptions ?? options ?? {},
  };
}

function ToastCard({ t, variant, title, description, icon }: ToastCardProps) {
  const styles = variantStyles[variant];
  const fallbackIcon =
    variant === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
    variant === 'error' ? <AlertCircle className="h-5 w-5" /> :
    variant === 'warning' ? <TriangleAlert className="h-5 w-5" /> :
    <Info className="h-5 w-5" />;

  return (
    <div className={`flex min-w-[280px] max-w-[360px] items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${styles.container}`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
        {icon ?? fallbackIcon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
        {description ? <p className={`mt-1 text-sm ${styles.description}`}>{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => baseToast.dismiss(t.id)}
        className="rounded-full p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function showToast(variant: ToastVariant, message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) {
  const { title, description, options: resolvedOptions } = resolveToastArgs(message, descriptionOrOptions, options);
  const resolvedDuration = resolvedOptions.duration ?? 4500;
  const resolvedIcon = resolvedOptions.icon;

  return baseToast.custom(
    (t) => <ToastCard t={t} variant={variant} title={title} description={description} icon={resolvedIcon} />,
    { id: resolvedOptions.id, duration: resolvedDuration }
  );
}

function toastFn(message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) {
  const { title, description, options: resolvedOptions } = resolveToastArgs(message, descriptionOrOptions, options);
  return showToast('info', title, description, resolvedOptions);
}

const toastApi = Object.assign(toastFn, {
  success: (message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) =>
    showToast('success', message, descriptionOrOptions, options),
  error: (message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) =>
    showToast('error', message, descriptionOrOptions, options),
  info: (message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) =>
    showToast('info', message, descriptionOrOptions, options),
  warning: (message: string, descriptionOrOptions?: string | ToastMessageOptions, options?: ToastMessageOptions) =>
    showToast('warning', message, descriptionOrOptions, options),
  loading: (message: string, options?: ToastMessageOptions) => baseToast.loading(message, { duration: Infinity, ...options } as any),
  dismiss: (id?: string) => baseToast.dismiss(id),
  custom: baseToast.custom,
  promise: baseToast.promise,
});

export const toast = toastApi;
export default toastApi;

export function getUserFriendlyErrorDetails(error: unknown) {
  const normalizedMessage = typeof error === 'string' ? error : error instanceof Error ? error.message : '';
  const nestedMessage = typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message?: unknown }).message ?? '')
    : '';
  const responseStatus = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: unknown }).status)
    : undefined;
  const responseCode = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : undefined;

  const combinedText = `${normalizedMessage} ${nestedMessage} ${responseCode ?? ''}`.toLowerCase();
  const technicalPattern = /(invalid token|unauthorized|token expired|forbidden|validation failed|internal server error|bad request|network error|something went wrong|jwt|axios|mongo|unknown error|request failed|stack trace|validation object|timeout)/i;

  if (responseStatus === 400 || combinedText.includes('bad request') || combinedText.includes('validation')) {
    return {
      title: 'Please check the details and try again.',
      description: 'A few details need a quick review before we can continue.',
    };
  }

  if (responseStatus === 401 || combinedText.includes('invalid token') || combinedText.includes('token expired') || combinedText.includes('unauthorized') || combinedText.includes('authentication')) {
    return {
      title: 'Your session has expired.',
      description: 'Please sign in again to continue.',
    };
  }

  if (responseStatus === 403 || combinedText.includes('forbidden')) {
    return {
      title: 'Access isn’t available right now.',
      description: 'Please sign in with the right account to continue.',
    };
  }

  if (responseStatus === 404) {
    return {
      title: 'We couldn’t find that page.',
      description: 'The item or page you’re looking for may have moved.',
    };
  }

  if (responseStatus === 409) {
    return {
      title: 'This request needs a quick check.',
      description: 'Please review the details and try again in a moment.',
    };
  }

  if (responseStatus === 422) {
    return {
      title: 'Please review the information provided.',
      description: 'A few details need to be corrected before we can continue.',
    };
  }

  if (responseStatus === 429) {
    return {
      title: 'We’re taking a short pause.',
      description: 'Too many attempts were made. Please wait a moment and try again.',
    };
  }

  if (responseStatus === 500 || responseStatus === 502 || responseStatus === 503 || responseStatus === 504 || combinedText.includes('internal server error')) {
    return {
      title: 'Something unexpected happened.',
      description: 'Please try again in a few moments.',
    };
  }

  if (combinedText.includes('network') || responseCode === 'ERR_NETWORK' || responseCode === 'ECONNABORTED') {
    return {
      title: 'Unable to connect right now.',
      description: 'Please check your internet connection and try again.',
    };
  }

  if (technicalPattern.test(combinedText)) {
    return {
      title: 'We couldn’t complete that request.',
      description: 'Please try again in a moment.',
    };
  }

  if (responseStatus && responseStatus >= 400) {
    return {
      title: 'We couldn’t complete that request.',
      description: 'Please try again in a moment.',
    };
  }

  return {
    title: 'We couldn’t complete that request.',
    description: 'Please try again in a moment.',
  };
}

export function getUserFriendlyErrorMessage(error: unknown) {
  return getUserFriendlyErrorDetails(error).title;
}

export function showUserFriendlyError(error: unknown, fallbackTitle?: string) {
  const details = getUserFriendlyErrorDetails(error);
  return toast.error(fallbackTitle ?? details.title, details.description);
}

export function showUserFriendlySuccess(title: string, description?: string) {
  return toast.success(title, description);
}

export function showUserFriendlyInfo(title: string, description?: string) {
  return toast.info(title, description);
}

export function showUserFriendlyWarning(title: string, description?: string) {
  return toast.warning(title, description);
}

export function getUserFriendlyToastContent(error: unknown) {
  return getUserFriendlyErrorDetails(error);
}
