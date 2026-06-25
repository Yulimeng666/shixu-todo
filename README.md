# WarmList

一个本地优先的个人待办网站，用来记录日程、管理任务分类，并在简洁的暖色工作区中完成日常安排。

## 项目简介

WarmList 是一个基于 React + TypeScript + Vite 构建的个人待办应用，面向单人使用场景。第一版聚焦本地数据保存与高频任务管理，不接入登录、云同步或团队协作。

项目当前支持：

- 待办新增、编辑、删除
- 完成 / 取消完成任务
- 今天、未来、全部、已完成视图
- 开始日期、截止日期、优先级、备注
- 全局分类体系
- 搜索、筛选、排序
- IndexedDB 本地持久化
- 暖色调工作区 UI

## 推荐的 GitHub 项目信息

推荐仓库名：

`warmlist`

推荐一句话描述：

`一个本地优先的个人待办应用，支持全局分类、暖色工作区界面和 IndexedDB 持久化。`

如果你更想强调中文语义，也可以用：

- `personal-todo-dashboard`
- `local-first-todo`
- `warm-todo-workspace`

## 设计定位

- 个人待办管理，不做团队协作
- 本地优先，不依赖后端即可使用
- 简洁效率型工具，不是营销展示页
- 暖色主题，但通过清晰边框区分导航、工具栏、状态区和任务列表区

## 核心功能

### 任务管理

- 新增任务
- 编辑任务
- 删除任务
- 标记完成 / 取消完成

### 任务字段

- 标题
- 备注
- 开始日期
- 截止日期
- 优先级
- 分类

### 视图与筛选

- 今天
- 未来
- 全部
- 已完成
- 搜索
- 按优先级筛选
- 按日期筛选
- 按完成状态筛选
- 按分类筛选
- 按截止日期 / 优先级 / 创建时间排序

### 分类体系

预置分类：

- 默认
- 工作
- 生活
- 学习
- 购物

分类规则：

- 左侧分类栏是分类主入口
- 可新增分类
- 可删除非默认分类
- 删除分类后，相关任务自动回收到 `默认`
- 未选择分类的任务自动归入 `默认`

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Dexie.js
- IndexedDB
- date-fns
- lucide-react
- Vitest
- React Testing Library

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test -- --run
```

## 项目结构

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

## 数据方案

- 使用 Zustand 管理业务状态
- 使用 Dexie.js 封装 IndexedDB 访问
- Todo 数据本地保存
- Category 数据本地保存
- 应用启动时自动初始化预置分类

## 文档说明

项目内包含以下核心文档：

- [PRD.md](D:/develop/个人作品集/test7(待办网站)/PRD.md)：产品需求
- [TECH_DESIGN.md](D:/develop/个人作品集/test7(待办网站)/TECH_DESIGN.md)：技术设计
- [TASKS.md](D:/develop/个人作品集/test7(待办网站)/TASKS.md)：开发阶段顺序
- [AGENTS.md](D:/develop/个人作品集/test7(待办网站)/AGENTS.md)：开发规范

## 当前状态

当前版本已经完成：

- 全局分类体系
- 左侧分类栏交互
- 今天视图默认补截止日期
- 开始日期录入与展示
- 暖色主题与分区边框优化

## 后续可扩展方向

- 登录与账号体系
- 云同步
- 多端同步
- 分类重命名
- 拖拽排序
- 日历视图

## License

当前仓库未声明开源协议。如果你准备公开发布到 GitHub，建议补充 `MIT` 或你自己的许可证文件。
