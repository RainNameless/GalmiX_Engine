import { useState, useCallback, useEffect } from 'react';
import { Node, initialStoryData } from '../data/storyData';

export const useGameData = () => {
  const [gameData, setGameData] = useState<Node[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
      setGameData(JSON.parse(savedData));
    } else {
      setGameData(initialStoryData);
    }
  }, []);

  const saveGameData = useCallback((data: Node[]) => {
    localStorage.setItem('gameData', JSON.stringify(data));
    setGameData(data);
  }, []);

  const handleUpdateNode = useCallback((updatedNode: Node) => {
    setGameData(prevData => {
      const newData = prevData.map(node => node.id === updatedNode.id ? updatedNode : node);
      localStorage.setItem('gameData', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleAddNode = useCallback((newNode: Node) => {
    setGameData(prevData => {
      const newData = [...prevData, newNode];
      localStorage.setItem('gameData', JSON.stringify(newData));
      return newData;
    });
    return newNode;
  }, []);

  const handleDeleteNode = useCallback((nodeId: number) => {
    setGameData(prevData => {
      const newData = prevData.filter(node => node.id !== nodeId);
      localStorage.setItem('gameData', JSON.stringify(newData));
      return newData;
    });
  }, []);

  return {
    gameData,
    handleUpdateNode,
    handleAddNode,
    handleDeleteNode,
    saveGameData,
  };
};

