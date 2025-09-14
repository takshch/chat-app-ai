import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import ChatBox from '../components/ChatBox';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Chat, ChatListItem, Message } from '../types';

const DashboardPage: React.FC = () => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();

  // Load user's chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChatHistory(chatId);
      setCurrentChat(response.chat);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (message: string) => {
    if (!message.trim()) return;

    // Immediately create a temporary chat with user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const tempChat: Chat = {
      id: 'temp-' + Date.now(), // Temporary ID
      title: message.length > 50 ? message.substring(0, 50) + '...' : message,
      messages: [userMessage],
      userId: user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentChat(tempChat);

    try {
      setIsCreatingChat(true);
      const response = await chatAPI.createChat(message);
      
      // Update the chat with the real data from server
      const newChat: Chat = {
        id: response.chatId,
        title: response.title,
        messages: [
          userMessage,
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          },
        ],
        userId: user!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentChat(newChat);
      
      // Reload chats to include the new one
      await loadChats();
    } catch (error) {
      console.error('Failed to create chat:', error);
      
      // Remove the temporary chat if creation failed
      setCurrentChat(null);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !currentChat) return;

    // Immediately add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const chatWithUserMessage: Chat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: new Date(),
    };

    setCurrentChat(chatWithUserMessage);

    try {
      setIsLoading(true);
      const response = await chatAPI.sendMessage(currentChat.id, message);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      const updatedChat: Chat = {
        ...chatWithUserMessage,
        messages: [...chatWithUserMessage.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setCurrentChat(updatedChat);
      
      // Reload chats to update the updatedAt timestamp
      await loadChats();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the user message if the request failed
      setCurrentChat(currentChat);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <div className="w-80 bg-dark-sidebar border-r border-dark-border flex flex-col shadow-2xl">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold text-dark-text mb-4">ViralLens Chat</h2>
          <button 
            className="w-full bg-white text-black border border-gray-300 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-gray-400"
            onClick={() => {
              setCurrentChat(null);
            }}
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden m-1 py-2 max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-transparent hover:scrollbar-thumb-dark-hover">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`m-1 px-2 py-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-dark-border/50 ${
                currentChat?.id === chat.id 
                  ? 'bg-dark-hover/30' 
                  : ''
              }`}
              onClick={() => loadChatHistory(chat.id)}
            >
              <div className="font-medium text-gray-200 text-sm overflow-hidden text-ellipsis whitespace-nowrap leading-relaxed">
                {chat.title}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-3">
          <div className="text-sm text-dark-text-secondary font-medium">
            <span>{user?.name || user?.email}</span>
          </div>
          <button 
            className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-gray-400" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-dark-bg">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-5 border-b border-dark-border bg-dark-sidebar">
              <h3 className="text-lg font-semibold text-dark-text">{currentChat.title}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {currentChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[80%] ${
                    message.role === 'user' ? 'self-end' : 'self-start'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed break-words bg-dark-message-user text-white rounded-br-md">
                      {message.content}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed break-words text-white">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 text-white">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 text-white">{children}</ol>,
                            li: ({ children }) => <li className="mb-1 text-white">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-gray-700 text-gray-200 px-1 py-0.5 rounded text-xs">{children}</code>
                              ) : (
                                <code className="block bg-gray-800 text-gray-200 p-3 rounded-md text-xs overflow-x-auto">{children}</code>
                              );
                            },
                            pre: ({ children }) => <pre className="mb-2 last:mb-0">{children}</pre>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-400 pl-4 italic mb-2 last:mb-0 text-white">{children}</blockquote>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-white">{children}</h3>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-white">{children}</em>,
                            a: ({ children, href }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                            table: ({ children }) => <table className="border-collapse border border-gray-400 mb-2 last:mb-0 text-white">{children}</table>,
                            th: ({ children }) => <th className="border border-gray-400 px-2 py-1 bg-gray-700 text-left text-white">{children}</th>,
                            td: ({ children }) => <td className="border border-gray-400 px-2 py-1 text-white">{children}</td>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div className={`text-xs text-dark-text-secondary mt-1 px-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {(isLoading || isCreatingChat) && (
                <div className="flex flex-col max-w-[80%] self-start">
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed break-words bg-dark-message-assistant text-dark-text border border-dark-border rounded-bl-md">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-2xl font-semibold text-dark-text mb-3">Welcome to ViralLens Chat</h2>
            <p className="text-dark-text-secondary text-base">Start a new conversation by typing a message below.</p>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-5">
          <div className="max-w-4xl mx-auto">
            <ChatBox
              onSubmit={currentChat ? sendMessage : createNewChat}
              placeholder={currentChat ? "Type your message..." : "Start a new conversation..."}
              disabled={isLoading || isCreatingChat}
              isLoading={isLoading || isCreatingChat}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
