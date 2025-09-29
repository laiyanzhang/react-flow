import { useNavigate } from '@tanstack/react-router';
import UserMenu from './auth/UserMenu';
import { Tabs } from 'antd';
import styles from './index.module.less';
import { useState } from 'react';
import logo from '@/assets/images/logo.png';

type TabItem = {
  key: string;
  label: string;
  disabled?: boolean;
  children: null;
  path?: string;
};

const items: TabItem[] = [
  /* {
    key: '1',
    label: '工作台',
    children: null,
  }, */
  {
    key: '2',
    label: 'AI员工',
    children: null,
    path: '/agent',
  },
  {
    key: '3',
    label: 'AI群组',
    children: null,
    path: '/groups',
  },
  {
    key: '4',
    disabled: true,
    label: '工作流',
    children: null,
  },
  {
    key: '5',
    disabled: true,
    label: 'AI市场',
    children: null,
  },
  {
    key: '6',
    disabled: true,
    label: '工具库',
    children: null,
  },
  {
    key: '7',
    disabled: false,
    label: '素材库',
    children: null,
    path: '/material',
  },
  {
    key: '8',
    disabled: true,
    label: '知识',
    children: null,
  },
  {
    key: '9',
    disabled: true,
    label: '项目中心',
    children: null,
  },
];

export default function HeaderBar() {
  const navigate = useNavigate();
  const activeTab = items.find(item =>
    window.location.pathname.includes(item.path || '~~')
  )?.key;

  const [activeKey, setActiveKey] = useState(activeTab || '1');
  const onChange = (key: string) => {
    setActiveKey(key);
    const item = items.find(item => item.key === key);
    if (item?.disabled) {
      return;
    }
    if (item?.path) {
      navigate({ to: item.path });
    }
  };
  return (
    <div className='sticky top-0 z-50 flex w-full h-16 bg-background px-4 justify-between items-center select-none border-b border-black-400'>
      <div className={styles.headerLogo}>
        <img src={logo}/>
        <div className={styles.text}>引爆流量，从影流开始</div>
      </div>
      <div className='justify-center flex items-center gap-4'>
        <Tabs
          activeKey={activeKey}
          className={styles['header-bar-tabs']}
          items={items}
          onChange={onChange}
        />
      </div>
      <div className='w-56 flex justify-end'>
        <UserMenu />
      </div>
    </div>
  );
}
