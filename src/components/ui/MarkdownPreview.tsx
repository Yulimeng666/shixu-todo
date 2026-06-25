import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        预览区暂无内容
      </div>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 text-2xl font-semibold text-slate-950">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-5 text-lg font-semibold text-slate-950">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-base font-semibold text-slate-950">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 text-sm leading-6 text-slate-800">{children}</p>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-l-4 border-blue-200 bg-blue-50 px-3 py-2 text-sm leading-6 text-slate-700">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 space-y-1 text-sm leading-6 text-slate-800">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-800">
            {children}
          </ol>
        ),
        li: ({ children, className }) => {
          const isTask = className?.includes("task-list-item");

          return (
            <li
              className={
                isTask
                  ? "flex list-none items-start gap-2 text-sm leading-6"
                  : "ml-5 list-disc text-sm leading-6"
              }
            >
              {children}
            </li>
          );
        },
        input: (props) => (
          <input
            {...props}
            readOnly
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700"
          />
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-950">{children}</strong>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);

          if (isBlock) {
            return (
              <code className="block overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-100">
                {children}
              </code>
            );
          }

          return (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-900">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-4">{children}</pre>,
        a: ({ children, href }) => (
          <a
            className="font-medium text-blue-700 underline-offset-2 hover:underline"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
