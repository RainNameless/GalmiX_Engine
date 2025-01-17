import fs from 'fs/promises';
import { generateHtmlContent } from './utils/exportUtils.js';

async function exportGame(gameData, outputPath) {
  try {
    const jsonStr = JSON.stringify(gameData, null, 2);
    const htmlContent = generateHtmlContent(jsonStr);
    await fs.writeFile(outputPath, htmlContent, 'utf8');
    console.log(`Game exported successfully to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting game:', error);
  }
}

// Example game data
const gameData = [
{ "id": 1, "text": "你是某国男性,简称国男，20岁,是学生，就读于某高校。今天你没有课， 你决定:", "image": "", "choices": [{ "text": "待在宿舍", "nextId": 2 }, { "text": "出去逛逛", "nextId": 3 }] },
{ "id": 2, "text": "你打算在宿舍享受一下颓废的生活，于是叫了一份外卖开始打游戏。几轮厮杀过后，看到你舍友问你为什么在食堂对着女生DIY，你感觉莫名其妙，一番网上冲浪后才知道，社交网络上到处都是你的负面消息，而你今天并没有出过宿舍。事后事件源头的女生表示事件纯属虚构，而你已经社会性死亡。", "image": "", "choices": [{ "text": "如果能重来...", "nextId": 1 }] },
{ "id": 3, "text": "出门应该带上哪些东西好呢，你看看手机、平板、kindle、switch...决定：", "image": "", "choices": [{ "text": "全都带上", "nextId": 4 }, { "text": "只带必要的", "nextId": 5 }] }
];

// Export the game
exportGame(gameData, 'exported-game.html');

