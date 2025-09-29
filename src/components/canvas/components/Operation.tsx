import { useCanvasStore } from '@/store/canvasStore';
import {
  Copy,
  X
} from 'lucide-react';

interface OperationProps {
  id: string;
  type: string;
  height: number;
  className?: any;
}
const Operation = ({id, type, height, className}: OperationProps) => {
  const { copyNode, deleteNode } = useCanvasStore(state => state.actions);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyNode(id, height);
  }
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNode(id, type)
  }
  return (
    <div className={`flex items-center nodrag gap-2 ${className}`}>
      <Copy size={18} onClick={(e) => handleCopy(e)} className='cursor-pointer'/>
      <X size={18} onClick={(e) => handleDelete(e)} className='cursor-pointer'/>
    </div>
  )
}; 

export default Operation;