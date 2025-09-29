import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'
import { message } from 'antd'
import {
  copyNode,
  isUniqueNode,
  isAllowConnect,
  getSameTypeEdge,
  getActualContent,
  getOutPutParamNodeIds,
  getEmptyParamNodeId,
  createParamNode,
  createEdge,
  transformWorkFlow,
  createNodeGroup,
  transformFormValueToFormField,
  saveCanavs,
} from '@/components/canvas/util';
import { getWorkFlow, copyEmployeeNode } from '@/api/agent';
import { useChatStore } from './chatStore';

interface CanavasData {
  nodes: Node[],
  edges: Edge[]
}

interface FlowState {
  nodes: Node[],
  edges: Edge[],
  locked: boolean,
  isInitializing: boolean,
  focusNodeIds: string[],
  undoStack: { nodes: Node[], edges: Edge[] }[], // 历史快照
  redoStack: { nodes: Node[], edges: Edge[] }[], 
  actions: {
    setNodes: (nodes: Node[]) => void,
    setEdges: (edges: Edge[]) => void,
    setFocusNodeIds: (nodeId: string[]) => void,
    reset: () => void,
    initial: (data?: CanavasData) => void,
    // 记录当前状态到历史栈
    recordSnapshot: () => void,
    undo: () => void,
    redo: () => void,
    // 获取全局画布数据（供自定义节点使用）
    getFlowData: () => { nodes: Node[]; edges: Edge[] },
    deleteNode: (id: string, type: string) => void,
    editNodeContent: (id: string, index: number, value: string) => void,
    copyNode: (id: string, nodeHeight: number) => void,
    connect: (params: Edge, edges: Edge[]) => void,
    setLocked: (locked: boolean) => void,
    updateNodeStatus: (id: string, status: string) => void,
    updateFormField: (id: string, formValue:any) => void,
    addParamNode: (targetNode: Node, content: any, status?: string) => void,
    addWorkFlow: (workFlowNodes: any, uploadUrls:Array<string>) => void,
    fetchWorkFlow: (uploadUrls: Array<string>) => void,
    rebuildNodeGroup: (type: string, uploadUrls: Array<string>) => void
  };
};

export const useCanvasStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  undoStack: [],
  redoStack: [],
  locked: false,
  isInitializing: true,
  focusNodeIds: [],

  actions: {
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setFocusNodeIds: (nodeIds) => set({focusNodeIds: nodeIds}),

    // 重置所有
    reset: () => {
      set({
        nodes: [],
        edges: [],
        undoStack: [],
        redoStack: [],
        locked: false,
        isInitializing: true,
        focusNodeIds: [],
      })
    },

    initial: (data?: CanavasData) => {
      if(!data) {
        set({
          nodes: [],
          edges: [],
          undoStack: [],
          redoStack: []
        })
      } else {
        console.log(data.nodes)
        set({
          nodes: data.nodes,
          edges: data.edges,
          undoStack: [{ nodes: data.nodes, edges: data.edges }],
          redoStack: [],
        })
      }
    },
    
    recordSnapshot: () => {
      const { nodes, edges, undoStack } = get();
      const conversationId = useChatStore.getState().conversationId;
      saveCanavs(conversationId, nodes, edges);

      // 保存当前状态并截断历史（最多50步）
      set({ 
        undoStack: [...undoStack.slice(-49), { nodes, edges }],
        redoStack: [] // 新操作时清空重做栈
      });
    },

    undo: () => {
      const { undoStack, redoStack, nodes, edges } = get();
      if (undoStack.length < 2) return;
      
      const prevState = undoStack[undoStack.length - 2];
      const conversationId = useChatStore.getState().conversationId;
      saveCanavs(conversationId, prevState.nodes, prevState.edges);

      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, { nodes, edges }] // 当前状态入重做栈
      });
    },

    redo: () => {
      const { redoStack, nodes, edges } = get();
      if (redoStack.length === 0) return;
      
      const nextState = redoStack[redoStack.length - 1];
      const conversationId = useChatStore.getState().conversationId;
      saveCanavs(conversationId, nextState.nodes, nextState.edges);

      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        undoStack: [...get().undoStack, { nodes, edges }], // 当前状态入撤销栈
        redoStack: redoStack.slice(0, -1)
      });
    },

    getFlowData: () => {
      const { nodes, edges } = get();
      return { nodes, edges };
    },

    setLocked: (locked: boolean) => set({ locked }),

    // 删除节点（同时删除相关连线）
    deleteNode: (id: string, type: string) => {
      const { nodes, edges } = get();
      const isUnique = isUniqueNode(nodes, type)

      if(isUnique) {
        message.warning('不允许删除唯一该类型节点')
      } else {
        set({
          nodes: nodes.filter(n => n.id !== id),
          edges: edges.filter(e => 
            e.source !== id && e.target !== id
          )
        });
        get().actions.recordSnapshot();
      }
    
    },
    
    // 复制节点（生成新ID并偏移位置）
    copyNode: async (id: string, nodeHeight = 100) => {
      const { nodes } = get();
      const originalNode = nodes.find(n => n.id === id);
      if (!originalNode) return;
      const data:any = originalNode.data
      let nodeId = ''
      if(data.basicType === 'employee') {
        const params = {
          nodeId: data.nodeId
        }
        const result:any = await copyEmployeeNode(params)
        nodeId = result.data
      }
      
      const newNode = copyNode(originalNode, nodeHeight, nodeId)
      set({ nodes: [...nodes, newNode] });
      get().actions.recordSnapshot();
    },

    /**
     * 编辑节点内容
     * @param id 节点ID
     * @param index 内容数组索引
     * @param value 新的值
     */
    editNodeContent: (id: string, index: number, value: string) => {
      const { nodes } = get();
      
      const newNodes = nodes.map(node => {
        if (node.id === id) {
          const content = node.data.content as Array<any>;
          // 确保 content 数组和指定索引存在
          if (content && content[index]) {
            // 创建新节点对象，避免修改原对象
            return {
              ...node,
              data: {
                ...node.data,
                content: content.map((contentItem: any, i:number) => 
                  i === index ? { ...contentItem, value } : contentItem
                )
              }
            };
          }
        }
        return node;
      });
      
      set({ nodes: newNodes });
      get().actions.recordSnapshot();
    },

    /**
     * 连线前置判断
     * @param {Edge} params - 变化线
     * @param {Edge[]} newEdges - 连线数组拼接变化线
     */
    connect: (params: Edge, newEdges: Edge[]) => {
      let { nodes, edges } = get();
      if(isAllowConnect(nodes, params)) {
        const edgeIds = getSameTypeEdge(edges, nodes, params)
        // 将连线数组中其他相同类型连线去除
        newEdges = newEdges.filter(edge => !edgeIds.includes(edge.id))
        set({ edges: newEdges });
      } else {
        message.warning('不允许连线')
      }
    },

    // 根据生成交互修改节点状态
    updateNodeStatus: (id: string, status: string) => {
      const { nodes, edges } = get();
      
      const newNodes = nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              status
            }
          };
        }
        return node;
      });

      const conversationId = useChatStore.getState().conversationId;
      saveCanavs(conversationId, newNodes, edges);
      
      set({ nodes: newNodes });
      
    },

    // 更新节点表单内容
    updateFormField: (id: string, formValue: any) => {
      const valueMap = transformFormValueToFormField(formValue)
      const { nodes } = get();
      
      const newNodes = nodes.map(node => {
        if (node.id === id) {
          const formField:any = node.data.formField
          formField.forEach((item: any) => {
            item.value = valueMap[item.name]
          })
          return {
            ...node,
            data: {
              ...node.data,
              formField
            }
          };
        }
        return node;
      });

      set({ nodes: newNodes });
      get().actions.recordSnapshot();
    },

    // 将生成结果填入新增/原有参数节点
    addParamNode: (targetNode: Node, content: any, status?: string) => {
      const { nodes, edges } = get();
      const outputData = status == 'error' ? null : JSON.parse(content)
      const outputParams:any = targetNode.data.outputParams
      const param = outputParams[0]
      let updatedNodes = [...nodes];
      let updatedEdges = [...edges]; 
      const actualContent = status == 'error' ? [] : getActualContent(outputData, param)
      const outputNodeIds = getOutPutParamNodeIds(edges, targetNode.id)
      const basicConfig = {
        type: param.type,
        name: param.name,
        content: actualContent,
        status
      }
      if(outputNodeIds.length == 0) {
        // 没有任何输出节点
        const newNode = createParamNode(
          nodes,
          targetNode.id,
          basicConfig,
          true,
        )
        updatedNodes = [...updatedNodes, newNode]; // 累积节点更新
        updatedEdges = [...updatedEdges, createEdge(newNode.id, targetNode.id)]
      } else {
        const emptyNodeId = getEmptyParamNodeId(nodes, outputNodeIds, param)
        if(emptyNodeId) {
          // 存在空的输出节点
          updatedNodes = updatedNodes.map(node => {
            if (node.id === emptyNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  content: actualContent,
                  status
                }
              };
            }
            return node;
          });        
        } else {
          // 不存在空的输出节点
          const newNode = createParamNode(
            nodes,
            outputNodeIds[outputNodeIds.length - 1],
            basicConfig,
            false,
          )
          updatedNodes = [...updatedNodes, newNode]; // 累积节点更新
          updatedEdges = [...updatedEdges, createEdge(newNode.id, targetNode.id)]
        }
      }
      set({ nodes: updatedNodes, edges: updatedEdges });
    },

    // TODO：预计V2版本实现多参数节点
    addParamNodeV2: (targetNode: Node, content: any) => {
      const { nodes, edges } = get();
      const outputData = JSON.parse(content)
      /* const outputData = {
        video_captions: ['123', '234'],
        video_urls: ['https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/d6a75111e69405c55a62fca4cb4041c9.mp4', 'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/sd-out/5dced56520a63252c8f1432d69bb1522.mp4'],
        video_categories: ['123', '321']
      } */
      const outputParams:any = targetNode.data.outputParams

      let updatedNodes = [...nodes];
      let updatedEdges = [...edges];

      outputParams.forEach((param: any) => {
        const actualContent = getActualContent(outputData, param)
        console.log(outputData, param, actualContent)
        const outputNodeIds = getOutPutParamNodeIds(edges, targetNode.id)
        const basicConfig = {
          type: param.type,
          name: param.name,
          content: actualContent,
        }
        if(outputNodeIds.length == 0) {
          // 没有任何输出节点
          const newNode = createParamNode(
            nodes,
            targetNode.id,
            basicConfig,
            true,
            /* outputData */
          )
          updatedNodes = [...updatedNodes, newNode]; // 累积节点更新
          updatedEdges = [...updatedEdges, createEdge(newNode.id, targetNode.id)]
        } else {
          const emptyNodeId = getEmptyParamNodeId(nodes, outputNodeIds, param)
          if(emptyNodeId) {
            // 存在空的输出节点
            updatedNodes = updatedNodes.map(node => {
              if (node.id === emptyNodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    content: actualContent,
                  }
                };
              }
              return node;
            });        
          } else {
            // 不存在空的输出节点
            const newNode = createParamNode(
              nodes,
              outputNodeIds[outputNodeIds.length - 1],
              basicConfig,
              false,
              /* outputData */
            )
            updatedNodes = [...updatedNodes, newNode]; // 累积节点更新
            updatedEdges = [...updatedEdges, createEdge(newNode.id, targetNode.id)]
          }
        }
      })
      set({ nodes: updatedNodes, edges: updatedEdges });
    },

    // 测试用：完整工作流的新增
    addWorkFlow: (workFlowNodes: any, uploadUrls: Array<string>) => {
      const { nodes, edges } = get();
      const { newNodes, newEdges } = transformWorkFlow(nodes, workFlowNodes, uploadUrls)
      set({ nodes: [...nodes, ...newNodes] });
      set({ edges: [...edges, ...newEdges] })
      get().actions.recordSnapshot();
    },

    // 获取工作流后将工作流协议转化为画布协议添加到画布上
    fetchWorkFlow: async(uploadUrls: Array<any>) => {
      const conversationId = useChatStore.getState().conversationId;
      if(!conversationId) {
        message.error('暂无会话')
        return
      }
      const params = {
        conversationId: conversationId
      }
      const result:any = await getWorkFlow(params)
      const workFlowNodes = result.data[0].nodes
      const { nodes, edges } = get();
      const { newNodes, newEdges } = transformWorkFlow(nodes, workFlowNodes, uploadUrls);
      const finalNodes = [...nodes, ...newNodes];
      const finalEdges = [...edges, ...newEdges];
      const focusNodeIds = [newNodes[0]?.id, newNodes[1]?.id, newNodes[2]?.id]
      set({
        nodes: finalNodes,
        edges: finalEdges,
        focusNodeIds,
      });
      get().actions.recordSnapshot();
    },

    // 根据对应类型的当前最新创建的员工节点新增节点组
    rebuildNodeGroup: async (type: string, uploadUrls: Array<any>) => {
      const { nodes, edges } = get()
      const { nodes: newNodes, edges: newEdges} = await createNodeGroup(nodes, edges, type, uploadUrls)
      const finalNodes = [...nodes, ...newNodes];
      const finalEdges = [...edges, ...newEdges];
      console.log(finalNodes, finalEdges)
      const focusNodeIds = [newNodes[0]?.id, newNodes[1]?.id, newNodes[2]?.id]
      set({
        nodes: finalNodes,
        edges: finalEdges,
        focusNodeIds,
      })
      get().actions.recordSnapshot();
    }
  }
}));