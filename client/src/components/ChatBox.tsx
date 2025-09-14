import React, { useState, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUp, Send } from 'lucide-react';
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
    <div className="w-full">
      <div className="relative w-full">
        <TextareaAutosize
          autoFocus={true}
          value={prompt}
          onKeyDown={onKeyDown}
          onChange={onChange}
          disabled={disabled || isLoading}
          className={cn(
            'text-dark-text bg-dark-message-assistant border-2 border-dark-border rounded-xl px-4 py-3 pr-12 w-full shadow-sm resize-none min-h-12 max-h-[200px] font-inherit text-sm leading-relaxed transition-all duration-200 overflow-y-auto',
            disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          )}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-4 bottom-4 bg-white text-black border border-gray-300 rounded-full w-8 h-8 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:border-gray-300"
          onClick={submitPrompt}
          disabled={!prompt.trim() || disabled || isLoading}
        >
          <ArrowUp size={16} className="text-black" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
