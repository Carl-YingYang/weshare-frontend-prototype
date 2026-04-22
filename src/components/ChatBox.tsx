import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { apiFetch } from '../api/client';
import { Avatar, getAvatarColor } from './Shared';

const BACKEND_URL = 'https://localhost:7227';

// 🚨 HELPER: Ensures relative URLs get the correct backend prefix
const getFullImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `https://localhost:7227${url}`;
};

interface ChatBoxProps {
    currentUser: any;
    chatUser: { id: string; name: string; initials: string; profilePicture?: string };
    onClose: () => void;
}

export default function ChatBox({ currentUser, chatUser, onClose }: ChatBoxProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Chat History & Mark as Read
    useEffect(() => {
        const fetchHistoryAndMarkRead = async () => {
            try {
                await apiFetch(`/Messages/read/${chatUser.id}`, { method: 'PUT' }).catch(() => { });
                const history = await apiFetch(`/Messages/${chatUser.id}`);
                setMessages(history);
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistoryAndMarkRead();
    }, [chatUser.id]);

    // 2. Setup SignalR WebSocket Connection
    useEffect(() => {
        const token = localStorage.getItem('weshare_token');
        if (!token) return;

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${BACKEND_URL}/chathub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                setIsConnected(true);
                newConnection.on("ReceiveMessage", (message) => {
                    if (message.senderId === chatUser.id || message.receiverId === chatUser.id) {
                        setMessages(prev => [...prev, message]);
                    }
                });
            })
            .catch(e => {
                console.error("SignalR Connection failed: ", e);
                setIsConnected(false);
            });

        return () => {
            newConnection.stop();
        };
    }, [chatUser.id]);

    // 3. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4. Send Message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection || !isConnected) return;

        try {
            await connection.invoke("SendMessage", chatUser.id, newMessage, null);
            setNewMessage('');
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-[340px] sm:w-80 bg-slate-900 border border-slate-700 rounded-t-2xl rounded-b-lg shadow-2xl flex flex-col z-[200] animate-in slide-in-from-bottom-5 overflow-hidden">

            {/* HEADER */}
            <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700 shadow-sm cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 shrink-0 flex items-center justify-center">
                        {chatUser.profilePicture ? (
                            <img src={getFullImageUrl(chatUser.profilePicture)} className="w-full h-full object-cover" />
                        ) : (
                            <Avatar initials={chatUser.initials} size="sm" colorClass={getAvatarColor(chatUser.name)} />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-white leading-tight truncate">{chatUser.name}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                            <span className="text-[10px] font-medium text-slate-400">
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-slate-900/50 rounded-lg hover:bg-rose-500/10 shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* BODY */}
            <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-slate-950/50">
                {isLoadingHistory ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                        <div className="w-12 h-12 rounded-full bg-slate-800 mb-2 flex items-center justify-center text-xl">👋</div>
                        Say hi to {chatUser.name.split(' ')[0]}!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={index} className={`flex gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {/* Friend's Avatar (Left) */}
                                {!isMe && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-auto border border-slate-700 flex items-center justify-center">
                                        {chatUser.profilePicture ? (
                                            <img src={getFullImageUrl(chatUser.profilePicture)} className="w-full h-full object-cover" />
                                        ) : (
                                            <Avatar initials={chatUser.initials} size="sm" colorClass={getAvatarColor(chatUser.name)} />
                                        )}
                                    </div>
                                )}
                                
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'}`}>
                                    {msg.content}
                                </div>

                                {/* My Avatar (Right) */}
                                {isMe && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-auto border border-slate-700 flex items-center justify-center">
                                        {currentUser?.profilePicture ? (
                                            <img src={getFullImageUrl(currentUser.profilePicture)} className="w-full h-full object-cover" />
                                        ) : (
                                            <Avatar initials={currentUser?.initials || "??"} size="sm" colorClass="bg-indigo-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    disabled={!isConnected}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    {isConnected ? <Send className="w-4 h-4 ml-0.5" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
            </form>

        </div>
    );
}