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

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
    authorInitials: string;
}

export interface Post {
    id: string;
    content: string;
    hasImage: boolean;
    createdAt: string;
    authorName: string;
    authorInitials: string;
    likesCount: number;
    commentsCount: number;
    comments: Comment[]; // <--- IDINAGDAG ITO
}

export interface Friend {
    friendshipId: string;
    friendUserId: string;
    friendName: string;
    friendInitials: string;
    friendRole: string;
    isAccepted: boolean;
    isRequester: boolean; // <--- ITO YUNG NAWAWALA
}