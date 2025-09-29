import { createRouter, createRoute, redirect } from '@tanstack/react-router';
import { Login } from './routes/login/index';
import { Route as rootRoute } from './routes/__root';
import { Robot } from './routes/Robot';
import XFlow from './routes/XFlow';
import Groups from './routes/groups/index';
import Agent from './routes/agents/index';
import { Material } from './routes/Material';
import { useChatStore } from './store/chatStore';
import { useCanvasStore } from './store/canvasStore';

// 定义需要清空的字段
const FIELD_TO_CLEAR = 'conversationId';
const storeRoutes = ['/groups', '/agent']

// 记录当前路径
let currentPath: string | null = null;

// 初始化路径
if (typeof window !== 'undefined') {
  currentPath = window.location.pathname;
}

// Define routes in one place for scalability
const routeDefs = [
  /* ['/', Index], */
  ['/login', Login],
  ['/robot', Robot],
  ['/xflow', XFlow],
  ['/groups', Groups],
  ['/agent', Agent],
  ['/material', Material],
] as const;

const childRoutes = routeDefs.map(([path, component]) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
  })
);

// 创建一个重定向路由
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/agent' });
  },
});

const routeTree = rootRoute.addChildren([...childRoutes, indexRoute]);

export const router = createRouter({ routeTree });

// 同时添加全局监听
router.subscribe("onBeforeNavigate", (match) => {
  const name = match.toLocation.pathname;
  if (
    typeof window !== 'undefined' &&
    storeRoutes.includes(name) &&
    currentPath !== name
  ) {
    localStorage.removeItem(FIELD_TO_CLEAR);
    currentPath = name;
    useChatStore.getState().actions.reset();
    useCanvasStore.getState().actions.reset();
  }
});


declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}