/**
 * 主题令牌系统
 * 集中管理所有主题相关的颜色和样式变量
 */

// 基础颜色
const baseColors = {
  // 紫色系
  purple: {
    light: '#4155F0',
    dark: '#9d8cff',
  },
  // 背景色系
  bg: {
    light: '#ffffff',
    dark: '#1e1e2e',
  },
  // 前景色系
  fg: {
    light: '#1e1e2e',
    dark: '#ffffff',
  },
  // 卡片色系
  card: {
    light: '#ffffff',
    dark: '#27273a',
  },
  // 次要色系
  secondary: {
    light: '#f4f4f5',
    dark: '#2a2a3a',
  },
  // 边框色系
  border: {
    light: 'rgba(0, 0, 0, 0.06)',
    dark: 'rgba(255, 255, 255, 0.1)',
  },
  // 输入框色系
  input: {
    light: '#e4e4e7',
    dark: 'rgba(255, 255, 255, 0.15)',
  },
  // 功能色系
  functional: {
    // 成功
    success: {
      light: '#22c55e',
      dark: '#4ade80',
    },
    // 警告
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    // 错误
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
    // 信息
    info: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
};

// 主题令牌
export const themeTokens = {
  light: {
    // 基础颜色
    background: baseColors.bg.light,
    foreground: baseColors.fg.light,
    card: baseColors.card.light,
    cardForeground: baseColors.fg.light,
    popover: baseColors.card.light,
    popoverForeground: baseColors.fg.light,

    // 主题颜色
    primary: baseColors.purple.light,
    primaryForeground: '#ffffff',
    secondary: baseColors.secondary.light,
    secondaryForeground: '#18181b',
    muted: baseColors.secondary.light,
    mutedForeground: '#71717a',
    accent: baseColors.secondary.light,
    accentForeground: '#18181b',

    // 功能颜色
    destructive: baseColors.functional.error.light,
    destructiveForeground: '#ffffff',
    success: baseColors.functional.success.light,
    successForeground: '#ffffff',
    warning: baseColors.functional.warning.light,
    warningForeground: '#ffffff',
    info: baseColors.functional.info.light,
    infoForeground: '#ffffff',

    // 边框和输入
    border: baseColors.border.light,
    input: baseColors.input.light,
    ring: baseColors.purple.light,

    // 图表颜色
    chart1: baseColors.purple.light,
    chart2: baseColors.functional.success.light,
    chart3: baseColors.functional.info.light,
    chart4: baseColors.functional.warning.light,
    chart5: baseColors.functional.error.light,

    // 侧边栏
    sidebar: baseColors.bg.light,
    sidebarForeground: baseColors.fg.light,
    sidebarPrimary: baseColors.purple.light,
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: baseColors.secondary.light,
    sidebarAccentForeground: '#18181b',
    sidebarBorder: baseColors.border.light,
    sidebarRing: baseColors.purple.light,
  },
  dark: {
    // 基础颜色
    background: baseColors.bg.dark,
    foreground: baseColors.fg.dark,
    card: baseColors.card.dark,
    cardForeground: baseColors.fg.dark,
    popover: baseColors.card.dark,
    popoverForeground: baseColors.fg.dark,

    // 主题颜色
    primary: baseColors.purple.dark,
    primaryForeground: baseColors.bg.dark,
    secondary: baseColors.secondary.dark,
    secondaryForeground: baseColors.fg.dark,
    muted: baseColors.secondary.dark,
    mutedForeground: '#a1a1aa',
    accent: baseColors.secondary.dark,
    accentForeground: baseColors.fg.dark,

    // 功能颜色
    destructive: baseColors.functional.error.dark,
    destructiveForeground: baseColors.fg.dark,
    success: baseColors.functional.success.dark,
    successForeground: baseColors.fg.dark,
    warning: baseColors.functional.warning.dark,
    warningForeground: baseColors.fg.dark,
    info: baseColors.functional.info.dark,
    infoForeground: baseColors.fg.dark,

    // 边框和输入
    border: baseColors.border.dark,
    input: baseColors.input.dark,
    ring: baseColors.purple.dark,

    // 图表颜色
    chart1: baseColors.purple.dark,
    chart2: baseColors.functional.success.dark,
    chart3: baseColors.functional.info.dark,
    chart4: baseColors.functional.warning.dark,
    chart5: baseColors.functional.error.dark,

    // 侧边栏
    sidebar: baseColors.card.dark,
    sidebarForeground: baseColors.fg.dark,
    sidebarPrimary: baseColors.purple.dark,
    sidebarPrimaryForeground: baseColors.bg.dark,
    sidebarAccent: baseColors.secondary.dark,
    sidebarAccentForeground: baseColors.fg.dark,
    sidebarBorder: baseColors.border.dark,
    sidebarRing: baseColors.purple.dark,
  },
};

// 辅助函数：获取CSS变量映射
export const getCssVariables = (mode: 'light' | 'dark') => {
  const tokens = themeTokens[mode];
  return {
    // 基础
    '--background': tokens.background,
    '--foreground': tokens.foreground,
    '--card': tokens.card,
    '--card-foreground': tokens.cardForeground,
    '--popover': tokens.popover,
    '--popover-foreground': tokens.popoverForeground,

    // 主题
    '--primary': tokens.primary,
    '--primary-foreground': tokens.primaryForeground,
    '--secondary': tokens.secondary,
    '--secondary-foreground': tokens.secondaryForeground,
    '--muted': tokens.muted,
    '--muted-foreground': tokens.mutedForeground,
    '--accent': tokens.accent,
    '--accent-foreground': tokens.accentForeground,

    // 功能
    '--destructive': tokens.destructive,
    '--destructive-foreground': tokens.destructiveForeground,
    '--success': tokens.success,
    '--success-foreground': tokens.successForeground,
    '--warning': tokens.warning,
    '--warning-foreground': tokens.warningForeground,
    '--info': tokens.info,
    '--info-foreground': tokens.infoForeground,

    // 边框和输入
    '--border': tokens.border,
    '--input': tokens.input,
    '--ring': tokens.ring,

    // 图表
    '--chart-1': tokens.chart1,
    '--chart-2': tokens.chart2,
    '--chart-3': tokens.chart3,
    '--chart-4': tokens.chart4,
    '--chart-5': tokens.chart5,

    // 侧边栏
    '--sidebar': tokens.sidebar,
    '--sidebar-foreground': tokens.sidebarForeground,
    '--sidebar-primary': tokens.sidebarPrimary,
    '--sidebar-primary-foreground': tokens.sidebarPrimaryForeground,
    '--sidebar-accent': tokens.sidebarAccent,
    '--sidebar-accent-foreground': tokens.sidebarAccentForeground,
    '--sidebar-border': tokens.sidebarBorder,
    '--sidebar-ring': tokens.sidebarRing,
  };
};

// 辅助函数：获取Ant Design主题配置
export const getAntdTokens = (mode: 'light' | 'dark') => {
  const tokens = themeTokens[mode];
  return {
    colorPrimary: tokens.primary,
    colorBgBase: tokens.background,
    colorTextBase: tokens.foreground,
    borderRadius: 8,
    wireframe: false,
    // 组件级配置
    components: {
      Button: {
        colorPrimary: tokens.primary,
      },
      Input: {
        colorBgContainer:
          mode === 'light' ? tokens.background : tokens.secondary,
        colorBorder: tokens.border,
      },
      Select: {
        colorBgContainer:
          mode === 'light' ? tokens.background : tokens.secondary,
        colorBorder: tokens.border,
      },
      Menu: {
        colorItemBg: tokens.background,
        colorItemText: tokens.foreground,
        colorItemTextSelected: tokens.primary,
      },
      Card: {
        colorBgContainer: tokens.card,
      },
      Table: {
        colorBgContainer: tokens.card,
        colorText: tokens.foreground,
      },
      Tabs: {
        colorBgContainer: tokens.background,
      },
      Modal: {
        colorBgElevated: tokens.card,
      },
      Drawer: {
        colorBgElevated: tokens.card,
      },
      Popover: {
        colorBgElevated: tokens.card,
      },
    },
  };
};
