import Bubble from './components/Bubble'
import ChatInput from './components/ChatInput'
import HistoryDropdown from './components/HistoryDropdown'
import styles from './index.module.less'
import { useRef, useState, useEffect } from 'react'
import { streamChatWithRequest } from './util'
import { useCanvasStore } from '@/store/canvasStore';
import {
  Plus,
} from 'lucide-react'
import { useChatStore } from '@/store/chatStore';
import { stopMessage, getChatInfos, fetchGroupAgents } from '@/api/agent';

interface Params {
  conversationId?: string | number;
  prompt: string;
  model: string;
}

interface ChatBoxProps {
  title: string;
  type: string;
  targetId: number;
  targetName: string;
  targetHeaderImage: string;
  changeType: string;
  chatMode: string;
  changeHistory: (item: any) => void;
  changeTitle: (title: string) => void;
  changeMode: (mode: string) => void;
}

const extraTargetId: Record<number, string> = {
  7: 'claude',
  8: 'openai'
}

const ChatBox = ({title, type, targetId, changeType, changeHistory, targetName, targetHeaderImage, changeTitle, chatMode, changeMode}: ChatBoxProps) => {
  const [ isLoading, setIsLoading ] = useState(false)
  const { setLocked, fetchWorkFlow, rebuildNodeGroup } = useCanvasStore(state => state.actions);
  const { uploadUrls, chatInfos, conversationId, agentType } = useChatStore(state => state)
  const { setUploadUrls, addChatInfo, updateInfoContent, setConversationId, initial, setAgentType } = useChatStore(state => state.actions)
  const [ agentList, setAgentList ] = useState([])
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const currentMessageRef = useRef('')
  const chatListRef = useRef<HTMLDivElement>(null);
  const [historyRefreshFlag, setHistoryRefreshFlag] = useState(0)

  // 获取群组下对应的智能体列表
  const getAgentList = async(id: number) => {
    const params = {
      groupId: id
    }
    const result:any = await fetchGroupAgents(params)
    setAgentList(result.data.map((item:any) => {
      return {
        key: item.id,
        label: item.name,
        agenttype: item.agentType,
        avatarurl: item.avatarUrl,
      }
    }))
  }

  // 根据id获取聊天信息
  const getChatData = async (id: string) => {
    if(!id) {
      initial()
    } else {
      const params = {
        conversationId: id
      }
      const result: any = await getChatInfos(params)
      initial(result.data)
    }
  }

  /* useEffect(() => {
    let info = {
      type: 'USER',
      title: '素材切片',
      content: '这是一个视频https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/ced131568179e64af6b5038c689e429b.mp4、https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/79d5c20c545a679bab68269262f8f3c9.mp4'
    }
    setTimeout(() => addChatInfo(info))
  }, []) */

  useEffect(() => {
    if(type === 'AI_GROUP' && targetId !== 0) {
      getAgentList(targetId)
    }
  }, [targetId])

  useEffect(() => {
    getChatData(conversationId)
  }, [])

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatInfos]);

  const handleHistoryRefresh = () => {
    setHistoryRefreshFlag(prev => prev + 1)
  }

  // 发送消息
  const handleCommunicate = (value: string) => {
    addChatInfo({
      type: 'USER',
      content: value
    })
    const params = {
      model: "GPT",
      prompt: value,
      conversationId,
      targetId,
      type,
      isUpload: uploadUrls && uploadUrls.length > 0
    }
    handleStreamRequest(params)
  }

  // 终止对话
  const handleStop = () => {
    if(!conversationId) return
    setIsLoading(false)
    setLocked(false)
    if (cancelStreamRef.current) {
      cancelStreamRef.current()
      currentMessageRef.current += '\n[已终止]'

      const params = {
        model: "GPT",
        conversationId,
      }
      stopMessage(params)
      
      // 更新最后一个元素的内容
      if (chatInfos.length > 0) {
        const lastIndex = chatInfos.length - 1
        const content = currentMessageRef.current
        updateInfoContent(lastIndex, content)
      }
    }
  }

  // 清空前端需要用的上传信息
  const clearUploadInfo = () => {
    setUploadUrls([]);
    setAgentType('');
  }

  // 流式获取对话内容
  const handleStreamRequest = (params: Params) => {
    let requestType = extraTargetId[targetId] || ''
    // 取消之前的流（如果存在）
    if (cancelStreamRef.current) {
      cancelStreamRef.current()
    }
    
    setIsLoading(true)
    setLocked(true)
    currentMessageRef.current = ''
    
    // 添加一个空的 AI 回复占位符
    addChatInfo({
      type: 'ASSISTANT',
      content: ''
    })

    // 使用封装好的流式聊天函数
    cancelStreamRef.current = streamChatWithRequest(params, {
      requestType: requestType,
      onMessage: ({ chunk, id }) => {
        // 累积消息内容
        currentMessageRef.current += chunk
        const latestChatInfos = useChatStore.getState().chatInfos;

        if (latestChatInfos.length > 0) {
          const lastIndex = latestChatInfos.length - 1
          const content = currentMessageRef.current
          updateInfoContent(lastIndex, content)
        }
        // 用于初始获取conversationId
        if(id && id !== conversationId) {
          setConversationId(id)
        }
      },
      onComplete: ({id, type: identifyType}) => {
        setIsLoading(false)
        setLocked(false)
        if(id && id !== conversationId) {
          setConversationId(id)
          handleHistoryRefresh()
        }
        cancelStreamRef.current = null
        if(identifyType === 'buildVideoWorkflow') {
          const urls = [...uploadUrls]
          fetchWorkFlow(urls)
        }
        if(identifyType === 'rebuildVideoWorkflow') {
          const urls = [...uploadUrls]
          if(type === 'AI_GROUP' && agentType) {
            rebuildNodeGroup(agentType, urls)
          }
          if(type === 'AI_STAFF') {
            fetchWorkFlow(urls)
          }
        }
        clearUploadInfo()
      },
      onError: (error: Error) => {
        console.error('Stream error:', error)
        setIsLoading(false)
        setLocked(false)
        cancelStreamRef.current = null
        
        // 添加错误消息
        const latestChatInfos = useChatStore.getState().chatInfos;
        if (latestChatInfos.length > 0) {
          const lastIndex = latestChatInfos.length - 1
          const content = currentMessageRef.current + '\n[连接错误，请重试]'
          updateInfoContent(lastIndex, content)
        }
        clearUploadInfo()
      }
    })
  }

  const handleNew = () => {
    setConversationId('')
    getChatData('')
    changeTitle('新对话')
  }

  const handleChange = (item: any) => {
    if(conversationId !== item.id) {
      setConversationId(item.id)
      getChatData(item.id)
      changeHistory(item)
      changeTitle(item.title)
    }
  }

  // 切换tab时根据历史列表首项初始化内容
  const handleInit = (item:any) => {
    if(!item)  {
      handleNew()
    } else if(!conversationId || changeType === 'changeAgent') {
      setConversationId(item.id)
      getChatData(item.id)
      changeHistory(item)
      changeTitle(item.title)
    }
  }

  return (
    <>
      <div className={styles.chatBox} style={{ display: chatMode === 'large' ? 'flex' : 'none' }}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.name}>{title || '新对话'}</div>
            <div className={styles.tip}>内容由AI生成</div>
          </div>
          <div className={styles.operations}>
            <div className={styles.operation} onClick={handleNew}>
              <Plus size={20}/>
              <div>新建对话</div>
            </div>
            <HistoryDropdown
              onClick={handleChange}
              init={handleInit}
              type={type}
              targetId={targetId}
              conversationId={conversationId}
              refreshFlag={historyRefreshFlag}>  
            </HistoryDropdown>
            <div className={styles.operation} onClick={() => changeMode('small')}>
              <div className='iconfont icon-shrink-diagonal' style={{fontSize: '20px'}}></div>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.chatList} ref={chatListRef}>
            {
              chatInfos.map((chatInfo, index) => (
                <Bubble chatInfo={chatInfo} key={index}/>
              ))
            }
          </div>
          <ChatInput
            type={type}
            agentList={agentList}
            targetName={targetName}
            targetHeaderImage={targetHeaderImage}
            isLoading={isLoading}
            onChange={handleCommunicate}
            onStop={handleStop}
          />
        </div>
      </div>
      <div className={styles.small} style={{ display: chatMode !== 'large' ? 'block' : 'none' }} onClick={() => changeMode('large')}>
        <div className={styles.content}>
          <div className={`iconfont icon-sparkling ${styles.icon}`}></div>
          <div className={styles.text}>对话框</div>
        </div>
      </div>
    </>
  )
}

export default ChatBox