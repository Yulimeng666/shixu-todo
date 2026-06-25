export const DEFAULT_CATEGORY_NAME = "默认";
export const PRESET_CATEGORY_NAMES = ["默认", "工作", "生活", "学习", "购物"] as const;

export const TODO_PRIORITIES = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const TODO_FILTERS = ["today", "future", "all", "completed"] as const;
export type TodoFilter = (typeof TODO_FILTERS)[number];

export const TODO_SORT_OPTIONS = ["dueDate", "priority", "createdAt"] as const;
export type TodoSortOption = (typeof TODO_SORT_OPTIONS)[number];

export const TODO_DATE_FILTERS = ["all", "today", "future", "noDate"] as const;
export type TodoDateFilter = (typeof TODO_DATE_FILTERS)[number];

export const TODO_COMPLETION_FILTERS = ["all", "active", "completed"] as const;
export type TodoCompletionFilter = (typeof TODO_COMPLETION_FILTERS)[number];

export type TodoPriorityFilter = TodoPriority | "all";

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  isSystem: boolean;
};

export type Todo = {
  id: string;
  title: string;
  note?: string;
  startDate?: string;
  dueDate?: string;
  priority: TodoPriority;
  category?: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type CreateTodoInput = {
  title: string;
  note?: string;
  startDate?: string;
  dueDate?: string;
  priority?: TodoPriority;
  category?: string;
};

export type UpdateTodoInput = Partial<CreateTodoInput>;

export type TodoFilterOptions = {
  view: TodoFilter;
  referenceDate?: Date;
  searchQuery?: string;
  priority?: TodoPriority;
  date?: TodoDateFilter;
  category?: string;
  completed?: boolean;
};
