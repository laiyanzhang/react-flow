import CanvasFlow from '@/components/canvas/index';
import ChatBox from '@/components/chatBox';
import GroupList from '@/components/groupList';
import { useState, useEffect } from 'react';
import { fetchGroups, fetchConversationDetail } from '@/api/agent';
import groupHeader from '@/assets/images/groupHeader.png';
import canvasImage from '@/assets/images/canvasImage.png';

const Groups = () => {
  const [ targetId, setTargetId ] = useState(0);
  const [ targetName, setTargetName ] = useState(''); // 聊天框头部名称
  const [ targetHeaderImage, setTargetHeaderImage ] = useState(''); // 聊天框头部标题
  const [ targetCanavasImage, setTargetCanvasImage ] = useState(''); // 聊天框画布占位图
  const [ agentList, setAgentList ] = useState([]);
  const [ title, setTitle ] = useState('新对话');
  const [ changeType, setChangeType ] = useState('');
  const [ chatMode, setChatMode ] = useState('large');

  const loadItems = async () => {
    try {
      const params = {
        page: 1,
        size: 20,
      };
      let result: any = await fetchGroups(params);
      return result.data.records

    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const getConversationInfo = async (id: string) => {
    try {
      const params = {
        conversationId: id,
      };
      const result:any = await fetchConversationDetail(params);
      return result.data
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  // 根据当前智能体id获取其他所需参数
  const setTargetInfo = (data: any, id: number) => {
    setTargetId(id);
    data.forEach((item: any) => {
      if(item.id === id) {
        setTargetName(item.name);
        setTargetHeaderImage(item.chatBoxBackgroundUrl || groupHeader);
        setTargetCanvasImage(item.backgroundUrl || canvasImage);
      }
    })
  }

  useEffect(() => {
    const init = async  () => {
      const data = await loadItems();
      const conversationId = localStorage.getItem('conversationId');
      let info: any
      let id: number
      if(conversationId) {
        info = await getConversationInfo(conversationId)
      }
      if(info) {
        id = info.targetId
        setTitle(info.title)
      } else {
        id = data[0].id
      }
      setTargetInfo(data, id);
      setAgentList(data);
      setChangeType('initial')
    }

    init();
  }, []);
  
  const changeAgent = (item: any) => {
    setTargetId(item.id);
    setTargetName(item.name);
    setChangeType('changeAgent');
  }
  const handleChangeHistory = (item: any) => {
    if(item.targetId !== targetId) {
      setChangeType('changeHistory')
      setTargetId(item.targetId)
      setTargetName(item.name)
      setTitle(item.title)
    }
  }
  const handleChangeTitle = (title: string) => {
    setTitle(title)
  }
  return (
    <div style={{height: 'calc(100vh - 64px)', width: '100%', position: 'relative'}}>
      {
        agentList.length ? (
          <GroupList
            onClick={changeAgent}
            agentList={agentList}
            targetId={targetId}>
          </GroupList>
        ) : null
      } 
      <ChatBox
        type="AI_GROUP"
        chatMode={chatMode}
        title={title}
        targetId={targetId}
        targetName={targetName}
        targetHeaderImage={targetHeaderImage}
        changeType={changeType}
        changeTitle={handleChangeTitle}
        changeHistory={handleChangeHistory}
        changeMode={(mode: string) => setChatMode(mode)}>
      </ChatBox>
      <CanvasFlow
        chatMode={chatMode}
        targetCanavasImage={targetCanavasImage}>
      </CanvasFlow>
    </div>
  );
}
export default Groups