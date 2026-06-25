import { ListTodo, Plus, SearchX } from "lucide-react";
import type { TodoFilter } from "../types";

type EmptyStateProps = {
  filter: TodoFilter;
  hasSearchQuery?: boolean;
  hasActiveFilters?: boolean;
  onCreateTodo?: () => void;
};

const emptyContent: Record<TodoFilter, { title: string; description: string }> = {
  today: {
    title: "今天没有待办",
    description: "添加今天要处理的任务，让日程保持清晰。",
  },
  future: {
    title: "未来还没有安排",
    description: "添加带截止日期的任务，提前整理后续计划。",
  },
  all: {
    title: "还没有任务",
    description: "创建第一条待办后，所有任务都会集中显示在这里。",
  },
  completed: {
    title: "暂无已完成任务",
    description: "完成任务后，它们会出现在这个视图中。",
  },
};

export function EmptyState({
  filter,
  hasSearchQuery = false,
  hasActiveFilters = false,
  onCreateTodo,
}: EmptyStateProps) {
  const isFilteredEmpty = hasSearchQuery || hasActiveFilters;
  const content = isFilteredEmpty
    ? {
        title: "没有匹配的任务",
        description: "调整搜索词或筛选条件后再试。",
      }
    : emptyContent[filter];
  const Icon = isFilteredEmpty ? SearchX : ListTodo;

  return (
    <div className="flex min-h-96 items-center justify-center px-4 py-12">
      <div role="status" className="max-w-sm text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-slate-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-3 text-base font-semibold text-slate-950">{content.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{content.description}</p>
        <button
          type="button"
          onClick={onCreateTodo}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>新增任务</span>
        </button>
      </div>
    </div>
  );
}
