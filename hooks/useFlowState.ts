import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge } from 'reactflow';
import { Node } from '../data/storyData';
import { useNodePositions } from './useNodePositions';

export const useFlowState = (gameData: Node[], layout: string) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { nodePositions, updateNodePosition } = useNodePositions();

  const updateNodes = useCallback(() => {
    const newNodes = gameData.map((node) => ({
      id: node.id.toString(),
      type: 'gameNode',
      data: { ...node, connectedNodes: getConnectedNodes(node.id) },
      position: nodePositions[node.id.toString()] || getNodePosition(node.id),
    }));

    const newEdges = gameData.flatMap((node) =>
      node.choices
        .filter(choice => choice.nextId !== null)
        .map((choice) => ({
          id: `e${node.id}-${choice.nextId}`,
          source: node.id.toString(),
          target: choice.nextId!.toString(),
          animated: true,
        }))
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [gameData, nodePositions, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getNodePosition = useCallback((id: number) => {
    const index = id - 1;
    const x = (layout === 'TB' ? 0 : 1) * (index % 5) * (250 + 100);
    const y = (layout === 'TB' ? 1 : 0) * Math.floor(index / 5) * (150 + 100);
    return { x, y };
  }, [layout]);

  const getConnectedNodes = useCallback((nodeId: number) => {
    const node = gameData.find(n => n.id === nodeId);
    if (!node) return [];
    return node.choices.map(choice => choice.nextId).filter((id): id is number => id !== null);
  }, [gameData]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodes,
    updateNodePosition,
  };
};

