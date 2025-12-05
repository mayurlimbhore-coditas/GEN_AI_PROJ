import { useRef, useEffect } from 'react';
import ChatMessage from '../ChatMessage';
import type { Message } from '../ChatMessage';
import './MessageList.scss';

interface MessageListProps {
  messages: Message[];
  onRegenerate?: () => void;
}

const MessageList = ({ messages, onRegenerate }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find last assistant message index
  const lastAssistantIdx = messages.reduce((lastIdx, msg, idx) => {
    return msg.role === 'assistant' ? idx : lastIdx;
  }, -1);

  return (
    <div className="message-list">
      {messages.map((message, idx) => (
        <ChatMessage 
          key={message.id} 
          message={message}
          onRegenerate={idx === lastAssistantIdx ? onRegenerate : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
