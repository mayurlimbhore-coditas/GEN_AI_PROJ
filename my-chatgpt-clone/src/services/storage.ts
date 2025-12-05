import type { Message } from '../components/ChatMessage';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'chatgpt-clone-chats';
const ACTIVE_CHAT_KEY = 'chatgpt-clone-active-chat';

/**
 * Get all chats from localStorage
 */
export const getChats = (): Chat[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const chats = JSON.parse(data) as Chat[];
    // Convert date strings back to Date objects
    return chats.map(chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
};

/**
 * Save all chats to localStorage
 */
export const saveChats = (chats: Chat[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats:', error);
  }
};

/**
 * Get a single chat by ID
 */
export const getChat = (chatId: string): Chat | undefined => {
  const chats = getChats();
  return chats.find(chat => chat.id === chatId);
};

/**
 * Create a new chat
 */
export const createChat = (title: string = 'New Chat'): Chat => {
  const chat: Chat = {
    id: generateId(),
    title,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const chats = getChats();
  chats.unshift(chat); // Add to beginning
  saveChats(chats);
  
  return chat;
};

/**
 * Update an existing chat
 */
export const updateChat = (chatId: string, updates: Partial<Chat>): Chat | undefined => {
  const chats = getChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  
  if (index === -1) return undefined;
  
  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveChats(chats);
  return chats[index];
};

/**
 * Delete a chat
 */
export const deleteChat = (chatId: string): boolean => {
  const chats = getChats();
  const filteredChats = chats.filter(chat => chat.id !== chatId);
  
  if (filteredChats.length === chats.length) return false;
  
  saveChats(filteredChats);
  return true;
};

/**
 * Add a message to a chat
 */
export const addMessage = (chatId: string, message: Message): Chat | undefined => {
  const chats = getChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  
  if (index === -1) return undefined;
  
  chats[index].messages.push(message);
  chats[index].updatedAt = new Date();
  
  // Update title based on first user message if it's still "New Chat"
  if (chats[index].title === 'New Chat' && message.role === 'user') {
    chats[index].title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }
  
  saveChats(chats);
  return chats[index];
};

/**
 * Update a specific message in a chat
 */
export const updateMessage = (chatId: string, messageId: string, content: string): Chat | undefined => {
  const chats = getChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex === -1) return undefined;
  
  const messageIndex = chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
  if (messageIndex === -1) return undefined;
  
  chats[chatIndex].messages[messageIndex].content = content;
  chats[chatIndex].messages[messageIndex].isStreaming = false;
  chats[chatIndex].updatedAt = new Date();
  
  saveChats(chats);
  return chats[chatIndex];
};

/**
 * Get active chat ID
 */
export const getActiveChatId = (): string | null => {
  return localStorage.getItem(ACTIVE_CHAT_KEY);
};

/**
 * Set active chat ID
 */
export const setActiveChatId = (chatId: string | null): void => {
  if (chatId) {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
  } else {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  }
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Clear all chats
 */
export const clearAllChats = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_CHAT_KEY);
};

