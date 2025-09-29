import { memo } from 'react';
import { Image } from 'antd';
import { Position, Handle, useNodeConnections } from '@xyflow/react';
import CustomHeader from './CustomHeader';

const CustomHandle = (props: any) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < props.connectionCount}
    />
  );
};

const CustomNode = () => {
  return (
    <div>
      <CustomHandle
        type='target'
        position={Position.Left}
        connectionCount={2}
      />
      <div>
        <CustomHeader />
        <Image
          src='https://oss.raysgo.com/upload/test/1753839999908/picture/c0f8220cf55a4c43973f6b244fbb465c.png'
          width={120}
          height={80}
        />
      </div>
      <CustomHandle type='source' position={Position.Right} />
    </div>
  );
};

export default memo(CustomNode);
