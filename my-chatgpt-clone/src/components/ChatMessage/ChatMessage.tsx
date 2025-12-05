import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownRenderer from './MarkdownRenderer';
import './ChatMessage.scss';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
}

const ChatMessage = ({ message, onRegenerate }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`chat-message chat-message--${message.role}`}>
      <div className="chat-message__container">
        <div className="chat-message__avatar">
          {isUser ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        <div className="chat-message__content">
          <div className="chat-message__header">
            <span className="chat-message__name">
              {isUser ? 'You' : 'ChatGPT'}
            </span>
          </div>
          <div className="chat-message__text">
            {message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : null}
            {message.isStreaming && (
              <span className="chat-message__loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            )}
          </div>
          {!isUser && !message.isStreaming && message.content && (
            <div className="chat-message__actions">
              <button 
                className={`chat-message__action ${copied ? 'chat-message__action--success' : ''}`} 
                onClick={handleCopyMessage}
                title={copied ? 'Copied!' : 'Copy message'}
              >
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </button>
              <button className="chat-message__action" title="Good response">
                <ThumbUpOffAltIcon fontSize="small" />
              </button>
              <button className="chat-message__action" title="Bad response">
                <ThumbDownOffAltIcon fontSize="small" />
              </button>
              {onRegenerate && (
                <button className="chat-message__action" title="Regenerate" onClick={onRegenerate}>
                  <RefreshIcon fontSize="small" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
