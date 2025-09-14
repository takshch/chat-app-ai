import mongoose, { Schema, Document } from 'mongoose';
import type { Chat, Message } from '../types/chat.ts';

// Chat interface extending Mongoose Document
export interface IChat extends Document, Omit<Chat, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// Message subdocument schema
const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Chat schema definition
const chatSchema = new Schema<IChat>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret: Record<string, unknown>) {
      ret.id = (ret._id as mongoose.Types.ObjectId).toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Index for better query performance
chatSchema.index({ userId: 1, createdAt: -1 });

// Create and export the model
export const ChatModel = mongoose.model<IChat>('Chat', chatSchema);

// Chat service class for database operations
class ChatService {
  async create(chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
    const chat = new ChatModel(chatData);
    const savedChat = await chat.save();
    
    return {
      id: savedChat._id.toString(),
      title: savedChat.title,
      messages: savedChat.messages,
      userId: savedChat.userId,
      createdAt: savedChat.createdAt,
      updatedAt: savedChat.updatedAt,
    };
  }

  async findById(id: string): Promise<Chat | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const chat = await ChatModel.findById(id).lean();
    if (!chat) return null;

    return {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Chat[]> {
    const chats = await ChatModel.find({ userId })
      .sort({ createdAt: -1 })
      .select('title createdAt updatedAt')
      .lean();
    
    return chats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
      messages: [],
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));
  }

  async addMessage(chatId: string, message: Message): Promise<Chat | null> {
    if (!mongoose.Types.ObjectId.isValid(chatId)) return null;
    
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { 
        $push: { messages: message },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!chat) return null;

    return {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  async updateTitle(chatId: string, title: string): Promise<Chat | null> {
    if (!mongoose.Types.ObjectId.isValid(chatId)) return null;
    
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { 
        title,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!chat) return null;

    return {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  async delete(chatId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(chatId)) return false;
    
    const result = await ChatModel.findByIdAndDelete(chatId);
    return !!result;
  }
}

// Export singleton instance
export const chatModel = new ChatService();
