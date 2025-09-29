// MediaGrid.tsx
import React from 'react';
import { X } from 'lucide-react';
import styles from './components.module.less'

interface MediaGridProps {
  urls: string[];
  onMediaClick: (index: number) => void;
  onDelete: (index: number) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  urls,
  onMediaClick,
  onDelete,
}) => {
  const renderMedia = (url: string, index: number) => {
    const isVideo = /\.(mp4|webm|ogg|mov|avi|wmv)$/i.test(url);

    return (
      <div
        className='relative w-full h-full rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-200'
        onClick={e => {
          e.stopPropagation();
          onMediaClick(index);
        }}
      >
        <div className='w-full h-full flex items-center justify-center bg-gray-100'>
          {isVideo ? (
            <div className={styles.videoItem}>
              <video 
                className={styles.video} 
                muted
                playsInline
                src={url}
              >
              </video>
              <div className={styles.playIcon}></div>
              <div className={styles.overlay}></div>
            </div>
          ) : (
            <img
              src={url}
              alt={`media-${index}`}
              className='w-full h-full object-cover'
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='grid grid-cols-10 gap-1'>
      {urls.map((url, index) => (
        <div key={url} className='aspect-square relative group'>
          {renderMedia(url, index)}
          <div
            className='absolute -top-1 -right-1 w-3 h-3 bg-black bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-90 z-10'
            onClick={e => {
              e.stopPropagation();
              onDelete(index);
            }}
          >
            <X size={14} className='text-white' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
