import React, { useState, useCallback, useMemo } from 'react';
import { Button, message, Image, Spin, Empty } from 'antd';
import { Plus } from 'lucide-react';
import type { ResourceType, MaterialItem } from '@/api/material';
import UploadModal from '@/components/common/uploadFile';
import InfiniteScroll from 'react-infinite-scroll-component';
import { uploadMaterial, deleteMaterial } from '@/api/material';
import { emumResourceType, handleDownload } from './material.utils';
import VideoMaterial from './videoItem';
import AudioMaterial from './audioItem';
import DocumentMaterial from './documentItem';

import {
  getFileTypeTag,
  renderDuration,
  MaterialItemSkeleton,
} from './material.utils';
import { useMaterials } from '@/hooks/useMaterials';

interface MaterialListProps {
  isModal?: boolean;
  onSelect?: (item: MaterialItem) => void;
}

interface MaterialCardWrapperProps extends MaterialListProps {
  item: MaterialItem;
  children: React.ReactNode;
  handleSelect?: (item: any) => void;
  handleDelete: (item: any) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelectChange?: (item: MaterialItem, selected: boolean) => void;
}

export const MaterialCardWrapper: React.FC<MaterialCardWrapperProps> = ({
  item,
  isModal,
  handleSelect,
  handleDelete,
  children,
  isSelectMode = false,
  isSelected = false,
  onSelectChange,
}) => {
  return (
    <div className='w-full'>
      <div
        key={item.id}
        className={`relative aspect-square rounded-lg overflow-hidden shadow-md group ${
          isSelectMode ? 'cursor-default' : 'cursor-pointer'
        }`}
        onClick={() => {
          // 在选择模式下，不处理容器的点击事件，避免与checkbox重复触发
          if (!isSelectMode && isModal) {
            handleSelect?.(item);
          }
        }}
      >
        {children}
        {getFileTypeTag(item.resourceType)}
        {renderDuration(item)}

        {/* 选择模式下显示checkbox */}
        {isSelectMode ? (
          <>
            <div className='absolute top-2 right-2 z-10'>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={e => {
                  e.stopPropagation();
                  onSelectChange?.(item, e.target.checked);
                }}
                className='w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500'
              />
            </div>
            {/* 选中状态的遮罩 */}
            {isSelected && (
              <div className='absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg' />
            )}
          </>
        ) : (
          /* 非选择模式下显示操作按钮 */
          <div className='absolute bottom-3 right-3 z-10 group-hover:bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
            <div className='flex space-x-2'>
              <div
                className='bg-black/45 w-[32px] h-[32px] p-1 rounded cursor-pointer flex items-center justify-center text-white hover:bg-black'
                onClick={e => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                title='下载'
              >
                <i className='iconfont icon-download text-lg ' />
              </div>
              <div
                className='bg-black/45 w-[32px] h-[32px] p-1 rounded cursor-pointer flex items-center justify-center text-white hover:bg-black'
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                title='删除'
              >
                <i className='iconfont icon-delete text-lg ' />
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className='py-2 text-sm truncate line-clamp-2'
        title={item.title || ''}
      >
        {item.title || `未命名.${item.format || ''}`}
      </div>
    </div>
  );
};

const ImageMaterial: React.FC<any> = ({ item, ...rest }) => {
  return (
    <MaterialCardWrapper item={item} {...rest}>
      <Image
        src={item.originUrl}
        alt={item.title || 'Material Image'}
        height='100%'
        className='w-full h-full object-cover  transform transition-transform duration-300 ease-in-out group-hover:scale-110' // 添加悬浮放大效果
        preview={{ mask: false }}
        onError={e => {
          (e.target as HTMLImageElement).src = '/path/to/placeholder-image.png'; // 替换为你的默认图片路径
          (e.target as HTMLImageElement).alt = '图片加载失败';
        }}
      />
    </MaterialCardWrapper>
  );
};

const MaterialList: React.FC<MaterialListProps> = ({
  isModal = false,
  onSelect,
}) => {
  const [activeTab, setActiveTab] = useState<ResourceType | 'ALL'>('ALL');
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading, // 仅在首次加载时为 true，用于显示骨架屏
    isFetchingNextPage, // 加载下一页时为 true
    isError,
    refetch,
  } = useMaterials(activeTab);

  const materials = useMemo(
    () => data?.pages.flatMap(page => page.dataList) ?? [],
    [data]
  );

  if (isError) {
    message.error(`获取素材列表失败: ${(error as Error).message}`);
  }

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as ResourceType | 'ALL');
  }, []);

  const handleDelete = useCallback(
    (item: MaterialItem) => {
      deleteMaterial(item.id).then((res: any) => {
        if (res.code === 'SUCCESS') {
          refetch();
        } else {
          message.error(res.msg || '删除失败');
        }
      });
    },
    [refetch]
  );

  const handleUploadSuccess = useCallback(async (fileList: any[]) => {
    setUploadVisible(false);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const uploadPromises = fileList.map(file => {
      const resourceType = emumResourceType(file.name);

      if (resourceType === 'UNKNOWN') {
        return Promise.resolve({
          success: false,
          fileName: file.name,
          message: '未知文件类型',
        });
      }

      return uploadMaterial({
        resourceType: resourceType,
        title: file.name,
        originUrl: file.url,
        size: file.size,
      })
        .then(response => ({ success: true, fileName: file.name, response }))
        .catch(error => ({ success: false, fileName: file.name, error }));
    });

    try {
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter(res => res.success);
      const failedUploads = results.filter(res => !res.success && res.fileName); // 过滤掉 'UNKNOWN' 类型的 Promise.resolve

      if (successfulUploads.length > 0) {
        message.success(`${successfulUploads.length} 个文件上传成功！`);
        await refetch();
      }

      if (failedUploads.length > 0) {
        const failedFileNames = failedUploads
          .map(res => res.fileName)
          .join(', ');
        message.error(
          `${failedUploads.length} 个文件上传失败：${failedFileNames}`
        );
        failedUploads.forEach((res: any) => {
          console.error(`文件 ${res.fileName} 上传失败:`, res.msg);
        });
      }
      if (
        successfulUploads.length === 0 &&
        failedUploads.length === 0 &&
        fileList.length > 0
      ) {
        message.info('所有文件均因类型未知被跳过上传～');
      }
    } catch (error) {
      // 捕获 Promise.all 本身可能发生的错误，例如某个 Promise 没有正确返回
      message.error('上传过程中发生未知错误。');
      console.error('Promise.all 错误:', error);
    }
  }, []);

  const handleSelect = useCallback(
    (item: MaterialItem) => {
      onSelect?.(item);
    },
    [onSelect]
  );

  const renderMaterialItem = useCallback(
    (item: MaterialItem): React.ReactNode => {
      const commonProps = {
        item,
        isModal,
        handleSelect,
        handleDelete,
      };

      switch (item.resourceType) {
        case 'IMAGE':
          return <ImageMaterial {...commonProps} />;
        case 'VIDEO':
          return <VideoMaterial {...commonProps} />;
        case 'AUDIO':
          return <AudioMaterial {...commonProps} />;
        case 'DOCUMENT':
          return <DocumentMaterial {...commonProps} />;
        default:
          return (
            <MaterialCardWrapper {...commonProps}>
              <div className='w-full h-full bg-gray-300 flex items-center justify-center text-gray-600'>
                <p>未知类型</p>
              </div>
            </MaterialCardWrapper>
          );
      }
    },
    [isModal, handleSelect, handleDelete]
  );

  // 骨架屏
  const renderSkeleton = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {Array.from({ length: 16 }).map((_, index) => (
        <MaterialItemSkeleton key={index} />
      ))}
    </div>
  );

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-between pb-8 items-center'>
        <div>
          {[
            { key: 'ALL', label: '全部' },
            // { key: 'IMAGE', label: '图片' },
            { key: 'VIDEO', label: '视频' },
            // { key: 'AUDIO', label: '音频' },
            // { key: 'DOCUMENT', label: '文档' },
          ].map(item => (
            <span
              className={`px-4 py-[6.5px] cursor-pointer text-gray-650 ${activeTab === item.key ? 'font-medium text-primary bg-[#E8EFFF] rounded-2xl' : ''}`}
              key={item.key}
              onClick={() => handleTabChange(item.key)}
            >
              {item.label}
            </span>
          ))}
        </div>
        <Button
          type='primary'
          icon={<Plus size={14} />}
          onClick={() => setUploadVisible(true)}
        >
          上传素材
        </Button>
      </div>

      <div
        id='scrollableDiv'
        className='flex-1 overflow-auto'
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {isLoading ? (
          renderSkeleton()
        ) : (
          <InfiniteScroll
            dataLength={materials.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={
              <div className='text-center py-4'>
                <Spin />
              </div>
            }
            endMessage={
              !hasNextPage && materials.length > 0 ? (
                <div className='text-center py-4 pt-4 text-gray-300'>
                  没有更多数据了～
                </div>
              ) : null
            }
            scrollableTarget='scrollableDiv'
          >
            {materials.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-center'>
                {materials.map(item => renderMaterialItem(item))}
              </div>
            ) : (
              !isFetchingNextPage && (
                <Empty className='mt-14' description='暂无素材' />
              )
            )}
          </InfiniteScroll>
        )}
      </div>

      <UploadModal
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        onOk={handleUploadSuccess}
        title='视频素材上传'
        accept='video/*'
        maxCount={100}
        maxSize={200}
        dragIcon={
          <i className='iconfont icon-video-upload text-4xl mb-5 text-primary' />
        }
        multiple
      />
    </div>
  );
};

export default MaterialList;
