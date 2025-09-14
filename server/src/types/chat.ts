import { z } from 'zod';

// Chat message schema
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content is required'),
  timestamp: z.date().optional(),
});

// Chat schema
export const chatSchema = z.object({
  title: z.string().min(1, 'Chat title is required'),
  messages: z.array(messageSchema).default([]),
  userId: z.string().min(1, 'User ID is required'),
});

// Send message request schema
export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  chatId: z.string().optional(),
});

// Types
export type Message = z.infer<typeof messageSchema>;
export type Chat = z.infer<typeof chatSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

// JWT payload type for chat
export interface ChatJWTPayload {
  userId: string;
  email: string;
}
