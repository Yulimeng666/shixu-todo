import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Inbox,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { DEFAULT_CATEGORY_NAME, type TodoFilter } from "../types";

export type TodoNavigationItem = {
  filter: TodoFilter;
  label: string;
  count: number;
  icon: LucideIcon;
};

export type TodoCategoryItem = {
  id: string;
  name: string;
  count: number;
};

type TodoSidebarProps = {
  items: TodoNavigationItem[];
  categories: TodoCategoryItem[];
  activeFilter: TodoFilter;
  activeCategory: string;
  onSelectFilter: (filter: TodoFilter) => void;
  onSelectCategory: (category: string) => void;
  onCreateCategory: (name: string) => Promise<void> | void;
  onRequestDeleteCategory: (category: TodoCategoryItem) => void;
};

type MobileNavProps = {
  items: TodoNavigationItem[];
  activeFilter: TodoFilter;
  onSelectFilter: (filter: TodoFilter) => void;
};

const desktopButtonBase =
  "flex h-10 w-full items-center justify-between gap-3 rounded-md px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2";

const mobileButtonBase =
  "flex h-10 min-w-20 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2";

export function createNavigationItems(
  counts: Record<TodoFilter, number>,
): TodoNavigationItem[] {
  return [
    { filter: "today", label: "今天", count: counts.today, icon: CalendarCheck },
    { filter: "future", label: "未来", count: counts.future, icon: CalendarDays },
    { filter: "all", label: "全部", count: counts.all, icon: Inbox },
    { filter: "completed", label: "已完成", count: counts.completed, icon: CheckCircle2 },
  ];
}

export function TodoSidebar({
  items,
  categories,
  activeFilter,
  activeCategory,
  onSelectFilter,
  onSelectCategory,
  onCreateCategory,
  onRequestDeleteCategory,
}: TodoSidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [draftCategoryName, setDraftCategoryName] = useState("");

  async function handleCreateCategory() {
    await onCreateCategory(draftCategoryName);
    setDraftCategoryName("");
    setIsAddingCategory(false);
  }

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-normal text-stone-500">Todo</p>
        <h1 className="mt-1 text-xl font-semibold text-stone-950">个人待办</h1>
      </div>

      <nav aria-label="桌面视图导航" className="space-y-1 rounded-xl border border-orange-200 bg-white/70 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.filter === activeFilter;

          return (
            <button
              key={item.filter}
              type="button"
              aria-label={item.label}
              aria-pressed={isActive}
              onClick={() => onSelectFilter(item.filter)}
              className={
                isActive
                  ? `${desktopButtonBase} bg-orange-100 text-orange-900 ring-1 ring-orange-200`
                  : `${desktopButtonBase} text-stone-700 hover:bg-orange-50`
              }
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <span
                aria-hidden="true"
                className="min-w-6 rounded bg-white px-2 py-0.5 text-center text-xs text-stone-600 ring-1 ring-orange-100"
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-orange-200 bg-white/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-stone-500">分类</p>
          <button
            type="button"
            aria-label="新增分类"
            onClick={() => {
              setIsAddingCategory((value) => !value);
              setDraftCategoryName("");
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-orange-50 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {isAddingCategory ? (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {isAddingCategory ? (
          <div className="mb-3 flex items-center gap-2">
            <input
              aria-label="分类名称"
              value={draftCategoryName}
              onChange={(event) => setDraftCategoryName(event.target.value)}
              placeholder="输入分类名称"
              className="h-9 min-w-0 flex-1 rounded-md border border-orange-200 bg-white px-3 text-sm text-stone-950 outline-none placeholder:text-stone-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="button"
              aria-label="确认新增分类"
              onClick={() => void handleCreateCategory()}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              保存
            </button>
          </div>
        ) : null}

        <div className="space-y-1">
          {categories.map((category) => {
            const isActive = activeCategory === category.name;
            const canDelete = category.name !== DEFAULT_CATEGORY_NAME;

            return (
              <div
                key={category.id}
                className={[
                  "flex items-center gap-1 rounded-md px-1 py-0.5",
                  isActive ? "bg-orange-50 ring-1 ring-orange-200" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  aria-label={`筛选分类 ${category.name}`}
                  aria-pressed={isActive}
                  onClick={() => onSelectCategory(category.name)}
                  className={[
                    "flex h-9 min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
                    isActive ? "text-orange-900" : "text-stone-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <span className="truncate">{category.name}</span>
                  <span className="min-w-6 rounded bg-white px-2 py-0.5 text-center text-xs text-stone-600 ring-1 ring-orange-100">
                    {category.count}
                  </span>
                </button>

                {canDelete ? (
                  <button
                    type="button"
                    aria-label={`删除分类 ${category.name}`}
                    onClick={() => onRequestDeleteCategory(category)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MobileNav({ items, activeFilter, onSelectFilter }: MobileNavProps) {
  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="truncate text-lg font-semibold text-stone-950">待办</h1>
      </div>
      <nav aria-label="移动端视图导航" className="flex gap-2 overflow-x-auto rounded-lg border border-orange-200 bg-white/70 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.filter === activeFilter;

          return (
            <button
              key={item.filter}
              type="button"
              aria-label={item.label}
              aria-pressed={isActive}
              onClick={() => onSelectFilter(item.filter)}
              className={
                isActive
                  ? `${mobileButtonBase} bg-orange-100 text-orange-900 ring-1 ring-orange-200`
                  : `${mobileButtonBase} bg-white text-stone-700 ring-1 ring-orange-100 hover:bg-orange-50`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              <span aria-hidden="true" className="text-xs opacity-80">
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
