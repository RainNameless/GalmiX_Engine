import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface AIChatProps {
  onSendMessage: (message: string) => Promise<void>;
}

export const AIChat: React.FC<AIChatProps> = ({ onSendMessage }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    try {
      await onSendMessage(userInput);
      setUserInput('');
    } catch (error) {
      console.error('发送消息时出错:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, onSendMessage]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-2">AI对话</h3>
      <Textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="与AI对话..."
        className="flex-grow mb-2 resize-none"
      />
      <Button onClick={handleSend} disabled={isLoading || !userInput.trim()}>
        {isLoading ? '发送中...' : '发送'}
      </Button>
    </div>
  );
};

