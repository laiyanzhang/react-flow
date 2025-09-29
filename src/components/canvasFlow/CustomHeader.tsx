import { memo } from 'react';
/* import { Handle, useNodeConnections } from '@xyflow/react'; */
import { Copy, Delete, View } from 'lucide-react';

/* const CustomHandle = (props: any) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < props.connectionCount}
    />
  );
}; */

const CustomNode = () => {
  return (
    <div className='flex justify-between items-center bg-gray-200 px-1'>
      <span className='text-xs'>action</span>
      <div className='flex items-center'>
        <Copy className='cursor-pointer hover:text-blue-500' size={9} />
        <Delete className='cursor-pointer hover:text-red-500 ml-2' size={9} />
        <View className='cursor-pointer hover:text-green-500 ml-2' size={9} />
      </div>
    </div>
  );
};

export default memo(CustomNode);
