import {
  Edit,
  Eye,
  Download
} from 'lucide-react';
import { Tooltip } from 'antd';
import MediaPreview from '@/components/common/MediaPreview';
import UploadModal from '@/components/common/uploadModal';
import { useState, useMemo } from 'react';
import { downloadFile } from '@/utils';

interface OperationProps {
  type: string; // 代表文件类型，image/video
  url: string; // 当前文件的URL
  previewUrls: string[]; // 可供预览的文件列表
  onEditComplete: (url: string) => void;
  className?: any;
}

const Operation = ({type, url, previewUrls, onEditComplete, className}: OperationProps) => {
  const [uploadVisible, setUploadVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const title = useMemo(() => { 
    if(type === 'image') return '上传图片文件'
    if(type === 'video') return '上传视频文件'
  }, [type]);
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadVisible(true);
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewVisible(true);
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(url)
  }

  // 编辑完成后的回调方法，供父组件调用
  const handleEditComplete = (url: string[]) => {
    onEditComplete(url[0]);
    setUploadVisible(false);
  }

  return (
    <div className={`flex items-center nodrag gap-2 ${className}`}>
      <Tooltip title='编辑'>
        <Edit size={18} onClick={handleEdit} className='cursor-pointer'/>
      </Tooltip>
      <Tooltip title='预览'>
        <Eye size={18} onClick={handlePreview} className='cursor-pointer'/>
      </Tooltip>
      <Tooltip title='下载'>
        <Download size={18} onClick={handleDownload} className='cursor-pointer'/>
      </Tooltip>
      <UploadModal
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        onOk={handleEditComplete}
        title={title}
        accept={type}
        maxCount={1}
        maxSize={200}
        multiple={false}
      />
      <MediaPreview
        visible={previewVisible}
        url={previewUrls}
        onClose={() => setPreviewVisible(false)}
      />
    </div>
  )
}; 

export default Operation;