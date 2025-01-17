import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { aiService, APIConfig } from '../services/aiService';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { ScrollArea } from "@/components/ui/scroll-area"

interface APIConfigProps {
  onSave: (config: APIConfig) => void;
}

export const APIConfig: React.FC<APIConfigProps> = ({ onSave }) => {
  const [config, setConfig] = useState<APIConfig>({
    apiKey: '',
    model: 'deepseek-chat',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    systemPrompt: '你是一个富有创意的文字冒险游戏设计师。请为用户的问题提供有关游戏设计和故事创作的见解和建议。',
    nodeGenerationPrompt: '你是一个富有创意的文字冒险游戏设计师。你的任务是创造引人入胜的故事情节和选择。新节点应包含 "text" 字段表示节点文本，和 "choices" 数组表示选项。每个选项应包含 "text" 字段。请以JSON格式返回。',
    probabilities: {
      oneChoice: 0.1,
      twoChoices: 0.7,
      threeChoices: 0.2
    }
  });
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      setConfig(prevConfig => ({ ...prevConfig, ...JSON.parse(savedConfig) }));
    }
  }, []);

  const handleSave = async () => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    aiService.setAPIConfig(config);
    onSave(config);
  };

  const checkBalance = async () => {
    if (!config.apiKey) {
      alert('请先添加有效的API密钥');
      return;
    }
    try {
      aiService.setAPIConfig(config);
      const balance = await aiService.checkBalance();
      setBalance(balance.toString());
    } catch (error) {
      console.error('余额查询失败:', error);
      alert('余额查询失败。请检查API设置和网络连接。');
    }
  };

  const handleProbabilityChange = (type: 'oneChoice' | 'twoChoices' | 'threeChoices', value: number) => {
    const newProbabilities = { ...config.probabilities, [type]: value / 100 };
    const total = Object.values(newProbabilities).reduce((sum, prob) => sum + prob, 0);
    
    // Normalize probabilities
    Object.keys(newProbabilities).forEach(key => {
      newProbabilities[key as keyof typeof newProbabilities] /= total;
    });

    setConfig({ ...config, probabilities: newProbabilities });
  };

  return (
    <ScrollArea className="h-[80vh] pr-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API密钥</Label>
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
          <Label htmlFor="apiEndpoint">API端点</Label>
          <Input
            id="apiEndpoint"
            type="text"
            value={config.apiEndpoint}
            onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="systemPrompt">系统提示词（用于AI对话）</Label>
          <AutoResizeTextarea
            id="systemPrompt"
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="nodeGenerationPrompt">节点生成提示词（用于批量AI生成和AI生成）</Label>
          <AutoResizeTextarea
            id="nodeGenerationPrompt"
            value={config.nodeGenerationPrompt}
            onChange={(e) => setConfig({ ...config, nodeGenerationPrompt: e.target.value })}
          />
        </div>
        <div>
          <Label>选项概率设置</Label>
          <div className="space-y-4">
            <div>
              <Label htmlFor="oneChoice">单选项概率（结局）</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="oneChoice"
                  min={0}
                  max={100}
                  step={1}
                  value={[config.probabilities.oneChoice * 100]}
                  onValueChange={([value]) => handleProbabilityChange('oneChoice', value)}
                />
                <span>{(config.probabilities.oneChoice * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="twoChoices">双选项概率</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="twoChoices"
                  min={0}
                  max={100}
                  step={1}
                  value={[config.probabilities.twoChoices * 100]}
                  onValueChange={([value]) => handleProbabilityChange('twoChoices', value)}
                />
                <span>{(config.probabilities.twoChoices * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="threeChoices">三选项概率（隐藏选项）</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="threeChoices"
                  min={0}
                  max={100}
                  step={1}
                  value={[config.probabilities.threeChoices * 100]}
                  onValueChange={([value]) => handleProbabilityChange('threeChoices', value)}
                />
                <span>{(config.probabilities.threeChoices * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button onClick={handleSave}>保存设置</Button>
          <Button onClick={checkBalance}>查询余额</Button>
        </div>
        {balance !== null && (
          <div>当前账户余额: {balance}</div>
        )}
      </div>
    </ScrollArea>
  );
};

