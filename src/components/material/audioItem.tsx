import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { Headphones } from 'lucide-react';
import { MaterialCardWrapper } from './list';
import type { MaterialItem } from '@/api/material';

// 定义 AudioMaterial 的 props 接口，保持类型安全
interface AudioMaterialProps {
  item: MaterialItem;
  isModal?: boolean;
  handleSelect: (item: MaterialItem) => void;
  handleDelete: (item: MaterialItem) => void;
}

const AudioMaterial: React.FC<AudioMaterialProps> = ({ item, ...rest }) => {
  const handleAudioModalOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      Modal.info({
        title: item.title || '音频预览',
        width: 540,
        icon: null,
        centered: true,
        content: (
          <div className='audio-modal-player-wrapper'>
            <audio
              controls
              src={item.originUrl}
              style={{ width: '100%' }}
              autoPlay
            />
          </div>
        ),
        maskClosable: true,
        footer: null,
      });
    },
    [item]
  );

  return (
    <MaterialCardWrapper item={item} {...rest}>
      <div
        className='w-full h-full bg-gray-700 flex flex-col items-center justify-center text-white p-4 cursor-pointer'
        onClick={handleAudioModalOpen}
      >
        <Headphones style={{ fontSize: '60px' }} />
        <p className='mt-2 text-center text-lg px-4 truncate'>
          {item.title || '无标题音频'}
        </p>
      </div>
    </MaterialCardWrapper>
  );
};

export default AudioMaterial;
