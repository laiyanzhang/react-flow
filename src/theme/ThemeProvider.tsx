import type { Theme } from '@/contexts/theme';
import { ThemeProviderContext } from '@/contexts/theme';
import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { getAntdTheme } from './antd-theme';
import { getCssVariables } from './theme-tokens';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = 'game-ui-theme',
  ...props
}: ThemeProviderProps) {
  // 获取系统主题偏好
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  const [theme, setTheme] = useState<Theme>(
    () =>
      (localStorage.getItem(storageKey) as Theme) || defaultTheme || systemTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // 添加主题类名
    root.classList.add(theme);

    // 应用CSS变量
    const cssVariables = getCssVariables(theme);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  // 获取antd主题配置
  const antdTheme = getAntdTheme(theme);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeProviderContext.Provider>
  );
}
