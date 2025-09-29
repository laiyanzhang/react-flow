import { FileTextIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { MaterialCardWrapper } from './list';
import { useCallback } from 'react';

const DocumentMaterial: React.FC<any> = ({ item, handlePreview, ...rest }) => {
  const handleDocumentPreview = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(item.originUrl, '_blank');
    },
    [item, handlePreview]
  );

  // 根据文档格式显示不同的图标
  const getDocumentIcon = (resourceType?: string) => {
    switch (resourceType?.toLowerCase()) {
      case 'document':
        return <FileText size={64} className='text-red-400' />;
      case 'docx':
        return <FileText size={64} className='text-blue-500' />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet size={64} className='text-green-500' />;
      case 'ppt':
      case 'pptx':
        return <FileText size={64} className='text-orange-500' />;
      default:
        return <FileTextIcon size={64} />;
    }
  };

  return (
    <MaterialCardWrapper
      item={item}
      handlePreview={handleDocumentPreview}
      {...rest}
    >
      <div className='w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-700 p-4'>
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt='文档缩略图'
            className='w-full h-[60%] object-contain mb-2'
          />
        ) : (
          <span>{getDocumentIcon(item.resourceType)}</span>
        )}
      </div>
    </MaterialCardWrapper>
  );
};

export default DocumentMaterial;
