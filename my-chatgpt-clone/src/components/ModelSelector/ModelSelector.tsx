import { useState, useRef, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import './ModelSelector.scss';

export interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const AVAILABLE_MODELS: Model[] = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model, great for complex tasks' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient for everyday tasks' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Powerful model with extended context' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast responses, good for simple tasks' },
];

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelData = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        className={`model-selector__trigger ${isOpen ? 'model-selector__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="model-selector__selected-name">{selectedModelData.name}</span>
        <KeyboardArrowDownIcon className={`model-selector__arrow ${isOpen ? 'model-selector__arrow--open' : ''}`} />
      </button>

      {isOpen && (
        <div className="model-selector__dropdown">
          <div className="model-selector__header">Select a model</div>
          <div className="model-selector__list">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                className={`model-selector__option ${model.id === selectedModel ? 'model-selector__option--selected' : ''}`}
                onClick={() => handleSelect(model.id)}
                type="button"
              >
                <div className="model-selector__option-content">
                  <span className="model-selector__option-name">{model.name}</span>
                  <span className="model-selector__option-desc">{model.description}</span>
                </div>
                {model.id === selectedModel && (
                  <CheckIcon className="model-selector__check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

