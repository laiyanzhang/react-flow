import { memo } from 'react';
import { Input } from 'antd';
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
        <Input.TextArea
          rows={4}
          style={{ width: 320 }}
          value='我将在 react 18 的脚手架上研发一个类似无限画布的功能，在画布中，拥有无限拖拽的能力，有缩放能力，可通过数据驱动的方式在画布能自定义reactnode节点，节点内容完全由开发者自定义，比如节点会承载图片、视频、大量form表单等等，节点可通过连接线连接，同时节点也支持自由拖拽、选中节点可缩放节点容器大小等。
请完善一下我要表达的能力，让AI更懂我在说什么'
        />
      </div>
      <CustomHandle type='source' position={Position.Right} />
    </div>
  );
};

export default memo(CustomNode);
