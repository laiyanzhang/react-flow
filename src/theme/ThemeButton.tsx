import { useTheme } from '@/hooks/use-theme';
import { MoonIcon, SunIcon } from 'lucide-react';

const ThemeButton: React.FC = () => {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className='rounded-md p-2 hover:bg-secondary transition-colors'
      title={`当前主题: ${theme === 'dark' ? '暗色' : '亮色'}`}
    >
      {theme === 'dark' ? (
        <SunIcon size={20} className='text-foreground' />
      ) : (
        <MoonIcon size={20} className='text-foreground' />
      )}
    </button>
  );
};

export default ThemeButton;
