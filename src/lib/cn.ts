import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并多个类名，并使用tailwind-merge处理冲突
 * @param inputs 类名列表
 * @returns 合并后的类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
