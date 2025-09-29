import { create } from 'zustand'
import { insertInfo } from '@/api/agent'

interface info {
  type: string,
  content: string,
  title?: string,
  agent?: string,
}

/* const initialUrls = [
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/ced131568179e64af6b5038c689e429b.mp4',
  'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/79d5c20c545a679bab68269262f8f3c9.mp4',
] */

interface ChatState {
  locked: boolean,
  conversationId: string,
  uploadUrls: string[],
  agentType: string, // 群组@的员工类型
  chatInfos: info[],
  actions: {
    setLocked: (locked: boolean) => void,
    setUploadUrls: (urls: string[]) => void
    setChatInfos: (chatInfos: info[]) => void,
    setConversationId: (id: string) => void,
    setAgentType: (agentType: string) => void,
    reset: () => void,
    initial: (data?: any) => void,
    addChatInfo: (info: info) => void,
    updateInfoContent: (index: number, content: string) => void;
    insertChatInfo: (info: info) => void;
  }
}

export const useChatStore = create<ChatState>()((set, get) => ({
  locked: false,
  uploadUrls: [],
  chatInfos: [],
  agentType: '',
  conversationId: localStorage.getItem('conversationId') || '',
  actions: {
    setLocked: (locked: boolean) => set({ locked }),
    setUploadUrls: (urls: string[]) => set({ uploadUrls: urls }),
    setChatInfos: (chatInfos: info[]) => set({ chatInfos }),
    setConversationId: (id: string) => {
      localStorage.setItem('conversationId', id);
      set(() => ({ conversationId: id }));
    },
    setAgentType: (agentType: string) => set({ agentType }),

    // 重置所有
    reset: () => {
      set({
        locked: false,
        uploadUrls: [],
        chatInfos: [],
        agentType: '',
        conversationId: '',
      })
    },

    initial: (data?: any) => {
      if(!data) {
        set(() => ({ chatInfos: [] }))
      } else {
        const chatInfos = data.map((item: any) => {
          let title = ''
          if(item.metadata) {
            const metadata = JSON.parse(item.metadata);
            title = metadata.title;
          }
          return {
            type: item.role,
            content: item.content,
            title,
          }
        })
        set(() => ({ chatInfos }));
      }
    },
    addChatInfo: (info: info) => set((state) => ({ chatInfos: [...state.chatInfos, info] })),
    updateInfoContent: (index: number, content: string) =>
      set((state) => {
        const updatedChatInfos = [...state.chatInfos];
        updatedChatInfos[index] = {
          ...updatedChatInfos[index],
          content: content
        };
        return { chatInfos: updatedChatInfos };
      }),
    insertChatInfo: (info: info) => {
      const { conversationId } = get();
      if(!info.content) return
      const metadata = {
        title: info.title
      }
      let param = {
        conversationId,
        role: info.type,
        content: info.content,
        metadata: JSON.stringify(metadata),
        msgType: 'file',
        modelName: info.agent || '',
      }
      insertInfo(param)
      set((state) => {
        const updatedChatInfos = [...state.chatInfos, info];
        return { chatInfos: updatedChatInfos };
      })
    },
  },
}))