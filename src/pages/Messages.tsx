import { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2, MessageCircle, Reply, Trash2, X, ChevronLeft } from 'lucide-react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Avatar, getAvatarColor } from '../components/Shared';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Friend } from '../types/index';

const BACKEND_URL = 'https://localhost:7227';

const formatTime = (dateString: string) => {
    return new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
    const { user } = useAuth();

    // States para sa Connections (Left Sidebar)
    const [connections, setConnections] = useState<Friend[]>([]);
    const [isLoadingConnections, setIsLoadingConnections] = useState(true);

    // States para sa Active Chat (Right Panel)
    const [activeChat, setActiveChat] = useState<Friend | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // States para sa Reply/Delete
    const [replyingTo, setReplyingTo] = useState<{ id: string, content: string } | null>(null);
    const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

    // Search state para sa mobile/desktop list
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Load Connections
    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const networkData = await apiFetch('/Friends/network');
                setConnections(networkData.filter((f: any) => f.isAccepted));
            } catch (error) {
                console.error("Failed to fetch connections", error);
            } finally {
                setIsLoadingConnections(false);
            }
        };
        fetchConnections();
    }, []);

    // 2. Load Chat History pag pumili ng ka-chat
    useEffect(() => {
        if (!activeChat) return;

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                await apiFetch(`/Messages/read/${activeChat.friendUserId}`, { method: 'PUT' }).catch(() => { });
                const history = await apiFetch(`/Messages/${activeChat.friendUserId}`);
                setMessages(history);
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
        setReplyingTo(null); // Reset reply state when changing chats
    }, [activeChat]);

    // 3. SignalR Setup
    useEffect(() => {
        const token = localStorage.getItem('weshare_token');
        if (!token) return;

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${BACKEND_URL}/chathub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start().then(() => {
            setIsConnected(true);

            // Listen for new messages
            newConnection.on("ReceiveMessage", (message) => {
                setMessages(prev => [...prev, message]);
            });

            // Listen for deleted messages
            newConnection.on("MessageDeleted", (deletedMsgId) => {
                setMessages(prev => prev.filter(m => m.id !== deletedMsgId));
            });

        }).catch(() => setIsConnected(false));

        return () => { newConnection.stop(); };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection || !isConnected || !activeChat) return;

        try {
            await connection.invoke("SendMessage", activeChat.friendUserId, newMessage, replyingTo?.id || null);
            setNewMessage('');
            setReplyingTo(null);
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!connection || !isConnected || !activeChat) return;
        try {
            await connection.invoke("DeleteMessage", msgId, activeChat.friendUserId);
        } catch (e) {
            console.error("Failed to delete message:", e);
        }
    };

    const filteredConnections = connections.filter(c =>
        c.friendName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        // 🚨 FIX: Ginamit natin ang h-full, tinanggal ang border at rounded styles sa mobile para full-screen edge-to-edge siya!
        <div className="bg-slate-950 md:bg-slate-900/60 md:backdrop-blur-xl border-none md:border border-slate-800 rounded-none md:rounded-[24px] shadow-none md:shadow-lg flex overflow-hidden h-full w-full">

            {/* ══════════════════════════════════════════════════
                LEFT PANEL: Chat List 
            ══════════════════════════════════════════════════ */}
            <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[350px] shrink-0 md:border-r border-slate-800 flex-col bg-slate-950 md:bg-slate-900/40 h-full`}>
                <div className="p-4 md:p-5 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search connections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 md:bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {isLoadingConnections ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                    ) : filteredConnections.length === 0 ? (
                        <div className="text-center p-10 text-slate-500 text-sm">No connections found.</div>
                    ) : (
                        filteredConnections.map((conn) => (
                            <div
                                key={conn.friendshipId}
                                onClick={() => setActiveChat(conn)}
                                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all mb-1 ${activeChat?.friendshipId === conn.friendshipId ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}
                            >
                                <Avatar initials={conn.friendInitials} size="md" colorClass={getAvatarColor(conn.friendName)} />
                                <div className="flex-1 overflow-hidden">
                                    <h3 className={`font-bold text-sm truncate ${activeChat?.friendshipId === conn.friendshipId ? 'text-indigo-400' : 'text-white'}`}>{conn.friendName}</h3>
                                    <p className="text-xs text-slate-500 truncate">{conn.friendRole}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                RIGHT PANEL: Active Chat Area 
            ══════════════════════════════════════════════════ */}
            <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-950 md:bg-slate-950/20 relative h-full w-full`}>
                {!activeChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                            <MessageCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-white font-bold">Your Messages</h3>
                        <p className="text-sm mt-1">Select a connection to start chatting.</p>
                    </div>
                ) : (
                    <>
                        {/* ── CHAT HEADER ── */}
                        <div className="px-3 md:px-6 py-3 md:py-4 border-b border-slate-800 bg-slate-950 md:bg-slate-900/60 md:backdrop-blur-md flex items-center justify-between shrink-0 z-10 shadow-sm">
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* 🚨 MOBILE BACK BUTTON */}
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <Avatar initials={activeChat.friendInitials} size="sm" colorClass={getAvatarColor(activeChat.friendName)} />
                                <div>
                                    <h3 className="font-bold text-white text-sm md:text-base leading-tight">{activeChat.friendName}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                                        <span className="text-[10px] font-medium text-slate-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── CHAT MESSAGES ── */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {isLoadingHistory ? (
                                <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                    <span className="text-4xl mb-2">👋</span>
                                    Say hi to {activeChat.friendName.split(' ')[0]}!
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                                            onMouseEnter={() => setHoveredMsgId(msg.id)}
                                            onMouseLeave={() => setHoveredMsgId(null)}
                                        >
                                            {/* REPLIED TO BOX */}
                                            {msg.replyToContent && (
                                                <div className={`mb-1 px-3 py-1.5 rounded-xl text-[11px] md:text-xs opacity-75 flex items-center gap-2 max-w-[80%] md:max-w-[60%] ${isMe ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-800 text-slate-300'}`}>
                                                    <Reply className="w-3 h-3 shrink-0" />
                                                    <span className="truncate italic">"{msg.replyToContent}"</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 max-w-[85%] md:max-w-[70%]">
                                                {/* MESSAGE ACTIONS (SHOW ON HOVER / ACTIVE ON MOBILE) */}
                                                {isMe && (hoveredMsgId === msg.id || window.innerWidth < 768) && (
                                                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setReplyingTo({ id: msg.id, content: msg.content })} className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Reply"><Reply className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                )}

                                                {/* ACTUAL MESSAGE BUBBLE */}
                                                <div className={`px-4 py-2.5 rounded-[20px] text-sm leading-relaxed shadow-sm break-words ${isMe ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-sm'}`}>
                                                    {msg.content}
                                                </div>

                                                {!isMe && (hoveredMsgId === msg.id || window.innerWidth < 768) && (
                                                    <div className="flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setReplyingTo({ id: msg.id, content: msg.content })} className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Reply"><Reply className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[9px] text-slate-500 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>{formatTime(msg.sentAt)}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── CHAT INPUT ── */}
                        <div className="p-3 md:p-4 bg-slate-950 md:bg-slate-900/60 border-t border-slate-800 shrink-0 pb-safe z-10">
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-slate-900 md:bg-slate-800/50 px-4 py-2 rounded-t-xl border-b border-slate-800 md:border-slate-700 mb-[-10px] pb-4 z-0 relative">
                                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-indigo-400 min-w-0">
                                        <Reply className="w-3 h-3 shrink-0" /> <span className="shrink-0">Replying to:</span> <span className="text-slate-300 italic truncate ml-1">"{replyingTo.content}"</span>
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-rose-400 shrink-0 ml-2"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="relative z-10 flex gap-2 items-center bg-slate-900 md:bg-slate-950 border border-slate-700 md:border-slate-800 rounded-full p-1.5 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isConnected ? "Message..." : "Connecting..."}
                                    disabled={!isConnected}
                                    className="flex-1 bg-transparent px-4 text-sm text-white focus:outline-none disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-md active:scale-95"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}