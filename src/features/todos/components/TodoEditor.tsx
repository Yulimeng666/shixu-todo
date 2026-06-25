import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { DEFAULT_CATEGORY_NAME, type CreateTodoInput, type Todo, type TodoPriority } from "../types";

type TodoEditorProps = {
  mode: "create" | "edit";
  todo?: Todo;
  categories?: string[];
  isSaving?: boolean;
  error?: string | null;
  onSubmit: (input: CreateTodoInput) => Promise<void> | void;
  onCancel: () => void;
};

const priorityOptions: Array<{ value: TodoPriority; label: string }> = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

export function TodoEditor({
  mode,
  todo,
  categories = [],
  isSaving = false,
  error,
  onSubmit,
  onCancel,
}: TodoEditorProps) {
  const [title, setTitle] = useState(todo?.title ?? "");
  const [note, setNote] = useState(todo?.note ?? "");
  const [startDate, setStartDate] = useState(todo?.startDate ?? "");
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? "");
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? "medium");
  const [selectedCategory, setSelectedCategory] = useState(todo?.category ?? DEFAULT_CATEGORY_NAME);
  const [validationError, setValidationError] = useState<string | null>(null);

  const normalizedCategories = useMemo(() => {
    const nextCategories = Array.from(new Set(categories.filter(Boolean)));
    return nextCategories.includes(DEFAULT_CATEGORY_NAME)
      ? nextCategories
      : [DEFAULT_CATEGORY_NAME, ...nextCategories];
  }, [categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setValidationError("任务标题不能为空");
      return;
    }

    setValidationError(null);

    await onSubmit({
      title: normalizedTitle,
      note: normalizeOptionalText(note),
      startDate: normalizeOptionalText(startDate),
      dueDate: normalizeOptionalText(dueDate),
      priority,
      category: selectedCategory || DEFAULT_CATEGORY_NAME,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="todo-editor-title"
      className="fixed inset-0 z-50 flex items-end bg-slate-950/30 p-0 sm:items-center sm:justify-center sm:p-4"
    >
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-md border border-slate-200 bg-white shadow-lg sm:max-w-lg sm:rounded-md">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 id="todo-editor-title" className="text-base font-semibold text-slate-950">
            {mode === "create" ? "新增任务" : "编辑任务"}
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <Field label="标题" htmlFor="todo-title" required>
            <input
              id="todo-title"
              aria-label="标题"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="输入任务标题"
              autoFocus
            />
          </Field>

          <Field label="备注" htmlFor="todo-note">
            <textarea
              id="todo-note"
              aria-label="备注"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="补充任务说明"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="开始日期" htmlFor="todo-start-date">
              <input
                id="todo-start-date"
                aria-label="开始日期"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="截止日期" htmlFor="todo-due-date">
              <input
                id="todo-due-date"
                aria-label="截止日期"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="优先级" htmlFor="todo-priority">
              <select
                id="todo-priority"
                aria-label="优先级"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TodoPriority)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="分类" htmlFor="todo-category-select">
              <select
                id="todo-category-select"
                aria-label="分类"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {normalizedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {validationError || error ? (
            <p role="alert" className="text-sm text-red-700">
              {validationError ?? error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();
  return normalizedValue || undefined;
}
