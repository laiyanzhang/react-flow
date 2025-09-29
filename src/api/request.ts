import { message, Modal } from 'antd';
import * as Cookie from '@/utils/cookie';
import { encodeReplace } from '@/utils'; // 假设这是一个将参数编码的工具函数

type RequestConfig = RequestInit & {
  timeout?: number;
  fullUrl?: string;
};

export type CustomResponse<T = any> = {
  code: number;
  msg: string;
  success: boolean;
  traceId: string;
  body: T;
};

export type MyResponse<T = any> = Promise<CustomResponse<T> | Blob>;

const ERROR_CODE = {
  SERVER_ERROR: 500,
  NETWORK_ERROR: 502, // 通常是网关错误
  AUTHORIZE_ERROR: 401,
  TIMEOUT_ERROR: 'ECONNABORTED', // 自定义超时错误代码
};

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_PREFIX_URL = import.meta.env.VITE_PREFIX_URL;
const VITE_API_BASE_URL_OLD = import.meta.env.VITE_API_BASE_URL_OLD;

/**
 * 核心 fetch 请求封装
 */
async function http<T>(
  url: string,
  options: RequestConfig = {}
): MyResponse<T> {
  const {
    headers: optionHeaders,
    signal: externalSignal,
    ...restOptions
  } = options;

  const finalConfig: RequestConfig = {
    method: 'POST', // 默认方法
    timeout: 140000,
    ...restOptions,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...optionHeaders,
    },
  };

  const config = await requestInterceptor(finalConfig);

  // --- AbortController 实现超时和取消 ---
  const controller = new AbortController();
  const internalSignal = controller.signal;

  let fetchSignal = internalSignal;
  let combinedController: AbortController | null = null;

  if (externalSignal) {
    combinedController = new AbortController();
    fetchSignal = combinedController.signal;

    // 监听外部 signal
    externalSignal.addEventListener('abort', () => {
      combinedController!.abort(externalSignal.reason);
    });

    // 监听内部 signal (超时)
    internalSignal.addEventListener('abort', () => {
      combinedController!.abort(internalSignal.reason);
    });
  }

  const timeoutPromise = (timeout: number) =>
    new Promise((_, reject) => {
      setTimeout(() => {
        controller.abort();
        // 如果使用了组合控制器，也需要中止它
        if (combinedController) {
          combinedController.abort();
        }
        reject(new Error('Request timed out'));
      }, timeout);
    });

  try {
    const response = (await Promise.race([
      fetch(url, { ...config, signal: fetchSignal }),
      timeoutPromise(config.timeout!),
    ])) as Response;

    return await responseInterceptor<T>(response);
  } catch (error) {
    return handleAjaxError(error);
  }
}

async function requestInterceptor(
  config: RequestConfig
): Promise<RequestConfig> {
  if (config.method?.toUpperCase() === 'GET' && config.body) {
    // 在实际调用时，我们会将 params 放在 url 上，这里只是一个示例
    // 真正的参数拼接在下面的 `request` 函数中处理
  }

  const headers = new Headers(config.headers); // 使用 Headers 对象更规范
  const cookieToken = Cookie.getCookie();
  if (cookieToken) {
    headers.set('token', cookieToken);
  }

  const storeData = JSON.parse(localStorage.getItem('accessToken') || '{}');
  let currentTime = new Date().getTime();
  if (currentTime > storeData.expiration) {
    // 数据已过期，清除
    localStorage.removeItem('accessToken');
  } else {
    headers.set('token', storeData.value);
  }

  headers.set('accept-language', localStorage.getItem('locale') || 'zh_CN');

  const accountInfoStr = localStorage.getItem('accountInfo') || '{}';
  try {
    const accountInfo = JSON.parse(accountInfoStr) as { token: string } | null;
    if (accountInfo?.token) {
      headers.set('Authorization', `Bearer ${accountInfo.token}`);
    }
  } catch (e) {
    console.error('Failed to parse accountInfo from localStorage', e);
  }

  config.headers = headers;
  return config;
}

async function responseInterceptor<T>(response: Response): MyResponse<T> {
  // Blob 类型响应，直接返回
  const contentType = response.headers.get('Content-Type');
  if (
    contentType &&
    (contentType.includes('text/event-stream') ||
      contentType.includes('application/octet-stream'))
  ) {
    return response as unknown as MyResponse<T>;
  }

  const data: CustomResponse<T> = await response.json();
  message.destroy();

  if (data.code === 200 || data.code === ('SUCCESS' as any)) {
    return data;
  } else if (data.code === -1) {
    Modal.error({
      title: '温馨提示',
      content: '该账号已在别处登录，您被迫下线',
      okText: '确认',
      okButtonProps: { className: 'w-56' },
      afterClose: () => {
        Cookie.removeCookie();
        location.replace('/login');
        location.reload();
      },
    });
    return Promise.reject(data);
  } else if (
    data.code === ('USER_SESSION_EXPIRED' as any) ||
    data.code === ('USER_NOT_LOGIN' as any)
  ) {
    sessionStorage.setItem(
      'cbPath',
      window.location.pathname + window.location.search
    );
    Cookie.removeCookie();
    message.error(data.msg);
    setTimeout(() => location.replace('/login'), 100);
    return Promise.reject(data);
  } else {
    return Promise.reject(data);
  }
}

/**
 * 统一错误处理
 */
function handleAjaxError(error: any): Promise<any> {
  let errorMessage = '服务器内部错误，请稍后重试！';
  let status = error.status || ERROR_CODE.SERVER_ERROR;

  // 设置接口返回错误信息为第一优先级
  if (error.msg) {
    errorMessage = error.msg;
    status = error.code;
  } else if (error.name === 'AbortError') {
    errorMessage = '请求超时，请稍后重试！';
    status = ERROR_CODE.TIMEOUT_ERROR;
  } else if (!error.response) {
    errorMessage = '网络问题，请检查您的网络连接！';
    status = ERROR_CODE.NETWORK_ERROR;
  } else {
    status = error.response.status;
    const data = error.response.data;
    if (typeof data === 'object' && typeof data?.error === 'string') {
      errorMessage = data.error;
    }
  }

  if (status === ERROR_CODE.AUTHORIZE_ERROR) {
    sessionStorage.setItem(
      'cbPath',
      window.location.pathname + window.location.search
    );
    Cookie.removeCookie();
    errorMessage = '登录已过期，请重新登录！';
    setTimeout(() => location.replace('/login'), 100);
  }

  if (
    typeof errorMessage === 'string' &&
    errorMessage.includes('!DOCTYPE html')
  ) {
    errorMessage = '服务器返回了非预期的HTML页面，可能是一个错误页。';
  }

  message.error(errorMessage);

  return Promise.reject({ message: errorMessage, status });
}

/**
 * 统一请求入口
 * @param url - 请求的相对路径
 * @param data - 请求数据或参数
 * @param config - 请求配置
 */
export const request = <T = any>(
  url: string,
  data?: any,
  config: Omit<RequestConfig, 'body'> = {}
): MyResponse<T> => {
  // 暂时兼容主网站的登录以及上传相关请求baseUrl
  let baseUrl = '';
  if (url.includes('user-server') || url.includes('image/upload'))
    baseUrl = VITE_API_BASE_URL_OLD;
  else baseUrl = VITE_API_BASE_URL + VITE_PREFIX_URL;
  const fullUrl = config.fullUrl ? config.fullUrl : `${baseUrl}${url}`;
  const method = config.method?.toUpperCase() || 'POST'; // 默认为 POST

  if (method === 'GET') {
    const finalUrl = new URL(fullUrl);
    if (data) {
      const processedParams = encodeReplace(data);
      finalUrl.search = new URLSearchParams(processedParams).toString();
    }
    return http<T>(finalUrl.toString(), { ...config, method: 'GET' });
  } else {
    if (data instanceof FormData) {
      // 对于 FormData，直接传递，不进行 JSON 序列化
      return http<T>(fullUrl, {
        ...config,
        method: method,
        body: data, // 直接使用 FormData 作为请求体
      });
    } else {
      // 其他情况保持原来的逻辑
      return http<T>(fullUrl, {
        ...config,
        method: method,
        body: JSON.stringify(data),
      });
    }
  }
};

export const get = <T = any>(
  url: string,
  params?: any,
  config?: Omit<RequestConfig, 'body'>
): MyResponse<T> => {
  return request<T>(url, params, { ...config, method: 'GET' });
};

export const post = <T = any>(
  url: string,
  data?: any,
  config?: Omit<RequestConfig, 'body'>
): MyResponse<T> => {
  return request<T>(url, data, { ...config, method: 'POST' });
};
