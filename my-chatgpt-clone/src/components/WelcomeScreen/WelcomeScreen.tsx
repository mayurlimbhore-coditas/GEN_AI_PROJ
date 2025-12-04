import type { ReactNode } from 'react';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import './WelcomeScreen.scss';

interface Suggestion {
  icon: ReactNode;
  title: string;
  description: string;
}

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  const suggestions: Suggestion[] = [
    {
      icon: <LightbulbOutlinedIcon />,
      title: 'Explain quantum computing',
      description: 'in simple terms',
    },
    {
      icon: <BrushOutlinedIcon />,
      title: 'Create a content strategy',
      description: 'for a tech startup',
    },
    {
      icon: <EditNoteOutlinedIcon />,
      title: 'Write a poem',
      description: 'about programming',
    },
    {
      icon: <BuildOutlinedIcon />,
      title: 'Help me debug',
      description: 'my React code',
    },
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__content">
        <div className="welcome-screen__logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="welcome-screen__title">How can I help you today?</h1>
        
        <div className="welcome-screen__suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="welcome-screen__suggestion"
              onClick={() => onSuggestionClick(`${suggestion.title} ${suggestion.description}`)}
            >
              <span className="welcome-screen__suggestion-icon">{suggestion.icon}</span>
              <div className="welcome-screen__suggestion-text">
                <span className="welcome-screen__suggestion-title">{suggestion.title}</span>
                <span className="welcome-screen__suggestion-desc">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
