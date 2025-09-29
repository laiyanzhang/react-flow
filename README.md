# Game AI Editor

一个强大的 AI B端基座，帮助您创建智能、动态的agent角色和系统。

## 功能特性

- 🧠 **AI 行为树** - 可视化编辑 agent 行为逻辑，创建复杂的决策树
- 💻 **代码生成** - 自动生成多种编程语言的 agent 代码
- ⚡ **实时预览** - 即时查看 agent 行为效果，快速迭代优化
- 👥 **团队协作** - 支持多人协作编辑，提升开发效率

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 库**: Ant Design
- **样式框架**: Tailwind CSS
- **路由管理**: TanStack Router
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **HTTP 客户端**: Fetch

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
npm run start
# 或者
pnpm start
```

### 构建生产版本

```bash
npm run build
# 或者
pnpm build
```

## 项目结构

```
src/
├── pages/          # 页面组件
│   ├── Root.tsx    # 根页面（包含导航栏）
│   ├── Home.tsx    # 首页
│   ├── About.tsx   # 关于页面
│   ├── Login.tsx   # 登录页面
├── routes.tsx      # 路由配置
├── App.tsx         # 主应用组件
└── main.tsx        # 应用入口
```

## 路由说明

- `/` - 首页，展示项目介绍和主要功能
- `/login` - 登录页面，用户登录和注册

### 添加新页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/routes.tsx` 中添加新的路由配置
3. 在导航栏中添加对应的链接

### 样式指南

- 项目使用 Tailwind CSS 作为样式框架，所有组件都采用响应式设计。

## 许可证

MIT License
