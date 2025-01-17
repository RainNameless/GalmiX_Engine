import { Node, Edge } from 'reactflow';

interface Spacing {
  horizontal: number;
  vertical: number;
}

export function treeLayout(nodes: Node[], edges: Edge[], direction: 'vertical' | 'horizontal', spacing: Spacing): Node[] {
  if (nodes.length === 0) return [];

  // Create adjacency list and in-degree count
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build adjacency list and count in-degrees
  edges.forEach(edge => {
    const sourceNeighbors = adjacencyList.get(edge.source) || [];
    sourceNeighbors.push(edge.target);
    adjacencyList.set(edge.source, sourceNeighbors);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find root node (node 1)
  const rootNodes = nodes.filter(node => node.id === '1');
  if (rootNodes.length === 0) {
    // If node 1 not found, fallback to nodes with no incoming edges
    rootNodes.push(...nodes.filter(node => inDegree.get(node.id) === 0));
    if (rootNodes.length === 0 && nodes.length > 0) {
      // If still no root found, use first node
      rootNodes.push(nodes[0]);
    }
  }


  // Assign levels using BFS
  const levels = new Map<string, number>();
  const queue: { nodeId: string; level: number }[] = rootNodes
    .sort((a, b) => (a.id === '1' ? -1 : b.id === '1' ? 1 : 0)) // Prioritize node 1
    .map(node => ({
      nodeId: node.id,
      level: 0,
    }));

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    
    // Only process if this is a better (smaller) level than previously assigned
    if (!levels.has(nodeId) || level < levels.get(nodeId)!) {
      levels.set(nodeId, level);
      
      // Add all neighbors to queue
      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        queue.push({ nodeId: neighbor, level: level + 1 });
      }
    }
  }

  // Count nodes at each level
  const nodesPerLevel = new Map<number, number>();
  const nodePositionsInLevel = new Map<number, number>();
  
  // Initialize counters
  for (const level of levels.values()) {
    nodesPerLevel.set(level, (nodesPerLevel.get(level) || 0) + 1);
    nodePositionsInLevel.set(level, 0);
  }

  // Calculate positions
  return nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const position = nodePositionsInLevel.get(level) || 0;
    const totalNodesInLevel = nodesPerLevel.get(level) || 1;
    
    // Update position counter for this level
    nodePositionsInLevel.set(level, position + 1);

    // Calculate x and y based on direction
    let x, y;
    if (direction === 'vertical') {
      x = (position - (totalNodesInLevel - 1) / 2) * spacing.horizontal;
      y = level * spacing.vertical;
    } else {
      x = level * spacing.horizontal;
      y = (position - (totalNodesInLevel - 1) / 2) * spacing.vertical;
    }

    return {
      ...node,
      position: { x, y },
      data: { ...node.data, layout: direction }
    };
  });
}

