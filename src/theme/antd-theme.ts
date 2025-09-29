import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import { getAntdTokens } from './theme-tokens';

type ThemeMode = 'light' | 'dark';

// 生成Antd主题配置
export const getAntdTheme = (themeMode: ThemeMode): ThemeConfig => {
  const isDark = themeMode === 'dark';
  const tokens = getAntdTokens(themeMode);

  return {
    token: {
      colorPrimary: tokens.colorPrimary,
      colorBgBase: tokens.colorBgBase,
      colorTextBase: tokens.colorTextBase,
      borderRadius: tokens.borderRadius,
      wireframe: tokens.wireframe,
    },
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    components: tokens.components,
  };
};
