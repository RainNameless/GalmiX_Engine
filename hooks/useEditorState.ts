import { useState, useCallback } from 'react';
import { Node, Choice } from '../data/storyData';
import { APIConfig } from '../services/aiService';

export const useEditorState = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<Node | null>(null);
  const [apiConfig, setAPIConfig] = useState<APIConfig | null>(null);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  const [layout, setLayout] = useState('TB');
  const [showEditorControls, setShowEditorControls] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiDialogue, setAiDialogue] = useState<string[]>([]);

  const handlePreviewToggle = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const handleShowAPIConfig = useCallback(() => {
    setShowAPIConfig(true);
  }, []);

  const handleSaveAPIConfig = useCallback((config: APIConfig) => {
    setAPIConfig(config);
    setShowAPIConfig(false);
  }, []);

  return {
    selectedNode,
    setSelectedNode,
    isPreviewMode,
    setIsPreviewMode,
    currentScenario,
    setCurrentScenario,
    apiConfig,
    setAPIConfig,
    showAPIConfig,
    setShowAPIConfig,
    layout,
    setLayout,
    showEditorControls,
    setShowEditorControls,
    error,
    setError,
    showLoginDialog,
    setShowLoginDialog,
    logs,
    setLogs,
    aiDialogue,
    setAiDialogue,
    handlePreviewToggle,
    handleShowAPIConfig,
    handleSaveAPIConfig,
  };
};

