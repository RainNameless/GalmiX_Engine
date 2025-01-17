import React, { useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  MiniMap, 
  Background,
  Node as FlowNode,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  useReactFlow
} from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { GamePreview } from './GamePreview';
import { Node } from '../data/storyData';
import '../styles/EditorContent.css';
import styles from '../styles/EditorContent.module.css';

interface EditorContentProps {
  isPreviewMode: boolean;
  currentScenario: Node | null;
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: FlowNode) => void;
  onNodeDragStop: (event: React.MouseEvent, node: FlowNode) => void;
  onChoiceClick: (nextId: number | null) => void;
  nodeTypes: { [key: string]: React.ComponentType<any> };
  isMobile: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  isPreviewMode,
  currentScenario,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDragStop,
  onChoiceClick,
  nodeTypes,
  isMobile
}) => {
  const { setCenter } = useReactFlow();

  const onMiniMapNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    const zoom = 1.85;
    setCenter(node.position.x, node.position.y, { zoom, duration: 800 });
  }, [setCenter]);

  return (
    <div className="editor-content-container" style={{ height: '100%', width: '100%' }}>
      {isPreviewMode ? (
        currentScenario ? (
          <GamePreview currentScenario={currentScenario} onChoiceClick={onChoiceClick} />
        ) : (
          <div className="flex items-center justify-center h-full">加载中...</div>
        )
      ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            style={{ width: '100%', height: '100%' }}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            panOnScroll={false}
            zoomOnScroll={!isMobile}
            panOnDrag={true}
            selectionOnDrag={false}
            zoomOnPinch={!isMobile}
            preventScrolling={true}
            zoomOnDoubleClick={!isMobile}
            className={styles.noTapHighlight}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'gameNode':
                    return '#00ff00';  // 绿色
                  default:
                    return '#ffffff';  // 白色
                }
              }}
              nodeStrokeWidth={3}
              nodeBorderRadius={2}
              maskColor="rgba(0, 0, 0, 0.2)"
              onNodeClick={onMiniMapNodeClick}
              zoomable
              pannable
              style={{ width: isMobile ? 100 : 200, height: isMobile ? 75 : 150 }}
            />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </div>
  );
};

