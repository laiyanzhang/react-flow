import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Upload, message, Progress } from 'antd';
import {
  Inbox,
  FileText,
  FileSpreadsheet,
  File,
  X,
  AlertCircle,
} from 'lucide-react';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { uploadFile } from './ossConfig';
import styles from './index.module.less';

const getFileType = (
  fileName: string
): 'image' | 'video' | 'pdf' | 'word' | 'excel' | 'unknown' => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return 'unknown';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension))
    return 'image';
  if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv'].includes(extension))
    return 'video';
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['xls', 'xlsx'].includes(extension)) return 'excel';
  return 'unknown';
};

const { Dragger } = Upload;

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (args: any[]) => void;
  accept?: string;
  maxCount?: number;
  maxSize?: number; // in MB
  multiple?: boolean;
  title?: string;
  dragIcon?: React.ReactNode;
  dragText?: string;
  dragHint?: string;
  allowAppendDuringUpload?: boolean;
  clearOnClose?: boolean;
}

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface MediaFile {
  uid: string;
  file: RcFile;
  url?: string;
  preview?: string;
  progress: number;
  status: FileStatus;
  error?: string;
  success?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  onOk,
  title = '素材上传',
  accept = '*',
  maxCount = 5,
  maxSize = 20,
  multiple = true,
  dragIcon = <Inbox size={48} className='text-blue-500' />,
  dragText = '点击或拖拽文件到此区域上传',
  dragHint,
  allowAppendDuringUpload = false,
  clearOnClose = true,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const isUploadingInProgress = useMemo(
    () => mediaFiles.some(f => f.status === 'uploading'),
    [mediaFiles]
  );
  const successfulUploads = useMemo(
    () => mediaFiles.filter(f => f.status === 'done'),
    [mediaFiles]
  );

  const beforeUpload: UploadProps['beforeUpload'] = file => {
    if (mediaFiles.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 个文件!`);
      return Upload.LIST_IGNORE;
    }

    const isSizeValid = file.size / 1024 / 1024 < maxSize;
    if (!isSizeValid) {
      message.error(`文件大小不能超过 ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    const isTypeValid = (() => {
      if (accept === '*') return true;
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      const acceptTypes = accept.split(',').map(t => t.trim().toLowerCase());
      return acceptTypes.some(type => {
        if (type === 'image') return fileType.startsWith('image/');
        if (type === 'video') return fileType.startsWith('video/');
        if (type.startsWith('.')) return fileName.endsWith(type);
        if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -1));
        return fileType === type;
      });
    })();

    if (!isTypeValid) {
      message.error(`只允许上传 ${accept} 类型的文件!`);
      return Upload.LIST_IGNORE;
    }

    const newFile: MediaFile = {
      uid: file.uid,
      file,
      status: 'pending',
      progress: 0,
    };

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      newFile.preview = URL.createObjectURL(file);
    }

    setMediaFiles(prev => [...prev, newFile]);
    return false;
  };

  useEffect(() => {
    const pendingFiles = mediaFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length > 0) {
      handleUpload(pendingFiles);
    }
  }, [mediaFiles]);

  useEffect(() => {
    if (!visible) {
      setMediaFiles([]);
      setIsUploading(false);
    }
  }, [visible]);

  const handleUpload = async (filesToUpload: MediaFile[]) => {
    setIsUploading(true);
    try {
      const uploadPromises = filesToUpload.map(mediaFile => {
        updateFileStatus(mediaFile.uid, { status: 'uploading', progress: 0 });

        // 每个 promise 自己 catch 并返回一个标记对象，保证 Promise.all 不会因为单个失败而抛
        return uploadFile(mediaFile.file, {
          onProgress: (percent: number) => {
            updateFileStatus(mediaFile.uid, { progress: percent });
          },
        })
          .then((resp: any) => {
            updateFileStatus(mediaFile.uid, {
              status: 'done',
              progress: 100,
              ...resp,
            });
            return { uid: mediaFile.uid, status: 'done', ...resp };
          })
          .catch((error: any) => {
            updateFileStatus(mediaFile.uid, {
              status: 'error',
              error: error?.message || String(error) || '上传失败',
            });
            return { uid: mediaFile.uid, status: 'error', error };
          });
      });

      // 因为每个 promise 都 catch 了，所以这里不会抛，所有上传都会等待完成
      await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (uid: string, newStatus: Partial<MediaFile>) => {
    setMediaFiles(prev =>
      prev.map(f => (f.uid === uid ? { ...f, ...newStatus } : f))
    );
  };

  const handleRemove = (uid: string) => {
    const fileToRemove = mediaFiles.find(f => f.uid === uid);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setMediaFiles(prev => prev.filter(f => f.uid !== uid));
  };

  const cleanup = () => {
    mediaFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    if (clearOnClose) {
      setMediaFiles([]);
    }
  };

  const handleOk = () => {
    const reGroupFiles = successfulUploads
      .map(f => ({
        uid: f.uid,
        url: f.url,
        status: f.status,
        success: f.success,
        name: f.file.name,
        type: f.file.type,
        size: f.file.size,
      }))
      .filter(f => f.status === 'done');

    onOk(reGroupFiles);
    // cleanup();
  };

  const handleCancel = () => {
    const hasUploadingFiles = mediaFiles.some(f => f.status === 'uploading');
    if (hasUploadingFiles) {
      Modal.confirm({
        title: '确定关闭上传窗口吗？',
        content: '有文件仍在上传中，请确认是否关闭上传窗口',
        onOk: () => {
          onCancel();
          cleanup();
        },
        onCancel: () => {
          // 取消取消上传，什么都不做
        },
      });
    } else {
      onCancel();
      cleanup();
    }
  };

  // highlight-start
  // Updated rendering logic to use lucide-react icons
  const renderFilePreview = (mediaFile: MediaFile) => {
    const { file, preview, status, progress, error } = mediaFile;
    const fileType = getFileType(file.name);

    let previewContent;
    const iconSize = 32; // Consistent icon size

    switch (fileType) {
      case 'image':
        previewContent = (
          <img
            src={preview}
            alt={file.name}
            className='w-full h-full object-cover rounded-sm'
          />
        );
        break;
      case 'video':
        previewContent = (
          <video
            src={preview}
            muted
            playsInline
            className='w-full h-full object-cover rounded-sm'
          />
        );
        break;
      case 'pdf':
        previewContent = <FileText size={iconSize} className='text-red-500' />;
        break;
      case 'word':
        previewContent = <FileText size={iconSize} className='text-blue-500' />;
        break;
      case 'excel':
        previewContent = (
          <FileSpreadsheet size={iconSize} className='text-green-500' />
        );
        break;
      default:
        previewContent = <File size={iconSize} className='text-gray-500' />;
    }

    return (
      <>
        <div className='aspect-square flex items-center justify-center bg-gray-50'>
          {previewContent}
          <div className='absolute inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center text-white text-center p-2 opacity-0 group-hover:opacity-100 rounded-md transition-opacity'>
            {/* <p className='text-xs break-all'>{file.name}</p> */}
          </div>

          {status === 'uploading' && (
            <div className='absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center'>
              <Progress
                type='circle'
                percent={progress}
                size={36}
                strokeWidth={8}
                trailColor='rgba(255, 255, 255, 0.25)'
                className={styles['progress-custom']}
              />
            </div>
          )}
          {status === 'error' && (
            <div className='absolute inset-0 bg-red-500 bg-opacity-80 flex flex-col items-center justify-center p-2'>
              <AlertCircle size={32} className='text-white' />
              <p className='text-white text-xs mt-2 text-center' title={error}>
                {error}
              </p>
            </div>
          )}
        </div>
        {status !== 'uploading' && (
          <button
            className='absolute -top-2 -right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-[99]' // 将 z-10 改为 z-[99] 或更高的值
            onClick={() => handleRemove(mediaFile.uid)}
          >
            <X size={12} className='text-white' />
          </button>
        )}
      </>
    );
  };
  // highlight-end

  const finalDragHint =
    dragHint ||
    `支持 ${multiple ? '多文件' : '单文件'} 上传，文件大小不超过${maxSize}MB${accept !== '*' ? `，仅支持 ${accept} 格式` : ''}`;

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isUploading}
      okText='完成'
      cancelText='取消'
      maskClosable={false}
      okButtonProps={{
        disabled: isUploadingInProgress || successfulUploads.length === 0,
      }}
      keyboard={false}
      width={800}
      destroyOnHidden
    >
      <div className='max-h-[60vh] overflow-y-auto pr-2'>
        {mediaFiles.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-6 pt-4'>
            {mediaFiles.map(file => (
              <div
                className='w-32 h-32 relative group overflow-visible'
                key={file.uid}
              >
                {renderFilePreview(file)}
              </div>
            ))}
          </div>
        )}

        <Dragger
          beforeUpload={beforeUpload}
          showUploadList={false}
          multiple={multiple}
          accept={accept}
          disabled={
            (isUploadingInProgress && !allowAppendDuringUpload) ||
            mediaFiles.length >= maxCount
          }
          className={
            mediaFiles.length >= maxCount
              ? '!bg-gray-100 cursor-not-allowed'
              : ''
          }
        >
          <div className='ant-upload-drag-icon inline-flex'>{dragIcon}</div>
          <p className='ant-upload-text'>{dragText}</p>
          <p className='ant-upload-hint'>
            {finalDragHint}
            {mediaFiles.length > 0 &&
              ` (已选择 ${mediaFiles.length}/${maxCount} 个文件)`}
          </p>
        </Dragger>
      </div>
    </Modal>
  );
};

export default UploadModal;
