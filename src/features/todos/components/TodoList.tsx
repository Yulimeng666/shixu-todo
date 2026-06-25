import type { Todo, TodoFilter } from "../types";
import { EmptyState } from "./EmptyState";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  filter: TodoFilter;
  searchQuery?: string;
  hasActiveFilters?: boolean;
  referenceDate?: Date;
  onCreateTodo?: () => void;
  onEditTodo?: (todo: Todo) => void;
  onToggleTodo?: (todo: Todo) => void;
  onRequestDelete?: (todo: Todo) => void;
};

export function TodoList({
  todos,
  filter,
  searchQuery = "",
  hasActiveFilters = false,
  referenceDate = new Date(),
  onCreateTodo,
  onEditTodo,
  onToggleTodo,
  onRequestDelete,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <EmptyState
        filter={filter}
        hasSearchQuery={searchQuery.trim().length > 0}
        hasActiveFilters={hasActiveFilters}
        onCreateTodo={onCreateTodo}
      />
    );
  }

  return (
    <ul role="list" className="divide-y divide-orange-100">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          referenceDate={referenceDate}
          onEditTodo={onEditTodo}
          onToggleTodo={onToggleTodo}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </ul>
  );
}
