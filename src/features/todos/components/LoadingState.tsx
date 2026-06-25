export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-96 items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-md bg-slate-200" />
        <div>
          <p className="text-sm font-medium text-slate-800">正在加载任务</p>
          <p className="mt-1 text-sm text-slate-500">正在读取本地待办数据</p>
        </div>
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3 rounded bg-slate-100" />
          <div className="mx-auto h-3 w-4/5 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
