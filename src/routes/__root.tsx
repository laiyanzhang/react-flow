import ErrorBoundary from '@/components/common/ErrorBoundary';
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthGuard } from '@/components/auth/AuthGuard';
import HeaderBar from '../components/HeaderBar';

// 不需要显示 HeaderBar 的页面路径
const noHeaderPaths = ['/login'];

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    const showHeader = !noHeaderPaths.includes(location.pathname);
    
    return (
      <AuthGuard>
        {showHeader && <HeaderBar />}
        <Outlet />
        <TanStackRouterDevtools position='bottom-right' />
      </AuthGuard>
    );
  },
  errorComponent: ErrorBoundary,
});
