import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "../../../components/layout/AppLayout";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ErrorBanner } from "../../../components/ui/ErrorBanner";
import {
  DEFAULT_CATEGORY_NAME,
  type Category,
  type CreateTodoInput,
  type Todo,
  type TodoFilter,
} from "../types";
import { selectVisibleTodos, useTodosStore } from "../store";
import { filterTodos } from "../utils";
import {
  createNavigationItems,
  MobileNav,
  TodoSidebar,
  type TodoCategoryItem,
} from "./TodoNavigation";
import { TodoList } from "./TodoList";
import { TodoEditor } from "./TodoEditor";
import { TodoToolbar } from "./TodoToolbar";
import { LoadingState } from "./LoadingState";

const filterTitles: Record<TodoFilter, string> = {
  today: "今天",
  future: "未来",
  all: "全部任务",
  completed: "已完成",
};

type EditorState = { mode: "create" } | { mode: "edit"; todo: Todo } | null;

export function TodoWorkspace() {
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | null>(null);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<TodoCategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const todos = useTodosStore((state) => state.todos);
  const categories = useTodosStore((state) => state.categories);
  const filter = useTodosStore((state) => state.filter);
  const searchQuery = useTodosStore((state) => state.searchQuery);
  const sortBy = useTodosStore((state) => state.sortBy);
  const priorityFilter = useTodosStore((state) => state.priorityFilter);
  const dateFilter = useTodosStore((state) => state.dateFilter);
  const completionFilter = useTodosStore((state) => state.completionFilter);
  const categoryFilter = useTodosStore((state) => state.categoryFilter);
  const isLoading = useTodosStore((state) => state.isLoading);
  const isHydrated = useTodosStore((state) => state.isHydrated);
  const error = useTodosStore((state) => state.error);
  const initializeAppData = useTodosStore((state) => state.initializeAppData);
  const createTodo = useTodosStore((state) => state.createTodo);
  const updateTodo = useTodosStore((state) => state.updateTodo);
  const deleteTodo = useTodosStore((state) => state.deleteTodo);
  const toggleTodo = useTodosStore((state) => state.toggleTodo);
  const createCategory = useTodosStore((state) => state.createCategory);
  const deleteCategory = useTodosStore((state) => state.deleteCategory);
  const setFilter = useTodosStore((state) => state.setFilter);
  const setSearchQuery = useTodosStore((state) => state.setSearchQuery);
  const setSortBy = useTodosStore((state) => state.setSortBy);
  const setPriorityFilter = useTodosStore((state) => state.setPriorityFilter);
  const setDateFilter = useTodosStore((state) => state.setDateFilter);
  const setCompletionFilter = useTodosStore((state) => state.setCompletionFilter);
  const setCategoryFilter = useTodosStore((state) => state.setCategoryFilter);
  const clearAdvancedFilters = useTodosStore((state) => state.clearAdvancedFilters);
  const clearError = useTodosStore((state) => state.clearError);

  useEffect(() => {
    if (!isHydrated) {
      void initializeAppData();
    }
  }, [initializeAppData, isHydrated]);

  const referenceDate = new Date();
  const visibleTodos = selectVisibleTodos(
    {
      todos,
      filter,
      searchQuery,
      sortBy,
      priorityFilter,
      dateFilter,
      completionFilter,
      categoryFilter,
    },
    referenceDate,
  );
  const navigationItems = createNavigationItems(getNavigationCounts(todos, referenceDate));
  const currentTitle = filterTitles[filter];
  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);
  const categoryItems = useMemo(() => getCategoryItems(categories, todos), [categories, todos]);
  const hasActiveFilters =
    priorityFilter !== "all" ||
    dateFilter !== "all" ||
    completionFilter !== "all" ||
    categoryFilter !== "all";

  async function handleSubmit(input: CreateTodoInput) {
    if (!editorState) {
      return;
    }

    setIsSaving(true);

    try {
      if (editorState.mode === "create") {
        await createTodo(applyTodayDefaultDueDate(input, filter, referenceDate));
      } else {
        await updateTodo(editorState.todo.id, input);
      }

      setEditorState(null);
    } catch {
      // 错误由 store 暴露给 UI。
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(name: string) {
    await createCategory(name);
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      await toggleTodo(todo.id);
    } catch {
      // 错误由 store 暴露给 UI。
    }
  }

  async function handleConfirmDeleteTodo() {
    if (!todoPendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTodo(todoPendingDelete.id);

      if (editorState?.mode === "edit" && editorState.todo.id === todoPendingDelete.id) {
        setEditorState(null);
      }

      setTodoPendingDelete(null);
    } catch {
      // 错误由 store 暴露给 UI。
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryPendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const target = categories.find((category) => category.name === categoryPendingDelete.name);
      if (target) {
        await deleteCategory(target.id);
      }
      setCategoryPendingDelete(null);
    } catch {
      // 错误由 store 暴露给 UI。
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppLayout
      sidebar={
        <TodoSidebar
          items={navigationItems}
          categories={categoryItems}
          activeFilter={filter}
          activeCategory={categoryFilter}
          onSelectFilter={setFilter}
          onSelectCategory={setCategoryFilter}
          onCreateCategory={handleCreateCategory}
          onRequestDeleteCategory={setCategoryPendingDelete}
        />
      }
      mobileNav={<MobileNav items={navigationItems} activeFilter={filter} onSelectFilter={setFilter} />}
    >
      <section className="flex min-h-screen flex-col bg-transparent">
        <TodoToolbar
          searchQuery={searchQuery}
          sortBy={sortBy}
          priorityFilter={priorityFilter}
          dateFilter={dateFilter}
          completionFilter={completionFilter}
          categoryFilter={categoryFilter}
          categories={categoryNames}
          hasActiveFilters={hasActiveFilters}
          onCreateTodo={() => setEditorState({ mode: "create" })}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onPriorityFilterChange={setPriorityFilter}
          onDateFilterChange={setDateFilter}
          onCompletionFilterChange={setCompletionFilter}
          onCategoryFilterChange={setCategoryFilter}
          onClearFilters={clearAdvancedFilters}
        />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 lg:px-6">
          {error && !editorState ? (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={clearError} />
            </div>
          ) : null}

          <div className="mb-4 rounded-xl border border-orange-200 bg-white/72 px-4 py-3 shadow-sm sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-stone-500">当前视图</p>
                <h2 className="text-2xl font-semibold text-stone-950">{currentTitle}</h2>
              </div>
              <p className="text-sm text-stone-500">{visibleTodos.length} 项任务</p>
            </div>
          </div>

          <section
            aria-label="任务列表"
            className="min-h-96 flex-1 overflow-hidden rounded-xl border border-orange-200 bg-white/82 shadow-[0_12px_30px_rgba(120,72,24,0.08)]"
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <TodoList
                todos={visibleTodos}
                filter={filter}
                searchQuery={searchQuery}
                hasActiveFilters={hasActiveFilters}
                referenceDate={referenceDate}
                onCreateTodo={() => setEditorState({ mode: "create" })}
                onEditTodo={(todo) => setEditorState({ mode: "edit", todo })}
                onToggleTodo={handleToggleTodo}
                onRequestDelete={setTodoPendingDelete}
              />
            )}
          </section>
        </div>

        {editorState ? (
          <TodoEditor
            mode={editorState.mode}
            todo={editorState.mode === "edit" ? editorState.todo : undefined}
            categories={categoryNames}
            isSaving={isSaving}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => setEditorState(null)}
          />
        ) : null}

        {todoPendingDelete ? (
          <ConfirmDialog
            title="删除任务"
            message={`确定要删除“${todoPendingDelete.title}”吗？删除后无法在本地列表中恢复。`}
            confirmLabel="删除"
            cancelLabel="取消"
            isBusy={isDeleting}
            onConfirm={handleConfirmDeleteTodo}
            onCancel={() => setTodoPendingDelete(null)}
          />
        ) : null}

        {categoryPendingDelete ? (
          <ConfirmDialog
            title="删除分类"
            message={`确定要删除分类“${categoryPendingDelete.name}”吗？该分类下任务将自动回收到“${DEFAULT_CATEGORY_NAME}”。`}
            confirmLabel="删除"
            cancelLabel="取消"
            isBusy={isDeleting}
            onConfirm={handleConfirmDeleteCategory}
            onCancel={() => setCategoryPendingDelete(null)}
          />
        ) : null}
      </section>
    </AppLayout>
  );
}

function applyTodayDefaultDueDate(
  input: CreateTodoInput,
  currentFilter: TodoFilter,
  referenceDate: Date,
): CreateTodoInput {
  if (currentFilter !== "today" || input.dueDate?.trim()) {
    return input;
  }

  return {
    ...input,
    dueDate: format(referenceDate, "yyyy-MM-dd"),
  };
}

function getNavigationCounts(todos: Todo[], referenceDate: Date): Record<TodoFilter, number> {
  return {
    today: filterTodos(todos, { view: "today", referenceDate }).length,
    future: filterTodos(todos, { view: "future", referenceDate }).length,
    all: filterTodos(todos, { view: "all", referenceDate }).length,
    completed: filterTodos(todos, { view: "completed", referenceDate }).length,
  };
}

function getCategoryItems(categories: Category[], todos: Todo[]): TodoCategoryItem[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    count: todos.filter((todo) => (todo.category ?? DEFAULT_CATEGORY_NAME) === category.name).length,
  }));
}
