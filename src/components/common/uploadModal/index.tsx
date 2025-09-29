import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Upload, message, Progress } from 'antd';
import { X } from 'lucide-react';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { uploadVideo, uploadImage, getFileType } from '@/utils/index'
import styles from './index.module.less'
import MediaPreview from '@/components/common/MediaPreview';

const { Dragger } = Upload;

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (urls: string[]) => void;
  title?: string;
  accept?: string;
  maxCount?: number;
  maxSize?: number;
  multiple?: boolean;
}

interface MediaFile {
  file: RcFile;
  url?: string;
  preview?: string;
  progress?: number;
  status: 'preview' | 'uploading' | 'done' | 'error';
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  onOk,
  title = '文件上传',
  accept = '*',
  maxCount = 1,
  maxSize = 10,
  multiple = false,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewUrls = useMemo(() => {
    const urls:Array<string> = []
    mediaFiles.forEach((item: any) => {
      if(item.status == 'done') {
        urls.push(item.url)
      }
    })
    return urls
  }, [mediaFiles])

  // 在 beforeUpload 函数中替换原有的文件类型检查逻辑
  const beforeUpload: UploadProps['beforeUpload'] = async (file, fileList) => {
    // 检查文件总数是否超过限制
    if (mediaFiles.length + fileList.length > maxCount) {
      if (fileList[0] === file) {
        message.error(`最多只能上传 ${maxCount} 个文件!`);
      }
      return Upload.LIST_IGNORE;
    }

    // 检查文件大小
    const isLtSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtSize) {
      message.error(`文件大小不能超过 ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    // 根据 accept 参数值检查文件类型
    let isAcceptType = true;
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    if (accept !== '*') {
      // 如果 accept 包含具体 MIME 类型
      if (accept.includes('/')) {
        const acceptTypes = accept.split(',').map(type => type.trim());
        isAcceptType = acceptTypes.some(type => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.slice(0, -1));
          }
          return fileType === type || fileName.endsWith(type.toLowerCase());
        });
      } 
      // 如果 accept 是 'image' 关键词
      else if (accept === 'image') {
        isAcceptType = fileType.startsWith('image/');
      }
      // 如果 accept 是 'video' 关键词
      else if (accept === 'video') {
        isAcceptType = fileType.startsWith('video/');
      }
      // 其他情况保持原有逻辑
      else {
        const acceptTypes = accept.split(',').map(type => type.trim());
        isAcceptType = acceptTypes.some(type => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.slice(0, -1));
          }
          return fileType === type || fileName.endsWith(type.toLowerCase());
        });
      }
    }

    if (!isAcceptType) {
      message.error(`只允许上传 ${accept} 类型的文件!`);
      return Upload.LIST_IGNORE;
    }

    // 为图片文件创建预览
    if (fileType.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      const newFile: MediaFile = {
        file,
        preview,
        status: 'preview'
      };
      
      setMediaFiles(prev => [...prev, newFile]);
    } else {
      // 对于非图片文件（如视频）暂不创建预览
      const newFile: MediaFile = {
        file,
        status: 'preview'
      };
      
      setMediaFiles(prev => [...prev, newFile]);
    }

    return false; // 不自动上传
  };

  // 当文件列表发生变化时，自动上传新添加的文件
  useEffect(() => {
    if (mediaFiles.length > 0) {
      const needUploadFiles = mediaFiles.filter(file => 
        file.status === 'preview' && !file.url
      );
      
      if (needUploadFiles.length > 0) {
        handleAutoUpload();
      }
    }
  }, [mediaFiles]);

  const handleAutoUpload = async () => {
    setUploading(true);
    
    try {
      // 创建一个 Promise 数组来跟踪所有上传任务
      const uploadPromises = mediaFiles.map(async (mediaFile, index) => {
        // 只处理需要上传的文件
        if (mediaFile.status !== 'preview' || mediaFile.url) {
          return Promise.resolve();
        }
        
        // 更新状态为上传中
        setMediaFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = {
            ...newFiles[index],
            status: 'uploading',
            progress: 0
          };
          return newFiles;
        });

        // 启动假进度条
        let progress = 0;
        const maxProgress = 99; // 最大进度为99%
        const interval = setInterval(() => {
          // 不规律增长进度 (1-3之间的随机数)
          const increment = Math.floor(Math.random() * 3) + 1;
          progress = Math.min(progress + increment, maxProgress);

          setMediaFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              progress
            };
            return newFiles;
          });
        }, 200); // 每200ms更新一次进度

        try {
          const fileType = getFileType(mediaFile.file.name);
          let url = '';
          
          // 文件上传
          if (fileType === 'video') {
            url = await uploadVideo(mediaFile.file);
          } else if (fileType === 'image') {
            url = await uploadImage(mediaFile.file);
          } else {
            message.error('无法识别文件类型');
          }
          
          // 清除定时器
          clearInterval(interval);
          
          if (url) {
            setMediaFiles(prev => {
              const newFiles = [...prev];
              newFiles[index] = {
                ...newFiles[index],
                url,
                progress: 100,
                status: 'done'
              };
              return newFiles;
            });
          } else {
            setMediaFiles(prev => {
              const newFiles = [...prev];
              newFiles[index] = {
                ...newFiles[index],
                status: 'error'
              };
              return newFiles;
            });
          }
        } catch (error) {
          // 清除定时器
          clearInterval(interval);
          
          // 更新状态为错误
          setMediaFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              status: 'error'
            };
            return newFiles;
          });
          
          message.error(`文件 "${mediaFile.file.name}" 上传失败`);
        }
      });
      
      // 等待所有上传任务完成
      await Promise.all(uploadPromises);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      // 清理预览URL对象
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleOk = () => {
    const urls = mediaFiles
      .filter(file => file.status === 'done' && file.url)
      .map(file => file.url) as string[];
    onOk(urls);
    cancel()
  }

  const handleCancel = () => {
    onCancel();
    cancel()
  };

  const cancel = () => {
    // 清理所有预览URL对象
    mediaFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    // 重置文件列表
    setMediaFiles([]);
  }

  const getAcceptDisplayText = (accept: string): string => {
    switch (accept) {
      case 'image':
        return '图片格式（jpg, png, gif等）';
      case 'video':
        return '视频格式（mp4, avi, mov等）';
      case 'image/*':
        return '所有图片格式';
      case 'video/*':
        return '所有视频格式';
      default:
        if (accept.includes('image/')) {
          return '图片格式';
        } else if (accept.includes('video/')) {
          return '视频格式';
        } else if (accept !== '*') {
          // 处理具体的 MIME 类型或文件扩展名
          return accept.split(',').map(type => {
            const trimmed = type.trim();
            if (trimmed.startsWith('.')) {
              return trimmed;
            } else if (trimmed.includes('/')) {
              // 简化的 MIME 类型显示
              return trimmed.split('/')[1] || trimmed;
            }
            return trimmed;
          }).join(', ');
        }
        return '';
    }
  };

  const handlePreview = (index: number) => {
    setPreviewVisible(true);
    setPreviewIndex(index);
  };

  const renderMediaPreview = (mediaFile: MediaFile, index: number) => {
    const isVideo = mediaFile.file.type.startsWith('video/');
    const previewUrl = mediaFile.preview || mediaFile.url;
    
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md">
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          {isVideo ? (
            <div className={styles.videoItem} onClick={() => handlePreview(index)}>
              <video 
                className={styles.video} 
                muted
                playsInline
                src={previewUrl}
              >
              </video>
              {
                previewUrl ? (
                  <>
                    <div className={styles.playIcon}></div>
                    <div className={styles.overlay}></div>
                  </>
                ) : null
              }
            </div>
          ) : (
            <img 
              src={previewUrl} 
              alt={`media-${index}`} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* 上传状态覆盖层 */}
        {mediaFile.status !== 'done' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <Progress 
                type="circle" 
                percent={mediaFile.progress || 0}
                status={mediaFile.status === 'error' ? 'exception' : 'normal'}
                size={80}
                format={(percent) => (
                  <span style={{ color: 'white', fontSize: '16px' }}>
                    {percent ? `${parseInt(percent.toString())}%` : '0%'}
                  </span>
                )}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={uploading}
      okText="完成"
      cancelText="取消"
      okButtonProps={{ disabled: uploading }}
      width={800}
    >
      {mediaFiles.length > 0 && (
        <div className={styles.mediaList}>
          {mediaFiles.map((mediaFile, index) => (
            <div key={index} className={styles.mediaItem}>
              {renderMediaPreview(mediaFile, index)}
              {
                mediaFile.status != 'uploading' ? (
                  <div 
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <X size={16} color="#fff" />
                  </div>
                ) : null
              }
            </div>
          ))}
        </div>
      )}
      <div className="mb-4">
        <Dragger 
          beforeUpload={beforeUpload}
          showUploadList={false}
          multiple={multiple}
          accept={accept}
          disabled={mediaFiles.length >= maxCount || uploading}
        >       
          <div className={`iconfont icon-shipinsucai-default ${styles.uploadIcon}`}></div>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            {`支持${multiple ? '多文件' : '单文件'}上传，文件大小不超过${maxSize}MB`}
            {accept !== '*' && `，仅支持${getAcceptDisplayText(accept)}格式`}
            {mediaFiles.length > 0 && `（已选择 ${mediaFiles.length}/${maxCount} 个文件）`}
          </p>
        </Dragger>
      </div>
      <MediaPreview
        visible={previewVisible}
        url={previewUrls}
        onClose={() => setPreviewVisible(false)}
        initialIndex={previewIndex}
      />      
    </Modal>
  );
};

export default UploadModal;