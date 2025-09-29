import { request } from './request';

const VITE_OSS_URL = import.meta.env.VITE_OSS_URL;
export function upload(data: any) {
  return request(
    `${VITE_OSS_URL}/image/upload`,
    data, {
      fullUrl: `${VITE_OSS_URL}/image/upload`,
    },
  )
}

export const getStsToken = (params: any) => {
  return request('upload/sts/token', params)
}