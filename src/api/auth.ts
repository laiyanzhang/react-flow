import { request } from './request';

export interface SmsCodeRequest {
  scene: string;
  phoneNumber: string;
}

export interface PhoneLoginRequest {
  type: string;
  info: {
    phoneNo: string;
    code: string;
  };
}

export interface LoginResponse {
  code: number;
  msg: string;
  success: boolean;
  traceId: string;
  body: {
    token: string;
    userId: string;
    userName: string;
  };
}

const loginHeader = {
  headers: {
    extinfo: JSON.stringify({ client_type: 'PC', biz_type: 'B' }),
  },
};

/**
 * 发送短信验证码
 * @param params 短信请求参数
 */
export const sendSmsCode = (params: SmsCodeRequest) => {
  return request('user-server/mobile/getSmsCode', params, loginHeader);
};

/**
 * 手机号登录
 * @param params 登录请求参数
 */
export const phoneLogin = (params: PhoneLoginRequest) => {
  return request<LoginResponse>('user-server/login', params, loginHeader);
};

/**
 * 用户登出
 * @param token 用户token
 */
export const logout = (token: string) => {
  return request(`user-server/logout?token=${token}`, null, loginHeader);
};
