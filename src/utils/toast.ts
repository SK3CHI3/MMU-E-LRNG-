import { toast } from "@/components/ui/sonner";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a toast notification
 * @param type The type of toast (success, error, info, warning)
 * @param title The title of the toast
 * @param options Additional options for the toast
 */
export const showToast = (
  type: ToastType,
  title: string,
  options?: ToastOptions
) => {
  const { description, duration = 5000, action } = options || {};

  // Don't pass the icon component directly, use a string identifier instead
  const iconType = type;

  toast[type](title, {
    description,
    duration,
    // Remove the icon property to avoid React errors
    // icon: iconMap[type],
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  });
};

/**
 * Show a success toast notification
 * @param title The title of the toast
 * @param options Additional options for the toast
 */
export const showSuccessToast = (title: string, options?: ToastOptions) => {
  showToast("success", title, options);
};

/**
 * Show an error toast notification
 * @param title The title of the toast
 * @param options Additional options for the toast
 */
export const showErrorToast = (title: string, options?: ToastOptions) => {
  showToast("error", title, options);
};

/**
 * Show an info toast notification
 * @param title The title of the toast
 * @param options Additional options for the toast
 */
export const showInfoToast = (title: string, options?: ToastOptions) => {
  showToast("info", title, options);
};

/**
 * Show a warning toast notification
 * @param title The title of the toast
 * @param options Additional options for the toast
 */
export const showWarningToast = (title: string, options?: ToastOptions) => {
  showToast("warning", title, options);
};
