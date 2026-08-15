import { chatRepository } from '../repository/chatRepository.js';
import { IMessage } from '../model/Chat.js';

export const chatService = {
    async appendMessage(userId: string, sessionId: string, sender: 'user' | 'ai' | 'system' | 'rag', content: string): Promise<void> {
        const message: IMessage = {
            sender,
            content,
            timestamp: new Date()
        };
        try {
            await chatRepository.addMessage(userId, sessionId, message);
        } catch (error) {
            console.error('Failed to append message to chat history:', error);
        }
    },

    async getHistory(userId: string, sessionId: string) {
        return await chatRepository.getChatHistory(userId, sessionId);
    },
    
    async clearHistory(userId: string, sessionId: string) {
        await chatRepository.deleteChatHistory(userId, sessionId);
    }
};
