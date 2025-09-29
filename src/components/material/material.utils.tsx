import React from 'react';
import type { ResourceType, MaterialItem } from '@/api/material';

export const emumResourceType = (fileName: string): any => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return 'UNKNOWN';

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return 'IMAGE';
  }
  if (
    ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpeg'].includes(
      extension
    )
  ) {
    return 'VIDEO';
  }
  if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma'].includes(extension)) {
    return 'AUDIO';
  }
  if (
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'].includes(
      extension
    )
  ) {
    return 'DOCUMENT';
  }
  return 'UNKNOWN';
};

// 辅助函数：根据文件类型显示标签
export const getFileTypeTag = (resourceType: ResourceType): React.ReactNode => {
  let tagText = '';
  /* let bgColorClass = ''; */
  switch (resourceType) {
    case 'IMAGE':
      tagText = '图片';
      /* bgColorClass = 'bg-blue-500'; */
      break;
    case 'VIDEO':
      tagText = '视频';
      /* bgColorClass = 'bg-green-500'; */
      break;
    case 'AUDIO':
      tagText = '音频';
      /* bgColorClass = 'bg-purple-500'; */
      break;
    case 'DOCUMENT':
      tagText = '文档';
      /* bgColorClass = 'bg-orange-500'; */
      break;
    default:
      return null;
  }
  return (
    <span
      className={`absolute top-2 left-2 rounded text-xs px-2 py-1 bg-black/45 backdrop-blur-3xl text-white
               opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    >
      {tagText}
    </span>
  );
};

// 辅助函数：渲染音视频时长
export const renderDuration = (item: any): React.ReactNode => {
  if (
    (item.resourceType === 'VIDEO' || item.resourceType === 'AUDIO') &&
    typeof item.duration === 'number'
  ) {
    const minutes = Math.floor(item.duration / 60);
    const seconds = Math.floor(item.duration % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return (
      <span className='absolute bottom-[58px] right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-70 rounded'>
        {`${minutes}:${formattedSeconds}`}
      </span>
    );
  }
  return null;
};

/**
 * 素材项的骨架屏组件
 */
export const MaterialItemSkeleton: React.FC = () => (
  <div className='relative w-[210px] h-[210px] rounded-lg overflow-hidden bg-gray-200 animate-pulse'>
    <div className='absolute bottom-0 left-0 right-0 p-2'>
      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
    </div>
  </div>
);

export const handleDownload = async (item: MaterialItem) => {
  try {
    const response = await fetch(item.originUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const defaultFileName = `file.${item.format || 'bin'}`; // 'bin' 作为未知格式的默认后缀
    a.download = item.title
      ? `${item.title}.${item.format || ''}`
      : defaultFileName;

    document.body.appendChild(a); // 某些浏览器需要将元素添加到DOM中才能触发点击
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // 释放内存
  } catch (error) {}
};
