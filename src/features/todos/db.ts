import Dexie, { type Table } from "dexie";
import type { Category, Todo } from "./types";

const DATABASE_NAME = "PersonalTodoDatabase";

export class TodoDatabase extends Dexie {
  todos!: Table<Todo, string>;
  categories!: Table<Category, string>;

  constructor(databaseName: string = DATABASE_NAME) {
    super(databaseName);

    this.version(1).stores({
      todos:
        "id, title, dueDate, priority, category, completed, order, createdAt, updatedAt, completedAt",
    });

    this.version(2).stores({
      todos:
        "id, title, startDate, dueDate, priority, category, completed, order, createdAt, updatedAt, completedAt",
    });

    this.version(3).stores({
      todos:
        "id, title, startDate, dueDate, priority, category, completed, order, createdAt, updatedAt, completedAt",
      categories: "id, &name, createdAt, isSystem",
    });
  }
}

export type TodoRepository = {
  getAll: () => Promise<Todo[]>;
  getById: (id: string) => Promise<Todo | undefined>;
  create: (todo: Todo) => Promise<Todo>;
  update: (todo: Todo) => Promise<Todo>;
  bulkUpsert: (todos: Todo[]) => Promise<Todo[]>;
  delete: (id: string) => Promise<void>;
};

export type CategoryRepository = {
  getAll: () => Promise<Category[]>;
  create: (category: Category) => Promise<Category>;
  bulkUpsert: (categories: Category[]) => Promise<Category[]>;
  delete: (id: string) => Promise<void>;
};

export function createTodoDatabase(databaseName?: string): TodoDatabase {
  return new TodoDatabase(databaseName);
}

export function createTodoRepository(database: TodoDatabase = todoDatabase): TodoRepository {
  return {
    async getAll() {
      return database.todos.orderBy("createdAt").toArray();
    },

    async getById(id: string) {
      return database.todos.get(id);
    },

    async create(todo: Todo) {
      await database.todos.add(todo);
      return todo;
    },

    async update(todo: Todo) {
      const updatedRows = await database.todos.update(todo.id, todo);

      if (updatedRows === 0) {
        throw new Error("待办不存在，无法更新");
      }

      return todo;
    },

    async bulkUpsert(todos: Todo[]) {
      if (todos.length === 0) {
        return [];
      }

      await database.todos.bulkPut(todos);
      return todos;
    },

    async delete(id: string) {
      await database.todos.delete(id);
    },
  };
}

export function createCategoryRepository(
  database: TodoDatabase = todoDatabase,
): CategoryRepository {
  return {
    async getAll() {
      return database.categories.orderBy("createdAt").toArray();
    },

    async create(category: Category) {
      await database.categories.add(category);
      return category;
    },

    async bulkUpsert(categories: Category[]) {
      if (categories.length === 0) {
        return [];
      }

      await database.categories.bulkPut(categories);
      return categories;
    },

    async delete(id: string) {
      await database.categories.delete(id);
    },
  };
}

export const todoDatabase = createTodoDatabase();
export const todoRepository = createTodoRepository(todoDatabase);
export const categoryRepository = createCategoryRepository(todoDatabase);
