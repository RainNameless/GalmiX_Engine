import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName: string;
}

export function ErrorFallback({ error, resetErrorBoundary, componentName }: ErrorFallbackProps) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 rounded">
      <p className="text-lg font-bold text-red-800">错误发生在 {componentName} 组件中：</p>
      <pre className="mt-2 p-2 bg-white rounded text-sm">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        重试
      </button>
    </div>
  );
}

