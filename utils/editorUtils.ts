import { Node } from '../data/storyData';

export const generateHtmlContent = (jsonData: string): string => {
  // 保持原有的generateHtmlContent函数实现
  // ...
};

export const handleExport = (gameData: Node[]) => {
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
};

