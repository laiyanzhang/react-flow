import React from 'react';
import { LogOut } from 'lucide-react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: t('auth.myAccount'),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: t('auth.logout'),
      icon: <LogOut />,
      extra: '⌘L',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === '4') {
      await logout();
    }
  };

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }}>
      <a className='flex gap-2 pl-5' onClick={e => e.preventDefault()}>
        {/* {t('common:auth.title')} */}
        <img
          className='w-8 h-8 rounded-full'
          src='https://game-ai-editor-videoassets-test.oss-cn-guangzhou.aliyuncs.com/user_in/3a1be91c-a0a1-49dc-89da-6e8d2069ade1.png'
        />
      </a>
    </Dropdown>
  );
};

export default UserMenu;
