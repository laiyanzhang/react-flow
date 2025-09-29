import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCallback, useRef, useEffect, useState } from 'react';
import styles from './param.module.less'
import VideoPlayer from '@/components/common/VideoPlayer';
import ParamOperation from '../../components/ParamOperation';
import Operation from '../../components/Operation';
import { useCanvasStore } from '@/store/canvasStore';
import AudioPlayer from '@/components/common/AudioPlayer';
import emptyVideo from '@/assets/images/emptyVideo.png';
import errorVideo from '@/assets/images/errorVideo.png';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface content {
  type: string,
  value: string,
  isSelected: boolean,
  tip?: string
}

const Param: React.FC = (props: any) => {
  const id = props.id
  const { name, type, status } = props.data
  const content = props.data.content || []
  const style = props.data.style || { width: '200px' }
  const [height, setHeight] = useState(100)
  const [isExpanded, setIsExpanded] = useState(true) // 控制是否展开
  const [hasOverflow, setHasOverflow] = useState(false) // 是否有溢出内容
  const contentRef = useRef<HTMLDivElement>(null) // 添加content的ref
  const nodeRef = useRef<HTMLDivElement>(null)
  const { editNodeContent } = useCanvasStore(state => state.actions)

  useEffect(() => {
    if (contentRef.current) {
      const contentElement = contentRef.current;
      setHasOverflow(contentElement.clientHeight > 300);
    }
    if (nodeRef.current) {
      setHeight(nodeRef.current.offsetHeight);
    }
  }, [content]);


  const previewUrls = useMemo(() => {
    const urls:Array<string> = []
    content.forEach((item: content) => {
      if(item.type == 'video' || item.type == 'image') {
        urls.push(item.value)
      }
    })
    return urls
  }, [content])

  const handleEdit = (url: string, index: number) => {
    editNodeContent(id, index, url)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  }

  const renderComponent = useCallback((content: content, index: number) => {
    switch (content.type) {
      case 'image':
        return (
          <div key={content.value}>
            <div className='flex items-center justify-between'>
              <div>{name + (index + 1)}</div>
              <ParamOperation
                url={content.value}
                previewUrls={previewUrls}
                type='image'
                onEditComplete={(url) => {
                  handleEdit(url, index);
                }}
                />
            </div>
            <img src={content.value}/>
          </div>
        )
      case 'video':
        return (
          <div key={content.value} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.name}>{name + (index + 1)}</div>
              <ParamOperation
                url={content.value}
                previewUrls={previewUrls}
                type='video'
                onEditComplete={(url) => {
                  handleEdit(url, index);
                }}
                className={styles.paramOperation}
                />
            </div>
            <div className={styles.container}>
              <VideoPlayer url={content.value}></VideoPlayer>
            </div>
            <div className={`${styles.tip} nodrag`}>{content.tip}</div>
          </div>
        )
      case 'text':
        return (
          <div className="break-all" key={index}>{content.value}</div>
        )
      case 'audio': 
        return (
          <AudioPlayer url={content.value}></AudioPlayer>
        )
    }
  },[previewUrls, handleEdit, name])

  return (
    <div className={styles.param} style={{width: style.width}} ref={nodeRef}>
      <div className={styles.header} style={{width: style.width}}>
        <div className={styles.name}>{name}</div>
        <Operation id={id} type={type} height={height} className={styles.operation}/>
      </div>
      <Handle type="target" position={Position.Left} id="a" style={{ width: 10, height: 10 }}/>
      <Handle type="source" position={Position.Right} id="b" style={{ width: 10, height: 10 }}/>
      <div
        className={`${styles.content} nowheel`}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? 'none' : '300px', // 设置最大高度，可以根据需要调整
          overflowY: isExpanded ? 'visible' : 'auto'
        }}
      >
        {
          content.length > 0 ? (
            content.map((item: content, index: number) => {
              return renderComponent(item, index)
            })
          ) : (    
              status == 'error' ? (
                <img src={errorVideo} className={styles.emptyVideo}></img>
              ) : (
                <img src={emptyVideo} className={styles.emptyVideo}></img>
              )         
          )
        }
      </div>
      {hasOverflow && (
        isExpanded ? (
          <div className={styles.upButton} onClick={toggleExpand}>
            <ChevronUp size={18} color="#fff"/>
          </div>
        ) : (
          <div className={styles.downButton} onClick={toggleExpand}>
            <div className={styles.button}>
              <ChevronDown size={18} color="#fff"/>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Param;
