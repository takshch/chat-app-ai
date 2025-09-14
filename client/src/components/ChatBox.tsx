import React, { useState, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send } from 'lucide-react';
import { cn } from '../utils/cn';

interface ChatBoxProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  onSubmit, 
  placeholder = "Send a message...", 
  disabled = false,
  isLoading = false 
}) => {
  const [prompt, setPrompt] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitPrompt();
    }
  };

  const submitPrompt = () => {
    if (prompt.trim() && !disabled && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-input-wrapper">
        <TextareaAutosize
          autoFocus={true}
          value={prompt}
          onKeyDown={onKeyDown}
          onChange={onChange}
          disabled={disabled || isLoading}
          className={cn(
            'chat-input',
            disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          )}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="chat-send-button"
          onClick={submitPrompt}
          disabled={!prompt.trim() || disabled || isLoading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
