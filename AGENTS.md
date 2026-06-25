# AGENTS.md

本文件是本项目的开发代理规范。任何后续代码生成、修改、重构、测试和文档维护都应遵守本文件，并以 `TECH_DESIGN.md` 作为技术设计来源。

## 1. 项目定位

- 项目类型：个人日程待办网站
- 第一版目标：实现本地优先的个人待办管理工具
- 技术路线：React + TypeScript + Vite + Tailwind CSS
- 数据路线：Zustand 管理业务状态，Dexie.js / IndexedDB 负责本地持久化
- 产品风格：简洁、高效、信息清晰

## 2. 开发原则

- 优先进行小范围、易审查的改动
- 除非明确要求，不做大范围重构
- 不编造 API、配置项、文件路径或依赖
- 修改前先确认相关文件和影响范围
- 保持实现与 `TECH_DESIGN.md` 一致

## 3. 开发前必读文档

每次开始功能开发、重构、修复或文档调整前，必须先阅读：

- `PRD.md`
- `TECH_DESIGN.md`
- `AGENTS.md`
- `TASKS.md`

## 4. 推荐项目结构

```text
src/
├── app/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   └── todos/
│       ├── components/
│       ├── db.ts
│       ├── store.ts
│       ├── types.ts
│       └── utils.ts
├── lib/
├── styles/
├── test/
├── types/
└── main.tsx
```

## 5. TypeScript 代码规范

- 所有业务数据必须有明确类型
- 不使用隐式 `any`
- Todo 与 Category 相关类型集中定义，避免重复
- 公共函数参数和返回值保持明确

推荐模型：

```ts
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
  priority: "low" | "medium" | "high";
  category: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

## 6. React 组件规范

- 组件保持单一职责
- 容器组件负责数据与事件编排
- 展示组件负责渲染
- 不在组件中直接操作 IndexedDB
- 分类新增入口放在左侧分类栏，不放在任务表单中

## 7. 状态与数据访问规范

- Zustand store 负责任务和分类状态
- Dexie 只在数据访问层使用
- 启动时加载任务与分类
- 写入失败时回滚 optimistic state

建议 store 方法：

```ts
initializeAppData();
loadTodos();
loadCategories();
createTodo(input);
updateTodo(id, patch);
deleteTodo(id);
toggleTodo(id);
createCategory(name);
deleteCategory(id);
setCategoryFilter(category);
```

## 8. UI 设计风格

- 页面第一屏就是待办工作区
- 桌面端布局：左侧导航、顶部工具栏、主任务列表、任务编辑弹层
- 左侧分类栏应具备真实导航感
- 分类行内按钮尺寸稳定，避免抖动
- 不做营销化或装饰性过强的设计

## 9. 交互与可访问性

- 新增任务入口始终清晰可见
- 左侧分类栏支持键盘访问
- 图标按钮必须提供 `aria-label`
- 删除分类必须二次确认
- `默认` 分类不可删除

## 10. Tailwind 与样式规范

- 优先使用 Tailwind 工具类
- 重复样式抽象为组件
- 左侧分类区不要堆叠卡片
- 分类标题旁的新增按钮使用轻量图标按钮

## 11. 数据模型与业务规则

- `title` 必填，保存前 trim
- `priority` 默认 `medium`
- `completed` 默认 `false`
- 未选择分类时，任务自动归入 `默认`
- `默认` 分类永久存在且不可删除
- 删除其他分类后，相关任务统一回收到 `默认`
- `today` / `future` 视图继续基于 `dueDate`
- `startDate` 只负责录入、存储、展示

## 12. 测试规范

涉及行为变化时必须新增或更新测试。

优先覆盖：

- 分类初始化
- 新增分类
- 删除分类与任务回收
- 左侧分类筛选
- 任务默认分类回退
- 今天视图默认补截止日期

建议命令：

```bash
npm run test -- --run
npm run build
```

## 13. 命令与依赖规范

- 运行命令前说明用途
- 新增依赖前确认必要性
- 不为简单功能引入大型 UI 框架或额外状态库

## 14. 文档维护

- 改变产品范围时更新 `PRD.md`
- 改变技术结构时更新 `TECH_DESIGN.md`
- 改变开发阶段时更新 `TASKS.md`
- 改变规范时更新 `AGENTS.md`

## 15. 完成标准

每次改动完成前检查：

- 测试通过
- 构建通过
- 文档与实现一致
- 没有引入未确认依赖或敏感信息
- UI 符合简洁效率型工具风格

## 16. 暖色主题补充规范

- 暖色调可以用于页面背景和辅助表面，但不能让所有工作区块失去边界。
- 只要采用暖色背景，必须同步检查并增强关键区域边框。
- 左侧导航、顶部工具栏、主列表容器、状态信息区默认都应有清晰边框或分隔线。
- 不用整片同色块表达层级，优先用浅暖背景、白色内容面和明确边框。
- 如果视觉调整降低了区域区分度，优先补边框和表面层级，不优先继续加颜色。
