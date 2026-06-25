import { Plus, Search, X } from "lucide-react";
import type {
  TodoCompletionFilter,
  TodoDateFilter,
  TodoPriorityFilter,
  TodoSortOption,
} from "../types";

type TodoToolbarProps = {
  searchQuery: string;
  sortBy: TodoSortOption;
  priorityFilter: TodoPriorityFilter;
  dateFilter: TodoDateFilter;
  completionFilter: TodoCompletionFilter;
  categoryFilter: string;
  categories: string[];
  hasActiveFilters: boolean;
  onCreateTodo: () => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: TodoSortOption) => void;
  onPriorityFilterChange: (priority: TodoPriorityFilter) => void;
  onDateFilterChange: (date: TodoDateFilter) => void;
  onCompletionFilterChange: (completion: TodoCompletionFilter) => void;
  onCategoryFilterChange: (category: string) => void;
  onClearFilters: () => void;
};

const priorityLabels: Record<TodoPriorityFilter, string> = {
  all: "全部优先级",
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
};

const dateLabels: Record<TodoDateFilter, string> = {
  all: "全部日期",
  today: "今天",
  future: "未来",
  noDate: "无日期",
};

const completionLabels: Record<TodoCompletionFilter, string> = {
  all: "全部状态",
  active: "未完成",
  completed: "已完成",
};

export function TodoToolbar({
  searchQuery,
  sortBy,
  priorityFilter,
  dateFilter,
  completionFilter,
  categoryFilter,
  categories,
  hasActiveFilters,
  onCreateTodo,
  onSearchChange,
  onSortChange,
  onPriorityFilterChange,
  onDateFilterChange,
  onCompletionFilterChange,
  onCategoryFilterChange,
  onClearFilters,
}: TodoToolbarProps) {
  const activeFilterLabels = getActiveFilterLabels({
    priorityFilter,
    dateFilter,
    completionFilter,
    categoryFilter,
  });

  return (
    <div className="flex flex-col gap-3 border-b border-orange-200 bg-white/82 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">搜索任务</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="搜索任务"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="搜索任务"
                className="h-10 w-full rounded-md border border-orange-200 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <button
              type="button"
              onClick={onCreateTodo}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>新增任务</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <select
              aria-label="筛选优先级"
              value={priorityFilter}
              onChange={(event) => onPriorityFilterChange(event.target.value as TodoPriorityFilter)}
              className="h-10 w-full rounded-md border border-orange-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">全部优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>

            <select
              aria-label="筛选日期"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value as TodoDateFilter)}
              className="h-10 w-full rounded-md border border-orange-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">全部日期</option>
              <option value="today">今天</option>
              <option value="future">未来</option>
              <option value="noDate">无日期</option>
            </select>

            <select
              aria-label="筛选完成状态"
              value={completionFilter}
              onChange={(event) =>
                onCompletionFilterChange(event.target.value as TodoCompletionFilter)
              }
              className="h-10 w-full rounded-md border border-orange-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">全部状态</option>
              <option value="active">未完成</option>
              <option value="completed">已完成</option>
            </select>

            <select
              aria-label="筛选分类"
              value={categoryFilter}
              onChange={(event) => onCategoryFilterChange(event.target.value)}
              className="h-10 w-full rounded-md border border-orange-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              aria-label="排序方式"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as TodoSortOption)}
              className="h-10 w-full rounded-md border border-orange-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="dueDate">截止日期</option>
              <option value="priority">优先级</option>
              <option value="createdAt">创建时间</option>
            </select>
          </div>
        </div>
      </div>

      {activeFilterLabels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs" aria-label="当前筛选条件">
          <span className="font-medium text-slate-600">当前筛选</span>
          {activeFilterLabels.map((label) => (
            <span
              key={label}
              className="inline-flex h-7 items-center rounded-md bg-orange-50 px-2 font-medium text-slate-700 ring-1 ring-orange-200"
            >
              {label}
            </span>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-orange-200 bg-white px-2 font-medium text-slate-700 transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>清除筛选</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getActiveFilterLabels({
  priorityFilter,
  dateFilter,
  completionFilter,
  categoryFilter,
}: Pick<
  TodoToolbarProps,
  "priorityFilter" | "dateFilter" | "completionFilter" | "categoryFilter"
>): string[] {
  return [
    priorityFilter === "all" ? null : priorityLabels[priorityFilter],
    dateFilter === "all" ? null : dateLabels[dateFilter],
    completionFilter === "all" ? null : completionLabels[completionFilter],
    categoryFilter === "all" ? null : `分类：${categoryFilter}`,
  ].filter((label): label is string => Boolean(label));
}
