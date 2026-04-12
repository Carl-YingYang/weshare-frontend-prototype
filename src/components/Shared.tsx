import React from 'react';

const AVATAR_PALETTE = ['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'];

export function getAvatarColor(str: string) {
    let h = 0; for (const c of str) h += c.charCodeAt(0);
    return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function Avatar({ initials, size = 'md', colorClass = 'bg-indigo-500' }: { initials: string, size?: 'sm' | 'md' | 'lg' | 'xl', colorClass?: string }) {
    const sizeClasses = {
        sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm', xl: 'w-14 h-14 text-base'
    };
    return (
        <div className={`${sizeClasses[size]} rounded-full ${colorClass} flex items-center justify-center font-bold text-white shrink-0 border-2 border-slate-900 shadow-sm`}>
            {initials}
        </div>
    );
}