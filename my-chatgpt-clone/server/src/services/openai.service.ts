import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { config } from '../config/index.js';
import type { ChatMessage } from '../types/chat.types.js';

const openai = createOpenAI({
  apiKey: config.openaiApiKey,
});

export const openaiService = {
  /**
   * Create a chat completion (non-streaming)
   */
  async createChatCompletion(messages: ChatMessage[], model: string = 'gpt-4o') {
    const { text, finishReason } = await generateText({
      model: openai(model),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return {
      content: text,
      role: 'assistant' as const,
      finishReason,
    };
  },

  /**
   * Create a streaming chat completion
   */
  async createStreamingChatCompletion(messages: ChatMessage[], model: string = 'gpt-4o') {
    const { textStream } = streamText({
      model: openai(model),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return textStream;
  },
};
