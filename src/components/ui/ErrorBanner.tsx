import { AlertCircle, X } from "lucide-react";

type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">操作失败</p>
        <p className="mt-1 break-words leading-6">{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label="关闭错误提示"
          onClick={onDismiss}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
