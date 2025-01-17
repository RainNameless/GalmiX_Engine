import { APIConfig } from './aiService';

export class AIService {
  private apiConfig: APIConfig | null = null;

  setAPIConfig(config: APIConfig) {
    this.apiConfig = config;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiConfig) {
      throw new Error('API配置未设置');
    }

    // 这里实现发送消息到AI的逻辑
    // 使用this.apiConfig中的设置

    // 模拟AI响应
    return `AI: 收到你的消息: "${message}"`;
  }

  async checkBalance(): Promise<number> {
    if (!this.apiConfig) {
      throw new Error('API配置未设置');
    }

    // 实现查询余额的逻辑
    // 使用this.apiConfig中的设置

    // 模拟余额
    return 100;
  }
}

export const aiService = new AIService();

