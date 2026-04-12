import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Home as HomeIcon, Users, LayoutGrid, ChevronDown, UserPlus, Loader2, X, Edit, Camera, Trash2, Heart, MessageCircle, AlertCircle, Menu, LogOut, Clock, UserCheck } from 'lucide-react';
import { Avatar, getAvatarColor } from './Shared';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
// 🚨 IBINALIK NATIN ANG CHATBOX PARA SA DESKTOP!
import ChatBox from './ChatBox';

const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, setUser } = useAuth();

    const pfpInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // ── REFS PARA SA AUTO-CLOSE LOGIC ──
    const notifRef = useRef<HTMLDivElement>(null);
    const messageMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // ── GLOBAL DATA STATES ──
    const [allUsersList, setAllUsersList] = useState<any[]>([]);
    const [allPostsList, setAllPostsList] = useState<any[]>([]);
    const [myNetworkList, setMyNetworkList] = useState<any[]>([]);

    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [isSending, setIsSending] = useState<Record<string, boolean>>({});
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [myPosts, setMyPosts] = useState<any[]>([]);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [editProfileData, setEditProfileData] = useState({ username: '', role: '', initials: '', profilePicture: '', coverPhoto: '' });
    const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null);
    const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null);

    // ── MENUS AND NOTIFS STATES ──
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);

    // ── STATES PARA SA SEARCH ──
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchType, setSearchType] = useState<'people' | 'posts'>('people');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // ── MODAL TABS ──
    const [mobilePublicTab, setMobilePublicTab] = useState<'about' | 'timeline'>('about');
    const [mobilePrivateTab, setMobilePrivateTab] = useState<'edit' | 'timeline'>('edit');

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const [viewingUsername, setViewingUsername] = useState<string | null>(null);

    // 🚨 IBINALIK ANG ACTIVE CHAT USER PARA SA DESKTOP POPUP 🚨
    const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string; initials: string; profilePicture?: string } | null>(null);

    const fetchNotificationsAndMessages = async () => {
        try {
            const [notifs, unreadMsgs] = await Promise.all([
                apiFetch('/Notifications'),
                apiFetch('/Messages/unread')
            ]);
            setNotifications(notifs);
            setUnreadMsgCount(unreadMsgs.count || 0);
        } catch (error) {
            console.error("Failed to fetch notifs/messages", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotificationsAndMessages();
            const interval = setInterval(fetchNotificationsAndMessages, 20000);
            return () => clearInterval(interval);
        }
    }, [user, activeChatUser]);

    useEffect(() => {
        setIsNotifOpen(false);
        setIsMessageMenuOpen(false);
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
            if (isMessageMenuOpen && messageMenuRef.current && !messageMenuRef.current.contains(e.target as Node)) setIsMessageMenuOpen(false);
            if (isSearchOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotifOpen, isMessageMenuOpen, isSearchOpen]);

    const handleReadNotification = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await apiFetch(`/Notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) { console.error("Failed to mark as read", error); }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [allUsers, myNetwork, allPosts] = await Promise.all([
                    apiFetch('/Users'),
                    apiFetch('/Friends/network'),
                    apiFetch('/Posts')
                ]);
                setAllUsersList(allUsers);
                setAllPostsList(allPosts);
                setMyNetworkList(myNetwork);

                const followersCount = myNetwork.filter((f: any) => f.isAccepted && !f.isRequester).length;
                const followingCount = myNetwork.filter((f: any) => f.isAccepted && f.isRequester).length;
                const userPosts = allPosts.filter((p: any) => p.authorName === user?.username);
                userPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setMyPosts(userPosts);
                setStats({ followers: followersCount, following: followingCount, posts: userPosts.length });

                const networkIds = myNetwork.map((f: any) => f.friendUserId);
                const validSuggestions = allUsers.filter((u: any) => u.id !== user?.id && !networkIds.includes(u.id));
                setSuggestedUsers(validSuggestions.slice(0, 5));

                if (user) {
                    setProfileImgPreview((user as any).profilePicture || null);
                    setCoverImgPreview((user as any).coverPhoto || null);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        if (user) fetchDashboardData();
    }, [user, location.pathname]);

    const handleSendRequest = async (receiverId: string) => {
        try {
            setIsSending(prev => ({ ...prev, [receiverId]: true }));
            await apiFetch('/Friends/request', { method: 'POST', body: JSON.stringify({ receiverId }) });
            setSuggestedUsers(prev => prev.filter(u => u.id !== receiverId));
            setMyNetworkList(prev => [...prev, { friendUserId: receiverId, isAccepted: false, isRequester: true }]);
        } catch (error) { console.error("Failed to send request", error); }
        finally { setIsSending(prev => ({ ...prev, [receiverId]: false })); }
    };

    const openProfileModal = () => {
        setSaveError('');
        setEditProfileData({
            username: user?.username || '', role: user?.role || '', initials: user?.initials || '',
            profilePicture: (user as any)?.profilePicture || '', coverPhoto: (user as any)?.coverPhoto || ''
        });
        setMobilePrivateTab('edit');
        setIsProfileModalOpen(true);
    };

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;
        try {
            setSaveError(''); setIsSavingProfile(true);
            const payload = { username: editProfileData.username, role: editProfileData.role, initials: editProfileData.initials, profilePicture: profileImgPreview, coverPhoto: coverImgPreview };
            await apiFetch(`/Users/${user.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            setUser(prev => prev ? { ...prev, ...payload } as any : null);
            setIsProfileModalOpen(false);
        } catch (error: any) { setSaveError(error.message || "Failed to save profile."); }
        finally { setIsSavingProfile(false); }
    };

    const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const base64 = await convertToBase64(file); setProfileImgPreview(base64); }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const base64 = await convertToBase64(file); setCoverImgPreview(base64); }
    };

    const publicUser = viewingUsername ? allUsersList.find(u => u.username === viewingUsername) : null;
    const publicUserPosts = viewingUsername ? allPostsList.filter(p => p.authorName === viewingUsername).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
    const relationshipStatus = publicUser ? myNetworkList.find(f => f.friendUserId === publicUser.id) : null;
    const isViewingSelf = publicUser?.id === user?.id;

    const filteredSearchUsers = allUsersList.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const filteredSearchPosts = allPostsList.filter(p =>
        p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeTab = location.pathname;

    const MobileAvatar = () => (
        <button onClick={openProfileModal} className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500/50 shrink-0">
            {(user as any)?.profilePicture
                ? <img src={(user as any).profilePicture} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-indigo-500 to-cyan-500">{user?.initials || "??"}</div>
            }
        </button>
    );

    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden flex flex-col">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute bottom-[5%] right-[-8%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
            </div>

            <nav className="shrink-0 z-50 h-[70px] bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 items-center justify-between px-4 md:px-8 shadow-sm hidden md:flex">
                <div className="flex items-center gap-3 w-auto lg:w-[240px]">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <LayoutGrid className="text-white w-4 h-4" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight hidden sm:block">Weshare</span>
                </div>

                <div className="flex-1 max-w-[500px] relative hidden md:block px-4" ref={searchRef}>
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search Weshare..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchOpen(true)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-full pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all shadow-inner"
                    />
                    {isSearchOpen && searchQuery.trim() && (
                        <div className="absolute top-12 left-4 right-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 flex flex-col max-h-[400px]">
                            <div className="flex border-b border-slate-800 shrink-0">
                                <button onClick={() => setSearchType('people')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${searchType === 'people' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>People ({filteredSearchUsers.length})</button>
                                <button onClick={() => setSearchType('posts')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${searchType === 'posts' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>Posts ({filteredSearchPosts.length})</button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-2">
                                {searchType === 'people' ? (
                                    filteredSearchUsers.length === 0 ? <div className="p-6 text-center text-xs text-slate-500">No people found matching "{searchQuery}"</div> :
                                        filteredSearchUsers.map(u => (
                                            <div key={u.id} onClick={() => { setViewingUsername(u.username); setIsSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors group">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 shrink-0 group-hover:border-indigo-500 transition-colors">
                                                    {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={u.initials} size="md" colorClass={getAvatarColor(u.username)} />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold text-white group-hover:text-indigo-400 truncate transition-colors">{u.username}</div>
                                                    <div className="text-[11px] text-slate-500 truncate">{u.role}</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    filteredSearchPosts.length === 0 ? <div className="p-6 text-center text-xs text-slate-500">No posts found containing "{searchQuery}"</div> :
                                        filteredSearchPosts.map(p => (
                                            <div key={p.id} onClick={() => { setViewingUsername(p.authorName); setIsSearchOpen(false); setSearchQuery(''); }} className="flex flex-col gap-2 p-4 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors border-b border-slate-800/50 last:border-0 group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                                                            {p.authorProfilePicture ? <img src={p.authorProfilePicture} className="w-full h-full object-cover" /> : <Avatar initials={p.authorInitials} size="sm" colorClass={getAvatarColor(p.authorName)} />}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">{p.authorName}</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wide">{timeAgo(p.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-white line-clamp-2 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">{p.content}</p>
                                                {p.hasImage && <div className="text-[10px] text-indigo-400 font-bold mt-1">📷 Contains an image</div>}
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-3 w-auto lg:w-[240px] relative">
                    <div className="relative" ref={messageMenuRef}>
                        <button onClick={() => { setIsMessageMenuOpen(!isMessageMenuOpen); setIsNotifOpen(false); setIsSearchOpen(false); }} className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isMessageMenuOpen ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <MessageCircle className="w-5 h-5" />
                            {unreadMsgCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />}
                        </button>
                        {isMessageMenuOpen && (
                            <div className="absolute top-14 right-0 w-[280px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-3 z-[100] animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-800/50 mb-2"><h3 className="font-bold text-white">Messages</h3></div>
                                <div className="px-4 py-4 text-center">
                                    {unreadMsgCount > 0 ? (<><div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3"><MessageCircle className="w-6 h-6 text-emerald-400" /></div><p className="text-sm font-bold text-white mb-1">You have {unreadMsgCount} unread message(s)</p><p className="text-xs text-slate-400">Open your Messages tab to view your connections.</p><button onClick={() => { setIsMessageMenuOpen(false); navigate('/messages'); }} className="mt-4 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">Go to Messages</button></>) : (<p className="text-slate-500 text-sm">No new messages.</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative notif-container" ref={notifRef}>
                        <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMessageMenuOpen(false); setIsSearchOpen(false); }} className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isNotifOpen ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />}
                        </button>
                        {isNotifOpen && (
                            <div className="absolute top-14 right-0 w-[300px] sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-3 z-[100] animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-800/50 mb-2"><h3 className="font-bold text-white">Notifications</h3>{unreadCount > 0 && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}</div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar px-2 space-y-1">
                                    {notifications.length === 0 ? (<div className="text-center text-slate-500 text-xs py-4">No notifications yet.</div>) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} onClick={() => handleReadNotification(notif.id, notif.isRead)} className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60 hover:bg-slate-800/30' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500 text-white'}`}><Bell className="w-4 h-4" /></div>
                                                <div className="flex-1"><p className={`text-xs ${notif.isRead ? 'text-slate-400' : 'text-slate-200 font-bold'}`}>{notif.content}</p><p className="text-[10px] text-indigo-400/70 uppercase tracking-widest mt-1">{timeAgo(notif.createdAt)}</p></div>
                                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-5 md:border-l border-slate-800">
                        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors font-bold text-sm" title="Logout"><LogOut className="w-4 h-4" /> Logout</button>
                    </div>
                </div>
            </nav>

            <nav className="md:hidden shrink-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
                <div className="flex items-center justify-between px-4 h-[56px]">
                    <div className="flex items-center gap-2.5">
                        <MobileAvatar />
                        <span className="text-lg font-black text-white tracking-tight">Weshare</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setIsMobileSearchOpen(true)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors">
                            <Search className="w-[18px] h-[18px]" />
                        </button>
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors">
                                <Bell className="w-[18px] h-[18px]" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 animate-pulse" />}
                            </button>
                            {isNotifOpen && (
                                <div className="absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-[320px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-3 z-[100] animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-800/50 mb-2">
                                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                                        {unreadCount > 0 && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 space-y-1">
                                        {notifications.length === 0 ? (<div className="text-center text-slate-500 text-xs py-4">No notifications yet.</div>) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} onClick={() => handleReadNotification(notif.id, notif.isRead)} className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60 hover:bg-slate-800/30' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500 text-white'}`}><Bell className="w-4 h-4" /></div>
                                                    <div className="flex-1"><p className={`text-xs ${notif.isRead ? 'text-slate-400' : 'text-slate-200 font-bold'}`}>{notif.content}</p><p className="text-[10px] text-indigo-400/70 uppercase tracking-widest mt-1">{timeAgo(notif.createdAt)}</p></div>
                                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={logout} className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors">
                            <LogOut className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center border-t border-slate-800/60">
                    <button onClick={() => navigate('/feed')} className={`flex-1 flex items-center justify-center py-2.5 relative transition-colors ${activeTab === '/feed' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <HomeIcon className="w-6 h-6" />{activeTab === '/feed' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-indigo-500 rounded-t-full" />}
                    </button>
                    <button onClick={() => navigate('/network')} className={`flex-1 flex items-center justify-center py-2.5 relative transition-colors ${activeTab === '/network' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Users className="w-6 h-6" />{activeTab === '/network' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-indigo-500 rounded-t-full" />}
                    </button>
                    <button onClick={() => navigate('/messages')} className={`flex-1 flex items-center justify-center py-2.5 relative transition-colors ${activeTab === '/messages' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <div className="relative">
                            <MessageCircle className="w-6 h-6" />
                            {unreadMsgCount > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-emerald-500 rounded-full text-[9px] font-black text-white flex items-center justify-center px-0.5">{unreadMsgCount}</span>}
                        </div>
                        {activeTab === '/messages' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-indigo-500 rounded-t-full" />}
                    </button>
                </div>
            </nav>

            {isMobileSearchOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col md:hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
                        <button onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input autoFocus type="text" placeholder="Search people or posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>
                    </div>
                    <div className="flex border-b border-slate-800 shrink-0">
                        <button onClick={() => setSearchType('people')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${searchType === 'people' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'}`}>People {searchQuery.trim() ? `(${filteredSearchUsers.length})` : ''}</button>
                        <button onClick={() => setSearchType('posts')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${searchType === 'posts' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'}`}>Posts {searchQuery.trim() ? `(${filteredSearchPosts.length})` : ''}</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                        {!searchQuery.trim() ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                                <Search className="w-12 h-12 opacity-30" />
                                <p className="text-sm font-medium">Start typing to search Weshare</p>
                            </div>
                        ) : searchType === 'people' ? (
                            filteredSearchUsers.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm">No people found for "{searchQuery}"</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredSearchUsers.map(u => (
                                        <div key={u.id} onClick={() => { setViewingUsername(u.username); setIsMobileSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors active:scale-[0.98]">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 shrink-0">
                                                {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={u.initials} size="md" colorClass={getAvatarColor(u.username)} />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-sm font-bold text-white truncate">{u.username}</div>
                                                <div className="text-xs text-slate-500 truncate">{u.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            filteredSearchPosts.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm">No posts found for "{searchQuery}"</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredSearchPosts.map(p => (
                                        <div key={p.id} onClick={() => { setViewingUsername(p.authorName); setIsMobileSearchOpen(false); setSearchQuery(''); }} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                                    {p.authorProfilePicture ? <img src={p.authorProfilePicture} className="w-full h-full object-cover" /> : <Avatar initials={p.authorInitials} size="sm" colorClass={getAvatarColor(p.authorName)} />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{p.authorName}</div>
                                                    <div className="text-[10px] text-slate-500">{timeAgo(p.createdAt)}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{p.content}</p>
                                            {p.hasImage && <div className="text-[10px] text-indigo-400 font-bold mt-2">📷 Contains an image</div>}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 w-full max-w-[1500px] mx-auto flex gap-4 md:gap-6 p-3 md:p-6 relative z-10 overflow-hidden">
                <div className="hidden lg:flex flex-col gap-5 w-[280px] xl:w-[320px] shrink-0 h-full overflow-y-auto custom-scrollbar pb-10 pr-2">
                    <div onClick={openProfileModal} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-5 text-center shadow-lg cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group shrink-0">
                        <div className="relative inline-block mx-auto mb-3 group-hover:scale-105 transition-transform">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-900 shadow-xl shadow-indigo-500/20 overflow-hidden bg-slate-800 flex items-center justify-center">
                                {(user as any)?.profilePicture ? <img src={(user as any).profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white bg-gradient-to-br from-indigo-500 to-cyan-500">{user?.initials || "??"}</div>}
                            </div>
                            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{user?.username || "Loading..."}</h3>
                        <p className="text-xs text-slate-400 font-medium mb-4 truncate">{user?.email || ""}</p>
                        <div className="grid grid-cols-3 gap-1 border-t border-slate-800 pt-4">
                            <div><div className="font-bold text-white">{stats.followers}</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Followers</div></div>
                            <div><div className="font-bold text-white">{stats.following}</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Following</div></div>
                            <div><div className="font-bold text-white">{stats.posts}</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Posts</div></div>
                        </div>
                    </div>

                    {/* ── NAIBALIK NA DESKTOP LEFT SIDEBAR ── */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-3 shadow-lg shrink-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Menu</div>
                        <div className="space-y-0.5">
                            <button onClick={() => navigate('/feed')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${activeTab === '/feed' || activeTab === '/' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                                <HomeIcon className="w-4 h-4 mr-3" /> <span className="font-bold text-sm">Feed</span>
                            </button>
                            <button onClick={() => navigate('/network')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${activeTab === '/network' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                                <Users className="w-4 h-4 mr-3" /> <span className="font-bold text-sm">Network</span>
                            </button>
                            <button onClick={() => navigate('/messages')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all ${activeTab === '/messages' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                                <div className="relative mr-3">
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadMsgCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-emerald-500 rounded-full text-[8px] font-black text-white flex items-center justify-center px-0.5">{unreadMsgCount}</span>}
                                </div>
                                <span className="font-bold text-sm">Messages</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full flex flex-col gap-4 md:gap-6 h-full overflow-y-auto custom-scrollbar pb-4 md:pb-20 px-0 md:px-2">
                    {/* 🚨 IPINASA NATIN ANG setActiveChatUser DITO PARA SA DESKTOP POPUP */}
                    <Outlet context={{ setViewingUsername, setActiveChatUser }} />
                </div>

                <div className="hidden xl:flex flex-col gap-5 w-[320px] shrink-0 h-full overflow-y-auto custom-scrollbar pb-10 pl-2">
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] overflow-hidden shadow-lg shrink-0">
                        <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-slate-800/50"><span className="text-sm font-bold text-white">Suggested for you</span></div>
                        <div className="px-3 pb-3 pt-2 space-y-1">
                            {suggestedUsers.length === 0 ? (<div className="text-center p-4 text-xs text-slate-500">You're connected with everyone!</div>) : (
                                suggestedUsers.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors group">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingUsername(p.username)}>
                                            {p.profilePicture ? <img src={p.profilePicture} className="w-8 h-8 rounded-lg object-cover" /> : <Avatar initials={p.initials} size="md" colorClass={getAvatarColor(p.username)} />}
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-indigo-400 truncate max-w-[120px] transition-colors">{p.username}</div>
                                                <div className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">{p.role}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleSendRequest(p.id)} disabled={isSending[p.id]} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all disabled:opacity-50"><UserPlus className="w-4 h-4" /></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 lg:p-10 transition-all" onClick={(e) => { if (e.target === e.currentTarget) setIsProfileModalOpen(false); }}>
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] md:h-[90vh] rounded-t-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col relative animate-in slide-in-from-bottom md:zoom-in-95 duration-200 overflow-hidden">
                        <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-3 right-3 md:top-6 md:right-6 z-50 bg-black/40 backdrop-blur-md text-white hover:bg-rose-500 p-2 md:p-2.5 rounded-full transition-all border border-white/10 shadow-lg"><X className="w-4 h-4 md:w-5 md:h-5" /></button>

                        <div className="w-full h-full flex flex-col overflow-hidden">
                            <div className="w-full h-32 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative shrink-0 group">
                                {coverImgPreview && <img src={coverImgPreview} className="w-full h-full object-cover" alt="Cover" />}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer z-10"><div className="bg-black/50 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-white/20 font-bold text-xs md:text-sm shadow-xl"><Camera className="w-3.5 h-3.5 md:w-4 md:h-4" /> Update Cover</div><input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" /></label>
                                {coverImgPreview && (<button onClick={(e) => { e.preventDefault(); setCoverImgPreview(null); }} className="absolute top-3 left-3 md:top-6 md:left-6 z-20 bg-rose-500/90 hover:bg-rose-500 backdrop-blur-md p-1.5 md:p-2.5 rounded-full border border-rose-400/50 text-white transition-colors shadow-lg"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>)}
                                <div className="absolute -bottom-10 md:-bottom-16 left-4 md:left-8 flex items-end gap-3 md:gap-6 z-20">
                                    <div className="relative group/pfp shrink-0">
                                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-[4px] md:border-[6px] border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center relative shadow-xl">
                                            {profileImgPreview ? (<img src={profileImgPreview} className="w-full h-full object-cover" alt="Profile" />) : (<div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-white bg-gradient-to-br from-indigo-500 to-cyan-500">{editProfileData.initials || "??"}</div>)}
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/pfp:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"><Camera className="w-4 h-4 md:w-6 md:h-6 text-white mb-0.5" /><span className="text-[8px] md:text-[10px] text-white font-bold uppercase tracking-widest">Update</span><input type="file" ref={pfpInputRef} onChange={handlePfpChange} accept="image/*" className="hidden" /></label>
                                        </div>
                                        {profileImgPreview && (<button onClick={(e) => { e.preventDefault(); setProfileImgPreview(null); }} className="absolute bottom-0 right-0 bg-rose-500 p-1 md:p-1.5 rounded-full border-2 md:border-4 border-slate-900 text-white hover:bg-rose-600 transition-colors shadow-lg z-30"><Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>)}
                                    </div>
                                    <div className="pb-1 md:pb-4 min-w-0">
                                        <h2 className="text-base md:text-3xl font-black text-white drop-shadow-md truncate">{editProfileData.username || "Loading..."}</h2>
                                        <p className="text-[10px] md:text-base text-indigo-400 font-bold drop-shadow-md truncate">{editProfileData.role || "Role"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 md:h-24 w-full border-b border-slate-800 shrink-0"></div>

                            <div className="flex md:hidden border-b border-slate-800/60 px-2 shrink-0">
                                <button onClick={() => setMobilePrivateTab('edit')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest relative transition-colors ${mobilePrivateTab === 'edit' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    Edit Profile
                                    {mobilePrivateTab === 'edit' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-indigo-500 rounded-t-full" />}
                                </button>
                                <button onClick={() => setMobilePrivateTab('timeline')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest relative transition-colors ${mobilePrivateTab === 'timeline' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    Timeline · {myPosts.length}
                                    {mobilePrivateTab === 'timeline' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-indigo-500 rounded-t-full" />}
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="md:hidden h-full overflow-y-auto custom-scrollbar">
                                    {mobilePrivateTab === 'edit' ? (
                                        <div className="p-3 space-y-3">
                                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 shadow-inner">
                                                <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-800/50 pb-2 flex items-center gap-2"><Edit className="w-4 h-4 text-indigo-400" /> Edit Intro</h3>
                                                {saveError && (<div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2"><AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" /><p className="text-[10px] font-medium text-rose-400 leading-snug">{saveError}</p></div>)}
                                                <form onSubmit={handleUpdateProfile} className="space-y-3">
                                                    <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label><input type="text" required value={editProfileData.username} onChange={(e) => setEditProfileData(prev => ({ ...prev, username: e.target.value, initials: e.target.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 transition-all outline-none" /></div>
                                                    <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Job Role</label><input type="text" required value={editProfileData.role} onChange={(e) => setEditProfileData(prev => ({ ...prev, role: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 transition-all outline-none" /></div>
                                                    <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Initials</label><input type="text" required maxLength={2} value={editProfileData.initials} onChange={(e) => setEditProfileData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 transition-all outline-none" /></div>
                                                    <button type="submit" disabled={isSavingProfile} className="w-full mt-2 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg">{isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile & Photos'}</button>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 space-y-3 pb-8">
                                            {myPosts.length === 0 ? (
                                                <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500 font-medium text-xs">You haven't posted anything yet.</div>
                                            ) : (
                                                myPosts.map(post => (
                                                    <div key={post.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 shadow-sm mb-3">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className="w-8 h-8 rounded-full border border-slate-800 overflow-hidden shrink-0">
                                                                {(user as any)?.profilePicture ? <img src={(user as any).profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={user?.initials || "??"} size="sm" colorClass={getAvatarColor(user?.username || '')} />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-xs">{user?.username}</div>
                                                                <div className="text-[9px] text-slate-500 uppercase tracking-wide">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                        {post.hasImage && post.imageUrl && (
                                                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                                                <img src={post.imageUrl} className="w-full h-auto max-h-[250px] object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
                                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {post.likesCount}</span>
                                                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-indigo-400" /> {post.commentsCount}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:grid md:grid-cols-3 h-full overflow-hidden">
                                    <div className="col-span-1 border-r border-slate-800 p-8 overflow-y-auto custom-scrollbar">
                                        <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-inner">
                                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-3"><Edit className="w-4 h-4 text-indigo-400" /> Edit Intro</h3>
                                            {saveError && (<div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5"><AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /><p className="text-xs font-medium text-rose-400 leading-snug">{saveError}</p></div>)}
                                            <form id="profileForm" onSubmit={handleUpdateProfile} className="space-y-4 mt-4">
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label><input type="text" required value={editProfileData.username} onChange={(e) => setEditProfileData(prev => ({ ...prev, username: e.target.value, initials: e.target.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() }))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Role</label><input type="text" required value={editProfileData.role} onChange={(e) => setEditProfileData(prev => ({ ...prev, role: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all" /></div>
                                                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initials</label><input type="text" required maxLength={2} value={editProfileData.initials} onChange={(e) => setEditProfileData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all" /></div>
                                                <button type="submit" disabled={isSavingProfile} className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg">{isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile & Photos'}</button>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="col-span-2 p-8 flex flex-col bg-slate-900 overflow-hidden">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4 shrink-0">
                                            <h3 className="text-xl font-bold text-white">Your Timeline</h3>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{myPosts.length} Posts</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-10 pr-2">
                                            {myPosts.length === 0 ? (
                                                <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-3xl p-10 text-center text-slate-500 font-medium">You haven't posted anything yet.</div>
                                            ) : (
                                                myPosts.map(post => (
                                                    <div key={post.id} className="bg-slate-950/50 border border-slate-800 rounded-3xl p-5 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-9 h-9 rounded-full border-2 border-slate-800 overflow-hidden">
                                                                {(user as any)?.profilePicture ? <img src={(user as any).profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={user?.initials || "??"} size="md" colorClass={getAvatarColor(user?.username || '')} />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{user?.username}</div>
                                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                        {post.hasImage && post.imageUrl && (
                                                            <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                                                                <img src={post.imageUrl} className="w-full h-auto max-h-[400px] object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800/50 text-xs font-bold text-slate-500">
                                                            <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> {post.likesCount} Likes</span>
                                                            <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-indigo-400" /> {post.commentsCount} Comments</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingUsername && publicUser && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 lg:p-10 transition-all" onClick={(e) => { if (e.target === e.currentTarget) { setViewingUsername(null); setMobilePublicTab('about'); } }}>
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] md:h-[90vh] rounded-t-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col relative animate-in slide-in-from-bottom md:zoom-in-95 duration-200 overflow-hidden">
                        <button onClick={() => { setViewingUsername(null); setMobilePublicTab('about'); }} className="absolute top-3 right-3 md:top-6 md:right-6 z-50 bg-black/40 backdrop-blur-md text-white hover:bg-rose-500 p-2 md:p-2.5 rounded-full transition-all border border-white/10 shadow-lg"><X className="w-4 h-4 md:w-5 md:h-5" /></button>

                        <div className="w-full h-full flex flex-col overflow-hidden">
                            <div className="w-full h-32 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative shrink-0">
                                {publicUser.coverPhoto && <img src={publicUser.coverPhoto} className="w-full h-full object-cover" alt="Cover" />}

                                <div className="absolute -bottom-10 md:-bottom-16 left-4 md:left-8 flex items-end gap-3 md:gap-6 z-20">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-[4px] md:border-[6px] border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center shadow-xl">
                                            {publicUser.profilePicture ? (<img src={publicUser.profilePicture} className="w-full h-full object-cover" alt="Profile" />) : (<div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-white bg-gradient-to-br from-indigo-500 to-cyan-500">{publicUser.initials || "??"}</div>)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 pb-1 md:pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-1 md:gap-2">
                                        <div className="min-w-0">
                                            <h2 className="text-base md:text-3xl font-black text-white truncate">{publicUser.username}</h2>
                                            <p className="text-[10px] md:text-base text-indigo-400 font-bold truncate">{publicUser.role}</p>
                                        </div>
                                        {!isViewingSelf && (
                                            <div className="md:hidden shrink-0 mt-1">
                                                {!relationshipStatus ? (
                                                    <button onClick={() => handleSendRequest(publicUser.id)} disabled={isSending[publicUser.id]} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-all flex items-center gap-1 shadow-sm">
                                                        {isSending[publicUser.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />} Add Friend
                                                    </button>
                                                ) : relationshipStatus.isAccepted ? (
                                                    <button onClick={() => { setViewingUsername(null); setMobilePublicTab('about'); if (window.innerWidth < 768) { navigate('/messages'); } else { setActiveChatUser({ id: publicUser.id, name: publicUser.username, initials: publicUser.initials, profilePicture: publicUser.profilePicture }); } }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white bg-slate-800 hover:bg-indigo-500 border border-slate-700 transition-all flex items-center gap-1 shadow-sm">
                                                        <MessageCircle className="w-3 h-3" /> Message
                                                    </button>
                                                ) : relationshipStatus.isRequester ? (
                                                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Sent</div>
                                                ) : (
                                                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700 flex items-center gap-1"><Users className="w-3 h-3" /> Pending</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 md:h-24 w-full border-b border-slate-800 shrink-0"></div>

                            <div className="flex md:hidden border-b border-slate-800/60 px-2 shrink-0">
                                <button onClick={() => setMobilePublicTab('about')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest relative transition-colors ${mobilePublicTab === 'about' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    About
                                    {mobilePublicTab === 'about' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-indigo-500 rounded-t-full" />}
                                </button>
                                <button onClick={() => setMobilePublicTab('timeline')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest relative transition-colors ${mobilePublicTab === 'timeline' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    Timeline · {publicUserPosts.length}
                                    {mobilePublicTab === 'timeline' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-indigo-500 rounded-t-full" />}
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="md:hidden h-full overflow-y-auto custom-scrollbar">
                                    {mobilePublicTab === 'about' ? (
                                        <div className="p-3 space-y-3">
                                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 shadow-inner">
                                                <h3 className="text-sm font-bold text-white mb-2 border-b border-slate-800/50 pb-2">About</h3>
                                                <div className="space-y-2.5">
                                                    <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label><p className="text-white font-medium text-xs mt-0.5">{publicUser.username}</p></div>
                                                    <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Job Role</label><p className="text-white font-medium text-xs mt-0.5">{publicUser.role}</p></div>
                                                    <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Email</label><p className="text-indigo-400 font-medium text-xs mt-0.5 break-all">{publicUser.email}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 space-y-3 pb-8">
                                            {publicUserPosts.length === 0 ? (
                                                <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500 font-medium text-xs">This user hasn't posted anything yet.</div>
                                            ) : (
                                                publicUserPosts.map(post => (
                                                    <div key={post.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 shadow-sm mb-3">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className="w-8 h-8 rounded-full border border-slate-800 overflow-hidden shrink-0">
                                                                {publicUser.profilePicture ? <img src={publicUser.profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={publicUser.initials} size="sm" colorClass={getAvatarColor(publicUser.username)} />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-xs">{publicUser.username}</div>
                                                                <div className="text-[9px] text-slate-500 uppercase tracking-wide">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                        {post.hasImage && post.imageUrl && (
                                                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                                                <img src={post.imageUrl} className="w-full h-auto max-h-[250px] object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
                                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {post.likesCount}</span>
                                                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-indigo-400" /> {post.commentsCount}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:grid md:grid-cols-3 h-full overflow-hidden">
                                    <div className="col-span-1 border-r border-slate-800 p-8 overflow-y-auto custom-scrollbar">
                                        <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-inner">
                                            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800/50 pb-3">About</h3>
                                            <div className="space-y-3">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label><p className="text-white font-medium text-sm mt-0.5">{publicUser.username}</p></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Role</label><p className="text-white font-medium text-sm mt-0.5">{publicUser.role}</p></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label><p className="text-indigo-400 font-medium text-sm mt-0.5">{publicUser.email}</p></div>
                                                {!isViewingSelf && (
                                                    <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
                                                        {!relationshipStatus ? (
                                                            <button onClick={() => handleSendRequest(publicUser.id)} disabled={isSending[publicUser.id]} className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-lg">
                                                                {isSending[publicUser.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add Friend
                                                            </button>
                                                        ) : relationshipStatus.isAccepted ? (
                                                            <>
                                                                <div className="w-full py-2.5 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex justify-center items-center gap-2 cursor-default"><UserCheck className="w-4 h-4" /> ✓ Friends</div>

                                                                {/* 🚨 DESKTOP MESSAGE BUTTON LOGIC (Will Open Floating Chat Box on PC!) 🚨 */}
                                                                <button onClick={() => { setViewingUsername(null); setActiveChatUser({ id: publicUser.id, name: publicUser.username, initials: publicUser.initials, profilePicture: publicUser.profilePicture }); }} className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-indigo-500 border border-slate-700 transition-all flex justify-center items-center gap-2"><MessageCircle className="w-4 h-4" /> Send Message</button>
                                                            </>
                                                        ) : relationshipStatus.isRequester ? (
                                                            <button disabled className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-slate-800/50 border border-slate-700 flex justify-center items-center gap-2"><Clock className="w-4 h-4" /> Request Sent</button>
                                                        ) : (
                                                            <button disabled className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-slate-800/50 border border-slate-700 flex justify-center items-center gap-2"><Users className="w-4 h-4" /> Pending Request</button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 p-8 flex flex-col bg-slate-900 overflow-hidden">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4 shrink-0">
                                            <h3 className="text-xl font-bold text-white">{publicUser.username}'s Timeline</h3>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{publicUserPosts.length} Posts</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-10 pr-2">
                                            {publicUserPosts.length === 0 ? (
                                                <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-3xl p-10 text-center text-slate-500 font-medium">This user hasn't posted anything yet.</div>
                                            ) : (
                                                publicUserPosts.map(post => (
                                                    <div key={post.id} className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden flex items-center justify-center">
                                                                {publicUser.profilePicture ? <img src={publicUser.profilePicture} className="w-full h-full object-cover" /> : <Avatar initials={publicUser.initials} size="md" colorClass={getAvatarColor(publicUser.username)} />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{publicUser.username}</div>
                                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                                        {post.hasImage && post.imageUrl && (
                                                            <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                                                                <img src={post.imageUrl} className="w-full h-auto max-h-[400px] object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-800/50 text-xs font-bold text-slate-500">
                                                            <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> {post.likesCount} Likes</span>
                                                            <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-indigo-400" /> {post.commentsCount} Comments</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DESKTOP FLOATING CHAT BOX ── */}
            {activeChatUser && (
                <div className="hidden md:block z-[200]">
                    <ChatBox
                        currentUser={user}
                        chatUser={activeChatUser}
                        onClose={() => { setActiveChatUser(null); fetchNotificationsAndMessages(); }}
                    />
                </div>
            )}
        </div>
    );
}