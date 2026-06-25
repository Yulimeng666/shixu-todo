import { create } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import { generateId } from "../../lib/ids";
import {
  categoryRepository,
  todoRepository,
  type CategoryRepository,
  type TodoRepository,
} from "./db";
import {
  DEFAULT_CATEGORY_NAME,
  PRESET_CATEGORY_NAMES,
  type Category,
  type CreateTodoInput,
  type Todo,
  type TodoCompletionFilter,
  type TodoDateFilter,
  type TodoFilter,
  type TodoPriorityFilter,
  type TodoSortOption,
  type UpdateTodoInput,
} from "./types";
import {
  createTodo as createTodoModel,
  filterTodos,
  normalizeOptionalText,
  sortTodos,
  toggleTodoCompletion,
  updateTodo as updateTodoModel,
} from "./utils";

export type TodosStoreState = {
  todos: Todo[];
  categories: Category[];
  filter: TodoFilter;
  searchQuery: string;
  sortBy: TodoSortOption;
  priorityFilter: TodoPriorityFilter;
  dateFilter: TodoDateFilter;
  completionFilter: TodoCompletionFilter;
  categoryFilter: string;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  initializeAppData: () => Promise<void>;
  loadTodos: () => Promise<void>;
  loadCategories: () => Promise<void>;
  createTodo: (input: CreateTodoInput) => Promise<Todo>;
  updateTodo: (id: string, patch: UpdateTodoInput) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<Todo>;
  createCategory: (name: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: TodoSortOption) => void;
  setPriorityFilter: (priority: TodoPriorityFilter) => void;
  setDateFilter: (date: TodoDateFilter) => void;
  setCompletionFilter: (completion: TodoCompletionFilter) => void;
  setCategoryFilter: (category: string) => void;
  clearAdvancedFilters: () => void;
  clearError: () => void;
};

type StoreSet = StoreApi<TodosStoreState>["setState"];
type StoreGet = StoreApi<TodosStoreState>["getState"];

export function createTodosStore(
  repository: TodoRepository = todoRepository,
  categoriesRepo: CategoryRepository = categoryRepository,
): StoreApi<TodosStoreState> {
  return createStore<TodosStoreState>()((set, get) =>
    createTodosStoreState(repository, categoriesRepo, set, get),
  );
}

export const useTodosStore = create<TodosStoreState>()((set, get) =>
  createTodosStoreState(todoRepository, categoryRepository, set, get),
);

export function selectVisibleTodos(
  state: Pick<
    TodosStoreState,
    | "todos"
    | "filter"
    | "searchQuery"
    | "sortBy"
    | "priorityFilter"
    | "dateFilter"
    | "completionFilter"
    | "categoryFilter"
  >,
  referenceDate: Date = new Date(),
): Todo[] {
  return sortTodos(
    filterTodos(state.todos, {
      view: state.filter,
      searchQuery: state.searchQuery,
      referenceDate,
      priority: state.priorityFilter === "all" ? undefined : state.priorityFilter,
      date: state.dateFilter,
      completed: getCompletedFilterValue(state.completionFilter),
      category: state.categoryFilter === "all" ? undefined : state.categoryFilter,
    }),
    state.sortBy,
  );
}

function createTodosStoreState(
  repository: TodoRepository,
  categoriesRepo: CategoryRepository,
  set: StoreSet,
  get: StoreGet,
): TodosStoreState {
  return {
    todos: [],
    categories: [],
    filter: "today",
    searchQuery: "",
    sortBy: "dueDate",
    priorityFilter: "all",
    dateFilter: "all",
    completionFilter: "all",
    categoryFilter: "all",
    isLoading: false,
    isHydrated: false,
    error: null,

    async initializeAppData() {
      if (get().isHydrated) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const [loadedTodos, loadedCategories] = await Promise.all([
          repository.getAll(),
          categoriesRepo.getAll(),
        ]);

        const normalizedTodos = loadedTodos.map((todo) => normalizeStoredTodo(todo));
        const categoriesFromTodos = normalizedTodos
          .map((todo) => todo.category)
          .filter((category): category is string => Boolean(category));
        const normalizedCategories = ensureCategories(loadedCategories, categoriesFromTodos);

        if (didTodosChange(loadedTodos, normalizedTodos)) {
          await repository.bulkUpsert(normalizedTodos);
        }

        if (didCategoriesChange(loadedCategories, normalizedCategories)) {
          await categoriesRepo.bulkUpsert(normalizedCategories);
        }

        set({
          todos: normalizedTodos,
          categories: sortCategories(normalizedCategories),
          isLoading: false,
          isHydrated: true,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          isHydrated: false,
          error: getErrorMessage(error),
        });
        throw error;
      }
    },

    async loadTodos() {
      const todos = (await repository.getAll()).map((todo) => normalizeStoredTodo(todo));
      set({ todos });
    },

    async loadCategories() {
      const categories = await categoriesRepo.getAll();
      set({ categories: sortCategories(ensureCategories(categories, [])) });
    },

    async createTodo(input) {
      const previousTodos = get().todos;
      const todo = createTodoModel({
        ...input,
        category: normalizeOptionalText(input.category) ?? DEFAULT_CATEGORY_NAME,
      });

      set({ todos: [...previousTodos, todo], error: null });

      try {
        await repository.create(todo);
        return todo;
      } catch (error) {
        set({ todos: previousTodos, error: getErrorMessage(error) });
        throw error;
      }
    },

    async updateTodo(id, patch) {
      const previousTodos = get().todos;
      const existingTodo = previousTodos.find((todo) => todo.id === id);

      if (!existingTodo) {
        const error = new Error("待办不存在，无法更新");
        set({ error: error.message });
        throw error;
      }

      const updatedTodo = updateTodoModel(existingTodo, patch);

      set({
        todos: previousTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
        error: null,
      });

      try {
        await repository.update(updatedTodo);
        return updatedTodo;
      } catch (error) {
        set({ todos: previousTodos, error: getErrorMessage(error) });
        throw error;
      }
    },

    async deleteTodo(id) {
      const previousTodos = get().todos;
      const nextTodos = previousTodos.filter((todo) => todo.id !== id);

      set({ todos: nextTodos, error: null });

      try {
        await repository.delete(id);
      } catch (error) {
        set({ todos: previousTodos, error: getErrorMessage(error) });
        throw error;
      }
    },

    async toggleTodo(id) {
      const previousTodos = get().todos;
      const existingTodo = previousTodos.find((todo) => todo.id === id);

      if (!existingTodo) {
        const error = new Error("待办不存在，无法更新");
        set({ error: error.message });
        throw error;
      }

      const updatedTodo = toggleTodoCompletion(existingTodo, !existingTodo.completed);

      set({
        todos: previousTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
        error: null,
      });

      try {
        await repository.update(updatedTodo);
        return updatedTodo;
      } catch (error) {
        set({ todos: previousTodos, error: getErrorMessage(error) });
        throw error;
      }
    },

    async createCategory(name) {
      const previousCategories = get().categories;
      const normalizedName = normalizeCategoryName(name);

      if (
        previousCategories.some(
          (category) => category.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
        )
      ) {
        const error = new Error("分类名称已存在");
        set({ error: error.message });
        throw error;
      }

      const category = createCategoryModel(normalizedName, false);
      const nextCategories = sortCategories([...previousCategories, category]);

      set({ categories: nextCategories, error: null });

      try {
        await categoriesRepo.create(category);
        return category;
      } catch (error) {
        set({ categories: previousCategories, error: getErrorMessage(error) });
        throw error;
      }
    },

    async deleteCategory(id) {
      const previousCategories = get().categories;
      const previousTodos = get().todos;
      const previousCategoryFilter = get().categoryFilter;
      const category = previousCategories.find((item) => item.id === id);

      if (!category) {
        const error = new Error("分类不存在");
        set({ error: error.message });
        throw error;
      }

      if (category.name === DEFAULT_CATEGORY_NAME) {
        const error = new Error("默认分类不可删除");
        set({ error: error.message });
        throw error;
      }

      const reassignedTodos = previousTodos.map((todo) =>
        todo.category === category.name ? updateTodoModel(todo, { category: DEFAULT_CATEGORY_NAME }) : todo,
      );
      const changedTodos = reassignedTodos.filter((todo, index) => todo !== previousTodos[index]);
      const nextCategories = previousCategories.filter((item) => item.id !== id);
      const nextCategoryFilter = previousCategoryFilter === category.name ? "all" : previousCategoryFilter;

      set({
        todos: reassignedTodos,
        categories: nextCategories,
        categoryFilter: nextCategoryFilter,
        error: null,
      });

      try {
        await repository.bulkUpsert(changedTodos);
        await categoriesRepo.delete(id);
      } catch (error) {
        set({
          todos: previousTodos,
          categories: previousCategories,
          categoryFilter: previousCategoryFilter,
          error: getErrorMessage(error),
        });
        throw error;
      }
    },

    setFilter(filter) {
      set({ filter });
    },

    setSearchQuery(query) {
      set({ searchQuery: query });
    },

    setSortBy(sortBy) {
      set({ sortBy });
    },

    setPriorityFilter(priorityFilter) {
      set({ priorityFilter });
    },

    setDateFilter(dateFilter) {
      set({ dateFilter });
    },

    setCompletionFilter(completionFilter) {
      set({ completionFilter });
    },

    setCategoryFilter(categoryFilter) {
      set({ categoryFilter });
    },

    clearAdvancedFilters() {
      set({
        priorityFilter: "all",
        dateFilter: "all",
        completionFilter: "all",
        categoryFilter: "all",
      });
    },

    clearError() {
      set({ error: null });
    },
  };
}

function getCompletedFilterValue(completionFilter: TodoCompletionFilter): boolean | undefined {
  if (completionFilter === "active") {
    return false;
  }

  if (completionFilter === "completed") {
    return true;
  }

  return undefined;
}

function normalizeStoredTodo(todo: Todo): Todo {
  const normalizedCategory = normalizeOptionalText(todo.category) ?? DEFAULT_CATEGORY_NAME;

  if (normalizedCategory === todo.category) {
    return todo;
  }

  return updateTodoModel(todo, { category: normalizedCategory });
}

function ensureCategories(categories: Category[], todoCategoryNames: readonly string[]): Category[] {
  const categoryMap = new Map(
    categories.map((category) => [category.name.toLocaleLowerCase(), category] as const),
  );

  for (const preset of PRESET_CATEGORY_NAMES) {
    const key = preset.toLocaleLowerCase();

    if (!categoryMap.has(key)) {
      categoryMap.set(key, createCategoryModel(preset, true));
    }
  }

  for (const rawName of todoCategoryNames) {
    const normalizedName = normalizeOptionalText(rawName) ?? DEFAULT_CATEGORY_NAME;
    const key = normalizedName.toLocaleLowerCase();

    if (!categoryMap.has(key)) {
      categoryMap.set(key, createCategoryModel(normalizedName, false));
    }
  }

  return Array.from(categoryMap.values());
}

function createCategoryModel(name: string, isSystem: boolean): Category {
  return {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    isSystem,
  };
}

function normalizeCategoryName(name: string): string {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("分类名称不能为空");
  }

  return normalizedName;
}

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((first, second) => {
    if (first.name === DEFAULT_CATEGORY_NAME) {
      return -1;
    }

    if (second.name === DEFAULT_CATEGORY_NAME) {
      return 1;
    }

    if (first.isSystem !== second.isSystem) {
      return first.isSystem ? -1 : 1;
    }

    return first.name.localeCompare(second.name, "zh-CN");
  });
}

function didTodosChange(previousTodos: Todo[], nextTodos: Todo[]): boolean {
  return (
    previousTodos.length !== nextTodos.length ||
    previousTodos.some((todo, index) => JSON.stringify(todo) !== JSON.stringify(nextTodos[index]))
  );
}

function didCategoriesChange(previousCategories: Category[], nextCategories: Category[]): boolean {
  return (
    previousCategories.length !== nextCategories.length ||
    previousCategories.some(
      (category) => !nextCategories.some((item) => item.name === category.name && item.id === category.id),
    )
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败";
}
