// MediaPreview.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface MediaPreviewProps {
  url: string | string[]; // 支持单个URL或URL数组
  visible: boolean;
  onClose: () => void;
  type?: 'image' | 'video' | Array<'image' | 'video'>;
  initialIndex?: number; // 初始索引
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ 
  url, 
  visible, 
  onClose,
  type,
  initialIndex = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const mediaWrapperRef = useRef<HTMLDivElement>(null);

  // 判断是否为URL数组
  const isUrlArray = Array.isArray(url);
  
  // 获取当前URL
  const currentUrl = isUrlArray ? url[currentIndex] : url;
  
  // 获取媒体类型
  const getMediaType = (mediaUrl: string, index: number): 'image' | 'video' => {
    if(!mediaUrl) return 'image'
    // 如果指定了类型且对应索引有类型定义
    if (Array.isArray(type) && type[index]) {
      return type[index];
    }
    if (type === 'image' || type === 'video') {
      return type;
    }

    // 根据URL后缀自动判断类型
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
    
    const lowerUrl = mediaUrl.toLowerCase();
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'image';
    }
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'video';
    }
    
    return 'image'; // 默认为图片
  };

  const currentMediaType = getMediaType(currentUrl, currentIndex);

  // 导航功能
  const goToPrevious = useCallback(() => {
    if (isUrlArray && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScale(1); // 重置缩放
    }
  }, [currentIndex, isUrlArray]);

  const goToNext = useCallback(() => {
    if (isUrlArray && currentIndex < (isUrlArray ? url.length : 1) - 1) {
      setCurrentIndex(currentIndex + 1);
      setScale(1); // 重置缩放
    }
  }, [currentIndex, isUrlArray, url]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!visible) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, goToPrevious, goToNext]);

  // 处理ESC键关闭和背景滚动锁定
  useEffect(() => {
    if (visible) {
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
      
      // 关闭时暂停视频
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [visible]);

  // 控制栏自动隐藏
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && visible) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showControls, visible]);

  // 显示控制栏
  const handleMouseMove = () => {
    setShowControls(true);
  };

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // 向上滚动，放大
      setScale(prev => Math.min(prev + 0.1, 3));
    } else {
      // 向下滚动，缩小
      setScale(prev => Math.max(prev - 0.1, 0.5));
    }
  }, []);

  // 双击缩放
  const handleDoubleClick = () => {
    setScale(prev => prev === 1 ? 2 : 1);
  };

  // 重置状态
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setShowControls(true);
    }
  }, [visible, initialIndex]);

  // 设置wheel事件监听器，显式指定passive: false
  useEffect(() => {
    const wrapperElement = mediaWrapperRef.current;
    
    // 确保元素存在再添加事件监听器
    if (wrapperElement) {
      // 添加新的事件监听器，显式设置 passive: false
      wrapperElement.addEventListener('wheel', handleWheel as EventListener, { passive: false });
    }

    // 清理函数
    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener('wheel', handleWheel as EventListener);
      }
    };
  }, [handleWheel, visible]); // 添加visible依赖确保在visible变化时重新绑定

  if (!visible) {
    return null;
  }

  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 计算媒体容器样式
  const mediaContainerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transition: 'transform 0.2s ease',
    cursor: scale !== 1 ? 'grab' : 'default'
  };

  // 是否可以导航
  const canGoPrevious = isUrlArray && currentIndex > 0;
  const canGoNext = isUrlArray && currentIndex < (isUrlArray ? url.length : 1) - 1;

  const portalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4"
      style={{ zIndex: 9999 }}
      onClick={handleMaskClick}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4"
        onClick={handleMaskClick}
        onMouseMove={handleMouseMove}
        ref={containerRef}
      >
        {/* 关闭按钮 */}
        <button 
          className={`absolute top-4 right-4 md:top-6 md:right-6 w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full text-white flex justify-center items-center transition-all z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        >
          <X size={24} className="md:w-8 md:h-8" />
        </button>

        {/* 左导航按钮 */}
        {canGoPrevious && (
          <button
            className={`absolute left-4 md:left-6 z-10 w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full text-white flex justify-center items-center transition-all ${showControls ? 'opacity-100' : 'opacity-0'}`}
            onClick={goToPrevious}
          >
            <ChevronLeft size={24} className="md:w-8 md:h-8" />
          </button>
        )}

        {/* 右导航按钮 */}
        {canGoNext && (
          <button
            className={`absolute right-4 md:right-6 z-10 w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full text-white flex justify-center items-center transition-all ${showControls ? 'opacity-100' : 'opacity-0'}`}
            onClick={goToNext}
          >
            <ChevronRight size={24} className="md:w-8 md:h-8" />
          </button>
        )}

        {/* 媒体容器 */}
        <div 
          className="flex justify-center items-center w-full h-full overflow-hidden"
          onDoubleClick={handleDoubleClick}
        >
          <div 
            ref={mediaWrapperRef} 
            style={mediaContainerStyle}
            className="flex justify-center items-center w-full h-full"
          >
            {currentMediaType === 'image' ? (
              <img 
                src={currentUrl} 
                alt={`预览图片 ${currentIndex + 1}`}
                className="min-w-[70vw] min-h-[70vh] max-w-[90vw] max-h-[90vh] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                src={currentUrl}
                className="min-w-[70vw] min-h-[70vh] max-w-[90vw] max-h-[90vh] object-contain"
                controls
                playsInline
              />
            )}
          </div>
        </div>

        {/* 底部指示器 */}
        {isUrlArray && url.length > 1 && (
          <div className={`absolute bottom-6 flex space-x-2 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {url.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );


  return createPortal(portalContent, document.body);
};

export default MediaPreview;