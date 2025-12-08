
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '../icons/HeroIcons';
import { ChatMessage, UserProfile } from '../../types';
import { GeminiService } from '../../src/services/GeminiService';

interface DoriSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserProfile;
}

const geminiService = new GeminiService({ apiKey: '' }); // API Key loaded from env internal to service

const DoriSidebar: React.FC<DoriSidebarProps> = ({ isOpen, onClose, currentUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'intro',
            sender: 'dori',
            text: "Aye, hello there! I'm Dori. Ask me anything about your properties, tenants, or financials.",
            timestamp: new Date().toISOString(),
            avatarUrl: 'https://ui-avatars.com/api/?name=Dori+AI&background=7c3aed&color=fff' // Purple for AI
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Call Agent
            const responseText = await geminiService.askDori(userMsg.text, {
                currentUser: currentUser.name,
                company: currentUser.companyName
            });

            const doriMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'dori',
                text: responseText,
                timestamp: new Date().toISOString(),
                avatarUrl: 'https://ui-avatars.com/api/?name=Dori+AI&background=7c3aed&color=fff'
            };
            setMessages(prev => [...prev, doriMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'dori',
                text: "Och, something went wrong with my circuits.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 bg-zinc-50">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-violet-100 rounded-full">
                            <SparklesIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-zinc-900">Ask Dori</h2>
                            <p className="text-xs text-zinc-500">AI Property Assistant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-4 bg-white">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'user'
                                    ? 'bg-zinc-900 text-white rounded-br-none'
                                    : 'bg-zinc-100 text-zinc-800 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-100 rounded-2xl rounded-bl-none px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Dori anything..."
                            className="flex-1 px-4 py-2 border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || isTyping}
                            className="p-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default DoriSidebar;
