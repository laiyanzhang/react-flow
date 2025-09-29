import { request } from './request';

interface ConversationParams {
  conversationId: string
}

interface NodeIdParams {
  nodeId: string
}

interface WorkFlowExcute {
  workflowId: string
  nodeId: string
  inputParam: any
}

interface WorkFlowResult {
  workflowId: string,
  nodeId: string,
}

interface CanavasData {
  conversationId: string,
  data: string
}

interface stopParams {
  conversationId: string,
  model: string
}

interface ChatInfo {
  conversationId: string,
  role: string,
  content: string,
  metadata: string,
  msgType: string,
  modelName: string,
}

// 终止对话
export const stopMessage = (params: stopParams) => {
  return request('conversation/cancelStream', params)
}

// 插入生成中间信息
export const insertMessage = (params: any) => {
  return request('message/insert', params)
}

// 获取会话下的工作流内容
export const getWorkFlow = (params: ConversationParams) => {
  return request('api/workflow/get', params);
};

// 执行工作流中某一员工
export const excuteWorkFlow = (params: WorkFlowExcute) => {
  return request('api/workflow/invoke', params);
};

// 获取工作流执行结果
export const getWorkFlowResult = (params: WorkFlowResult) => {
  return request('api/workflow/getNodeProcess', params);
};

// 查询画布数据
export const getCanavsData = (params: ConversationParams) => {
  return request('api/canvas/get', params);
};

// 保存画布数据
export const saveCanavsData = (params: CanavasData) => {
  return request('api/canvas/save', params);
};

// 获取新的nodeId
export const copyEmployeeNode = (params: NodeIdParams) => {
  return request('api/workflow/copyNode', params);
};

// 插入聊天信息
export const insertInfo = (params: ChatInfo) => {
  return request('message/insert', params);
}

// 获取会话历史记录
export const getConversationHistory = (params: any) => {
  return request('conversation/page', params);
}

// 获取会话下的聊天信息
export const getChatInfos = (params: any) => {
  return request('message/list', params);
}

// 获取群组列表
export const fetchGroups = (params: any) => {
  return request('agent-group/page', params);
}

// 获取员工列表
export const fetchAgent = (params: any) => {
  return request('agent/page', params);
}

// 获取对应群组内所有员工
export const fetchGroupAgents = (params: any) => {
  return request('agent/listByGroupId', params);
}

// 获取会话详情
export const fetchConversationDetail = (params: any) => {
  return request('conversation/type', params);
}