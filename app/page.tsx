'use client'

import { MainEditor } from '../components/MainEditor';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ErrorFallback';
import { useState, useCallback } from 'react';
import { Node } from '../data/storyData';

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);

  const updateNodes = useCallback(() => {
    // This function should update the nodes based on your game logic
    // For now, we'll just log that it's been called
    console.log('updateNodes called');
    // You might want to fetch new nodes or update existing ones here
    // setNodes(newNodes);
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          componentName="Home"
        />
      )}
    >
      <AuthProvider>
        <MainEditor updateNodes={updateNodes} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

