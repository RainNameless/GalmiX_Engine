import React from 'react';
import { LogViewer } from './LogViewer';
import { AIChat } from './AIChat';
import { Button } from "@/components/ui/button"

interface EditorFooterProps {
  isPreviewMode: boolean;
  messages: string[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ 
  isPreviewMode, 
  messages,
  onSendMessage,
  onClearChat
}) => {
  if (isPreviewMode) return null;

  return (
    <div style={{ height: '30%', display: 'flex' }}>
      <div style={{ width: '50%', padding: '10px', borderTop: '1px solid #ccc' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">对话记录</h3>
          <Button onClick={onClearChat} variant="outline" size="sm">清除对话</Button>
        </div>
        <div style={{ height: 'calc(100% - 40px)', overflow: 'hidden' }}>
          <LogViewer messages={messages} />
        </div>
      </div>
      <div style={{ width: '50%', padding: '10px', borderTop: '1px solid #ccc', borderLeft: '1px solid #ccc' }}>
        <AIChat onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

