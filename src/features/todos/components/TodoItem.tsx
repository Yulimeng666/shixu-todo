import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, Pencil, PlayCircle, Tag, Trash2 } from "lucide-react";
import { isPastDate, parseIsoDate } from "../../../lib/dates";
import type { Todo, TodoPriority } from "../types";

type TodoItemProps = {
  todo: Todo;
  referenceDate?: Date;
  onEditTodo?: (todo: Todo) => void;
  onToggleTodo?: (todo: Todo) => void;
  onRequestDelete?: (todo: Todo) => void;
};

const priorityLabels: Record<TodoPriority, string> = {
  low: "低优先级",
  medium: "中优先级",
  high: "高优先级",
};

const priorityClasses: Record<TodoPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
};

export function TodoItem({
  todo,
  referenceDate = new Date(),
  onEditTodo,
  onToggleTodo,
  onRequestDelete,
}: TodoItemProps) {
  const isOverdue = Boolean(todo.dueDate) && !todo.completed && isPastDate(todo.dueDate, referenceDate);
  const statusText = todo.completed ? "已完成" : "未完成";

  return (
    <li
      className={[
        "border-l-4 bg-white px-4 py-4 transition-colors hover:bg-slate-50",
        getStateBorderClass(todo, isOverdue),
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleTodo?.(todo)}
          aria-label={`${todo.title} ${statusText}`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={[
                  "break-words text-sm font-semibold leading-6",
                  todo.completed ? "text-slate-500 line-through" : "text-slate-950",
                ].join(" ")}
              >
                {todo.title}
              </h3>
              {todo.note ? (
                <p className="mt-1 break-words text-sm leading-6 text-slate-500">{todo.note}</p>
              ) : null}
            </div>

            <span
              className={[
                "inline-flex h-7 shrink-0 items-center gap-1 self-start rounded-md px-2 text-xs font-medium",
                todo.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {todo.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {statusText}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={[
                "inline-flex h-7 items-center rounded-md px-2 font-medium",
                priorityClasses[todo.priority],
              ].join(" ")}
            >
              {priorityLabels[todo.priority]}
            </span>

            {todo.startDate ? (
              <span className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-100 px-2 font-medium text-slate-600">
                <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {formatStartDate(todo.startDate)}
              </span>
            ) : null}

            <span className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-100 px-2 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDueDate(todo.dueDate)}
            </span>

            {todo.category ? (
              <span className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-100 px-2 font-medium text-slate-600">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                {todo.category}
              </span>
            ) : null}

            {isOverdue ? (
              <span className="inline-flex h-7 items-center rounded-md bg-red-50 px-2 font-medium text-red-700">
                已逾期
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap justify-end gap-1">
            <button
              type="button"
              aria-label={`编辑 ${todo.title}`}
              onClick={() => onEditTodo?.(todo)}
              className="inline-flex h-8 min-w-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>编辑</span>
            </button>
            <button
              type="button"
              aria-label={`删除 ${todo.title}`}
              onClick={() => onRequestDelete?.(todo)}
              className="inline-flex h-8 min-w-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function getStateBorderClass(todo: Todo, isOverdue: boolean): string {
  if (todo.completed) {
    return "border-emerald-300";
  }

  if (isOverdue) {
    return "border-red-400";
  }

  if (todo.priority === "high") {
    return "border-amber-400";
  }

  return "border-slate-200";
}

function formatStartDate(startDate: string): string {
  const date = parseIsoDate(startDate);

  if (!date) {
    return "开始日期无效";
  }

  return `开始 ${format(date, "yyyy-MM-dd")}`;
}

function formatDueDate(dueDate: string | undefined): string {
  const date = parseIsoDate(dueDate);

  if (!date) {
    return "无截止日期";
  }

  return `截止 ${format(date, "yyyy-MM-dd")}`;
}
