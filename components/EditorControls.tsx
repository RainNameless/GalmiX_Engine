import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"

interface EditorControlsProps {
  onAddNode: () => void;
  onExport: () => void;
  onImportNode: () => void;
  onPreviewToggle: () => void;
  onShowAPIConfig: () => void;
  onVerticalLayout: () => void;
  onHorizontalLayout: () => void;
  isPreviewMode: boolean;
  onBatchAIGeneration: () => Promise<void>;
  isMobile: boolean;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthenticated: boolean;
  onOnlineSave: () => Promise<void>;
  onOnlineLoad: () => Promise<void>;
  onBatchDelete: () => void;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  onAddNode,
  onExport,
  onImportNode,
  onPreviewToggle,
  onShowAPIConfig,
  onVerticalLayout,
  onHorizontalLayout,
  isPreviewMode,
  onBatchAIGeneration,
  isMobile,
  isExpanded,
  setIsExpanded,
  isAuthenticated,
  onOnlineSave,
  onOnlineLoad,
  onBatchDelete,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (isMobile && isExpanded && !(event.target as Element).closest('.editor-controls')) {
      setIsExpanded(false);
    }
  }, [isMobile, isExpanded, setIsExpanded]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleBatchGeneration = async () => {
    setIsGenerating(true);
    try {
      await onBatchAIGeneration();
    } finally {
      setIsGenerating(false);
      if (isMobile) setIsExpanded(false);
    }
  };

  const handleOnlineSave = async () => {
    setIsSaving(true);
    try {
      await onOnlineSave();
    } finally {
      setIsSaving(false);
      if (isMobile) setIsExpanded(false);
    }
  };

  const handleOnlineLoad = async () => {
    setIsLoading(true);
    try {
      await onOnlineLoad();
    } finally {
      setIsLoading(false);
      if (isMobile) setIsExpanded(false);
    }
  };

  const handleButtonClick = (action: () => void) => {
    action();
    if (isMobile) setIsExpanded(false);
  };

  const renderButtons = () => (
    <div className="flex flex-col gap-2">
      <Button onClick={() => handleButtonClick(onShowAPIConfig)}>API设置</Button>
      <Button onClick={() => handleButtonClick(onAddNode)}>添加节点</Button>
      <Button onClick={() => handleButtonClick(onImportNode)}>导入节点</Button>
      <Button onClick={() => handleButtonClick(onExport)}>导出游戏</Button>
      <Button onClick={() => handleButtonClick(onPreviewToggle)}>
        {isPreviewMode ? '返回编辑' : '预览游戏'}
      </Button>
      <Button onClick={handleBatchGeneration} disabled={isGenerating}>
        {isGenerating ? '生成中...' : '批量AI生成'}
      </Button>
      <Button onClick={handleOnlineSave} disabled={isSaving}>
        {isSaving ? '保存中...' : '保存到在线存档'}
      </Button>
      <Button onClick={handleOnlineLoad} disabled={isLoading}>
        {isLoading ? '加载中...' : '从在线存档加载'}
      </Button>
      <Button onClick={() => handleButtonClick(onVerticalLayout)}>垂直布局</Button>
      <Button onClick={() => handleButtonClick(onHorizontalLayout)}>水平布局</Button>
      <Button onClick={() => handleButtonClick(onBatchDelete)} variant="destructive">
        批量删除所有节点
      </Button>
    </div>
  );

  if (!isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="fixed left-0 top-1/4 z-50 editor-controls">
        <div 
          className="bg-black w-2 h-16 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        />
        {isExpanded && (
          <div className="bg-white p-4 rounded-r-lg shadow-md max-h-[60vh] overflow-y-auto">
            {renderButtons()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-wrap gap-2">
      {renderButtons()}
    </div>
  );
};

