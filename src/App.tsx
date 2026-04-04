import { useState } from 'react';
import {
  Search, Bell, Bookmark, Home as HomeIcon, Users, Calendar,
  Video, Image as ImageIcon, ShoppingBag, Folder, Heart,
  MessageCircle, Share2, Plus, Play, MoreVertical, LayoutGrid,
  UserPlus, ChevronDown, Settings, Volume2, Maximize2, Check,
  FileText, Code, PenTool, Star, Download, MoreHorizontal,
  Send, TrendingUp, Filter, Clock, Info
} from 'lucide-react';

// ─────────────────────────────────────────────
// 1. EXTENDED MOCK DATA (Enterprise Level)
// ─────────────────────────────────────────────

const FEED_POSTS = [
  { id: 1, author: 'Martin Botosh', avatar: 'MB', role: 'Senior Frontend Dev', time: '2 hrs ago', content: 'Just finished migrating our entire component library to Tailwind v4. The new CSS-first configuration is absolutely brilliant — removed so much boilerplate from our setup. Anyone else tried it yet?', likes: 124, comments: 32, shares: 5, hasImage: false },
  { id: 2, author: 'Jakob Botosh', avatar: 'JB', role: 'UI Architect', time: '5 hrs ago', content: 'Sneak peek at the new dashboard interface we are building. Trying out a "soft architecture" approach with layered depth and breathable spacing. Thoughts?', likes: 342, comments: 89, shares: 41, hasImage: true },
  { id: 3, author: 'Sarah Miller', avatar: 'SM', role: 'UX Researcher', time: '1 day ago', content: 'We just wrapped up our Q3 user interviews. The biggest takeaway? Users do not read instructions. If the UI isn\'t intuitive enough to guide them without text, it\'s too complex. Back to the drawing board for the onboarding flow!', likes: 512, comments: 145, shares: 88, hasImage: false },
  { id: 4, author: 'David Chen', avatar: 'DC', role: 'Fullstack Engineer', time: '2 days ago', content: 'Finally got the new GraphQL subscription layer working perfectly with our React Native frontend. The real-time updates are insanely fast now. Next step: scaling the WebSocket servers.', likes: 89, comments: 14, shares: 2, hasImage: false },
  { id: 5, author: 'Emma Watson', avatar: 'EW', role: 'Product Designer', time: '3 days ago', content: 'Design systems are not just about components; they are about communication. If your developers and designers aren\'t speaking the same language, your system will fail.', likes: 892, comments: 211, shares: 134, hasImage: false },
];

const NETWORK_USERS = [
  { name: 'Alice Freeman', role: 'Product Designer', avatar: 'AF', mutual: 12 },
  { name: 'David Chen', role: 'Fullstack Engineer', avatar: 'DC', mutual: 8 },
  { name: 'Sarah Miller', role: 'UX Researcher', avatar: 'SM', mutual: 24 },
  { name: 'James Wilson', role: 'DevOps Lead', avatar: 'JW', mutual: 3 },
  { name: 'Emma Watson', role: 'Frontend Developer', avatar: 'EW', mutual: 15 },
  { name: 'Michael Chang', role: 'UI Designer', avatar: 'MC', mutual: 42 },
  { name: 'Olivia Martinez', role: 'Product Manager', avatar: 'OM', mutual: 31 },
  { name: 'Lucas Wright', role: 'Backend Engineer', avatar: 'LW', mutual: 5 },
  { name: 'Sophia Taylor', role: 'Data Analyst', avatar: 'ST', mutual: 18 },
];

const EVENTS = [
  { id: 1, title: 'Planning Masterclass', date: 'AUG 24', time: 'THU 10:00 AM', location: '24 Royal Ln. Mesa, New Jersey', color: 'bg-indigo-500' },
  { id: 2, title: 'Monumental Event Planning', date: 'AUG 27', time: 'WED 12:30 PM', location: '63 Elgin St. Celina, Delaware', color: 'bg-cyan-500' },
  { id: 3, title: 'Summer Nights Concert Series', date: 'AUG 28', time: 'SAT 09:15 PM', location: '45 Washington Ave. Manchester', color: 'bg-emerald-500' },
  { id: 4, title: 'Artisan Market and Craft Fair', date: 'AUG 31', time: 'MON 07:00 PM', location: '85 Preston Rd. Inglewood, Maine', color: 'bg-orange-500' },
  { id: 5, title: 'Tech Startup Pitch Night', date: 'SEP 05', time: 'TUE 06:00 PM', location: '101 Innovation Dr. San Francisco, CA', color: 'bg-purple-500' },
  { id: 6, title: 'Global Developer Conference', date: 'SEP 12', time: 'FRI 09:00 AM', location: 'Virtual Event', color: 'bg-rose-500' },
];

const VIDEOS = [
  { id: 1, author: 'Cristofer Press', avatar: 'CP', time: '14 mins ago', title: 'UI/UX Inspiration August, 2023', views: '12.4k Views', desc: "Zero UI is a style that's been looming in the shadow for some time but is really starting to emerge now.", tags: ['#design', '#uiux', '#minimalism'], likes: 89, comments: 21, shares: 12, saved: 8, duration: '13:32', current: '0:47' },
  { id: 2, author: 'Alfonso Schleifer', avatar: 'AS', time: '29 mins ago', title: 'Abstract 3D Motion Design', views: '8.1k Views', desc: 'Exploring the new features in Blender 4.0 for seamless abstract animations.', tags: ['#3d', '#blender', '#motion'], likes: 54, comments: 13, shares: 9, saved: 4, duration: '22:10', current: '0:00' },
  { id: 3, author: 'Elena Rodriguez', avatar: 'ER', time: '2 hrs ago', title: 'Building Scalable APIs with Go', views: '45.2k Views', desc: 'A deep dive into concurrency patterns in Go and how to structure your backend for massive scale.', tags: ['#golang', '#backend', '#api'], likes: 1204, comments: 342, shares: 156, saved: 489, duration: '45:20', current: '12:05' },
  { id: 4, author: 'Tech With Tim', avatar: 'TT', time: '5 hrs ago', title: 'Next.js 14 App Router Explained', views: '102k Views', desc: 'Everything you need to know about the new routing paradigm in React and Next.js.', tags: ['#react', '#nextjs', '#frontend'], likes: 5600, comments: 890, shares: 412, saved: 1200, duration: '1:15:00', current: '0:00' },
];

const PHOTOS = [
  { id: 1, title: 'Dashboard Concepts', items: 12, color: 'from-indigo-500 to-purple-500' },
  { id: 2, title: 'Mobile App Wireframes', items: 8, color: 'from-emerald-500 to-teal-500' },
  { id: 3, title: 'Brand Guidelines', items: 24, color: 'from-orange-500 to-rose-500' },
  { id: 4, title: 'User Personas', items: 4, color: 'from-pink-500 to-rose-500' },
  { id: 5, title: 'Marketing Assets', items: 45, color: 'from-cyan-500 to-blue-600' },
  { id: 6, title: '3D Renderings', items: 6, color: 'from-violet-500 to-fuchsia-500' },
];

const PRODUCTS = [
  { id: 1, title: 'Ultimate SaaS UI Kit', creator: 'Jakob Botosh', price: '$49', rating: 4.9, sales: '1.2k' },
  { id: 2, title: 'React Admin Template', creator: 'DevStudio', price: '$29', rating: 4.7, sales: '850' },
  { id: 3, title: 'Wireframe Icons Pack', creator: 'Iconic', price: 'Free', rating: 4.9, sales: '5.4k' },
  { id: 4, title: 'Figma Design System', creator: 'UI Masters', price: '$99', rating: 5.0, sales: '342' },
  { id: 5, title: 'Modern Pitch Deck', creator: 'Startup Kits', price: '$19', rating: 4.8, sales: '2.1k' },
  { id: 6, title: 'Dark Mode Dashboard', creator: 'Jakob Botosh', price: '$39', rating: 4.9, sales: '450' },
];

const FILES = [
  { id: 1, name: 'Q3_Project_Requirements.pdf', size: '2.4 MB', type: 'pdf', date: 'Oct 12, 2026' },
  { id: 2, name: 'API_Documentation_v2.md', size: '156 KB', type: 'code', date: 'Oct 10, 2026' },
  { id: 3, name: 'Brand_Assets_Final.zip', size: '142 MB', type: 'folder', date: 'Oct 08, 2026' },
  { id: 4, name: 'User_Interview_Transcripts.docx', size: '1.1 MB', type: 'text', date: 'Oct 05, 2026' },
  { id: 5, name: 'Homepage_Redesign.fig', size: '18 MB', type: 'design', date: 'Oct 01, 2026' },
  { id: 6, name: 'Database_Schema_v4.sql', size: '45 KB', type: 'code', date: 'Sep 28, 2026' },
  { id: 7, name: 'Q2_Financial_Report.pdf', size: '4.2 MB', type: 'pdf', date: 'Sep 15, 2026' },
  { id: 8, name: 'Component_Library.fig', size: '45 MB', type: 'design', date: 'Sep 10, 2026' },
];

const SUGGESTED = [
  { name: 'Carter Vaccaro', role: 'Data Scientist', avatar: 'CV' },
  { name: 'Jaylon Siphron', role: 'Motion Designer', avatar: 'JS' },
  { name: 'Gustavo Schleifer', role: 'Product Manager', avatar: 'GS' },
  { name: 'Lydia George', role: 'Content Strategist', avatar: 'LG' },
  { name: 'Ahmad Levin', role: 'Cloud Engineer', avatar: 'AL' },
  { name: 'Miriam Cohen', role: 'UX Writer', avatar: 'MC' },
];

const ACTIVITIES = [
  { id: 1, type: 'like', text: 'Jakob Geidt and 80 others liked your post', avatars: ['JG', 'CC'], time: '2m ago', hasActions: false },
  { id: 2, type: 'comment', text: 'Martin Botosh mentioned you in a comment: "This is exactly what we need!"', avatars: ['MB'], time: '8m ago', hasActions: false },
  { id: 3, type: 'follow', text: 'Carter started following you', avatars: ['CV'], time: '15m ago', hasActions: true },
  { id: 4, type: 'share', text: 'Sarah Miller shared your design to "UI/UX Community"', avatars: ['SM'], time: '1h ago', hasActions: false },
  { id: 5, type: 'download', text: 'Your file "Homepage_Redesign.fig" was downloaded 12 times today.', avatars: ['FI'], time: '3h ago', hasActions: false },
  { id: 6, type: 'alert', text: 'Reminder: "Planning Masterclass" starts in 30 minutes.', avatars: ['EV'], time: '5h ago', hasActions: false },
  { id: 7, type: 'like', text: 'David Chen liked your comment on the GraphQL thread.', avatars: ['DC'], time: '1d ago', hasActions: false },
];

const PAGES = [
  { name: 'UI/UX Community', abbr: 'UX', color: 'bg-indigo-500', verified: true, members: '12.4k' },
  { name: 'Web Designer Hub', abbr: 'WD', color: 'bg-cyan-500', verified: false, members: '8.2k' },
  { name: 'Dribbble Global', abbr: 'Dr', color: 'bg-pink-500', verified: false, members: '45k' },
  { name: 'Behance Portfolio', abbr: 'Be', color: 'bg-blue-600', verified: true, members: '89k' },
  { name: 'Frontend Masters', abbr: 'FM', color: 'bg-amber-500', verified: true, members: '34.1k' },
  { name: 'DevOps Central', abbr: 'DO', color: 'bg-emerald-500', verified: false, members: '5.6k' },
  { name: 'React Native Devs', abbr: 'RN', color: 'bg-sky-500', verified: true, members: '22.8k' },
];

// ─────────────────────────────────────────────
// 2. HELPER COMPONENTS & LOGIC
// ─────────────────────────────────────────────

// Enterprise color assignment logic
const AVATAR_PALETTE = ['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'];
function getAvatarColor(str: string) {
  let h = 0; for (const c of str) h += c.charCodeAt(0);
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function Avatar({ initials, size = 'md', colorClass = 'bg-indigo-500' }: { initials: string, size?: 'sm' | 'md' | 'lg' | 'xl', colorClass?: string }) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base'
  };
  return (
    <div className={`${sizeClasses[size]} rounded-full ${colorClass} flex items-center justify-center font-bold text-white shrink-0 border-2 border-slate-900 shadow-sm`}>
      {initials}
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${active ? 'bg-indigo-500/10 border border-indigo-500/20' : 'border border-transparent hover:bg-slate-800/50 hover:border-slate-700/50'
      }`}>
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-indigo-400' : 'text-slate-400'}`}>{icon}</span>
        <span className={`${active ? 'text-white font-bold' : 'text-slate-300 font-medium'} text-sm`}>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// 3. MAIN APPLICATION
// ─────────────────────────────────────────────

type TabType = 'feed' | 'network' | 'event' | 'watch' | 'photos' | 'marketplace' | 'files';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); setIsLoggedIn(true); };
  const toggleLike = (id: number) => setLikedPosts(p => ({ ...p, [id]: !p[id] }));

  // ── LOGIN VIEW ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[28px] p-10 w-full max-w-[420px] relative z-10 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Weshare</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Work Email</label>
              <input type="email" required defaultValue="jakob@weshare.io" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Password</label>
              <input type="password" required defaultValue="password" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-6">
              Access Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD VIEW ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative">

      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-8%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* ── TOP NAVBAR ── */}
      <nav className="sticky top-0 z-50 h-[70px] bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3 w-[240px]">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            <LayoutGrid className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">Weshare</span>
        </div>

        <div className="flex-1 max-w-[500px] relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder={`Search ${activeTab}...`} className="w-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 focus:bg-slate-800 focus:border-indigo-500 rounded-full pl-11 pr-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500" />
        </div>

        <div className="flex items-center justify-end gap-3 w-[240px]">
          <button className="relative w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all mr-2">
            <Bookmark className="w-5 h-5" />
          </button>

          {/* Fully Polished Navbar Profile Pill */}
          <div className="flex items-center gap-3 pl-5 border-l border-white/10 cursor-pointer hover:bg-slate-800/50 p-1.5 pr-2.5 rounded-2xl transition-all" onClick={() => setIsLoggedIn(false)}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white shadow-sm border border-white/5">JB</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
            </div>
            <div className="hidden lg:flex flex-col text-left justify-center">
              <div className="text-sm font-bold text-white leading-tight">Jakob Botosh</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">UI Architect</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden lg:block ml-2" />
          </div>
        </div>
      </nav>

      {/* ── 3-COLUMN MAIN LAYOUT ── */}
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 relative z-10">

        {/* ── LEFT SIDEBAR ── */}
        <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-5">

          {/* Profile Mini-Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-5 text-center shadow-lg">
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-black text-white border-4 border-slate-900 shadow-xl shadow-indigo-500/20">JB</div>
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <h3 className="font-bold text-white text-base">Jakob Botosh</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">@jakob_ui</p>
            <div className="grid grid-cols-3 gap-1 border-t border-slate-800 pt-4">
              <div><div className="font-bold text-white">2.3k</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Followers</div></div>
              <div><div className="font-bold text-white">235</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Following</div></div>
              <div><div className="font-bold text-white">80</div><div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Posts</div></div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-3 shadow-lg">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Menu</div>
            <div className="space-y-0.5">
              <NavItem icon={<HomeIcon className="w-4 h-4" />} label="Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
              <NavItem icon={<Users className="w-4 h-4" />} label="Network" active={activeTab === 'network'} onClick={() => setActiveTab('network')} badge="3" />
              <NavItem icon={<Calendar className="w-4 h-4" />} label="Events" active={activeTab === 'event'} onClick={() => setActiveTab('event')} badge="6" />
              <NavItem icon={<Video className="w-4 h-4" />} label="Watch" active={activeTab === 'watch'} onClick={() => setActiveTab('watch')} />
              <NavItem icon={<ImageIcon className="w-4 h-4" />} label="Photos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
              <NavItem icon={<ShoppingBag className="w-4 h-4" />} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
              <NavItem icon={<Folder className="w-4 h-4" />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} badge="8" />
            </div>
          </div>

          {/* Communities (Expanded) */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Communities</div>
              <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-300" />
            </div>
            <div className="space-y-1">
              {PAGES.map((pg, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/10 ${pg.color}`}>{pg.abbr}</div>
                  <div className="flex-1 overflow-hidden">
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white truncate flex items-center gap-1.5">
                      {pg.name} {pg.verified && <Check className="w-3 h-3 text-indigo-400" strokeWidth={3} />}
                    </span>
                    <div className="text-[10px] text-slate-500">{pg.members} members</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 px-2 leading-relaxed opacity-60">
            Privacy · Terms · Advertising<br />Weshare © 2026
          </div>
        </div>

        {/* ── CENTER CONTENT (DYNAMIC) ── */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-7 flex flex-col gap-6">

          {/* TAB: FEED */}
          {activeTab === 'feed' && (
            <>
              {/* Composer */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] p-5 shadow-lg">
                <div className="flex gap-4 mb-4">
                  <Avatar initials="JB" size="lg" colorClass="bg-indigo-500" />
                  <textarea placeholder="What's on your mind, Jakob?" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-24 transition-all shadow-inner" />
                </div>
                <div className="flex items-center justify-between pl-[60px]">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3 py-2 rounded-xl transition-all"><ImageIcon className="w-4 h-4" /> Photo</button>
                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3 py-2 rounded-xl transition-all"><Video className="w-4 h-4" /> Video</button>
                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3 py-2 rounded-xl transition-all"><Calendar className="w-4 h-4" /> Event</button>
                  </div>
                  <button className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-sm font-bold px-6 py-2 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                    Post <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              {FEED_POSTS.map(post => (
                <div key={post.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={post.avatar} size="lg" colorClass={getAvatarColor(post.author)} />
                      <div>
                        <div className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer transition-colors">{post.author}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{post.time} · {post.role}</div>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors p-1"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{post.content}</p>

                  {post.hasImage && (
                    <div className="w-full h-[250px] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-slate-700/50 flex items-center justify-center mb-5 shadow-inner">
                      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl px-6 py-2.5 text-xs font-bold text-white tracking-widest uppercase">Mock UI Asset</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-medium text-slate-400 pb-4 border-b border-slate-800 mb-3">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> {likedPosts[post.id] ? post.likes + 1 : post.likes} Likes</span>
                    <div className="flex gap-4"><span>{post.comments} Comments</span><span>{post.shares} Shares</span></div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => toggleLike(post.id)} className={`flex-1 flex justify-center items-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all ${likedPosts[post.id] ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Heart className="w-4 h-4" /> Like</button>
                    <button className="flex-1 flex justify-center items-center gap-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 py-2.5 rounded-xl transition-all"><MessageCircle className="w-4 h-4" /> Comment</button>
                    <button className="flex-1 flex justify-center items-center gap-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 py-2.5 rounded-xl transition-all"><Share2 className="w-4 h-4" /> Share</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TAB: NETWORK */}
          {activeTab === 'network' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Network</h2>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors border border-slate-700/50"><Filter className="w-4 h-4" /> Filter</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {NETWORK_USERS.map((user, i) => (
                  <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] p-6 flex flex-col items-center text-center hover:bg-slate-800/80 transition-all group shadow-lg">
                    <Avatar initials={user.avatar} size="xl" colorClass={getAvatarColor(user.name)} />
                    <h3 className="font-bold text-white text-base mt-4 group-hover:text-indigo-400 transition-colors">{user.name}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-1 mb-3">{user.role}</p>
                    <p className="text-[11px] text-slate-500 mb-5">{user.mutual} mutual connections</p>
                    <button className="w-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white font-bold py-2.5 rounded-xl transition-all text-sm">Connect</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: EVENTS */}
          {activeTab === 'event' && (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Events</h2>
                  <p className="text-sm text-slate-400 mt-1">Discover tech meetups near you.</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors border border-slate-700/50">
                  Sort: Recent <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {EVENTS.map(ev => (
                  <div key={ev.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] overflow-hidden hover:border-slate-700 transition-all group shadow-lg">
                    <div className={`h-1.5 w-full ${ev.color}`} />
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-5">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ev.date.split(' ')[0]}</div>
                          <div className="text-xl font-black text-white mt-0.5">{ev.date.split(' ')[1]}</div>
                        </div>
                        <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${ev.color} shadow-[0_0_8px_currentColor]`} />
                        <span className={`text-[11px] font-bold ${ev.color.replace('bg-', 'text-')} uppercase tracking-wider`}>{ev.time}</span>
                      </div>
                      <div className="font-bold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors truncate">{ev.title}</div>
                      <div className="text-sm text-slate-400 mb-5 truncate">{ev.location}</div>
                      <div className="flex items-center border-t border-slate-800 pt-4">
                        <div className="flex -space-x-2">
                          {['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500'].map((c, i) => (
                            <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-slate-900`} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 ml-3">+24 attending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: WATCH */}
          {activeTab === 'watch' && (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Curated For You</h2>
                  <p className="text-sm text-slate-400 mt-1">Latest tutorials from your network.</p>
                </div>
              </div>
              <div className="space-y-6">
                {VIDEOS.map(video => (
                  <div key={video.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] overflow-hidden shadow-lg">
                    <div className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar initials={video.avatar} size="lg" colorClass={getAvatarColor(video.author)} />
                        <div>
                          <div className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer transition-colors">{video.author}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{video.time} · Pro Member</div>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white font-bold px-4 py-1.5 rounded-full transition-all text-xs">
                        <Plus className="w-3.5 h-3.5" /> Follow
                      </button>
                    </div>

                    <div className="mx-5 rounded-2xl bg-slate-950 relative overflow-hidden aspect-video group cursor-pointer border border-slate-800 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </div>
                      {/* Video Progress Bar Mock */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '15%' }} />
                        </div>
                        <div className="flex justify-between items-center text-white">
                          <span className="text-[11px] font-semibold text-slate-300">{video.current} / {video.duration}</span>
                          <div className="flex gap-4">
                            <Settings className="w-4 h-4 text-slate-300 hover:text-white" />
                            <Maximize2 className="w-4 h-4 text-slate-300 hover:text-white" />
                            <Volume2 className="w-4 h-4 text-slate-300 hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-lg">{video.title}</h3>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{video.views}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{video.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {video.tags.map((tag, i) => (
                          <span key={i} className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"><Heart className="w-4 h-4" /> {video.likes} Like</button>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"><MessageCircle className="w-4 h-4" /> {video.comments} Comment</button>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"><Share2 className="w-4 h-4" /> {video.shares} Share</button>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors ml-auto"><Bookmark className="w-4 h-4" /> {video.saved} Saved</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: PHOTOS */}
          {activeTab === 'photos' && (
            <>
              <h2 className="text-2xl font-bold text-white tracking-tight">Your Albums</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PHOTOS.map((ph) => (
                  <div key={ph.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] overflow-hidden group cursor-pointer hover:border-slate-700 transition-all shadow-lg">
                    <div className={`h-32 bg-gradient-to-br ${ph.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center border-b border-slate-800`}>
                      <ImageIcon className="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors" />
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-white text-sm mb-1 group-hover:text-indigo-400 transition-colors">{ph.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{ph.items} Items</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Design Store</h2>
                  <p className="text-sm text-slate-400 mt-1">Premium assets and templates.</p>
                </div>
                <button className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/20 transition-all">
                  + Sell Item
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {PRODUCTS.map(prod => (
                  <div key={prod.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] p-5 hover:border-slate-700 hover:bg-slate-800/50 transition-all group cursor-pointer shadow-lg">
                    <div className="w-full h-[140px] bg-slate-950/80 rounded-xl mb-4 flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                      <ShoppingBag className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{prod.title}</h3>
                      <span className="font-black text-lg text-white">{prod.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">by {prod.creator}</p>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-amber-400"><Star className="w-3.5 h-3.5 fill-amber-400" /> {prod.rating}</span>
                      <span className="text-slate-500">{prod.sales} Sales</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: FILES */}
          {activeTab === 'files' && (
            <>
              <h2 className="text-2xl font-bold text-white tracking-tight">Recent Files</h2>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[24px] overflow-hidden shadow-lg">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50">
                  <div className="col-span-6 pl-2">Name</div>
                  <div className="col-span-3">Date Modified</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1 text-right pr-2">Action</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {FILES.map((file) => {
                    const fileIconMap = {
                      pdf: { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: FileText },
                      code: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Code },
                      folder: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Folder },
                      design: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: PenTool },
                      text: { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: FileText },
                    };
                    const cfg = fileIconMap[file.type as keyof typeof fileIconMap] || fileIconMap.text;
                    const Icon = cfg.icon;

                    return (
                      <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="col-span-6 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-700 shadow-sm ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-slate-300 text-sm group-hover:text-white transition-colors truncate">{file.name}</span>
                        </div>
                        <div className="col-span-3 text-sm text-slate-500">{file.date}</div>
                        <div className="col-span-2 text-sm font-medium text-slate-400">{file.size}</div>
                        <div className="col-span-1 flex justify-end pr-2">
                          <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-5">

          {/* Impact Stats */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-5 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-white mb-5"><TrendingUp className="w-4 h-4 text-indigo-400" /> Your Impact</div>
            {[
              { label: 'Profile Views', val: '1,482', pct: 72, color: 'bg-indigo-500' },
              { label: 'Post Reach', val: '8,390', pct: 58, color: 'bg-cyan-500' },
              { label: 'Connections', val: '235', pct: 45, color: 'bg-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <span className="text-sm font-bold text-white">{stat.val}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Connections (Expanded) */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] overflow-hidden shadow-lg">
            <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-slate-800/50 mb-1">
              <span className="text-sm font-bold text-white">Suggested</span>
              <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="px-3 pb-3 space-y-1">
              {SUGGESTED.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <Avatar initials={p.avatar} size="md" colorClass={getAvatarColor(p.name)} />
                    <div>
                      <div className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{p.name}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{p.role}</div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">View All</button>
            </div>
          </div>

          {/* Recent Activity / Notifications (Expanded) */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-5 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Bell className="w-4 h-4 text-rose-400" /> Notifications
              </div>
            </div>
            <div className="space-y-5">
              {ACTIVITIES.map(act => (
                <div key={act.id} className="flex items-start gap-3 group cursor-pointer">
                  <div className="flex -space-x-2 shrink-0 mt-0.5 relative">
                    {act.avatars.map((av, i) => (
                      <Avatar key={i} initials={av} size="sm" colorClass={getAvatarColor(av)} />
                    ))}
                    {/* Dynamic Action Badges */}
                    {act.type === 'like' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><Heart className="w-2 h-2 text-white fill-white" /></div>}
                    {act.type === 'comment' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sky-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><MessageCircle className="w-2 h-2 text-white fill-white" /></div>}
                    {act.type === 'follow' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><UserPlus className="w-2.5 h-2.5 text-white" /></div>}
                    {act.type === 'download' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><Download className="w-2.5 h-2.5 text-white" /></div>}
                    {act.type === 'alert' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><Info className="w-2.5 h-2.5 text-white" /></div>}
                    {act.type === 'share' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-slate-900 flex items-center justify-center"><Share2 className="w-2.5 h-2.5 text-white" /></div>}
                  </div>
                  <div className="flex-1 min-w-0 pl-1.5">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200 group-hover:text-indigo-400 transition-colors">{act.text.split(' ')[0]}</strong> {act.text.substring(act.text.indexOf(' ') + 1)}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                      <Clock className="w-3 h-3" /> {act.time}
                    </div>
                    {act.hasActions && (
                      <div className="flex gap-2 mt-2.5">
                        <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-md shadow-indigo-500/20">Follow Back</button>
                        <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">Discard</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors border-t border-slate-800">
              See All Activity
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}