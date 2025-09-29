import { useLanguage } from '@/hooks/use-language';
import { Dropdown, type MenuProps } from 'antd';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { changeLanguage } = useLanguage();

  const items: MenuProps['items'] = [
    {
      key: 'zh-CN',
      label: <a target='_blank'>简体中文</a>,
      onClick: () => changeLanguage('zh-CN'),
    },
    {
      key: 'en',
      label: <a target='_blank'>English</a>,
      onClick: () => changeLanguage('en'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement='bottomLeft'>
      <Languages size={24} />
    </Dropdown>
  );
};

export default LanguageSwitcher;
