import type { Request, Response } from 'express';
import { openaiService } from '../services/openai.service.js';
import type { ChatRequest } from '../types/chat.types.js';

export const chatController = {
  /**
   * Handle chat completion request (non-streaming)
   */
  async chat(req: Request<object, object, ChatRequest>, res: Response) {
    try {
      const { messages, model = 'gpt-4o' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required' });
        return;
      }

      const response = await openaiService.createChatCompletion(messages, model);
      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  },

  /**
   * Handle streaming chat completion request
   */
  async chatStream(req: Request<object, object, ChatRequest>, res: Response) {
    try {
      const { messages, model = 'gpt-4o' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required' });
        return;
      }

      // Set headers for SSE (Server-Sent Events)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const textStream = await openaiService.createStreamingChatCompletion(messages, model);

      // Stream text chunks directly from Vercel AI SDK
      for await (const chunk of textStream) {
        if (chunk) {
          res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
        }
      }

      // Signal completion
      res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Stream error:', error);
      
      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process streaming request' });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Stream error', done: true })}\n\n`);
        res.end();
      }
    }
  },
};
