import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  ReactFlow,
  addEdge,
  Position,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
} from '@xyflow/react';
import type { Edge, Node, OnConnect } from '@xyflow/react';
import CustomImgNode from '../components/canvasFlow/CustomImgNode';
import CustomVideoNode from '../components/canvasFlow/CustomVideoNode';
import CustomForm from '../components/canvasFlow/CustomForm';
import CustomText from '../components/canvasFlow/CustomText';

import '@xyflow/react/dist/style.css';

const generateRandomFlowData = (
  totalNodes: number
): { nodes: Node[]; edges: Edge[] } => {
  const nodeTemplates = [
    { type: 'CustomImgNode', width: 120, height: 100 },
    { type: 'CustomVideoNode', width: 100, height: 180 },
    { type: 'CustomForm', width: 250, height: 760 },
    { type: 'CustomText', width: 320, height: 110 },
  ];

  const generatedNodes: Node[] = [];
  const generatedEdges: Edge[] = [];

  if (totalNodes === 0) {
    return { nodes: [], edges: [] };
  }

  let nodeCounter = 0;
  let currentX = 0;
  const X_SPACING = 250;
  const Y_SPACING = 40;

  const rootTemplate =
    nodeTemplates[Math.floor(Math.random() * nodeTemplates.length)];
  const rootNode: Node = {
    id: (++nodeCounter).toString(),
    type: rootTemplate.type,
    data: {},
    position: { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
  generatedNodes.push(rootNode);

  let lastLayerNodeIds = [rootNode.id];
  let lastLayerMaxWidth = rootTemplate.width;

  while (nodeCounter < totalNodes) {
    const newLayerNodeIds: string[] = [];
    let newLayerMaxWidth = 0;
    currentX += lastLayerMaxWidth + X_SPACING;

    const sourceNodeId =
      lastLayerNodeIds[Math.floor(Math.random() * lastLayerNodeIds.length)];
    const sourceNode = generatedNodes.find(n => n.id === sourceNodeId);

    if (!sourceNode) continue;

    const childrenCount = Math.floor(Math.random() * 4) + 1;
    const childrenNodes: Node[] = [];
    let totalChildrenHeight = 0;

    for (let i = 0; i < childrenCount && nodeCounter < totalNodes; i++) {
      const template =
        nodeTemplates[Math.floor(Math.random() * nodeTemplates.length)];
      const newNode: Node = {
        id: (++nodeCounter).toString(),
        type: template.type,
        data: {},
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
      childrenNodes.push(newNode);
      newLayerMaxWidth = Math.max(newLayerMaxWidth, template.width);
      totalChildrenHeight += template.height;
    }

    const totalGroupHeight =
      totalChildrenHeight + (childrenNodes.length - 1) * Y_SPACING;
    let currentY =
      sourceNode.position.y -
      totalGroupHeight / 2 +
      (sourceNode.height ?? 0) / 2;

    for (const childNode of childrenNodes) {
      const template = nodeTemplates.find(t => t.type === childNode.type)!;
      childNode.position = { x: currentX, y: currentY };
      generatedNodes.push(childNode);
      newLayerNodeIds.push(childNode.id);

      generatedEdges.push({
        id: `e${sourceNodeId}-${childNode.id}`,
        source: sourceNodeId,
        target: childNode.id,
        animated: true,
      });

      currentY += template.height + Y_SPACING;
    }

    if (newLayerNodeIds.length > 0) {
      lastLayerNodeIds = newLayerNodeIds;
      lastLayerMaxWidth = newLayerMaxWidth;
    }
  }

  return { nodes: generatedNodes, edges: generatedEdges };
};

// ORIGINAL COMPONENT MODIFIED TO USE THE GENERATOR ---
const colorMap = (n: Node) => {
  if (n.type === 'input') return '#0041d0';
  if (n.type === 'CustomImgNode') return '#ff0072';
  if (n.type === 'CustomVideoNode') return '#ff9972';
  if (n.type === 'CustomForm') return '#009972';
  if (n.type === 'CustomText') return '#880072';
  return '#eee';
};

const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  CustomImgNode,
  CustomVideoNode,
  CustomForm,
  CustomText,
};

export default function XFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateRandomFlowData(20),
    []
  );

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    params => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <div>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={snapGrid}
          minZoom={0.1}
          fitView
        >
          <MiniMap nodeStrokeColor={colorMap} nodeColor={colorMap} />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
