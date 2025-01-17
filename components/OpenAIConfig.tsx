import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OpenAIConfig {
  apiKey: string;
  model: string;
  apiEndpoint: string;
  systemPrompt: string;
}

interface OpenAIConfigProps {
  onSave: (config: OpenAIConfig) => void;
}

export const OpenAIConfig: React.FC<OpenAIConfigProps> = ({ onSave }) => {
  const [config, setConfig] = useState<OpenAIConfig>({
    apiKey: '',
    model: 'gpt-3.5-turbo',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    systemPrompt: '你是一个创意丰富的文字冒险游戏设计师。你的任务是创造引人入胜的故事情节和选择。',
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('openAIConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('openAIConfig', JSON.stringify(config));
    onSave(config);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={config.apiKey}
          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="model">模型</Label>
        <Input
          id="model"
          type="text"
          value={config.model}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
          placeholder="输入模型名称"
        />
      </div>
      <div>
        <Label htmlFor="apiEndpoint">API 地址</Label>
        <Input
          id="apiEndpoint"
          type="text"
          value={config.apiEndpoint}
          onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="systemPrompt">系统提示词</Label>
        <Input
          id="systemPrompt"
          type="text"
          value={config.systemPrompt}
          onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
        />
      </div>
      <Button onClick={handleSave}>保存配置</Button>
    </div>
  );
};

