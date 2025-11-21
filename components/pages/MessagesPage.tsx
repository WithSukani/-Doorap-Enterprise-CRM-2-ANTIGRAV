
import React, { useState } from 'react';
import { ChatSession, UserProfile, Tenant, Landlord } from '../../types';
import PageHeader from '../PageHeader';
import { ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, PaperAirplaneIcon, UserGroupIcon } from '../icons/HeroIcons';
import Button from '../common/Button';

interface MessagesPageProps {
    chatSessions: Record<string, ChatSession>;
    onSendMessage: (chatId: string, text: string, sender: string) => void;
    userProfile: UserProfile;
    tenants: Tenant[];
    landlords: Landlord[];
}

const MessagesPage: React.FC<MessagesPageProps> = ({ chatSessions, onSendMessage, userProfile, tenants, landlords }) => {
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Flatten sessions
    const sessions = (Object.values(chatSessions) as ChatSession[]).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    
    const handleSend = () => {
        if (!activeChatId || !inputText.trim()) return;
        onSendMessage(activeChatId, inputText, 'user');
        setInputText('');
    };

    const activeSession = activeChatId ? chatSessions[activeChatId] : null;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in">
            <PageHeader title="Messages" subtitle="Unified inbox for tenants, landlords, and providers." />
            
            <div className="flex-1 bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden flex">
                {/* Sidebar List */}
                <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50">
                    <div className="p-4 border-b border-zinc-200">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-md focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sessions.length === 0 ? (
                            <p className="p-6 text-center text-sm text-zinc-400">No active conversations.</p>
                        ) : (
                            sessions.map(session => (
                                <div 
                                    key={session.id}
                                    onClick={() => setActiveChatId(session.id)}
                                    className={`p-4 border-b border-zinc-100 cursor-pointer hover:bg-zinc-100 transition-colors ${activeChatId === session.id ? 'bg-white border-l-4 border-l-zinc-900' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            {session.targetAvatarUrl ? (
                                                <img src={session.targetAvatarUrl} className="w-8 h-8 rounded-full mr-3" alt="Avatar"/>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center mr-3 text-xs font-bold text-zinc-600">
                                                    {session.name.charAt(0)}
                                                </div>
                                            )}
                                            <h4 className="font-semibold text-sm text-zinc-900">{session.name}</h4>
                                        </div>
                                        <span className="text-xs text-zinc-400">{new Date(session.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate ml-11">
                                        {session.messages[session.messages.length - 1]?.text || 'New conversation'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeSession ? (
                        <>
                            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                                <div className="flex items-center">
                                    <h3 className="font-bold text-lg text-zinc-900">{activeSession.name}</h3>
                                </div>
                                <Button variant="outline" size="sm" leftIcon={<UserGroupIcon className="w-4 h-4"/>}>Profile</Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
                                {activeSession.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 shadow-sm text-sm ${
                                            msg.sender === 'user' ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none'
                                        }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-zinc-200 bg-white">
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 border border-zinc-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                                        placeholder="Type a message..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    />
                                    <Button onClick={handleSend} disabled={!inputText.trim()}><PaperAirplaneIcon className="w-5 h-5"/></Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                            <ChatBubbleLeftEllipsisIcon className="w-16 h-16 mb-4 opacity-20"/>
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
