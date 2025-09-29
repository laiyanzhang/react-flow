import { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  notification,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { sendSmsCode, phoneLogin } from '@/api/auth';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';
import logoImg from '@/assets/images/logo_ch.png';
import scanImg from '@/assets/images/scanImg.png';
import { X } from 'lucide-react';

interface AccountLoginFormValues {
  username: string;
  password: string;
}

interface PhoneLoginFormValues {
  phone: string;
  verificationCode: string;
}

type LoginFormValues = AccountLoginFormValues | PhoneLoginFormValues;

const assetsUrl = import.meta.env.VITE_APP_OSS_ASSETS

export function Login() {
  const { t } = useTranslation('login');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const phoneFormRef = useRef<FormInstance>(null);
  const { login } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    // 强制设置为 light 主题
    setTheme('light');

    return () => {
      // 组件卸载时恢复之前的主题
      const savedTheme = localStorage.getItem('theme') as
        | 'dark'
        | 'light'
        | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
  }, [setTheme]);

  useEffect(() => {
    if (loginError) {
      notification.open({
        type: 'error',
        message: t('auth:messages.warmReminder'),
        description: loginError,
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    }
  }, [loginError]);

  // 发送验证码
  const sendVerificationCode = async (phone: string) => {
    setLoginError('');

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setLoginError(t('auth:login.phoneError'));
      return;
    }

    try {
      await sendSmsCode({
        scene: 'LOGIN',
        phoneNumber: phone,
      });

      // 更新状态
      setVerificationCodeSent(true);
      setCountdown(60);

      message.success(t('auth:login.verificationCodeSent'));

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setVerificationCodeSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('发送验证码失败:', error);
      setLoginError(t('auth:login.sendCodeFailed'));
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setLoginError('');

    try {
      const phoneValues = values as PhoneLoginFormValues;
      const response: any = await phoneLogin({
        type: 'PHONE_NUM',
        info: {
          phoneNo: phoneValues.phone,
          code: phoneValues.verificationCode,
        },
      });

      if (response.code === 'SUCCESS') {
        await login();
        message.success(t('auth:login.success'));
        localStorage.setItem(
          'accessToken',
          JSON.stringify({
            value: response.data.token,
            expiration: response.data.expiredTime
          })
        )

        // 跳转到之前保存的页面或首页
        const redirectPath = sessionStorage.getItem('redirectPath');
        if (redirectPath && redirectPath !== '/login') {
          sessionStorage.removeItem('redirectPath');
          window.location.href = redirectPath;
        } else {
          window.location.href = '/';
        }
      } else {
        setLoginError(response.msg || t('auth:login.fail'));
      }
    } catch (error: any) {
      if(error.status === 'ACCESS_DENY') {
        setShowErrorOverlay(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.left}>
        <video
          src={`${assetsUrl}/assets/login/login.mp4`}
          poster={`${assetsUrl}/assets/login/login.png`}
          autoPlay
          muted
          loop
          webkit-playsinline="true"
          playsInline
          x5-video-player-type="h5-page"
        />
      </div>
      <div className={styles.right}>
        <div className={styles.logo}>
          <img src={logoImg} className={styles.icon} />
        </div>
        <div className={styles.loginContent}>
          <div className={styles.title}>欢迎登录因赛AI</div>
          <Form
            name='phone-login'
            onFinish={handleLogin}
            layout='vertical'
            className={styles.form}
            preserve={false}
            ref={phoneFormRef}>
            <Form.Item
              name='phone'
              rules={[
                {
                  required: true,
                  message: t('auth:login.requiredPhone'),
                },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: t('auth:login.phoneError'),
                },
              ]}
            >
              <Input
                placeholder={t('auth:login.requiredPhone')}
                maxLength={11}
                className='h-[45px]'
              />
            </Form.Item>

            <Form.Item
              name='verificationCode'
              rules={[
                {
                  required: true,
                  message: t('auth:login.codeRequired'),
                },
              ]}
            >
              <div className='flex gap-2'>
                <Input
                  placeholder={t('auth:login.verificationCode')}
                  className='h-[45px] flex-1'
                  maxLength={6}
                />
                <Button
                  onClick={() => {
                    const phone =
                      phoneFormRef.current?.getFieldValue('phone');
                    sendVerificationCode(phone);
                  }}
                  disabled={verificationCodeSent}
                  className={styles.verificateButton}
                >
                  {verificationCodeSent
                    ? `${t('auth:login.resendAfter', {
                        seconds: countdown,
                      })}`
                    : t('auth:login.getCode')}
                </Button>
              </div>
            </Form.Item>
            <div className={styles.tip}>*验证码有效期10分钟，请不要随意告诉他人</div>
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                className={styles.loginBtn}
                loading={loading}
                block
              >
                {t('auth:login.login')}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className={styles.msg}>研发单位保留对生成作品一切权利，如需使用，详询授权规则。</div>
      </div>
      {
        showErrorOverlay && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <img 
                src={scanImg} 
                className={styles.overlayImage}
              />
              <div 
                className={styles.overlayClose}
                onClick={() => setShowErrorOverlay(false)}
              >
                <X size={24} color="#fff"></X>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
