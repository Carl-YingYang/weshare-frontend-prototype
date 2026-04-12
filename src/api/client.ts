// src/api/client.ts

const BASE_URL = 'https://localhost:7227/api';

// Helper function para sa lahat ng API calls
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    // 1. Kunin ang token sa localStorage (kung meron)
    const token = localStorage.getItem('weshare_token');

    // 2. I-setup ang headers (automatic na idadagdag ang Bearer token)
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // 3. I-send ang request sa C# Backend
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // 4. Handle errors (kung 401 Unauthorized, i-logout ang user)
    if (response.status === 401) {
        localStorage.removeItem('weshare_token');
        window.location.href = '/'; // Ibalik sa login
        throw new Error('Unauthorized');
    }

    // 5. I-parse ang JSON
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}