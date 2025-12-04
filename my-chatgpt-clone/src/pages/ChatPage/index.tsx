import { useState } from 'react';
import { Sidebar, ChatInput, MessageList, WelcomeScreen } from '../../components';
import type { Message } from '../../components';
import './ChatPage.scss';

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual OpenAI API call)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming response
    const mockResponse = `This is a simulated response to your question: "${content}"

I'm currently running in demo mode. Once you integrate the OpenAI API, I'll be able to provide real, intelligent responses to your queries.

Here are some things I'll be able to help you with:
• Answer questions on various topics
• Help with coding problems
• Provide explanations and tutorials
• Assist with writing and editing
• And much more!

Feel free to ask me anything once the API is connected.`;

    let currentContent = '';
    const words = mockResponse.split(' ');

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      currentContent += (i === 0 ? '' : ' ') + words[i];
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: currentContent }
            : msg
        )
      );
    }

    // Mark streaming as complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessage.id
          ? { ...msg, isStreaming: false }
          : msg
      )
    );

    setIsLoading(false);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className={`chat-page ${sidebarOpen ? 'chat-page--sidebar-open' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      <main className="chat-page__main">
        <header className="chat-page__header">
          <h1 className="chat-page__title">ChatGPT</h1>
          <div className="chat-page__model">
            <span className="chat-page__model-badge">GPT-4</span>
          </div>
        </header>

        <div className="chat-page__content">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <MessageList messages={messages} />
          )}
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ChatPage;

