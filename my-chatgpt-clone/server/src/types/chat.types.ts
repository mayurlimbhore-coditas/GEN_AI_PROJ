export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  content: string;
  role: 'assistant';
  finishReason: string | null;
}

