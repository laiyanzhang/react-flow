import type { Node, Edge } from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid';
import { copyEmployeeNode, saveCanavsData } from '@/api/agent';

const unionWidth = 400

interface param {
  name: string,
  type: string
}

interface content {
  type: string,
  value: string,
  isSelected: boolean,
  tip?: string
}

interface position {
  x: number,
  y: number
}

interface config {
  name: string,
  type: string,
  nodeId: string,
  workflowId: string,
  formField: Array<any>,
  inputParams: Array<any>,
  outputParams: Array<any>,
  nextNode: any,
  position: position
}

interface paramConfig {
  type: string,
  name: string,
  content: content[],
  outputData?: any,
  status?: string,
}

// 根据被复制节点以及高度返回复制的新节点
export const copyNode = (originalNode: Node, nodeHeight: number, nodeId: string) => {
  const newId = uuidv4()
  const newNode = {
    ...originalNode,
    id: newId,
    position: {
      x: originalNode.position.x,
      y: originalNode.position.y + nodeHeight + 50,
    },
    data: {
      ...originalNode.data,
      time: Date.now(),
      nodeId: nodeId ? nodeId : null,
      status: originalNode.data.status ? 'complete' : null
    }
  };
  return newNode
}

// 判断该类型节点在节点数组中是否唯一
export const isUniqueNode = (nodes: Node[], type: string) => {
  let sameTypeNodeNumber = 0
  nodes.forEach((item) => {
    if(item.data.type === type) sameTypeNodeNumber++
  })
  if(sameTypeNodeNumber > 1) return false
  else return true
}

// 获取所有以当前节点为目标节点的所有节点
const getAllSourceNodeIdsByTarget = (edges: Edge[], target: string): string[] => {
  const nodeIds: string[] = []
  edges.forEach(item => {
    if(item.target === target) {
      nodeIds.push(item.source)
    }
  })
  return nodeIds
}

// 获取连线中对应的节点
const getEdgeNodes = (nodes: Node[], changeParams: Edge) => {
  const { source, target } = changeParams
  const targetNodeIndex = nodes.findIndex(item => item.id === target)
  const sourceNodeIndex = nodes.findIndex(item => item.id === source)
  const targetNode = nodes[targetNodeIndex]
  const sourceNode = nodes[sourceNodeIndex]
  return {
    targetNode,
    sourceNode,
  }
}



// 处理返回：获取连线数组中所有与源节点类型相同且与该类型员工节点连线的节点id数组
const getSameTypeInputEdge = (edges: Edge[], nodes: Node[], sourceNode: Node, targetNode: Node) => {
  const edgeIds: string[] = []
  const sourceNodeType = sourceNode.data.type
  edges.forEach(item => {
    let nodeIndex = 0
    let node: Node = nodes[nodeIndex]

    // 在连线数组中找到所有均为相同目标节点的节点
    if(item.target === targetNode.id) {
      // 找到连线对应的源节点
      nodeIndex = nodes.findIndex(node => node.id === item.source)
      if(nodeIndex > -1) {
        node = nodes[nodeIndex]
        // 当该节点与新连线源节点为同类型节点时，记录连线对应id
        if(node.data.type === sourceNodeType) {
          edgeIds.push(item.id)
        }
      }
    }
  })
  return edgeIds
}

// 处理返回：获取连线数组中所有与目标节点类型相同且与该类型员工节点连线的节点id数组
const getSameTypeOutputEdge = (edges: Edge[], nodes: Node[], sourceNode: Node, targetNode: Node) => {
  const edgeIds: string[] = []
  const targetNodeType = targetNode.data.type
  edges.forEach(item => {
    let nodeIndex = 0
    let node: Node = nodes[nodeIndex]

    // 在连线数组中找到所有均为相同源节点的节点
    if(item.source === sourceNode.id) {
      // 找到连线对应的目标节点
      nodeIndex = nodes.findIndex(node => node.id === item.target)
      if(nodeIndex > -1) {
        node = nodes[nodeIndex]
        // 当该节点与新连线目标节点为同类型节点时，记录连线对应id
        if(node.data.type === targetNodeType) {
          edgeIds.push(item.id)
        }
      }
    }
  })
  return edgeIds
}

// 获取所有相同类型的连线
export const getSameTypeEdge = (edges: Edge[], nodes: Node[], changeParams: Edge) => {
  const { sourceNode, targetNode } = getEdgeNodes(nodes, changeParams)
  let inputEdgeIds:string[] = []
  let outputEdgeIds:string[] = []
  if(targetNode.data.basicType === 'employee' && sourceNode.data.basicType === 'param') {
    inputEdgeIds = getSameTypeInputEdge(edges, nodes, sourceNode, targetNode)
  }
  if(targetNode.data.basicType === 'param' && sourceNode.data.basicType === 'employee') {
    outputEdgeIds = getSameTypeOutputEdge(edges, nodes, sourceNode, targetNode)
  }
  return inputEdgeIds.concat(outputEdgeIds)
}

// 判断连线的两个节点是否允许连接
export const isAllowConnect = (nodes: Node[], changeParams: Edge) => {
  const { sourceNode, targetNode } = getEdgeNodes(nodes, changeParams)

  if(targetNode.data.basicType == sourceNode.data.basicType) {
    return false
  } else if(targetNode.data.basicType == 'employee' && sourceNode.data.basicType == 'param') {
    const inputParams = targetNode.data.inputParams as param[]
    let isMatch = false
    inputParams.forEach((item) => {
      if(item.type === sourceNode.data.type) isMatch = true
    })
    return isMatch
  }
  return true
}


// 判断当前员工节点是否有完整入参以及获取对应入参
// 当前仅判断是否有对应节点，不判断是否有其他不符合要求的入参节点
export const getMatchParams = (edges: Edge[], nodes: Node[], employeeNode: Node) => {
  const nodeIds = getAllSourceNodeIdsByTarget(edges, employeeNode.id)
  const inputParams = employeeNode.data.inputParams as param[]
  const inputNodes: Node[] = []
  const inputFields: any = {}
  let isMatch = true
  nodes.forEach(node => { 
    if(nodeIds.includes(node.id)) inputNodes.push(node)
  })
  // 在源节点中找到需要的参数节点
  inputParams.forEach(param => {
    let isParamMacth = false
    const index = inputNodes.findIndex(node => node.data.type === param.type)
    if(index > -1) {
      const inputNode = inputNodes[index]
      const content = inputNode.data.content as content[]
      const outputData = inputNode.data.outputData
      if(outputData) {
        // 若存在原装的输出参数则直接使用
        Object.assign(inputFields, outputData)
        isParamMacth = true
      } else { 
        // 当前默认传递数组，TODO：根据协议字段判断传递的字段类型
        inputFields[param.type] = []
        content.forEach((item) => {
          if(item.value) {
            inputFields[param.type].push(item.value)
            isParamMacth = true
          }
        })
      }
    }
    if(!isParamMacth) isMatch = false
  })
  return {
    isMatch,
    inputFields
  }
}

// 根据员工节点的输出参数配置，在返回结果中获取对应字段的数据
export const getMatchOutput = (response: any, employeeNode: Node) => {
  const outputParams = employeeNode.data.outputParams as param[]
  const outputFields: any = []
  outputParams.forEach((param) => {
    const field = {
      type: param.type,
      value: response.data[param.type]
    }
    outputFields.push(field)
  })
  return outputFields
}

/**
 * 获取所有节点中position.y的最大值
 * @param {nodes[]} nodes - 包含节点数据的对象
 * @returns {number} y坐标最大值，如果没有节点则返回null
 */
export const getMaxYPosition = (nodes: Node[]): number => {
  // 检查数据是否存在且包含node数组
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return 0;
  }

  // 过滤出包含position.y的有效节点，并获取最大值
  const validNodes = nodes.filter((node: Node) => 
    node.position && 
    typeof node.position.y === 'number'
  );

  if (validNodes.length === 0) {
    return 0;
  }

  return Math.max(...validNodes.map((node:Node) => node.position.y));
}

// 根据上一节点计算当前节点坐标
export const dealNodePosition = (
  lastNode: Node,
  maxYPosition: number,
): position => { 
  let position = {
    x: 0,
    y: 0
  }
  if(lastNode) {
    const data:any = lastNode.data
    position.x = lastNode.position.x + data.style.width + 50
    position.y = maxYPosition + 350
  } else {
    position.x = 0
    position.y = maxYPosition + 350
  }
  return position
}


// 根据传入的nodeId找到对应的node
export const getTargetNode = (nodes: Node[], nodeId: string): Node | undefined => {
  return nodes.find(item => item.id === nodeId);
}

// 识别字符串的类型
const getStringType = (url: string): string => {
  // 音频文件
  if (/\.(mp3|wav|ogg|flac|m4a|aac|wma)$/i.test(url)) {
    return 'video';
  }
  // 视频文件
  else if (/\.(mp4|avi|mkv|mov|wmv|flv|webm|m4v)$/i.test(url)) {
    return 'video';
  }
  // 图片文件
  else if (/\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i.test(url)) {
    return 'image';
  }
  // 文本文件
  else {
    return 'text'
  }
};

// 将智能体输出参数转化为画布协议可用的content字段
export const getActualContent = (outputData: any, param: any) => {
  let content:Array<any> = []
  const field = param.type
  const actualContent = outputData[field]
  if (Array.isArray(actualContent)) {
    actualContent.forEach((item: string) => {
      let obj = {
        type: getStringType(item),
        value: item,
        isSelected: false
      }
      content.push(obj)
    })
  } else if (typeof actualContent === 'string') {
    let obj = {
      type: getStringType(actualContent),
      value: actualContent,
      isSelected: false
    }
    content.push(obj)
  }
  // 特殊处理video_captions字段
  // TODO：V2版本去除特殊处理
  if(outputData.video_captions) {
    const extraInfo = outputData.video_captions
    if (Array.isArray(extraInfo)) {
      content.forEach((item: content, index: number) => {
        item.tip = extraInfo[index]
      })
    } else if (typeof extraInfo === 'string') {
      content[0].tip = extraInfo
    }
  }
  return content;
}


// 获取当前节点的所有输出节点
export const getOutPutParamNodeIds = (edges: Edge[], nodeId: string) => {
  const targetNodeIds:string[] = []
  edges.forEach((item: Edge) => {
    if(item.source === nodeId) targetNodeIds.push(item.target)
  })
  return targetNodeIds
}

// 根据输出节点id数组找出内容为空且非失败的节点的节点id
export const getEmptyParamNodeId = (nodes: Node[], targetNodeIds: string[], param:any) => {
  let targetNodeId = ''
  nodes.forEach((item: Node) => {
    const data:any = item.data
    if(targetNodeIds.includes(item.id)) {
      if(!data.content.length && data.status !== 'error' && data.type === param.type) targetNodeId = item.id 
    }
  })
  return targetNodeId
}

// 通过判断是否是首个该类型的参数节点决定纵坐标或者横坐标变化
const cauculateParamNodePosition = (nodes: Node[], targetNodeId: string, initial: boolean) => {
  let positionX
  let positionY
  const targetNode = getTargetNode(nodes, targetNodeId)
  const data:any = targetNode?.data
  const position:any = targetNode?.position
  if(initial) {
    positionX = position.x + data.style.width
    positionY = position.y
  } else {
    positionX = position.x
    positionY = position.y + 350
  }
  return {
    x: positionX,
    y: positionY
  }
}

// targetNode位置计算需要的目标节点
export const createParamNode = (nodes: Node[], targetNodeId: string, basicConfig: paramConfig, initial: boolean) => {
  const node = {
    id: uuidv4(),
    type: 'customParam',
    position: cauculateParamNodePosition(nodes, targetNodeId, initial),
    data: {
      time: Date.now(),
      basicType: 'param',
      type: basicConfig.type,
      name: basicConfig.name,
      status: basicConfig.status,
      style: {
        width: unionWidth,
      },
      content: basicConfig.content,
      outputData: basicConfig.outputData
    }
  }
  return node
}

// 根据传入的目标id以及源id创建连线
export const createEdge = (targetId: string, sourceId: string) => {
  return {
    id: uuidv4(),
    target: targetId,
    source: sourceId,
    sourceHandle: 'b',
    targetHandle: 'a'
  }
}

// 将传入的url数组转化为content字段
const createContentByUrls = (uploadUrls: Array<string>) => {
  const content:Array<any> = []
  uploadUrls.forEach((url) => {
    let obj = {
      type: getStringType(url),
      value: url,
      isSelected: false
    }
    content.push(obj)
  })
  return content
}

// 根据基础信息生成一个内容为空的参数节点
const createEmptyParamNode = (config: any) => {
  const node = {
    id: uuidv4(),
    type: 'customParam',
    position: config.position,
    data: {
      time: Date.now(),
      basicType: 'param',
      type: config.type,
      name: config.name,
      style: {
        width: unionWidth,
      },
      content: config.content || []
    }
  }
  return node
}

// 根据基础信息生成一个内容为空的员工节点
const createEmptyEmployeeNode = (config: config) => {
  const node = {
    id: uuidv4(),
    type: 'customEmployee',
    // 节点位置
    position: config.position,
    data: {
      time: Date.now(),
      basicType: 'employee',
      type: config.type,
      name: config.name,
      nodeId: config.nodeId,
      workflowId: config.workflowId,
      status: 'complete',
      formField: config.formField,
      nextNode: config.nextNode,
      style: {
        width: unionWidth,
      },
      inputParams: config.inputParams,
      outputParams: config.outputParams,
    }
  }
  return node
}

// 获取当前员工节点与下一个员工节点信息的map
const createNextNodeMap = (workFlowNodes: Array<any>) => {
  const map:any = {}
  let lastNode:any
  workFlowNodes.forEach((item) => {
    const currentNodeId = item.id
    map[currentNodeId] = {
      nodeId: '',
      type: '',
      name: ''
    }
    if(lastNode) {
      lastNode.nodeId = item.id
      lastNode.type = item.agentType
      lastNode.name = item.name
    }
    lastNode = map[currentNodeId]
  })
  return map
}

// 将工作流协议转换为画布协议
export const transformWorkFlow = (originNodes: Node[], workFlowNodes: Array<any>, uploadUrls: Array<string>) => {
  let nodes: Node[] = []
  let edges: Edge[] = []
  let lastNode:any
  let lastParamNode: Array<any>
  const maxYPosition = getMaxYPosition(originNodes)
  const map = createNextNodeMap(workFlowNodes)
  workFlowNodes.forEach((node:any) => {
    const inputParamDefinition = JSON.parse(node.inputParamDefinition)
    const outputParamDefinition = JSON.parse(node.outputParamDefinition)
    const { name, agentType: type, id: nodeId, workflowId } = node
    const inputParams:Array<any> = []
    const outputParams:Array<any> = []
    const formField:Array<any> = []
    let inputParamNode:Array<any> = []
    const outputParamNode:Array<any> = []

    // 生成输入节点
    inputParamDefinition.forEach((param:any) => {
      if(!param.showInfront) return
      if(param.formField) {
        // 表单字段
        let field = {
          name: param.name,
          label: param.description,
          required: param.required,
          type: param.controlType,
          value: param.controlType === 'image' ? [] : ''
        }
        formField.push(field)
      } else {
        // 参数字段
        let field = {
          type: param.name,
          name: param.description,
        }
        inputParams.push(field)
        // 上一个员工的出参节点与该员工的入参节点一致，无需额外生成
        if(!lastParamNode) {
          const config = {
            type: field.type,
            name: field.name,
            position: dealNodePosition(lastNode, maxYPosition),
            content: createContentByUrls(uploadUrls)
          }
          const paramNode = createEmptyParamNode(config)
          lastNode = paramNode
          inputParamNode.push(paramNode)
        }
      }
    })
    outputParamDefinition.forEach((param:any) => {
      if(!param.showInfront) return
      let field = {
        type: param.name,
        name: param.description
      }
      outputParams.push(field)
    })

    // 生成员工节点
    const config = {
      name,
      type,
      position: dealNodePosition(lastNode, maxYPosition),
      nodeId,
      formField,
      inputParams,
      outputParams,
      workflowId,
      nextNode: map[nodeId]
    }
    const employeeNode = createEmptyEmployeeNode(config)
    lastNode = employeeNode

    // 生成输出节点
    outputParams.forEach((param:any) => {
      const config = {
        type: param.type,
        name: param.name,
        position: dealNodePosition(lastNode, maxYPosition)
      }
      const paramNode = createEmptyParamNode(config)
      lastNode = paramNode
      outputParamNode.push(paramNode)
    })

    // 批量更新节点以及连线
    // 引用上一节点的出参节点作为入参节点进行连线
    if(lastParamNode) inputParamNode = lastParamNode
    inputParamNode.forEach((paramNode: Node) => {
      const edge = {
        id: uuidv4(),
        source: paramNode.id,
        target: employeeNode.id,
        sourceHandle: 'b',
        targetHandle: 'a'
      }
      edges.push(edge)
    })
    outputParamNode.forEach((paramNode: Node) => {
      const edge = {
        id: uuidv4(),
        source: employeeNode.id,
        target: paramNode.id,
        sourceHandle: 'b',
        targetHandle: 'a'
      }
      edges.push(edge)
    })
    // 若已有上一员工节点的出参节点，则无需再添加
    let newNodes
    if(lastParamNode) {
      newNodes = [employeeNode].concat(outputParamNode)
    } else {
      newNodes = inputParamNode.concat([employeeNode]).concat(outputParamNode)
    }
    nodes = nodes.concat(newNodes)
    lastParamNode = outputParamNode
  })
  console.log(nodes)
  return {
    newNodes: nodes,
    newEdges: edges
  }
}

// 复制员工节点
const copyEmployee = async (originalNode: Node, maxYPosition: number) => {
  const data:any = originalNode.data
  const params = {
    nodeId: data.nodeId
  }
  console.log(originalNode.position.y, maxYPosition)
  const result:any = await copyEmployeeNode(params)
  const newNodeId = result.data
  const newNode = {
    ...originalNode,
    id: uuidv4(),
    position: {
      x: originalNode.position.x,
      y: maxYPosition + 300,
    },
    data: {
      ...data,
      time: Date.now(),
      nodeId: newNodeId,
      status: 'complete',
      formField: JSON.parse(JSON.stringify(data.formField))
    }
  };
  return newNode
}

// 复制参数节点
export const copyParam = (originalNode: Node, config: any) => {
  const data:any = originalNode.data
  const newNode = {
    ...originalNode,
    id: uuidv4(),
    position: config.position,
    data: {
      ...data,
      time: Date.now(),
      content: config.content && config.content.length > 0 ? config.content : data.content
    }
  }
  return newNode
}

// 根据最新的该类型员工生成节点组
export const createNodeGroup = async (nodes: Node[], edges: Edge[], type: string, uploadUrls: Array<string>) => {
  let lastestTime = 0
  let employeeNode: Node | any
  let maxYPosition = getMaxYPosition(nodes)
  const newNodes: Node[] = [] // 新节点数组
  const newEdges: Edge[] = [] // 新连线数组
  const inputNodeIds: string[] = [] // 原输入节点id数组
  const inputNodes: Node[] = [] // 原输入节点数组
  const newInputNodes: Node[] = [] // 新输入节点数组
  const newOutputNodes: Node[] = [] // 新输出节点数组
  let outputParams:any = [] // 限定输出节点个数
  let newEmployeeNodePosition = {
    x: 0,
    y: 0
  }
  let newEmployeeNode: Node | any // 新生成的员工节点
  // 找出最新生成的同类型员工节点
  nodes.forEach((item: Node) => {
    const data:any = item.data
    if(data.type === type && data.time > lastestTime) {
      employeeNode = item
    }
  })
  if(!employeeNode) {
    return {
      nodes: [],
      edges: []
    }
  } else {
    // 复制该员工节点
    newEmployeeNode = await copyEmployee(employeeNode, maxYPosition)
    newNodes.push(newEmployeeNode)
    newEmployeeNodePosition = newEmployeeNode.position
    const data:any = newEmployeeNode.data
    // 获取员工限定输出节点
    data.outputParams.forEach((item: any) => {
      outputParams.push(item)
    })
  }
  // 根据连线数组找到输入节点id数组
  edges.forEach((item: Edge) => {
    if(item.target === employeeNode.id) {
      inputNodeIds.push(item.source)
    }
  })
  // 根据节点数组找到输入节点数组
  nodes.forEach((item: Node) => {
    if(inputNodeIds.includes(item.id)) {
      inputNodes.push(item)
    }
  })
  let content = createContentByUrls(uploadUrls)
  // 生成新的输入节点
  inputNodes.forEach((item: Node, index: number) => {
    let config = {
      position: {
        x: newEmployeeNodePosition.x - (unionWidth + 50),
        y: newEmployeeNodePosition.y - (index * 350)
      },
      content: content
    }
    const paramNode = copyParam(item, config)
    newInputNodes.push(paramNode)
  })
  // 生成新的输出节点
  outputParams.forEach((item: any, index: number) => {
    const config = {
      type: item.type,
      name: item.name,
      position: {
        x: newEmployeeNodePosition.x + (unionWidth + 50),
        y: newEmployeeNodePosition.y - (index * 350)
      },
    }
    const paramNode = createEmptyParamNode(config)
    newOutputNodes.push(paramNode)
  })
  // 生成新的连线
  if(newEmployeeNode) {
    const employeeId = newEmployeeNode.id
    newInputNodes.forEach((item) => {
      const edge = createEdge(employeeId, item.id)
      newEdges.push(edge)
    })
    newOutputNodes.forEach((item) => {
      const edge = createEdge(item.id, employeeId)
      newEdges.push(edge)
    })
  }
  return {
    nodes: newNodes.concat(newInputNodes).concat(newOutputNodes),
    edges: newEdges
  }
}

const caculateExceedTime = (dateTimeString: string): number => {
  const targetDate = new Date(dateTimeString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - targetDate.getTime();
  const minutesDifference = timeDifference / (1000 * 60);
  
  return minutesDifference;
}

// 计算刷新时间间隔
export const caculateIntervalTime = (dateTimeString: string) => {
  const exceedTime = caculateExceedTime(dateTimeString)
  let intervalTime = 5000
  if (exceedTime > 5) {
    intervalTime = 50000;
  } else if (exceedTime > 4) {
    intervalTime = 40000;
  } else if (exceedTime > 3) {
    intervalTime = 30000;
  } else if (exceedTime > 2) {
    intervalTime = 20000;
  } else if (exceedTime > 1) {
    intervalTime = 10000;
  }
  return intervalTime
}

// 将生成结果转化为聊天信息
export const createChatInfo = (targetNode: Node, outputParam: any) => {
  const data:any = targetNode.data
  const nextNode = data.nextNode
  if(nextNode.nodeId) {
    let info = {
      type: 'TOOL',
      title: nextNode.name,
      agent: nextNode.type,
      content: '已收到您的信息，请在左侧完善好相关信息后，点击生成，我将立刻为您工作'
    }
    return info
  } else {
    const outputParams = data.outputParams
    const param = outputParams[0]
    const outputData = JSON.parse(outputParam)
    const field = param.type
    const actualContent = outputData[field]
    let content = ''
    let prefix = '已为你生成以下结果：'
    // 暂时特殊处理这类型字段
    if(outputData.video_captions) {
      let extraInfo = outputData.video_captions
      let itemContents:string[] = []
      actualContent.forEach((item: any, index: number) => {
        let itemContent = item + ' ' + extraInfo[index]
        itemContents.push(itemContent)
      })
      content = itemContents.join('')
    } else {
      if (Array.isArray(actualContent)) {
        content = actualContent.join('、')
      } else if (typeof actualContent === 'string') {
        content = actualContent
      }
    }
    let info = {
      type: 'TOOL',
      title: data.name,
      agent: data.type,
      content: content ? prefix + content : ''
    }
    return info
  }
}

// 画布协议字段转化为表单初始值
export const getFormValue = (formField: Array<any>) => {
  let formValue:any = {}
  formField.forEach((item: any) => {
    if(item.type === 'image') {
      let list:any = []
      if(item.value) {
        item.value.forEach((item: any) => {
          let obj = {
            uid: uuidv4(),
            status: 'done',
            url: item.url,
            name: item.name
          }
          list.push(obj)
        })
        formValue[item.name] = list
      } else {
        formValue[item.name] = []
      }
    } else {
      formValue[item.name] = item.value
    }
  })
  return formValue
}

// 将表单字段转化为画布协议需要的内容
export const transformFormValueToFormField = (formValue: any) => {
  let valueMap: any = {}
  for(let key in formValue) {
    let value = formValue[key]
    // 处理图片类型
    if(value && value.fileList) {
      let list:any[] = []
      value.fileList.forEach((item: any) => {
        let obj = {
          name: item.name,
          url: item.response.url
        }
        list.push(obj)
      })
      valueMap[key] = list
    } else {
      valueMap[key] = formValue[key]
    }
  }
  return valueMap
}

// 获取表单字段中需要提交的值
export const getFieldValue = (formValue: any) => {
  let valueMap: any = {}
  for(let key in formValue) {
    let value = formValue[key]
    // 处理图片类型
    if(value && (value.fileList || value instanceof Array)) {
      let list:any[] = []
      if(value.fileList) {
        value.fileList.forEach((item: any) => {
          list.push(item.response.url)
        }) 
      } else {
        value.forEach((item: any) => {
          list.push(item.url)
        })
      }
      valueMap[key] = list.length > 1 ? list : list[0]
    } else {
      valueMap[key] = formValue[key]
    }
  }
  return valueMap
}

// 保存画布数据
export const saveCanavs = (conversationId: string, nodes: Node[], edges: Edge[]) => {
  const data = {
    nodes,
    edges,
  }
  if(conversationId) {
    const params = {
      conversationId,
      data: JSON.stringify(data)
    }
    saveCanavsData(params)
  }
}