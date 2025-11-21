
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '../icons/HeroIcons';
import Button from '../common/Button';
import { ChatMessage, UserProfile } from '../../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: UserProfile;
  targetAvatarUrl?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  title,
  messages,
  onSendMessage,
  currentUser,
  targetAvatarUrl,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const defaultUserAvatar = `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=06b6d4&color=fff&size=128`;
  const defaultTargetAvatar = targetAvatarUrl || `https://ui-avatars.com/api/?name=${title.replace(' ', '+')}&background=6b7280&color=fff&size=128`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end justify-end p-0 sm:p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full sm:max-w-md h-[80vh] sm:h-[70vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-neutral-light">
          <div className="flex items-center">
            <img src={targetAvatarUrl || defaultTargetAvatar} alt={title} className="w-8 h-8 rounded-full mr-2" />
            <h2 className="text-lg font-semibold text-neutral-dark">{title}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-DEFAULT hover:text-primary-dark transition-colors p-1">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-light/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
              }`}
            >
              <img 
                src={msg.sender === 'user' ? (currentUser.avatarUrl || defaultUserAvatar) : (msg.avatarUrl || defaultTargetAvatar) } 
                alt={msg.sender} 
                className={`w-7 h-7 rounded-full ${msg.sender === 'user' ? 'ml-2' : 'mr-2'}`}
              />
              <div
                className={`px-3 py-2 rounded-lg shadow ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white text-neutral-dark border border-neutral-light rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-light/80 text-right' : 'text-neutral-DEFAULT text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-neutral-light bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 w-full px-3 py-2 border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors"
              aria-label="Chat message input"
            />
            <Button onClick={handleSend} variant="primary" size="md" className="p-2.5" aria-label="Send message">
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
