import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { Play } from 'lucide-react';
import { MaterialCardWrapper } from './list';
import type { MaterialItem } from '@/api/material';

interface VideoMaterialProps {
  item: MaterialItem;
  isModal?: boolean;
  handleSelect: (item: MaterialItem) => void;
  handleDelete: (item: MaterialItem) => void;
}

const VideoMaterial: React.FC<VideoMaterialProps> = ({ item, ...rest }) => {
  const handleVideoModalOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      Modal.info({
        title: item.title || '视频预览',
        icon: null,
        width: '70vw', // 适应宽度
        content: (
          <video
            controls
            src={item.originUrl}
            style={{ width: '100%', maxHeight: '70vh' }}
            autoPlay
          />
        ),
        maskClosable: true,
        footer: null,
      });
    },
    [item]
  );

  return (
    <MaterialCardWrapper item={item} {...rest}>
      <video
        src={item.originUrl}
        poster={item.thumbnailUrl}
        className='w-full h-full object-cover'
        muted
        preload='metadata'
      />
      <div
        className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer'
        onClick={handleVideoModalOpen}
      >
        <Play />
      </div>
    </MaterialCardWrapper>
  );
};

export default VideoMaterial;
