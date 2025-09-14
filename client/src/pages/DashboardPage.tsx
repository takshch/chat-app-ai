import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import ChatBox from '../components/ChatBox';
import type { Chat, ChatListItem, Message } from '../types';
import './DashboardPage.css';

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
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>ViralLens Chat</h2>
          <button 
            className="new-chat-button"
            onClick={() => {
              setCurrentChat(null);
            }}
          >
            + New Chat
          </button>
        </div>

        <div className="chats-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => loadChatHistory(chat.id)}
            >
              <div className="chat-title">{chat.title}</div>
              <div className="chat-date">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.name || user?.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <h3>{currentChat.title}</h3>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {currentChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {(isLoading || isCreatingChat) && (
                <div className="message assistant-message">
                  <div className="message-content">
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
          <div className="welcome-screen">
            <h2>Welcome to ViralLens Chat</h2>
            <p>Start a new conversation by typing a message below.</p>
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
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
