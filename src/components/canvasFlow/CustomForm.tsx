import React from 'react';
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Mentions,
  Select,
  TreeSelect,
} from 'antd';
import { Position, Handle, useNodeConnections } from '@xyflow/react';
import CustomHeader from './CustomHeader';

const { RangePicker } = DatePicker;

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

const CustomForm: React.FC = () => {
  const [form] = Form.useForm();
  const variant = Form.useWatch('horizontal', form);
  return (
    <div>
      <CustomHandle type='target' position={Position.Left} />
      <div className='bg-green-50 px-2'>
        <CustomHeader />
        <Form
          layout={'vertical'}
          form={form}
          variant={variant || 'filled'}
          size='small'
          style={{ maxWidth: 240 }}
          initialValues={{ variant: 'filled' }}
        >
          <Form.Item
            label='Input'
            name='Input'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='InputNumber'
            name='InputNumber'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label='TextArea'
            name='TextArea'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label='Mentions'
            name='Mentions'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Mentions />
          </Form.Item>

          <Form.Item
            label='Select'
            name='Select'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Select />
          </Form.Item>

          <Form.Item
            label='Cascader'
            name='Cascader'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Cascader />
          </Form.Item>

          <Form.Item
            label='TreeSelect'
            name='TreeSelect'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <TreeSelect />
          </Form.Item>

          <Form.Item
            label='DatePicker'
            name='DatePicker'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label='RangePicker'
            name='RangePicker'
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
        <CustomHandle type='source' position={Position.Right} />
      </div>
    </div>
  );
};

export default CustomForm;
