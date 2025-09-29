import { memo } from 'react';
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
      <CustomHandle type='target' position={Position.Left} />
      <div>
        <CustomHeader />
        <video
          src='https://oss.raysgo.com/oss/uploadfe/mp4/5763c4b59bbd6b15eeab0bf71ef5efe3.mp4'
          width={100}
          height={160}
          controls
        />
      </div>
      <CustomHandle type='source' position={Position.Right} />
    </div>
  );
};

export default memo(CustomNode);
