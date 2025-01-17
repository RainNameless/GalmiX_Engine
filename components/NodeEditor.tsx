import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { aiService } from '../services/aiService';

interface Choice {
  text: string;
  nextId: number | null;
  image?: string;
}

interface Node {
  id: number;
  text: string;
  choices: Choice[];
  image?: string;
}

interface NodeEditorProps {
  node: Node;
  onUpdate: (updatedNode: Node) => void;
  onDelete: () => void;
  onAIGenerate: (choice: Choice) => Promise<void>;
}

async function getRandomImageUrl() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/get-image?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    if (!data.url) throw new Error('No image URL returned');
    return data.url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}

export function NodeEditor({ node, onUpdate, onDelete, onAIGenerate }: NodeEditorProps) {
  const [text, setText] = useState(node.text);
  const [choices, setChoices] = useState(node.choices);
  const [image, setImage] = useState(node.image || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!node.image) {
      handleRefreshImage();
    } else {
      setImage(node.image);
    }
  }, [node.image]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleChoiceTextChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index].text = value;
    setChoices(newChoices);
  };

  const handleChoiceNextIdChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index].nextId = value === '' ? null : parseInt(value, 10);
    setChoices(newChoices);
  };

  const handleAddChoice = () => {
    if (choices.length < 3) {
      setChoices(choices.concat({ text: '', nextId: null }));
    }
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
  };

  const handleSave = () => {
    const newChoices = [...choices];
  
    newChoices.forEach(choice => {
      if (choice.text === "重开") {
        choice.nextId = 1;
      }
    });

    onUpdate({ ...node, text, choices: newChoices, image });
  };

  const handleAIGenerate = async (choice: Choice) => {
    setIsGenerating(true);
    try {
      console.log('Starting AI generation for choice:', choice);
      let newImageUrl;
      try {
        newImageUrl = await getRandomImageUrl();
        console.log('Got new image URL:', newImageUrl);
      } catch (imageError) {
        console.error('Failed to fetch image:', imageError);
        // Continue with AI generation even if image fetch fails
      }
      
      const newNode = await aiService.generateAIContent(
        node.id,
        node.text,
        [choice.text],
        [node] // Pass the current node as the existing nodes
      );
      console.log('Generated new node:', newNode);
      
      if (newImageUrl) {
        newNode.image = newImageUrl;
      }
      await onAIGenerate({ ...choice, nextId: newNode.id });
      toast.success('AI生成成功');
    } catch (error) {
      console.error('AI生成失败:', error);
      toast.error(`AI生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRefreshImage = async () => {
    try {
      const newUrl = await getRandomImageUrl();
      console.log('Got new image URL:', newUrl);
      setImage(newUrl);
      toast.success('图片刷新成功');
    } catch (error) {
      console.error('Failed to refresh image:', error);
      toast.error(`刷新图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          componentName="NodeEditor"
        />
      )}
    >
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="node-text">节点文本</Label>
            <Textarea
              id="node-text"
              value={text}
              onChange={handleTextChange}
              className="w-full"
              placeholder="输入节点文本"
            />
          </div>
          <div>
            <Label htmlFor="node-image">图片</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="node-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-grow"
                placeholder="输入图片 URL 或使用随机动漫图片"
              />
              <Button onClick={handleImageButtonClick} type="button">
                上传图片
              </Button>
              <Button
                onClick={handleRefreshImage}
                type="button"
              >
                刷新图片
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            {image && (
              <div className="mt-2">
                <Image src={image} alt="预览图片" width={200} height={200} objectFit="cover" className="rounded-md max-w-full h-auto" />
              </div>
            )}
          </div>
          <div>
            <Label>选项</Label>
            {choices.map((choice, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <Input
                  value={choice.text}
                  onChange={(e) => handleChoiceTextChange(index, e.target.value)}
                  className="flex-grow"
                  placeholder="选项文本"
                />
                <Input
                  type="number"
                  value={choice.nextId === null ? '' : choice.nextId}
                  onChange={(e) => handleChoiceNextIdChange(index, e.target.value)}
                  className="w-24"
                  placeholder="下一个ID"
                />
                <Button onClick={() => handleRemoveChoice(index)} variant="destructive" size="sm">删除</Button>
                <Button 
                  onClick={() => handleAIGenerate(choice)} 
                  size="sm" 
                  disabled={isGenerating}
                >
                  {isGenerating ? 'AI生成中...' : 'AI生成'}
                </Button>
              </div>
            ))}
            {choices.length < 3 && (
              <Button onClick={handleAddChoice} className="mt-2" size="sm">添加选项</Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <Button onClick={handleSave} className="flex-grow">保存</Button>
            <Button onClick={onDelete} variant="destructive">删除节点</Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

