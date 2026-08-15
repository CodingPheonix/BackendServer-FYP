import { Chat, IMessage } from '../model/Chat.js';

export const chatRepository = {
    async addMessage(userId: string, sessionId: string, message: IMessage): Promise<void> {
        await Chat.updateOne(
            { userId, sessionId },
            { $push: { messages: message } },
            { upsert: true }
        );
    },

    async getChatHistory(userId: string, sessionId: string) {
        const chat = await Chat.findOne({ userId, sessionId }).lean();
        return chat ? chat.messages : [];
    },
    
    async deleteChatHistory(userId: string, sessionId: string) {
        await Chat.deleteOne({ userId, sessionId });
    }
};
