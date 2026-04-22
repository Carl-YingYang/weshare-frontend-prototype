export interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    initials: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Friend {
    friendshipId: string;
    friendUserId: string;
    friendName: string;
    friendInitials: string;
    friendRole: string;
    isAccepted: boolean;
    isRequester: boolean; 
}

// 🚨 FIX 1: Changed from 'enum' to 'type' to fix the Vite compilation error
export type PostVisibility = 0 | 1 | 2;

export interface CommentResponse {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
    authorInitials: string;
    authorProfilePicture?: string;
    parentCommentId?: string;
    replies?: CommentResponse[]; 
}

export interface PostResponse {
    id: string;
    content: string;
    hasImage: boolean;
    imageUrl?: string;
    createdAt: string;
    authorName: string;
    authorInitials: string;
    authorProfilePicture?: string;
    likesCount: number;
    commentsCount: number;
    comments: CommentResponse[]; 
}

// 🚨 FIX 2: This safely maps the old names to the new names so Vite doesn't crash!
export interface Post extends PostResponse {}
export interface Comment extends CommentResponse {}