import { useGlobalStore } from '@/store/global';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  LayoutDashboard,
  Database,
  FileText,
  Bot,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  badge?: {
    text: string;
    variantClass?: string;
    variant: 'ai' | 'new' | 'pro' | 'beta';
  };
  onClick?: () => void;
  active?: boolean;
}

const SlideLeft: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useGlobalStore();
  const { t } = useTranslation('sidebar');
  const navigator = useNavigate();

  const menuItems: MenuItem[] = [
    {
      icon: <Home size={18} />,
      label: t('menu.dashboard'),
      active: true,
      onClick: () => {
        navigator({
          to: '/',
        });
      },
    },
    {
      icon: <Bot size={18} />,
      label: t('menu.aiMember'),
      badge: {
        text: 'ai',
        variant: 'ai' as const,
        variantClass: 'bg-info',
      },
      onClick: () => {
        navigator({
          to: '/agent',
        });
      },
    },
    {
      icon: <Users size={18} />,
      label: t('menu.aiGroups'),
      badge: {
        text: t('badges.new'),
        variant: 'new' as const,
        variantClass: 'bg-info',
      },
      onClick: () => {
        navigator({
          to: '/groups',
        })
      },
    },
    {
      icon: <LayoutDashboard size={18} />,
      label: t('menu.workflow'),
      badge: {
        text: t('badges.pro'),
        variant: 'pro' as const,
        variantClass: 'bg-warning',
      },
      onClick: () =>
        navigator({
          to: '/xflow',
        }),
    },
    {
      icon: <Database size={18} />,
      label: t('menu.aiMarket'),
      badge: {
        text: t('badges.beta'),
        variant: 'beta' as const,
        variantClass: 'bg-accent',
      },
      onClick: () => {},
    },
    {
      icon: <FileText size={18} />,
      label: t('menu.materialLibrary'),
      onClick: () => {},
    },
    {
      icon: <FileText size={18} />,
      label: t('menu.knowledgeBase'),
    },
    {
      icon: <Users size={18} />,
      label: t('menu.projectCenter'),
    },
  ];

  // 侧边栏宽度状态
  const expandedWidth = 200;
  const collapsedWidth = 60;

  return (
    <motion.div
      className={cn(
        'h-full flex flex-col',
        'bg-sidebar text-sidebar-foreground border-r border-sidebar-border'
      )}
      initial={{ width: sidebarOpen ? expandedWidth : collapsedWidth }}
      animate={{ width: sidebarOpen ? expandedWidth : collapsedWidth }}
      transition={{ duration: 0.3, ease: 'linear' }}
    >
      {/* 顶部标题区域 */}
      <div className='p-4 flex items-center justify-between border-b border-sidebar-border'>
        {sidebarOpen ? (
          <div className='flex items-center'>
            <h1 className='text-lg font-bold'>GameAI Editor</h1>
          </div>
        ) : (
          <div className='w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center mx-auto'>
            <span className='text-sidebar-primary-foreground font-bold'>G</span>
          </div>
        )}

        {/* 折叠按钮 */}
        <button
          onClick={toggleSidebar}
          className='p-1 rounded hover:bg-sidebar-accent transition-colors'
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* 菜单项 */}
      <div className='flex-1 overflow-y-auto py-2'>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center px-4 py-3 cursor-pointer transition-colors',
              item.active ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
            )}
            onClick={item?.onClick}
          >
            <div className='flex items-center justify-center w-6 h-6'>
              {item.icon}
            </div>

            {sidebarOpen && (
              <div className='ml-3 flex-1 flex items-center justify-between'>
                <span className='min-w-20'>{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                      item.badge.variantClass
                    )}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部状态区域 */}
      <div className='p-4 border-t border-sidebar-border'>
        {sidebarOpen ? (
          <div className='text-sm text-sidebar-foreground/70'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-green-400 rounded-full mr-2'></div>
              <span className='min-w-10'>{t('status.systemRunning')}</span>
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <div className='w-2 h-2 bg-green-400 rounded-full'></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SlideLeft;
