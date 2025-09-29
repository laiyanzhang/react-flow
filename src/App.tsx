import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from '@/hooks/use-theme';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/i18n';
import '@/assets/style/App.css';
import '@/assets/style/index.css';

import { router } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // 失败重试次数
      refetchOnWindowFocus: true, // 窗口聚焦时刷新数据
      staleTime: 1000 * 60 * 5, //  5 minutes 数据新鲜时间
    },
  },
});

function App() {
  const { theme } = useTheme();

  return (
    <ThemeProvider defaultTheme={theme} storageKey='vite-ui-theme'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className='app-container min-h-screen bg-background text-foreground'>
            <RouterProvider router={router} />
          </div>

          {/* Update Notification Dialog */}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
