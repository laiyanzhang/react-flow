import { useCallback, useEffect, useRef } from  'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Employee from './customNode/employee';
import Param from './customNode/param';
import { Undo, Redo } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore';
import { useChatStore } from '@/store/chatStore';
import { getCanavsData } from '@/api/agent';
import styles from './index.module.less';
import { Tooltip } from 'antd';

interface CanvasFlowProps {
  chatMode: string;
  targetCanavasImage: string;
}

const CanvasFlow = ({chatMode, targetCanavasImage} : CanvasFlowProps) => {
  const { nodes, edges, locked, focusNodeIds } = useCanvasStore(state => state);
  const { setNodes, setEdges, recordSnapshot, undo, redo, connect, initial } = useCanvasStore(state => state.actions);
  const { conversationId } = useChatStore(state => state);
  const reactFlowInstance = useRef<any>(null);

  const onInit = (rf: any) => {
    reactFlowInstance.current = rf;
  };

  useEffect(() => {
    const getCanavasData = async() => {
      if(!conversationId) {
        initial()
      } else {
        const params = {
          conversationId: conversationId
        }
        const result: any = await getCanavsData(params)
        if(result.data) {
          initial(JSON.parse(result.data.data))
        } else {
          initial()
        }
      }
    }
    /* const getConversationId = async() => {
      const params = {
        conversationId: '3'
      }
      const result:any = await getWorkFlow(params)
      addWorkFlow(result.data[0].nodes, [])
    }
    getConversationId() */
    getCanavasData()
  }, [conversationId])

  useEffect(() => {
    if(focusNodeIds && reactFlowInstance.current) {
      const focusNodes = focusNodeIds.map(item => (
        {
          id: item
        }
      ))
      reactFlowInstance.current.fitView({
        nodes: focusNodes,
        padding: 0.5,
        duration: 500,
      });
    }
  }, [focusNodeIds]);

  const nodeTypes = {
    customEmployee: Employee,
    customParam: Param
  };

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes(applyNodeChanges(changes, nodes));
      if (changes.some((change: any) => 
        change.type !== 'position' && 
        change.type !== 'select' && 
        change.type !== 'unselect' &&
        change.type !== 'dimensions')
      ) {
        console.log('change')
        recordSnapshot();
      }
    },
    [nodes],
  );
  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges(applyEdgeChanges(changes, edges));
      if (changes.some((change: any) => 
        change.type !== 'select' && 
        change.type !== 'unselect')) {
        recordSnapshot();
      }
    },
    [edges],
  );
  const onConnect = useCallback(
    (params: any) => {
      connect(params, addEdge(params, edges));
      recordSnapshot();
    },
    [edges],
  );
 
  return (
    <div className={styles.canvasFlow}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={recordSnapshot}
        onInit={onInit}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
        fitView
        fitViewOptions={{
          padding: 0.5,    // 边距（0-1）
          duration: 500,    // 动画时长（ms）
        }}
      >
        <Background
          style={{ background: '#F5F5F5' }}
          color="#999999"
          variant={BackgroundVariant.Dots} />
        <Controls
          showInteractive={!locked}
          className={styles.controls}/>
      </ReactFlow>
      {
        nodes.length == 0 ? (
          <img src={targetCanavasImage} className={`${styles.img} ${chatMode === 'small' ? styles.smallMode : ''}`}></img>
        ) : null
      }
      <div className={styles.operations}>
        <Tooltip title="撤回">
          <div className={styles.undo} onClick={undo}>
            <Undo className={styles.icon}/>
          </div>
        </Tooltip>
        <div className={styles.divider}>|</div>
        <Tooltip title="重做">
          <div className={styles.redo} onClick={redo}>
            <Redo className={styles.icon}/>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

export default CanvasFlow