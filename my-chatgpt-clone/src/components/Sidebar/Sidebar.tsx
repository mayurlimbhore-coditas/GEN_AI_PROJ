import { useEffect } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Chat } from '../../services/storage';
import './Sidebar.scss';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chats?: Chat[];
  activeChatId?: string | null;
  onSelectChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
}

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  onNewChat,
  chats = [],
  activeChatId,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) => {

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const chatDate = new Date(date);
    const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

    if (chatDay >= today) {
      return 'Today';
    } else if (chatDay >= yesterday) {
      return 'Yesterday';
    } else if (chatDay >= lastWeek) {
      return 'Previous 7 Days';
    } else {
      return chatDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    const dateKey = formatDate(chat.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat?.(chatId);
  };

  const handleNewChat = () => {
    onNewChat();
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar__overlay" onClick={onToggle} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar__header">
          <button className="sidebar__new-chat" onClick={handleNewChat}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>New chat</span>
          </button>
          <button className="sidebar__toggle" onClick={onToggle} aria-label="Close sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="sidebar__content">
          {chats.length === 0 ? (
            <div className="sidebar__empty">
              <p>No conversations yet</p>
              <p>Start a new chat to begin</p>
            </div>
          ) : (
            Object.entries(groupedChats).map(([date, dateChats]) => (
              <div key={date} className="sidebar__group">
                <h3 className="sidebar__group-title">{date}</h3>
                <ul className="sidebar__list">
                  {dateChats.map((chat) => (
                    <li key={chat.id} className="sidebar__item">
                      <div 
                        className={`sidebar__chat-btn ${chat.id === activeChatId ? 'sidebar__chat-btn--active' : ''}`}
                        onClick={() => onSelectChat?.(chat.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectChat?.(chat.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="sidebar__chat-title">{chat.title}</span>
                        <button 
                          className="sidebar__delete-btn"
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                          title="Delete chat"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="sidebar__footer">
          <button className="sidebar__user">
            <div className="sidebar__avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>User</span>
          </button>
        </div>
      </aside>

      {!isOpen && (
        <button className="sidebar__open-btn" onClick={onToggle} aria-label="Open sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
