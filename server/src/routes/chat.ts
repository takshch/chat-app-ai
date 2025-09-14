import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendMessageSchema } from '../types/chat.ts';
import { chatModel } from '../models/Chat.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { llmService } from '../services/llm.ts';

const router = Router();

// Send message endpoint (requires existing chatId)
router.post('/send', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = sendMessageSchema.parse(req.body);
    const userId = req.user!.id;

    // chatId is required for /send route
    if (!validatedData.chatId) {
      res.status(400).json({ error: 'chatId is required for /send route' });
      return;
    }

    // Add message to existing chat
    const chat = await chatModel.addMessage(validatedData.chatId, {
      role: 'user',
      content: validatedData.message,
      timestamp: new Date(),
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Verify user owns this chat
    if (chat.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Generate AI response using OpenRouter
    try {
      // Prepare chat history for context (last 10 messages to avoid token limits)
      const recentMessages = chat.messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const aiResponseContent = await llmService.generateChatResponse(
        validatedData.message,
        recentMessages
      );

      const aiResponse = {
        role: 'assistant' as const,
        content: aiResponseContent,
        timestamp: new Date(),
      };

      // Add AI response to chat
      await chatModel.addMessage(chat.id, aiResponse);

      // Return only chatId and assistant message
      res.status(200).json({
        chatId: chat.id,
        message: aiResponseContent
      });
    } catch (llmError) {
      console.error('LLM Error:', llmError);
      
      // If LLM fails, return error response
      res.status(500).json({
        error: 'Failed to generate AI response',
        details: llmError instanceof Error ? llmError.message : 'Unknown error'
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.message 
      });
      return;
    }
    
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat endpoint
router.post('/create', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = sendMessageSchema.parse(req.body);
    const userId = req.user!.id;

    // Create new chat with first message
    const firstMessage = {
      role: 'user' as const,
      content: validatedData.message,
      timestamp: new Date(),
    };

    // Generate title from first message (truncated to 50 chars)
    const title = validatedData.message.length > 50 
      ? validatedData.message.substring(0, 50) + '...'
      : validatedData.message;

    const chat = await chatModel.create({
      title,
      messages: [firstMessage],
      userId,
    });

    // Generate AI response using OpenRouter
    try {
      const aiResponseContent = await llmService.generateChatResponse(
        validatedData.message,
        [] // No chat history for new chat
      );

      const aiResponse = {
        role: 'assistant' as const,
        content: aiResponseContent,
        timestamp: new Date(),
      };

      // Add AI response to chat
      await chatModel.addMessage(chat.id, aiResponse);

      // Return chatId, title, and assistant message
      res.status(200).json({
        chatId: chat.id,
        title: chat.title,
        message: aiResponseContent
      });
    } catch (llmError) {
      console.error('LLM Error:', llmError);
      
      // If LLM fails, still return the created chat without AI response
      res.status(200).json({
        chatId: chat.id,
        title: chat.title,
        message: 'Sorry, I could not generate a response at this time.'
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.message 
      });
      return;
    }
    
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history endpoint
router.get('/history/:chatId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    const chat = await chatModel.findById(chatId);

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Verify user owns this chat
    if (chat.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json({
      chat: {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all chats for user (sidebar)
router.get('/chats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const chats = await chatModel.findByUserId(userId);

    res.status(200).json({
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export { router as default };
