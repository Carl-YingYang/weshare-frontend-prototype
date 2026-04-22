import { useState, useEffect, useRef } from 'react';
import { Avatar, getAvatarColor } from '../components/Shared';
import { Send, Image as ImageIcon, Heart, MessageCircle, Loader2, Reply, X, FileText, Trash2, Edit } from 'lucide-react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

const getFullImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `https://localhost:7227${url}`;
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

export default function Feed() {
    const { user } = useAuth();
    const { setViewingUsername } = useOutletContext<any>();

    const [posts, setPosts] = useState<any[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<number>(0);

    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // Editing States
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editPostContent, setEditPostContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});

    const fetchPosts = async (showSpinner = true) => {
        try {
            if (showSpinner) setIsLoadingPosts(true);
            const endpoint = user ? '/Posts/friends-feed' : '/Posts';
            const data = await apiFetch(endpoint);
            data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            if (showSpinner) setIsLoadingPosts(false);
        }
    };

    useEffect(() => { fetchPosts(true); }, [user]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewPostContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearImageSelection = () => {
        setSelectedFile(null);
        setSelectedImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedFile) return;
        try {
            setIsPosting(true);
            const formData = new FormData();
            formData.append('content', newPostContent);
            formData.append('visibility', visibility.toString());
            if (selectedFile) formData.append('image', selectedFile);
            await apiFetch('/Posts', { method: 'POST', body: formData });
            setNewPostContent('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            clearImageSelection();
            setVisibility(0);
            fetchPosts(false);
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await apiFetch(`/Posts/${postId}`, { method: 'DELETE' });
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) { console.error("Failed to delete post", error); }
    };

    const submitEditPost = async (postId: string) => {
        if (!editPostContent.trim()) return;
        try {
            const updatedPost = await apiFetch(`/Posts/${postId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: editPostContent })
            });
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: updatedPost.content } : p));
            setEditingPostId(null);
        } catch (error) { console.error("Failed to update post", error); }
    };

    const handleToggleLike = async (postId: string) => {
        if (!user) return;
        const isCurrentlyLiked = likedPosts[postId];
        setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }));
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likesCount: isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1 } : post));
        try { await apiFetch(`/Posts/${postId}/like`, { method: 'POST' }); }
        catch (error) {
            setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }));
            setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1 } : post));
        }
    };

    const handleAddComment = async (postId: string) => {
        if (!user) return;
        const commentText = commentInputs[postId];
        if (!commentText || !commentText.trim()) return;
        const parentId = replyingTo[postId] || null;
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setReplyingTo(prev => ({ ...prev, [postId]: null }));
        try {
            await apiFetch(`/Posts/${postId}/comment`, {
                method: 'POST',
                body: JSON.stringify({ content: commentText, parentCommentId: parentId }),
            });
            fetchPosts(false);
        } catch (error) { console.error("Failed to add comment:", error); }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await apiFetch(`/Posts/comments/${commentId}`, { method: 'DELETE' });
            fetchPosts(false);
        } catch (error) { console.error("Failed to delete comment", error); }
    };

    const submitEditComment = async (commentId: string) => {
        if (!editCommentContent.trim()) return;
        try {
            await apiFetch(`/Posts/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: editCommentContent })
            });
            setEditingCommentId(null);
            fetchPosts(false);
        } catch (error) { console.error("Failed to edit comment", error); }
    };

    const toggleCommentsView = (id: string) => setExpandedComments(p => ({ ...p, [id]: !p[id] }));

    const handleReplyClick = (postId: string, commentId: string, authorName: string) => {
        setReplyingTo(prev => ({ ...prev, [postId]: commentId }));
        setCommentInputs(prev => ({ ...prev, [postId]: `@${authorName} ` }));
        setExpandedComments(p => ({ ...p, [postId]: true }));
        setTimeout(() => document.getElementById(`comment-input-${postId}`)?.focus(), 100);
    };

    const cancelReply = (postId: string) => {
        setReplyingTo(prev => ({ ...prev, [postId]: null }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 pb-2 w-full max-w-full overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {user && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-lg shrink-0">
                    <div className="flex gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-800">
                            {user.profilePicture ? (
                                <img src={getFullImageUrl(user.profilePicture)} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <Avatar initials={user?.initials || "??"} size="lg" colorClass="bg-indigo-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <textarea
                                ref={textareaRef}
                                value={newPostContent}
                                onChange={handleTextareaChange}
                                placeholder={`What's on your mind, ${user?.username?.split(' ')[0] || 'there'}?`}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm text-white placeholder:text-slate-500 resize-none min-h-[80px] focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
                            />
                            {selectedImagePreview && (
                                <div className="relative mt-2 md:mt-3 rounded-xl md:rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 backdrop-blur-md">
                                    <button onClick={clearImageSelection} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-500 rounded-full text-white backdrop-blur-md transition-colors"><X className="w-3 h-3 md:w-4 md:h-4" /></button>
                                    <img src={selectedImagePreview} alt="Upload preview" className="w-full h-auto max-h-[300px] object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pl-12 md:pl-[60px]">
                        <div className="flex gap-2 items-center">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-semibold text-slate-400 px-3 py-2 md:px-4 md:py-2.5 bg-slate-800/30 hover:bg-slate-800 hover:text-white rounded-lg md:rounded-xl transition-all border border-slate-700/50">
                                <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" /> <span className="hidden sm:inline">Photo</span>
                            </button>
                            <select value={visibility} onChange={(e) => setVisibility(Number(e.target.value))} className="bg-slate-800/50 text-slate-300 text-[10px] md:text-xs px-2 py-2 md:px-3 rounded-lg md:rounded-xl border border-slate-700 outline-none focus:border-indigo-500 hover:bg-slate-800 transition-colors cursor-pointer appearance-none">
                                <option value={0}>🌎 Public</option>
                                <option value={1}>👥 Friends Only</option>
                                <option value={2}>🔒 Only Me</option>
                            </select>
                        </div>
                        <button onClick={handleCreatePost} disabled={isPosting || (!newPostContent.trim() && !selectedFile)} className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] md:text-sm font-bold px-4 py-2 md:px-8 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                            {isPosting ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : 'Post'} {!isPosting && <Send className="w-3 h-3 md:w-4 md:h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {isLoadingPosts && <div className="flex justify-center items-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}
            
            {!isLoadingPosts && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 border border-slate-800 border-dashed rounded-[24px]">
                    <FileText className="w-12 h-12 mb-3 opacity-30" />
                    <span className="font-medium text-sm">No posts to show right now.</span>
                </div>
            )}

            {!isLoadingPosts && posts.map(post => (
                <div key={post.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer group" onClick={() => setViewingUsername(post.authorName)}>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 border-2 border-slate-800 group-hover:border-indigo-500 transition-colors">
                                {post.authorProfilePicture || (post.authorName === user?.username && user?.profilePicture) ? (
                                    <img src={getFullImageUrl(post.authorProfilePicture || user?.profilePicture)} className="w-full h-full object-cover" alt={post.authorName} />
                                ) : (
                                    <Avatar initials={post.authorInitials} size="md" colorClass={getAvatarColor(post.authorName)} />
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white text-xs md:text-sm group-hover:text-indigo-400 transition-colors">{post.authorName}</div>
                                <div className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{timeAgo(post.createdAt)}</div>
                            </div>
                        </div>
                        
                        {post.authorName === user?.username && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setEditingPostId(post.id); setEditPostContent(post.content); }} className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    {editingPostId === post.id ? (
                        <div className="mb-4">
                            <textarea value={editPostContent} onChange={e => setEditPostContent(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 custom-scrollbar" rows={3} />
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => submitEditPost(post.id)} className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors">Save</button>
                                <button onClick={() => setEditingPostId(null)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        post.content && <p className="text-xs md:text-sm text-slate-300 mb-3 md:mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    )}

                    {post.hasImage && post.imageUrl && (
                        <div className="mb-3 md:mb-4 rounded-xl md:rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 backdrop-blur-md relative flex justify-center">
                            <img src={getFullImageUrl(post.imageUrl)} alt="Post content" className="w-full h-auto max-h-[400px] md:max-h-[600px] object-contain" />
                        </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-slate-400 pb-3 md:pb-4 border-b border-slate-800 mb-2 md:mb-3">
                        <span className="flex items-center gap-1 md:gap-1.5"><Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500 fill-rose-500" /> {post.likesCount} Likes</span>
                        <div className="flex gap-2 md:gap-4 cursor-pointer hover:text-slate-300" onClick={() => toggleCommentsView(post.id)}>
                            <span>{post.commentsCount} Comments</span>
                        </div>
                    </div>

                    <div className="flex gap-1.5 md:gap-2">
                        <button onClick={() => handleToggleLike(post.id)} className={`flex-1 flex justify-center items-center gap-1.5 md:gap-2 text-[11px] md:text-sm font-bold py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all ${likedPosts[post.id] ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" /> Like
                        </button>
                        <button onClick={() => toggleCommentsView(post.id)} className="flex-1 flex justify-center items-center gap-1.5 md:gap-2 text-[11px] md:text-sm font-bold text-slate-400 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-slate-800 hover:text-white transition-all"><MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comment</button>
                    </div>

                    {expandedComments[post.id] && (
                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-800/50">
                            {user && (
                                <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 relative items-start">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
                                        {user.profilePicture ? <img src={getFullImageUrl(user.profilePicture)} className="w-full h-full object-cover" /> : <Avatar initials={user?.initials || "??"} size="sm" colorClass="bg-indigo-500" />}
                                    </div>
                                    <div className="flex-1 flex flex-col min-w-0">
                                        {replyingTo[post.id] && (
                                            <div className="text-[9px] md:text-[10px] text-indigo-400 flex items-center gap-1 mb-1 ml-1 md:ml-2 font-bold uppercase tracking-widest">
                                                <Reply className="w-2.5 h-2.5 md:w-3 md:h-3" /> Replying to comment <button onClick={() => cancelReply(post.id)} className="ml-1 md:ml-2 text-slate-500 hover:text-rose-500"><X className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                                            </div>
                                        )}
                                        <div className="relative">
                                            <input id={`comment-input-${post.id}`} type="text" placeholder={replyingTo[post.id] ? "Write a reply..." : "Write a comment..."} value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }} className={`w-full bg-slate-950/50 border ${replyingTo[post.id] ? 'border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.1)]' : 'border-slate-800'} rounded-full pl-3 pr-8 md:pl-4 md:pr-10 py-1.5 md:py-2.5 text-[11px] md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-all`} />
                                            <button onClick={() => handleAddComment(post.id)} disabled={!commentInputs[post.id]?.trim()} className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"><Send className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3 md:space-y-4">
                                {post.comments && post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex flex-col gap-1">
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden shrink-0 border border-slate-800 cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setViewingUsername(comment.authorName)}>
                                                {comment.authorProfilePicture || (comment.authorName === user?.username && user?.profilePicture) ? (
                                                    <img src={getFullImageUrl(comment.authorProfilePicture || user?.profilePicture)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Avatar initials={comment.authorInitials} size="sm" colorClass={getAvatarColor(comment.authorName)} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-slate-800/50 rounded-xl md:rounded-2xl rounded-tl-none p-2.5 md:p-3 inline-block max-w-full">
                                                    <div className="flex items-center justify-between mb-1 gap-2 md:gap-4">
                                                        <span className="text-xs md:text-sm font-bold text-white cursor-pointer hover:underline truncate" onClick={() => setViewingUsername(comment.authorName)}>{comment.authorName}</span>
                                                        <span className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-wide shrink-0">{timeAgo(comment.createdAt)}</span>
                                                    </div>
                                                    
                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2">
                                                            <input type="text" value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none custom-scrollbar" />
                                                            <div className="flex gap-2 mt-2">
                                                                <button onClick={() => submitEditComment(comment.id)} className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-md">Save</button>
                                                                <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-md">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[11px] md:text-sm text-slate-300 break-words">{comment.content}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-1 ml-1 md:ml-2 text-[9px] md:text-[11px] font-bold text-slate-500">
                                                    <button onClick={() => handleReplyClick(post.id, comment.id, comment.authorName)} className="hover:text-white transition-colors">Reply</button>
                                                    {comment.authorName === user?.username && (
                                                        <>
                                                            <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }} className="hover:text-indigo-400 transition-colors">Edit</button>
                                                            <button onClick={() => handleDeleteComment(comment.id)} className="hover:text-rose-500 transition-colors">Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-3 md:ml-4 pl-3 md:pl-4 border-l-2 border-slate-700/50 space-y-2 md:space-y-3 mt-1.5 md:mt-2">
                                                {comment.replies.map((reply: any) => (
                                                    <div key={reply.id} className="flex items-start gap-2 md:gap-2.5">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden shrink-0 border border-slate-800 cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setViewingUsername(reply.authorName)}>
                                                            {reply.authorProfilePicture || (reply.authorName === user?.username && user?.profilePicture) ? (
                                                                <img src={getFullImageUrl(reply.authorProfilePicture || user?.profilePicture)} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Avatar initials={reply.authorInitials} size="sm" colorClass={getAvatarColor(reply.authorName)} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl md:rounded-2xl rounded-tl-none p-2 md:p-2.5 inline-block max-w-full">
                                                                <div className="flex items-center justify-between mb-0.5 md:mb-1 gap-2 md:gap-4">
                                                                    <span className="text-[10px] md:text-xs font-bold text-white cursor-pointer hover:underline truncate" onClick={() => setViewingUsername(reply.authorName)}>{reply.authorName}</span>
                                                                    <span className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-wide shrink-0">{timeAgo(reply.createdAt)}</span>
                                                                </div>
                                                                
                                                                {editingCommentId === reply.id ? (
                                                                    <div className="mt-2">
                                                                        <input type="text" value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none custom-scrollbar" />
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button onClick={() => submitEditComment(reply.id)} className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-md">Save</button>
                                                                            <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-md">Cancel</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[10px] md:text-xs text-slate-300 break-words">
                                                                        {reply.content.startsWith('@') ? (
                                                                            <><span className="text-indigo-400 font-bold">{reply.content.split(' ')[0]}</span> {reply.content.substring(reply.content.indexOf(' ') + 1)}</>
                                                                        ) : reply.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-4 mt-1 ml-1 md:ml-2 text-[9px] font-bold text-slate-500">
                                                                {reply.authorName === user?.username && (
                                                                    <>
                                                                        <button onClick={() => { setEditingCommentId(reply.id); setEditCommentContent(reply.content); }} className="hover:text-indigo-400 transition-colors">Edit</button>
                                                                        <button onClick={() => handleDeleteComment(reply.id)} className="hover:text-rose-500 transition-colors">Delete</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}