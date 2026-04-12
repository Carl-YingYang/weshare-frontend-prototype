export const FEED_POSTS = [
    { id: 1, author: 'Martin Botosh', avatar: 'MB', role: 'Senior Frontend Dev', time: '2 hrs ago', content: 'Just finished migrating our entire component library to Tailwind v4. The new CSS-first configuration is absolutely brilliant — removed so much boilerplate from our setup. Anyone else tried it yet?', likes: 124, comments: 32, shares: 5, hasImage: false },
    { id: 2, author: 'Jakob Botosh', avatar: 'JB', role: 'UI Architect', time: '5 hrs ago', content: 'Sneak peek at the new dashboard interface we are building. Trying out a "soft architecture" approach with layered depth and breathable spacing. Thoughts?', likes: 342, comments: 89, shares: 41, hasImage: true }
];

export const NETWORK_USERS = [
    { name: 'Alice Freeman', role: 'Product Designer', avatar: 'AF', mutual: 12 },
    { name: 'David Chen', role: 'Fullstack Engineer', avatar: 'DC', mutual: 8 },
    { name: 'Sarah Miller', role: 'UX Researcher', avatar: 'SM', mutual: 24 }
];

export const SUGGESTED = [
    { name: 'Carter Vaccaro', role: 'Data Scientist', avatar: 'CV' },
    { name: 'Jaylon Siphron', role: 'Motion Designer', avatar: 'JS' }
];

export const ACTIVITIES = [
    { id: 1, type: 'like', text: 'Jakob Geidt liked your post', avatars: ['JG'], time: '2m ago', hasActions: false },
    { id: 2, type: 'follow', text: 'Carter started following you', avatars: ['CV'], time: '15m ago', hasActions: true }
];

export const PAGES = [
    { name: 'UI/UX Community', abbr: 'UX', color: 'bg-indigo-500', verified: true, members: '12.4k' },
    { name: 'React Native Devs', abbr: 'RN', color: 'bg-sky-500', verified: true, members: '22.8k' }
];