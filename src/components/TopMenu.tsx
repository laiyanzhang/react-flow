import { SettingsIcon } from 'lucide-react';
import ThemeButton from '@/theme/ThemeButton';
import LanguageSwitcher from './common/LanguageSwitcher';
import UserMenu from './auth/UserMenu';

export default function TopMenu({ right }: { right?: React.ReactNode }) {
  return (
    <div className='sticky top-0 z-0 flex w-full h-20 bg-background px-4 justify-between items-center select-none border-b border-border'>
      <div />
      <div className='flex items-center gap-4'>
        {right}
        <SettingsIcon size={24} />
        <LanguageSwitcher />
        <ThemeButton />
        <UserMenu />
      </div>
    </div>
  );
}
