# 国际化 (i18n) 使用指南

## 概述

本项目使用 `react-i18next` 进行国际化处理，支持中英文切换。翻译文件按功能模块组织，便于维护和扩展。

## 文件结构

```
src/i18n/
├── index.ts                 # i18n 配置文件
├── locales/
│   ├── en/                 # 英文翻译
│   └── zh/                 # 中文翻译
└── README.md               # 本说明文档
```

## 基本使用

### 1. 在组件中使用翻译

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### 2. 使用嵌套键值

```tsx
// 翻译文件中：
// {
//   "buttons": {
//     "save": "保存",
//     "cancel": "取消"
//   }
// }

const { t } = useTranslation();
return <button>{t('common:buttons.save')}</button>;
```

### 3. 使用插值

```tsx
// 翻译文件中：
// {
//   "welcome": "欢迎, {{name}}!"
// }

const { t } = useTranslation();
return <div>{t('common:welcome', { name: 'trival' })}</div>;
```

### 4. 语言切换

```tsx
import { useLanguage } from '@/hooks/use-language';

function LanguageButton() {
  const { changeLanguage, currentLanguage } = useLanguage();

  return (
    <button
      onClick={() =>
        changeLanguage(currentLanguage === 'zh-CN' ? 'en' : 'zh-CN')
      }
    >
      {currentLanguage === 'zh-CN' ? 'English' : '中文'}
    </button>
  );
}
```

### 语言切换器组件

```tsx
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

function Header() {
  return (
    <div className="header">
      <LanguageSwitcher />
    </div>
  );
}
```

### 自定义钩子

```tsx
import { useLanguage } from '@/hooks/use-language';

function MyComponent() {
  const { currentLanguage, changeLanguage, isEnglish, isChinese } =
    useLanguage();

  // 根据当前语言执行不同逻辑
  if (isEnglish) {
    // 英文逻辑
  }

  if (isChinese) {
    // 中文逻辑
  }
}
```
