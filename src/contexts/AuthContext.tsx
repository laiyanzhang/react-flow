/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';
import { logout as apiLogout } from '@/api/auth';

interface AuthStatus {
  status: 'logged_in' | 'logged_out';
  tokenExpired: boolean;
}

interface AuthContextType {
  authStatus: AuthStatus;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    status: 'logged_out',
    tokenExpired: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      // 检查本地存储中是否有登录信息
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      // 模拟获取认证状态
      const status: AuthStatus = {
        status: isLoggedIn ? 'logged_in' : 'logged_out',
        tokenExpired: false,
      };

      // 检查token是否过期
      if (status.tokenExpired) {
        message.error('登录状态已过期，请重新登录', 5000);
        // 清除登录状态
        localStorage.removeItem('isLoggedIn');
      }

      setAuthStatus(status);
    } catch (error) {
      console.error('获取认证状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 登录函数
  const login = async () => {
    localStorage.setItem('isLoggedIn', 'true');
    await refreshAuth();
  };

  // 登出函数
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiLogout(token);
      }
    } catch (error) {
      console.error('登出接口调用失败:', error);
    } finally {
      // 清理除主题外的所有缓存
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) {
        localStorage.setItem('theme', theme);
      }

      // 清除cookie
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });

      await refreshAuth();

      // 跳转到登录页
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authStatus, isLoading, refreshAuth, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
