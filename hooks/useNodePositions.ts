import { useState, useCallback, useEffect } from 'react';

export const useNodePositions = () => {
  const [nodePositions, setNodePositions] = useState<{[key: string]: {x: number, y: number}}>({});

  useEffect(() => {
    const savedPositions = localStorage.getItem('nodePositions');
    if (savedPositions) {
      setNodePositions(JSON.parse(savedPositions));
    }
  }, []);

  const updateNodePosition = useCallback((nodeId: string, position: {x: number, y: number}) => {
    setNodePositions(prev => {
      const newPositions = { ...prev, [nodeId]: position };
      localStorage.setItem('nodePositions', JSON.stringify(newPositions));
      return newPositions;
    });
  }, []);

  const saveNodePositions = useCallback((positions: { [key: string]: { x: number, y: number } }) => {
    localStorage.setItem('nodePositions', JSON.stringify(positions));
    setNodePositions(positions);
  }, []);

  return {
    nodePositions,
    updateNodePosition,
    saveNodePositions
  };
};

