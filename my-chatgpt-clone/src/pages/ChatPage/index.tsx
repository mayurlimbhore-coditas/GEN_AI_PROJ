import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar, ChatInput, MessageList, WelcomeScreen, ModelSelector } from '../../components';
import type { Message } from '../../components';
import { streamChatCompletion } from '../../services';
import type { ChatMessage } from '../../services';
import {
  getChats,
  createChat,
  updateChat,
  deleteChat,
  getActiveChatId,
  setActiveChatId,
  generateId,
} from '../../services/storage';
import type { Chat } from '../../services/storage';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import './ChatPage.scss';

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  // Load chats on mount
  useEffect(() => {
    const savedChats = getChats();
    setChats(savedChats);

    const savedActiveChatId = getActiveChatId();
    if (savedActiveChatId) {
      const activeChat = savedChats.find(c => c.id === savedActiveChatId);
      if (activeChat) {
        setActiveChatIdState(savedActiveChatId);
        setMessages(activeChat.messages);
      }
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (activeChatId && messages.length > 0 && !isStreamingRef.current) {
      updateChat(activeChatId, { messages });
      // Refresh chats list
      setChats(getChats());
    }
  }, [messages, activeChatId]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isStreamingRef.current = false;
    setIsLoading(false);
    
    // Mark last message as not streaming
    setMessages(prev => 
      prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isStreaming 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  }, []);

  const handleSendMessage = async (content: string) => {
    setError(null);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    isStreamingRef.current = true;

    // Create or get active chat
    let currentChatId = activeChatId;
    if (!currentChatId) {
      const newChat = createChat();
      currentChatId = newChat.id;
      setActiveChatIdState(currentChatId);
      setActiveChatId(currentChatId);
      setChats(getChats());
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Prepare messages for API
    const apiMessages: ChatMessage[] = newMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Stream the response
    await streamChatCompletion(
      apiMessages,
      selectedModel,
      (chunk) => {
        if (!isStreamingRef.current) return;
        
        if (chunk.content) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk.content }
                : msg
            )
          );
        }

        if (chunk.done) {
          isStreamingRef.current = false;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
        }

        if (chunk.error) {
          isStreamingRef.current = false;
          setError(chunk.error);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: '', isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Stream error:', err);
        isStreamingRef.current = false;
        setError('Failed to get response. Please check if the server is running and try again.');
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: '', isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    );
  };

  const handleNewChat = () => {
    handleStopGeneration();
    setMessages([]);
    setActiveChatIdState(null);
    setActiveChatId(null);
    setError(null);
  };

  const handleSelectChat = (chatId: string) => {
    handleStopGeneration();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChatIdState(chatId);
      setActiveChatId(chatId);
      setMessages(chat.messages);
      setError(null);
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    setChats(getChats());
    
    if (chatId === activeChatId) {
      setMessages([]);
      setActiveChatIdState(null);
      setActiveChatId(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleRetry = () => {
    setError(null);
    // Get last user message and retry
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message (the failed one)
      const messagesWithoutLastAssistant = messages.filter((m, idx) => {
        const isLastAssistant = idx === messages.length - 1 && m.role === 'assistant';
        return !isLastAssistant;
      });
      setMessages(messagesWithoutLastAssistant);
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleRegenerate = () => {
    // Get the last user message
    const lastUserMessageIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIdx === -1) return;
    
    const actualIdx = messages.length - 1 - lastUserMessageIdx;
    const lastUserMessage = messages[actualIdx];
    
    // Remove all messages after the last user message
    const previousMessages = messages.slice(0, actualIdx + 1);
    setMessages(previousMessages);
    
    // Resend the message
    setTimeout(() => {
      handleSendMessage(lastUserMessage.content);
    }, 100);
  };

  return (
    <div className={`chat-page ${sidebarOpen ? 'chat-page--sidebar-open' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="chat-page__main">
        <header className="chat-page__header">
          <h1 className="chat-page__title">ChatGPT</h1>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </header>

        <div className="chat-page__content">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <MessageList 
              messages={messages} 
              onRegenerate={handleRegenerate}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="chat-page__error">
            <div className="chat-page__error-content">
              <span className="chat-page__error-icon">⚠️</span>
              <span className="chat-page__error-text">{error}</span>
              <button className="chat-page__error-retry" onClick={handleRetry}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stop button */}
        {isLoading && (
          <div className="chat-page__stop">
            <button className="chat-page__stop-btn" onClick={handleStopGeneration}>
              <StopCircleIcon />
              <span>Stop generating</span>
            </button>
          </div>
        )}

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ChatPage;
