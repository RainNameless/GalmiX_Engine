'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node as FlowNode, ReactFlowInstance } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { GameNode } from './GameNode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoginForm } from './LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { APIConfig } from './APIConfig';
import { ErrorBoundary } from 'react-error-boundary';
import { Node, Choice } from '../data/storyData';
import { aiService, APIConfig as AIConfig } from '../services/aiService';
import { EditorControls } from './EditorControls';
import { useGameData } from '../hooks/useGameData';
import { useNodePositions } from '../hooks/useNodePositions';
import { NodeEditor } from './NodeEditor';
import { generateHtmlContent } from '../utils/exportUtils';
import { ErrorFallback } from './ErrorFallback';
import { EditorHeader } from './EditorHeader';
import { EditorContent } from './EditorContent';
import { EditorFooter } from './EditorFooter';
import { AlertDialog } from './AlertDialog';
import { ImportNodeDialog } from './ImportNodeDialog';
import { treeLayout } from '../utils/treeLayout';
import { LayoutProvider } from '../contexts/LayoutContext';
import { Button } from "@/components/ui/button";
import { noteService } from '../services/noteService';
import { toast } from 'react-hot-toast';
import { SavedUrlDialog } from './SavedUrlDialog'; // Added import statement
import { LoadGameDialog } from './LoadGameDialog'; // Added import statement for LoadGameDialog

const nodeTypes = { gameNode: GameNode };

interface MainEditorProps {
  updateNodes: () => void;
}

interface EditorControlsProps {
  onAddNode: () => void;
  onExport: () => void;
  onImport: (jsonString: string) => void;
  onImportNode: () => void;
  onPreviewToggle: () => void;
  onShowAPIConfig: () => void;
  onCheckBalance: () => void;
  onVerticalLayout: () => void;
  onHorizontalLayout: () => void;
  isPreviewMode: boolean;
  onBatchAIGeneration: () => void;
  isMobile: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isAuthenticated: boolean;
  onOnlineSave: () => Promise<void>;
  onOnlineLoad: () => Promise<void>;
  onBatchDelete: () => void;
}

export function MainEditor({ updateNodes }: MainEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { gameData, handleUpdateNode, handleAddNode, handleDeleteNode, saveGameData } = useGameData();
  const { nodePositions, updateNodePosition, saveNodePositions } = useNodePositions();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<Node | null>(null);
  const [apiConfig, setAPIConfig] = useState<AIConfig | null>(null);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  const [showEditorControls, setShowEditorControls] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiDialogue, setAiDialogue] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', description: '' });
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [nodeSpacing, setNodeSpacing] = useState({ horizontal: 300, vertical: 200 });
  const [currentLayout, setCurrentLayout] = useState<'horizontal' | 'vertical'>('vertical');
  const [messages, setMessages] = useState<string[]>([]);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null); // Added state for the saved URL
  const [showSavedUrlDialog, setShowSavedUrlDialog] = useState(false); // Added state for saved URL dialog
  const [showLoadDialog, setShowLoadDialog] = useState(false); // Added state for load dialog
  const [loadResult, setLoadResult] = useState<{ success: boolean; message: string } | null>(null); // Added state for load result
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false); // Added state for mobile menu
  const [isLeftMenuExpanded, setIsLeftMenuExpanded] = useState(false); // Added state for left menu

  const { isAuthenticated, login, logout } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsPreviewMode(false);
      setShowEditorControls(true);
    }
  }, []);

  const calculateNodePosition = useCallback((id: number) => {
    const baseX = 0;
    const baseY = 0;
    const xOffset = 300; // 水平间距
    const yOffset = 200; // 垂直间距
    const nodesPerRow = 5; // 每行节点数

    const row = Math.floor((id - 1) / nodesPerRow);
    const col = (id - 1) % nodesPerRow;

    return {
      x: baseX + col * xOffset,
      y: baseY + row * yOffset
    };
  }, []);

  const getConnectedNodes = useCallback((nodeId: number) => {
    const node = gameData.find(n => n.id === nodeId);
    if (!node) return [];
    return node.choices.map(choice => choice.nextId).filter((id): id is number => id !== null);
  }, [gameData]);

  const updateFlowNodes = useCallback(() => {
    const newNodes = gameData.map((node) => ({
      id: node.id.toString(),
      type: 'gameNode',
      data: { 
        ...node, 
        connectedNodes: getConnectedNodes(node.id),
        layout: currentLayout // Add the current layout to node data
      },
      position: nodePositions[node.id.toString()] || calculateNodePosition(node.id),
    }));

    const newEdges = gameData.flatMap((node) =>
      node.choices
        .filter(choice => choice.nextId !== null)
        .map((choice, index) => ({
          id: `e${node.id}-${choice.nextId}-${index}`,
          source: node.id.toString(),
          target: choice.nextId!.toString(),
          animated: true,
        }))
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [gameData, nodePositions, setNodes, setEdges, getConnectedNodes, calculateNodePosition, currentLayout]);

  useEffect(() => {
    try {
      console.log('Game data:', gameData);
      if (gameData.length > 0 && !currentScenario) {
        console.log('Setting initial scenario');
        setCurrentScenario(gameData[0]);
      }
      const savedPositions = localStorage.getItem('nodePositions');
      if (savedPositions) {
        const parsedPositions = JSON.parse(savedPositions);
        Object.entries(parsedPositions).forEach(([nodeId, position]) => {
          updateNodePosition(nodeId, position as { x: number, y: number });
        });
      }
      updateNodes();
    } catch (err) {
      console.error('Error in MainEditor useEffect:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    }
  }, [gameData, currentScenario, updateNodes, updateNodePosition]);

  useEffect(() => {
    console.log('Current scenario:', currentScenario);
  }, [currentScenario]);

  useEffect(() => {
    if (isAuthenticated && showEditorControls) {
      updateFlowNodes();
    }
  }, [gameData, nodePositions, isAuthenticated, showEditorControls, updateFlowNodes, nodeSpacing]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (!isPreviewMode && isAuthenticated) {
      setSelectedNode(node.data);
      setShowNodeEditor(true);
    }
  }, [isPreviewMode, isAuthenticated]);

  const handleExport = useCallback(() => {
    const jsonStr = JSON.stringify(gameData, null, 2);
    const htmlContent = generateHtmlContent(jsonStr);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'text-adventure-game.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [gameData]);

  const handlePreviewToggle = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
    if (!isPreviewMode && gameData.length > 0) {
      console.log('Toggling to preview mode, setting current scenario');
      setCurrentScenario(gameData[0]);
    }
  }, [isPreviewMode, gameData]);

  const handleChoiceClick = useCallback((nextId: number | null) => {
    if (nextId === null) return;
    const nextScenario = gameData.find(node => node.id === nextId);
    if (nextScenario) {
      setCurrentScenario(nextScenario);
    }
  }, [gameData]);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: FlowNode) => {
    updateNodePosition(node.id, node.position);
    saveNodePositions({ ...nodePositions, [node.id]: node.position });
  }, [updateNodePosition, saveNodePositions, nodePositions]);

  const handleLogin = useCallback(() => {
    setShowLoginDialog(true);
    setIsMobileMenuExpanded(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setShowEditorControls(false);
    setIsPreviewMode(true);
    setIsMobileMenuExpanded(false);
    setIsLeftMenuExpanded(false); // Close left menu on logout
  }, [logout]);

  const showAlertMessage = (title: string, description: string) => {
    setAlertMessage({ title, description });
    setShowAlert(true);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    console.log('Using API config:', apiConfig);

    try {
      setMessages(prev => [...prev, `用户: ${message}`]);
      const response = await aiService.sendMessage(message);
      setMessages(prev => [...prev, `AI: ${response}`]);
    } catch (error) {
      console.error('发送消息失败:', error);
      setError(error instanceof Error ? error : new Error('发送消息时发生未知错误'));
      setMessages(prev => [...prev, "错误: 无法发送消息。请稍后重试。"]);
    }
  }, [apiConfig]);

  const handleCheckBalance = useCallback(async () => {
    console.log('Using API config:', apiConfig);

    try {
      const balance = await aiService.checkBalance();
      console.log('当前余额:', balance);
      showAlertMessage('账户余额', `当前账户余额: ${balance}`);
    } catch (error) {
      console.error('查询余额失败:', error);
      setError(new Error('查询余额失败。请检查API设置和网络连接。'));
      showAlertMessage('查询失败', '余额查询失败。请检查API设置和网络连接。');
    }
  }, [apiConfig]);

  const handleSaveAPIConfig = useCallback((config: AIConfig) => {
    setAPIConfig(config);
    aiService.setAPIConfig(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiConfig', JSON.stringify(config));
    }
    setShowAPIConfig(false);
  }, []);

  const handleAINodeGeneration = useCallback(async (choice: Choice) => {
    console.log('Using API config:', apiConfig);

    if (!selectedNode) {
      showAlertMessage('未选择节点', '请先选择一个节点进行AI生成');
      return;
    }
    try {
      const newNode = await aiService.generateAIContent(
        selectedNode.id,
        selectedNode.text,
        [choice.text],
        gameData
      );

      try {
        const response = await fetch('/api/get-image?t=' + new Date().getTime());
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        newNode.image = data.url;
      } catch (error) {
        console.error('Failed to fetch image for new node:', error);
      }

      console.log('Generated node:', newNode);

      const addedNode = handleAddNode(newNode);
      if (addedNode) {
        choice.nextId = addedNode.id;
        const updatedSelectedNode = {
          ...selectedNode,
          choices: selectedNode.choices.map(c =>
            c.text === choice.text ? { ...c, nextId: addedNode.id } : c
          )
        };
        handleUpdateNode(updatedSelectedNode);
      }

      updateFlowNodes();
      showAlertMessage('AI生成成功', '成功生成新节点');
    } catch (error) {
      console.error('AI节点生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(new Error(`AI节点生成失败: ${errorMessage}`));
      showAlertMessage('AI生成失败', `生成节点时发生错误: ${errorMessage}`);
    }
  }, [apiConfig, selectedNode, gameData, handleAddNode, handleUpdateNode, updateFlowNodes, showAlertMessage]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
    setAiDialogue([]);
  }, []);

  const checkImportFormat = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const issues: string[] = [];

      if (!Array.isArray(data)) {
        issues.push("顶层结构应该是一个数组。");
        return { isValid: false, issues };
      }

      data.forEach((node, index) => {
        if (typeof node.id !== 'number') {
          issues.push(`节点 ${index + 1}: id 应该是一个数字。`);
        }
        if (typeof node.text !== 'string') {
          issues.push(`节点 ${index + 1}: text 应该是一个字符串。`);
        }
        if (!Array.isArray(node.choices)) {
          issues.push(`节点 ${index + 1}: choices 应该是一个数组。`);
        } else {
          node.choices.forEach((choice: any, choiceIndex: number) => {
            if (typeof choice.text !== 'string') {
              issues.push(`节点 ${index + 1}, 选项 ${choiceIndex + 1}: text 应该是一个字符串。`);
            }
            if (choice.nextId !== null && typeof choice.nextId !== 'number') {
              issues.push(`节点 ${index + 1}, 选项 ${choiceIndex + 1}: nextId 应该是一个数字或 null。`);
            }
          });
        }
        if (!Array.isArray(node.connectedNodes)) {
          issues.push(`节点 ${index + 1}: connectedNodes 应该是一个数组。`);
        }
        if (typeof node.layout !== 'string' || !['vertical', 'horizontal'].includes(node.layout)) {
          issues.push(`节点 ${index + 1}: layout 应该是 'vertical' 或 'horizontal'。`);
        }
        if (node.image && typeof node.image !== 'string') {
          issues.push(`节点 ${index + 1}: image 应该是一个字符串或不存在。`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`JSON 解析错误: ${(error as Error).message}`]
      };
    }
  };

  const handleImport = useCallback((jsonString: string) => {
    const checkResult = checkImportFormat(jsonString);
    if (!checkResult.isValid) {
      const errorMessage = "导入格式无效:\n" + checkResult.issues.join("\n");
      showAlertMessage('导入错误', errorMessage);
      return;
    }

    try {
      const importedData = JSON.parse(jsonString);
      saveGameData(importedData);
      updateFlowNodes();
      showAlertMessage('导入成功', '游戏数据已成功导入。');
    } catch (error) {
      console.error('Import failed:', error);
      showAlertMessage('导入错误', `导入失败: ${(error as Error).message}`);
    }
  }, [saveGameData, updateFlowNodes, showAlertMessage]);

  const handleImportNode = useCallback((nodeData: string) => {
    try {
      console.log('Received node data:', nodeData);

      let parsedNodes;
      try {
        parsedNodes = JSON.parse(nodeData);
      } catch (parseError) {
        try {
          parsedNodes = JSON.parse(`[${nodeData}]`);
        } catch (arrayParseError) {
          throw new Error(`JSON parsing failed. Original error: ${parseError.message}. Array parsing error: ${arrayParseError.message}`);
        }
      }

      const nodesToAdd = Array.isArray(parsedNodes) ? parsedNodes : [parsedNodes];

      console.log('Nodes to add:', nodesToAdd);

      nodesToAdd.forEach((node, index) => {
        console.log(`Processing node ${index + 1}:`, node);
        if (
          typeof node.id === 'number' &&
          typeof node.text === 'string' &&
          Array.isArray(node.choices) &&
          Array.isArray(node.connectedNodes) &&
          typeof node.layout === 'string' &&
          (typeof node.image === 'string' || node.image === undefined)
        ) {
          const newNode: Node = {
            id: node.id,
            text: node.text,
            choices: node.choices,
            connectedNodes: node.connectedNodes,
            layout: node.layout,
            image: node.image || ''
          };
          console.log('Adding node:', newNode);
          const addedNode = handleAddNode(newNode);
          if (addedNode) {
            console.log('Node added successfully:', addedNode);
            setSelectedNode(addedNode);
          } else {
            console.error('Failed to add node:', newNode);
          }
        } else {
          console.error('Invalid node format:', node);
          throw new Error(`Invalid format for node ${index + 1}`);
        }
      });

      updateFlowNodes();
      showAlertMessage('导入成功', '节点已成功导入');
      setShowNodeEditor(true);
    } catch (error) {
      console.error('Node import failed:', error);
      showAlertMessage('导入失败', `节点格式无效，请检查JSON格式是否正确。错误: ${(error as Error).message}`);
    }
  }, [handleAddNode, updateFlowNodes, showAlertMessage, setSelectedNode]);

  const handleVerticalLayout = useCallback(() => {
    const direction = 'vertical';
    console.log('Applying layout:', direction);
    console.log('Nodes before layout:', nodes);
    console.log('Edges:', edges);
    try {
      const updatedNodes = treeLayout(nodes, edges, direction, nodeSpacing);
      console.log('Nodes after layout:', updatedNodes);
      setNodes(updatedNodes);
      saveNodePositions(updatedNodes.reduce((acc, node) => {
        acc[node.id] = node.position;
        return acc;
      }, {} as { [key: string]: { x: number, y: number } }));
      setCurrentLayout('vertical');
    } catch (error) {
      console.error('Error applying vertical layout:', error);
      showAlertMessage('布局错误', '应用垂直布局时发生错误。请检查节点连接是否正确。');
    }
  }, [nodes, edges, setNodes, saveNodePositions, showAlertMessage, nodeSpacing]);

  const handleHorizontalLayout = useCallback(() => {
    const direction = 'horizontal';
    console.log('Applying layout:', direction);
    console.log('Nodes before layout:', nodes);
    console.log('Edges:', edges);
    try {
      const updatedNodes = treeLayout(nodes, edges, direction, nodeSpacing);
      console.log('Nodes after layout:', updatedNodes);
      setNodes(updatedNodes);
      saveNodePositions(updatedNodes.reduce((acc, node) => {
        acc[node.id] = node.position;
        return acc;
      }, {} as { [key: string]: { x: number, y: number } }));
      setCurrentLayout('horizontal');
    } catch (error) {
      console.error('Error applying horizontal layout:', error);
      showAlertMessage('布局错误', '应用水平布局时发生错误。请检查节点连接是否正确。');
    }
  }, [nodes, edges, setNodes, saveNodePositions, showAlertMessage, nodeSpacing]);

  const handleIncreaseSpacing = useCallback(() => {
    setNodeSpacing(prev => {
      const newSpacing = {
        horizontal: prev.horizontal + 50,
        vertical: prev.vertical + 50
      };
      const updatedNodes = treeLayout(nodes, edges, currentLayout, newSpacing);
      setNodes(updatedNodes);
      saveNodePositions(updatedNodes.reduce((acc, node) => {
        acc[node.id] = node.position;
        return acc;
      }, {} as { [key: string]: { x: number, y: number } }));
      return newSpacing;
    });
  }, [nodes, edges, setNodes, saveNodePositions, currentLayout]);

  const handleResetSpacing = useCallback(() => {
    const defaultSpacing = { horizontal: 300, vertical: 200 };
    setNodeSpacing(defaultSpacing);
    const updatedNodes = treeLayout(nodes, edges, currentLayout, defaultSpacing);
    setNodes(updatedNodes);
    saveNodePositions(updatedNodes.reduce((acc, node) => {
      acc[node.id] = node.position;
      return acc;
    }, {} as { [key: string]: { x: number, y: number } }));
  }, [nodes, edges, setNodes, saveNodePositions, currentLayout]);

  const handleAddNewNode = useCallback(() => {
    const existingIds = gameData.map(node => node.id);
    let newId = 1;
    while (existingIds.includes(newId)) {
      newId++;
    }

    const newNode: Node = {
      id: newId,
      text: '新节点',
      choices: [
        { text: '选项 1', nextId: null },
        { text: '选项 2', nextId: null },
      ],
    };

    const addedNode = handleAddNode(newNode);
    if (addedNode) {
      const position = calculateNodePosition(addedNode.id);
      updateNodePosition(addedNode.id.toString(), position);

      const newFlowNode: FlowNode = {
        id: addedNode.id.toString(),
        type: 'gameNode',
        data: { ...addedNode, layout: currentLayout },
        position,
      };

      setNodes((nds) => [...nds, newFlowNode]);
      setSelectedNode(addedNode);
      setShowNodeEditor(true);
    }
    updateFlowNodes();
  }, [gameData, handleAddNode, updateNodePosition, setNodes, currentLayout, updateFlowNodes, calculateNodePosition]);

  const handleBatchAIGeneration = useCallback(async () => {
    console.log('Using API config:', apiConfig);

    try {
      const unlinkedChoices = gameData.flatMap(node =>
        node.choices
          .map((choice, index) => ({ nodeId: node.id, choiceIndex: index, choiceText: choice.text, nextId: choice.nextId }))
          .filter(choice => choice.nextId === null)
      );

      if (unlinkedChoices.length === 0) {
        showAlertMessage('无可生成节点', '所有选项都已链接到节点');
        return;
      }

      let generatedCount = 0;
      for await (const newNode of aiService.batchGenerateNodes(unlinkedChoices, gameData)) {
        try {
          const response = await fetch('/api/get-image?t=' + Date.now());
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          newNode.image = data.url;
        } catch (imageError) {
          console.error('Failed to fetch image for new node:', imageError);
        }

        const addedNode = handleAddNode(newNode);
        if (addedNode) {
          const parentChoice = unlinkedChoices.find(choice =>
            choice.nodeId === addedNode.id ||
            (gameData.find(n => n.id === choice.nodeId)?.choices[choice.choiceIndex].nextId === null)
          );
          if (parentChoice) {
            const parentNode = gameData.find(n => n.id === parentChoice.nodeId);
            if (parentNode) {
              parentNode.choices[parentChoice.choiceIndex].nextId = addedNode.id;
              handleUpdateNode(parentNode);
            }
          }
        }
        generatedCount++;
        updateFlowNodes();
      }

      showAlertMessage('批量生成完成', `成功生成 ${generatedCount} 个新节点`);
    } catch (error) {
      console.error('批量AI节点生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(new Error(`批量AI节点生成失败: ${errorMessage}`));
      showAlertMessage('批量生成失败', `生成节点时发生错误: ${errorMessage}`);
    }
  }, [apiConfig, gameData, handleAddNode, handleUpdateNode, updateFlowNodes, showAlertMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    // Initialize aiService with saved config from localStorage
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('apiConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setAPIConfig(parsedConfig);
        aiService.setAPIConfig(parsedConfig);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setIsMenuExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleOnlineSave = async () => { // Updated handleOnlineSave function
    try {
      const dataToSave = {
        nodes: gameData,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      };

      // 如果存在 apiConfig，创建一个新的对象，但不包含 apiKey
      if (apiConfig) {
        dataToSave.apiConfig = { ...apiConfig };
        delete dataToSave.apiConfig.apiKey;
      }

      const url = await noteService.saveGameData(dataToSave);
      setSavedUrl(url);
      setShowSavedUrlDialog(true); // Show saved URL dialog
      toast.success('游戏数据已保存到在线存档');
    } catch (error) {
      console.error('Failed to save online:', error);
      showAlertMessage(
        '保存失败',
        '保存到在线存档失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
    }
  };

  const handleOnlineLoad = async () => { // Updated handleOnlineLoad function
    setShowLoadDialog(true);
  };

  const handleBatchDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all nodes? This action cannot be undone.')) {
      saveGameData([]);
      setNodes([]);
      setEdges([]);
      updateFlowNodes();
      toast.success('All nodes have been deleted');
    }
  }, [saveGameData, setNodes, setEdges, updateFlowNodes]);

  const handleLeftMenuToggle = useCallback(() => {
    setIsLeftMenuExpanded(prev => !prev);
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          componentName="MainEditor"
        />
      )}
      onReset={() => {
        setNodes([]);
        setEdges([]);
      }}
    >
      <ReactFlowProvider>
        <LayoutProvider>
          <div
            className="bg-transparent"
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden'
            }}
          >
            <EditorHeader
              isAuthenticated={isAuthenticated}
              onLogin={() => {
                handleLogin();
                setIsMobileMenuExpanded(false);
              }}
              onLogout={() => {
                handleLogout();
                setIsMobileMenuExpanded(false);
                setIsLeftMenuExpanded(false); // Close left menu on logout
              }}
              isMobile={isMobile}
              onMenuToggle={handleLeftMenuToggle}
            />
            {isAuthenticated && (
              <EditorControls
                onAddNode={handleAddNewNode}
                onExport={handleExport}
                onImport={handleImport}
                onImportNode={() => setShowImportDialog(true)}
                onPreviewToggle={handlePreviewToggle}
                onShowAPIConfig={() => setShowAPIConfig(true)}
                onCheckBalance={handleCheckBalance}
                onVerticalLayout={handleVerticalLayout}
                onHorizontalLayout={handleHorizontalLayout}
                onIncreaseSpacing={handleIncreaseSpacing}
                onResetSpacing={handleResetSpacing}
                isPreviewMode={isPreviewMode}
                onBatchAIGeneration={handleBatchAIGeneration}
                isMobile={isMobile}
                isExpanded={isLeftMenuExpanded}
                setIsExpanded={setIsLeftMenuExpanded}
                isAuthenticated={isAuthenticated}
                onOnlineSave={handleOnlineSave}
                onOnlineLoad={handleOnlineLoad}
                onBatchDelete={handleBatchDelete}
              />
            )}
            <EditorContent
              isPreviewMode={isPreviewMode}
              currentScenario={currentScenario}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onNodeDragStop={onNodeDragStop}
              onChoiceClick={handleChoiceClick}
              nodeTypes={nodeTypes}
              isMobile={isMobile}
            />
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>后台管理登录</DialogTitle>
                </DialogHeader>
                <LoginForm onSuccess={() => {
                  setShowLoginDialog(false);
                  setShowEditorControls(true);
                  setIsPreviewMode(false);
                }} />
              </DialogContent>
            </Dialog>
            <Dialog open={showAPIConfig} onOpenChange={setShowAPIConfig}>
              <DialogContent className="max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>API设置</DialogTitle>
                </DialogHeader>
                <APIConfig onSave={handleSaveAPIConfig} />
              </DialogContent>
            </Dialog>
            <Dialog open={showNodeEditor} onOpenChange={setShowNodeEditor}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>编辑节点</DialogTitle>
                  <DialogDescription>在这里编辑节点的内容和选项。</DialogDescription>
                </DialogHeader>
                {selectedNode && (
                  <NodeEditor
                    node={selectedNode}
                    onUpdate={(updatedNode) => {
                      handleUpdateNode(updatedNode);
                      setShowNodeEditor(false);
                    }}
                    onDelete={() => {
                      handleDeleteNode(selectedNode.id);
                      setShowNodeEditor(false);
                    }}
                    onAIGenerate={handleAINodeGeneration}
                  />
                )}
              </DialogContent>
            </Dialog>
            <AlertDialog
              isOpen={showAlert}
              onClose={() => setShowAlert(false)}
              title={alertMessage.title}
              description={alertMessage.description}
            />
            <ImportNodeDialog
              isOpen={showImportDialog}
              onClose={() => setShowImportDialog(false)}
              onImport={handleImportNode}
            />
            <LoadGameDialog // Updated LoadGameDialog
              isOpen={showLoadDialog}
              onClose={() => setShowLoadDialog(false)}
              onLoad={async (url) => {
                try {
                  setShowLoadDialog(false);
                  const data = await noteService.loadGameData(url);
                  
                  if (!data || !data.nodes) {
                    throw new Error('存档数据为空或格式无效');
                  }
                  
                  saveGameData(data.nodes);
                  
                  if (data.apiConfig) {
                    setAPIConfig(data.apiConfig);
                    aiService.setAPIConfig(data.apiConfig);
                    localStorage.setItem('apiConfig', JSON.stringify(data.apiConfig));
                  }
                  
                  updateFlowNodes();
                  setLoadResult({ success: true, message: '游戏数据已成功从在线存档加载' });
                } catch (error) {
                  console.error('Failed to load online:', error);
                  const errorMessage = error instanceof Error ? error.message : '未知错误';
                  setLoadResult({ success: false, message: `加载失败: ${errorMessage}` });
                }
              }}
            />
            <SavedUrlDialog // Added SavedUrlDialog
              isOpen={showSavedUrlDialog}
              onClose={() => setShowSavedUrlDialog(false)}
              url={savedUrl || ''}
              error={error instanceof Error ? error.message : undefined} // Updated usage of SavedUrlDialog
            />
            {!isMobile && !isPreviewMode && (
              <EditorFooter
                isPreviewMode={isPreviewMode}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
              />
            )}
            <AlertDialog // Added AlertDialog for load result
              isOpen={loadResult !== null}
              onClose={() => setLoadResult(null)}
              title={loadResult?.success ? '加载成功' : '加载失败'}
              description={loadResult?.message || ''}
            />
          </div>
        </LayoutProvider>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}

