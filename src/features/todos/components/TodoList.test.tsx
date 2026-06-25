import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Todo } from "../types";
import { TodoList } from "./TodoList";

const referenceDate = new Date("2026-06-25T09:00:00.000Z");

describe("TodoList", () => {
  it("renders todo item status, metadata, overdue state and completed state", () => {
    render(
      <TodoList
        todos={[
          createTodoFixture({
            id: "todo-overdue",
            title: "提交周报",
            startDate: "2026-06-23",
            dueDate: "2026-06-24",
            priority: "high",
            category: "工作",
          }),
          createTodoFixture({
            id: "todo-completed",
            title: "整理资料",
            dueDate: "2026-06-25",
            completed: true,
            completedAt: "2026-06-25T08:00:00.000Z",
          }),
        ]}
        filter="all"
        referenceDate={referenceDate}
      />,
    );

    expect(screen.getByText("提交周报")).toBeInTheDocument();
    expect(screen.getByText("开始 2026-06-23")).toBeInTheDocument();
    expect(screen.getByText("截止 2026-06-24")).toBeInTheDocument();
    expect(screen.getByText("高优先级")).toBeInTheDocument();
    expect(screen.getByText("工作")).toBeInTheDocument();
    expect(screen.getByText("已逾期")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "提交周报 未完成" })).not.toBeChecked();

    expect(screen.getByText("整理资料")).toHaveClass("line-through");
    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "整理资料 已完成" })).toBeChecked();
  });

  it("renders the matching empty state when there are no todos", () => {
    render(<TodoList todos={[]} filter="today" referenceDate={referenceDate} />);

    expect(screen.getByRole("status")).toHaveTextContent("今天没有待办");
    expect(screen.getByRole("button", { name: "新增任务" })).toBeInTheDocument();
  });
});

function createTodoFixture(patch: Partial<Todo>): Todo {
  return {
    id: "todo",
    title: "测试任务",
    priority: "medium",
    completed: false,
    order: 0,
    createdAt: "2026-06-24T08:00:00.000Z",
    updatedAt: "2026-06-24T08:00:00.000Z",
    ...patch,
  };
}
