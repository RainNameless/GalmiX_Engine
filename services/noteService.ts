import { toast } from 'react-hot-toast';

export interface NoteData {
  id: string;
  nodes: Array<{
    id: number;
    text: string;
    choices: Array<{
      text: string;
      nextId: number | null;
    }>;
    image?: string;
  }>;
  version: string;
  lastUpdated: string;
  apiConfig?: any;
}

export class NoteService {
  private async callApi(endpoint: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<any> {
    const response = await fetch(`/api/blob/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${errorText}`);
    }

    return response.json();
  }

  async saveGameData(data: Omit<NoteData, 'id'>): Promise<string> {
    try {
      // 创建一个新对象，排除 apiConfig
      const { apiConfig, ...dataToSave } = data;
      
      // 如果 apiConfig 存在，创建一个新的对象，但不包含 apiKey
      if (apiConfig) {
        dataToSave.apiConfig = { ...apiConfig };
        delete dataToSave.apiConfig.apiKey;
      }

      const { url } = await this.callApi('save', 'POST', dataToSave);
      toast.success('游戏数据已保存到云存储');
      return url;
    } catch (error) {
      console.error('Failed to save game data:', error);
      toast.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  }

  async loadGameData(url: string): Promise<NoteData> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('无法获取游戏数据');
      }
      const data = await response.json();
      toast.success('已从在线存档加载游戏数据');
      return data;
    } catch (error) {
      console.error('Failed to load game data:', error);
      toast.error('加载失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  }

  async deleteGameData(url: string): Promise<void> {
    try {
      await this.callApi(`delete?url=${encodeURIComponent(url)}`, 'DELETE');
      toast.success('游戏数据已从云存储删除');
    } catch (error) {
      console.error('Failed to delete game data:', error);
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  }
}

export const noteService = new NoteService();

