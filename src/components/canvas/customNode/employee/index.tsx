import React from 'react';
import {
  Form,
  Input,
  Upload,
  Tooltip,
  message,
  type FormProps
} from 'antd';
import {
  CircleQuestionMark,
  Plus,
} from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import styles from './employee.module.less'
import { useCallback, useRef, useEffect, useState } from 'react';
import Operation from '../../components/Operation';
import { useChatStore } from '@/store/chatStore';
import { getMatchParams, caculateIntervalTime, createChatInfo, getFormValue, getFieldValue } from '../../util';
import { useCanvasStore } from '@/store/canvasStore';
import { excuteWorkFlow, getWorkFlowResult } from '@/api/agent';
import { uploadImage } from '@/utils/index';
import memberIcon from '@/assets/images/memberIcon.png';

interface field {
  name: string,
  label: string,
  type: string,
  require: boolean,
  value: string,
  tip: string
}

interface FormItemProps {
  field: field;
  children?: React.ReactNode;
}

// 输入框限制输入内容长度，暂时写死，TODO：修改工作流协议并进行识别
const staticInputLength: Record<string, number> = {
  'first_input_text': 14,
  'second_input_text': 8
}


const FormItem: React.FC<FormItemProps> = ({ children, field }) => {
  return (
    <Form.Item
      label={
        <div className='flex items-center'>
          {field.label}
          {
            field.tip ?
              <Tooltip title={field.tip}>
                <CircleQuestionMark style={{ marginLeft: 4 }} size={12} color="#999" />
              </Tooltip>
            : null
          }
        </div>
      }
      name={field.name}
      rules={[{ required: field.require, message: '请输入' + field.label }]}
    >
      {children}
    </Form.Item>
  );
};

const Employee: React.FC = (props: any) => {
  const id = props.id
  const { name, type, nodeId, status, workflowId } = props.data
  const formField = props.data.formField || []
  const style = props.data.style || { width: '200px' }
  const { nodes, edges } = useCanvasStore((state) => state)
  const { updateNodeStatus, addParamNode, updateFormField } = useCanvasStore(state => state.actions)
  const { setLocked, insertChatInfo } = useChatStore((state) => state.actions)
  const [height, setHeight] = useState(100)
  const nodeRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [form] = Form.useForm();
  const [ fileLists, setFileLists ] = useState<Record<string, any[]>>({});

  const handleUploadChange = useCallback((field: field, { file, fileList }: any) => {
    setFileLists(prev => ({
      ...prev,
      [field.name]: fileList
    }));
    
    // 如果文件被移除，同时更新表单值
    if (file.status === 'removed') {
      form.setFieldsValue({
        [field.name]: undefined
      });
    }
  }, [form]);
  
  const renderComponent = useCallback((field: field) => {
    switch (field.type) {
      case 'input':
        return (
          <FormItem field={field} key={field.name}>
            <Input placeholder={field.label} className='nodrag' maxLength={staticInputLength[field.name] || 100}/>
          </FormItem>
        )
      case 'image':
        return (
          <FormItem field={field} key={field.name}>
            <Upload
              customRequest={async (options) => {
                const { file, onSuccess, onError } = options;
                
                try {
                  const result = await uploadImage(file as File);
                  // 假设 uploadImage 返回图片的 URL
                  onSuccess?.({ url: result }, new XMLHttpRequest());
                } catch (error) {
                  onError?.(error as Error);
                }
              }}
              accept="image/*"  // 限制只能选择图片文件
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件!');
                }
                return isImage;
              }}
              listType="picture-card"
              maxCount={1}
              fileList={fileLists[field.name] || []}
              onChange={(info) => handleUploadChange(field, info)}
              onPreview={(file) => {
                window.open(file.url || URL.createObjectURL(file.originFileObj!));
              }}
            >
              { (<div className="flex flex-col items-center">
                <Plus size={20} />
                <div>上传图片</div>
              </div>)}
            </Upload>
          </FormItem>
        );
    }
  }, [fileLists])

  useEffect(() => {
    if (nodeRef.current && height !== nodeRef.current.offsetHeight) {
      setHeight(nodeRef.current.offsetHeight);
    }
    // 还原表单参数
    if(formField.length > 0) {
      const valueMap = getFormValue(formField)
      let lists:any = {}
      formField.forEach((item: any) => {
        if(item.type == 'image') {
          let obj = valueMap[item.name]
          lists[item.name] = obj
        }
      })
      setFileLists(lists)
      form.setFieldsValue(valueMap)
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      const cancel = () => {
        updateNodeStatus(id, 'complete')
        setLocked(false)
      }
      // 开始轮询
      const poll = async () => {
        try {
          const params = {
            workflowId: workflowId,
            nodeId: nodeId,
          };
          // 调用轮询接口
          const result:any = await getWorkFlowResult(params); // 你需要替换为实际的 API 调用
          const target = result.data.items[0]
          // 阶梯间隔轮询
          if (target.status === 'RUNNING') {
            const newInterval = caculateIntervalTime(target.createTime)
            intervalRef.current = setTimeout(poll, newInterval);
          }
          if (target.status === 'SUCCESS' || target.status === 'FAILURE') { // 根据实际结果判断是否完成
            if(target.status === 'SUCCESS') {
              addParamNode(props, target.outputParam)
              insertChatInfo(createChatInfo(props, target.outputParam))
            } else {
              addParamNode(props, '', 'error')
              message.error('执行失败')
            }
            setTimeout(() => {
              cancel()
            }, 1000);
          }
        } catch (error) {
          console.log('error', error)
          setTimeout(() => {
            cancel()
          }, 1000);
        }
      };
      intervalRef.current = setTimeout(poll, 1000);
    }
    
    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, id, workflowId, nodeId, props]);

  const onFinish:FormProps<any>['onFinish'] = async (values = {}) => {
    const finalValues = { ...values };
    const isFormSubmit = Object.keys(finalValues).length > 0 ? true : false
    const matchResult = getMatchParams(edges, nodes, props)
    const fieldValues = getFieldValue(finalValues)

    if(!matchResult.isMatch) {
      message.error('缺少对应入参')
      return
    } else {
      const params = {
        workflowId: workflowId,
        nodeId: nodeId,
        inputParam: Object.assign(matchResult.inputFields, fieldValues)
      };
      try {   
        if(isFormSubmit) {
          updateFormField(id, finalValues)
        }
        await excuteWorkFlow(params)
        setLocked(true)
        updateNodeStatus(id, 'loading')
      } catch (error) {
        console.log('error', error)
      }
      /* addParamNode(props, null) */
    }
  };

  return (
    <div className={styles.employee} style={{width: style.width}} ref={nodeRef}>
      <div className={styles.header} style={{width: style.width}}>
        <div className={styles.name}>
          <img src={memberIcon} className={styles.img}></img>
          <div className={styles.text}>{name}</div>
        </div>
        <Operation id={id} type={type} height={height} className={styles.operation}/>
      </div>
      <Handle type="target" position={Position.Left} id="a" style={{ width: 10, height: 10 }}/>
      <Handle type="source" position={Position.Right} id="b" style={{ width: 10, height: 10 }}/>
      <Form
        form={form}
        size='small'
        layout="vertical"
        onFinish={onFinish}
      >
        {
          formField.length > 0 ? (
            <>
              <div className={styles.title} style={{marginBottom: 16}}>还需帮我提供一下信息~</div>
              {
                formField.map((item: field) => {
                  return renderComponent(item)
                })
              }
            </>
          ) : (
            <div className={styles.container}>
              <div className={styles.title}>请确认输入的视频</div>
              <div className={styles.content}>根据您输入的视频，我将为您进行工作</div>
            </div>
          )
        }

        <div className={styles.button} onClick={() => form.submit()}>
          {
            status === 'loading' ? (
              <>
                <div className={styles.loadingCircle}></div>
                <div className={styles.buttonText}>生成中</div>
              </>
            ) : (
              <>
                <div className={`iconfont icon-sparkling ${styles.icon}`}/>
                <div className={styles.buttonText}>立即生成</div>
              </>
            )
          }
        </div>
      </Form>
    </div>
  );
};

export default Employee;
