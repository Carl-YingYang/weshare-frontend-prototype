import { useState, useEffect } from 'react';
import { UserCheck, Loader2, Users, Clock, X, UserPlus, MessageCircle } from 'lucide-react';
import { Avatar, getAvatarColor } from '../components/Shared';
import { apiFetch } from '../api/client';
import type { Friend } from '../types/index';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function Network() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setViewingUsername } = useOutletContext<any>();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInteracting, setIsInteracting] = useState<Record<string, boolean>>({});

    const fetchNetworkData = async () => {
        try {
            setIsLoading(true);
            const [networkData, allUsersData] = await Promise.all([
                apiFetch('/Friends/network'),
                apiFetch('/Users')
            ]);

            setFriends(networkData);

            const networkIds = networkData.map((f: any) => f.friendUserId);
            const validSuggestions = allUsersData.filter((u: any) =>
                u.id !== user?.id && !networkIds.includes(u.id)
            );
            setSuggestedUsers(validSuggestions.slice(0, 15));

        } catch (error) {
            console.error("Failed to fetch network data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNetworkData();
    }, [user]);

    const handleAcceptRequest = async (friendshipId: string) => {
        try {
            setIsInteracting(prev => ({ ...prev, [friendshipId]: true }));
            await apiFetch(`/Friends/accept/${friendshipId}`, { method: 'POST' });
            await fetchNetworkData();
        } catch (error) {
            console.error("Failed to accept request:", error);
        } finally {
            setIsInteracting(prev => ({ ...prev, [friendshipId]: false }));
        }
    };

    const handleRejectRequest = async (friendshipId: string) => {
        try {
            setIsInteracting(prev => ({ ...prev, [friendshipId]: true }));
            await apiFetch(`/Friends/${friendshipId}`, { method: 'DELETE' });
            await fetchNetworkData();
        } catch (error) {
            console.error("Failed to reject request:", error);
        } finally {
            setIsInteracting(prev => ({ ...prev, [friendshipId]: false }));
        }
    };

    const handleSendRequest = async (receiverId: string) => {
        try {
            setIsInteracting(prev => ({ ...prev, [receiverId]: true }));
            await apiFetch('/Friends/request', { method: 'POST', body: JSON.stringify({ receiverId }) });
            await fetchNetworkData();
        } catch (error) {
            console.error("Failed to send request", error);
        } finally {
            setIsInteracting(prev => ({ ...prev, [receiverId]: false }));
        }
    };

    const receivedRequests = friends.filter(f => !f.isAccepted && !f.isRequester);
    const sentRequests = friends.filter(f => !f.isAccepted && f.isRequester);
    const connections = friends.filter(f => f.isAccepted);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-4 w-full max-w-full overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* 1. ── EXISTING NETWORK SECTION ── */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-3 md:gap-4 px-1 md:px-0">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        Your Connections <span className="bg-indigo-500/20 text-indigo-400 text-[10px] md:text-xs px-2.5 py-0.5 rounded-full">{connections.length}</span>
                    </h2>
                </div>

                {connections.length === 0 ? (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[20px] md:rounded-[24px] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3 md:mb-4">
                            <Users className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
                        </div>
                        <h3 className="text-white text-sm md:text-base font-bold mb-1">No connections yet</h3>
                        <p className="text-slate-400 text-xs md:text-sm">Start building your network by accepting requests or exploring suggestions below.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                        {connections.map((conn) => (
                            <div key={conn.friendshipId} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[16px] md:rounded-[24px] p-4 md:p-6 flex flex-col items-center text-center shadow-lg hover:border-slate-700 transition-all group relative">
                                <button
                                    onClick={() => handleRejectRequest(conn.friendshipId)}
                                    disabled={isInteracting[conn.friendshipId]}
                                    className="absolute top-2 right-2 md:top-4 md:right-4 p-1 md:p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50 z-10"
                                    title="Remove Connection"
                                >
                                    {isInteracting[conn.friendshipId] ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <X className="w-3 h-3 md:w-4 md:h-4" />}
                                </button>

                                <div
                                    className="cursor-pointer relative group-hover:scale-105 transition-transform"
                                    onClick={() => setViewingUsername(conn.friendName)}
                                >
                                    {/* Responsive Avatar Size for Grid */}
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-slate-800 overflow-hidden flex items-center justify-center">
                                        <Avatar initials={conn.friendInitials} size="lg" colorClass={getAvatarColor(conn.friendName)} />
                                    </div>
                                </div>
                                <h3
                                    className="font-bold text-white text-xs md:text-base mt-2 md:mt-4 hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1 w-full px-1"
                                    onClick={() => setViewingUsername(conn.friendName)}
                                >
                                    {conn.friendName}
                                </h3>
                                <p className="text-[9px] md:text-xs font-medium text-slate-400 mt-0.5 md:mt-1 mb-3 md:mb-6 truncate w-full px-2">{conn.friendRole}</p>

                                <button
                                    onClick={() => navigate('/messages')}
                                    className="w-full flex items-center justify-center gap-1.5 md:gap-2 bg-slate-800/50 text-slate-300 font-bold py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm border border-slate-700 hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all shadow-sm"
                                >
                                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Message</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. ── RECEIVED REQUESTS ── */}
            {receivedRequests.length > 0 && (
                <div className="pt-2 md:pt-4 border-t border-slate-800/50 px-1 md:px-0">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-tight mb-3 md:mb-4 flex items-center gap-2">
                        Friend Requests <span className="bg-rose-500 text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">{receivedRequests.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {receivedRequests.map((req) => (
                            <div key={req.friendshipId} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between shadow-md hover:border-slate-700 transition-colors">
                                <div
                                    className="flex items-center gap-2.5 md:gap-3 overflow-hidden cursor-pointer group flex-1"
                                    onClick={() => setViewingUsername(req.friendName)}
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-700 shrink-0">
                                        <Avatar initials={req.friendInitials} size="md" colorClass={getAvatarColor(req.friendName)} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white text-xs md:text-sm truncate group-hover:text-indigo-400 transition-colors">{req.friendName}</h3>
                                        <p className="text-[10px] md:text-xs text-slate-400 truncate">{req.friendRole}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 md:gap-2 shrink-0 ml-2">
                                    <button
                                        onClick={() => handleAcceptRequest(req.friendshipId)}
                                        disabled={isInteracting[req.friendshipId]}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                                    >
                                        {isInteracting[req.friendshipId] ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <UserCheck className="w-4 h-4 md:w-5 md:h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(req.friendshipId)}
                                        disabled={isInteracting[req.friendshipId]}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-rose-500 hover:text-white hover:border-rose-500 flex items-center justify-center transition-all disabled:opacity-50"
                                    >
                                        {isInteracting[req.friendshipId] ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <X className="w-4 h-4 md:w-5 md:h-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. ── SENT REQUESTS ── */}
            {sentRequests.length > 0 && (
                <div className="pt-2 md:pt-4 px-1 md:px-0">
                    <h2 className="text-xs md:text-sm font-bold text-slate-400 tracking-tight mb-2 md:mb-3">Requests you sent</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                        {sentRequests.map((req) => (
                            <div key={req.friendshipId} className="bg-slate-900/30 border border-slate-800/50 rounded-xl md:rounded-2xl p-2.5 md:p-3 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div
                                    className="flex items-center gap-2.5 md:gap-3 overflow-hidden cursor-pointer group flex-1"
                                    onClick={() => setViewingUsername(req.friendName)}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
                                        <Avatar initials={req.friendInitials} size="sm" colorClass={getAvatarColor(req.friendName)} />
                                    </div>
                                    <h3 className="font-bold text-white text-[11px] md:text-sm truncate group-hover:text-indigo-400 transition-colors">{req.friendName}</h3>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0 ml-2">
                                    <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded-md md:rounded-lg">
                                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> Pending
                                    </div>
                                    <button
                                        onClick={() => handleRejectRequest(req.friendshipId)}
                                        disabled={isInteracting[req.friendshipId]}
                                        className="p-1 md:p-1.5 rounded-md md:rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                                        title="Cancel Request"
                                    >
                                        {isInteracting[req.friendshipId] ? <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin" /> : <X className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. ── SUGGESTIONS (PEOPLE YOU MAY KNOW) ── */}
            {suggestedUsers.length > 0 && (
                <div className="pt-4 md:pt-8 border-t border-slate-800/50 px-1 md:px-0">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-tight mb-1">People You May Know</h2>
                    <p className="text-[10px] md:text-xs text-slate-400 mb-3 md:mb-5">Expand your network by connecting with these professionals.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                        {suggestedUsers.map((userSuggest) => (
                            <div key={userSuggest.id} className="bg-slate-900/40 border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                                <div
                                    className="flex items-center gap-2.5 md:gap-3 overflow-hidden cursor-pointer group flex-1"
                                    onClick={() => setViewingUsername(userSuggest.username)}
                                >
                                    <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                                        {userSuggest.profilePicture ? (
                                            <img src={userSuggest.profilePicture} className="w-full h-full object-cover" />
                                        ) : (
                                            <Avatar initials={userSuggest.initials} size="md" colorClass={getAvatarColor(userSuggest.username)} />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs md:text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{userSuggest.username}</div>
                                        <div className="text-[10px] md:text-[11px] text-slate-500 truncate">{userSuggest.role}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendRequest(userSuggest.id)}
                                    disabled={isInteracting[userSuggest.id]}
                                    className="w-8 h-8 md:w-9 md:h-9 ml-2 rounded-lg md:rounded-xl bg-slate-800 border border-slate-700 flex shrink-0 items-center justify-center text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all disabled:opacity-50 shadow-sm"
                                >
                                    {isInteracting[userSuggest.id] ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}