// src/api/client.ts

// 🚨 STRICT LOCALHOST BINDING: This forces the app to ONLY talk to your local C# server.
const BASE_URL = 'https://localhost:7227/api';

// Helper function para sa lahat ng API calls
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('weshare_token');

    // Check if we are sending files (FormData)
    const isFormData = options.body instanceof FormData;

    // I-setup ang headers (automatic na idadagdag ang Bearer token)
    const headers: HeadersInit = {
        // If it's FormData, DO NOT set Content-Type. The browser does it automatically.
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // I-send ang request sa C# Backend
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle errors (kung 401 Unauthorized, i-logout ang user)
    if (response.status === 401) {
        localStorage.removeItem('weshare_token');
        window.location.href = '/'; // Ibalik sa login
        throw new Error('Unauthorized');
    }

    // I-parse ang JSON safely
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        data = await response.text(); // Support for endpoints that return plain string messages
    }

    if (!response.ok) {
        throw new Error(data.message || data || 'Something went wrong');
    }

    return data;
}

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

// Using 'type' instead of 'enum' fixes Vite compilation crashes
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

// These aliases prevent older components from crashing!
export interface Post extends PostResponse {}
export interface Comment extends CommentResponse {}