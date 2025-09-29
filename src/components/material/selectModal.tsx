import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, message, Spin, Empty } from 'antd';
/* import { Plus } from 'lucide-react'; */
import type { ResourceType, MaterialItem } from '@/api/material';
import UploadModal from '@/components/common/uploadFile';
import InfiniteScroll from 'react-infinite-scroll-component';
import { uploadMaterial } from '@/api/material';
import { emumResourceType, MaterialItemSkeleton } from './material.utils';
import VideoMaterial from './videoItem';
import AudioMaterial from './audioItem';
import DocumentMaterial from './documentItem';
import { MaterialCardWrapper } from './list';
import { useMaterials } from '@/hooks/useMaterials';

interface MaterialSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (selectedItems: MaterialItem[]) => void;
  title?: string;
  maxCount?: number; // 最大选择数量
  allowedTypes?: ResourceType[]; // 允许选择的文件类型
}

/* const SelectableImageMaterial: React.FC<{
  item: MaterialItem;
  isSelected: boolean;
  onSelect: (item: MaterialItem, selected: boolean) => void;
}> = ({ item, isSelected, onSelect }) => {
  return (
    <MaterialCardWrapper
      item={item}
      isModal={true}
      isSelectMode={true}
      isSelected={isSelected}
      onSelectChange={onSelect}
      handleDelete={() => {}}
    >
      <img
        src={item.originUrl}
        alt={item.title || 'Material Image'}
        className='w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110'
        onError={e => {
          (e.target as HTMLImageElement).src = '/path/to/placeholder-image.png';
          (e.target as HTMLImageElement).alt = '图片加载失败';
        }}
      />
    </MaterialCardWrapper>
  );
}; */

const MaterialSelectModal: React.FC<MaterialSelectModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = '选择素材',
  maxCount = 100,
  allowedTypes,
}) => {
  const [activeTab, setActiveTab] = useState<ResourceType | 'ALL'>('ALL');
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<MaterialItem[]>([]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch,
  } = useMaterials(activeTab);

  const materials = useMemo(() => {
    const allMaterials = data?.pages.flatMap(page => page.dataList) ?? [];
    if (allowedTypes && allowedTypes.length > 0) {
      return allMaterials.filter(item =>
        allowedTypes.includes(item.resourceType)
      );
    }
    return allMaterials;
  }, [data, allowedTypes]);

  if (isError) {
    message.error(`获取素材列表失败: ${(error as Error).message}`);
  }

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as ResourceType | 'ALL');
  }, []);

  const handleSelect = useCallback(
    (item: MaterialItem, selected: boolean) => {
      setSelectedItems(prev => {
        if (selected) {
          // 检查是否超过最大选择数量
          if (prev.length >= maxCount) {
            message.warning(`最多只能选择 ${maxCount} 个文件`);
            return prev;
          }
          return [...prev, item];
        } else {
          return prev.filter(selectedItem => selectedItem.id !== item.id);
        }
      });
    },
    [maxCount]
  );

  const handleConfirm = useCallback(() => {
    if (selectedItems.length === 0) {
      message.warning('请至少选择一个文件');
      return;
    }
    onConfirm(selectedItems);
    setSelectedItems([]);
  }, [selectedItems, onConfirm]);

  const handleCancel = useCallback(() => {
    setSelectedItems([]);
    onCancel();
  }, [onCancel]);

  const handleUploadSuccess = useCallback(
    async (fileList: any[]) => {
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
        const failedUploads = results.filter(
          res => !res.success && res.fileName
        );

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
        }
      } catch (error) {
        message.error('上传过程中发生未知错误。');
        console.error('Promise.all 错误:', error);
      }
    },
    [refetch]
  );

  const renderMaterialItem = useCallback(
    (item: MaterialItem): React.ReactNode => {
      const isSelected = selectedItems.some(
        selectedItem => selectedItem.id === item.id
      );

      const commonProps = {
        item,
        isModal: true,
        isSelectMode: true,
        isSelected,
        onSelectChange: handleSelect,
        handleDelete: () => {}, // 选择模式下不需要删除功能
      };

      switch (item.resourceType) {
        case 'IMAGE':
          return (
            <MaterialCardWrapper
              item={item}
              isModal={true}
              isSelectMode={true}
              isSelected={isSelected}
              onSelectChange={handleSelect}
              handleDelete={() => {}}
            >
              <img
                src={item.originUrl}
                alt={item.title || 'Material Image'}
                className='w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110'
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    '/path/to/placeholder-image.png';
                  (e.target as HTMLImageElement).alt = '图片加载失败';
                }}
              />
            </MaterialCardWrapper>
          );
        case 'VIDEO':
          return (
            <MaterialCardWrapper {...commonProps}>
              <VideoMaterial
                item={item}
                isModal={true}
                handleSelect={() => {}}
                handleDelete={() => {}}
              />
            </MaterialCardWrapper>
          );
        case 'AUDIO':
          return (
            <MaterialCardWrapper {...commonProps}>
              <AudioMaterial
                item={item}
                isModal={true}
                handleSelect={() => {}}
                handleDelete={() => {}}
              />
            </MaterialCardWrapper>
          );
        case 'DOCUMENT':
          return (
            <MaterialCardWrapper {...commonProps}>
              <DocumentMaterial
                item={item}
                isModal={true}
                handleSelect={() => {}}
                handleDelete={() => {}}
              />
            </MaterialCardWrapper>
          );
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
    [selectedItems, handleSelect]
  );

  // 过滤标签页，如果指定了允许的类型
  const availableTabs = useMemo(() => {
    const allTabs = [
      { key: 'ALL', label: '全部' },
      { key: 'IMAGE', label: '图片' },
      { key: 'VIDEO', label: '视频' },
      { key: 'AUDIO', label: '音频' },
      { key: 'DOCUMENT', label: '文档' },
    ];

    if (allowedTypes && allowedTypes.length > 0) {
      return allTabs.filter(
        tab =>
          tab.key === 'ALL' || allowedTypes.includes(tab.key as ResourceType)
      );
    }
    return allTabs;
  }, [allowedTypes]);

  const renderSkeleton = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {Array.from({ length: 16 }).map((_, index) => (
        <MaterialItemSkeleton key={index} />
      ))}
    </div>
  );

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onCancel={handleCancel}
        width={1200}
        footer={[
          <Button key='cancel' onClick={handleCancel}>
            取消
          </Button>,
          <Button key='confirm' type='primary' onClick={handleConfirm}>
            确定 ({selectedItems.length}/{maxCount})
          </Button>,
        ]}
        destroyOnHidden
      >
        <div className='h-[600px] flex flex-col'>
          <div className='flex justify-between pb-4 items-center'>
            <div>
              {availableTabs.map(item => (
                <span
                  className={`px-4 py-[6.5px] cursor-pointer text-gray-650 ${
                    activeTab === item.key
                      ? 'font-medium text-primary bg-[#E8EFFF] rounded-2xl'
                      : ''
                  }`}
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                >
                  {item.label}
                </span>
              ))}
            </div>
            {/* <Button
              type='primary'
              icon={<Plus size={14} />}
              onClick={() => setUploadVisible(true)}
            >
              上传素材
            </Button> */}
          </div>

          <div
            id='selectModalScrollableDiv'
            className='flex-1 overflow-auto px-4'
            style={{ height: '520px' }}
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
                scrollableTarget='selectModalScrollableDiv'
              >
                {materials.length > 0 ? (
                  <div className='grid grid-cols-[repeat(auto-fill,210px)] gap-4 justify-center'>
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
        </div>
      </Modal>

      <UploadModal
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        onOk={handleUploadSuccess}
        title='视频素材上传'
        dragIcon={
          <i className='iconfont icon-video-upload text-4xl mb-5 text-primary' />
        }
        accept='video/*'
        maxCount={100}
        maxSize={200}
        multiple
      />
    </>
  );
};

export default MaterialSelectModal;
