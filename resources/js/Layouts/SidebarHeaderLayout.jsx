import { Link, router, Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import backgroundImageSrc from '@/assets/images/backgroundbg.png';

export default function SidebarHeaderLayout({ auth, children, pageTitle = "Platform" }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const searchRef = useRef(null);
    const notifRef = useRef(null);

    // 📊 Tüm veriler stats içinde toplanıyor
    const [stats, setStats] = useState({ 
        tasks: [], 
        search_tasks: [], 
        search_workspaces: [], 
        dbTalent: [],
        notifications: [] // Veritabanından gelecek gerçek bildirimler
    });

    useEffect(() => {
        // DashboardController'daki index metodundan verileri çekiyoruz
        axios.get('/dashboard-stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Sync Error:", err));

        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔍 Arama Mantığı
    const pages = [
        { name: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { name: 'Active Sprints', url: route('sprints.index'), icon: '🏃' },
        { name: 'Workspaces', url: route('workspaces.index'), icon: '🖥️' },
        { name: 'Ai Insights', url: route('ai.index'), icon: '🤖' },
        { name: 'Talent Matrix', url: route('talent-matrix.index'), icon: '🌐' },
        { name: 'Profile Settings', url: route('profile.edit'), icon: '👤' },
    ];

    const filteredPages = pages.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTasks = stats.search_tasks?.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const filteredUsers = (stats.dbTalent || []).filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔔 Bildirim Mantığı (Stats üzerinden dinamik)
    const notifications = stats.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        // Arayüzde anında güncelleme (Optimistic Update)
        const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setStats({ ...stats, notifications: updatedNotifs });

        // Backend'e bildirim durumunu gönder (Routelarına göre isimlendir)
        // axios.post(`/notifications/${id}/read`);
    };

    const clearAll = () => {
        const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
        setStats({ ...stats, notifications: updatedNotifs });
        // axios.post('/notifications/mark-all-read');
    };

    return (
        <div className="min-h-screen font-sans text-slate-200 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${backgroundImageSrc})` }}>
            <div className="max-w-[1600px] mx-auto flex gap-6 p-6">
                
                {/* 📌 SIDEBAR */}
                <aside className="w-64 flex-shrink-0 bg-[#160d33]/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 flex flex-col hidden lg:flex shadow-2xl h-[calc(100vh-48px)] sticky top-6">
                    <div className="flex items-center justify-center mb-10">
                        <Link href="/dashboard">
                            <img src="/images/logo.png" alt="Logo" className="h-28 w-auto brightness-[1.3] scale-125" />
                        </Link>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('dashboard') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🏠</span> Dashboard</Link>
                        <Link href={route('ai.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('ai.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🤖</span> Ai Insights</Link>
                        <Link href={route('workspaces.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('workspaces.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🖥️</span> Workspaces</Link>
                        <Link href={route('talent-matrix.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('talent-matrix.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🌐</span> Talent Matrix</Link>
                        <div className="mt-8 mb-2 text-xs font-bold text-slate-500 tracking-widest uppercase pl-4">Account</div>
                        <Link href={route('profile.edit')} className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"><span>👤</span> Profile</Link>
                        <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"><span>🚪</span> Sign Out</Link>
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col gap-6">
                    <header className="flex justify-between items-center bg-[#160d33]/50 backdrop-blur-md p-4 rounded-2xl border border-purple-500/10 relative z-50">
                        <div className="text-sm font-medium text-slate-300"><span className="opacity-50">🏠 /</span> <span className="text-white ml-1">{pageTitle}</span></div>
                        
                        <div className="flex items-center gap-4">
                            {/* Arama Çubuğu */}
                            <div className="relative" ref={searchRef}>
                                <div className="bg-[#0f0822] border border-purple-500/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 focus-within:border-purple-500/60 w-64 focus-within:w-96 shadow-inner">
                                    <span className="text-slate-400 text-sm">🔍</span>
                                    <input type="text" placeholder="Access talent matrix..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }} onFocus={() => setIsSearchOpen(true)} className="bg-transparent border-none text-sm text-white focus:ring-0 w-full outline-none placeholder-slate-600" />
                                </div>
                                
                                {isSearchOpen && searchTerm && (
                                    <div className="absolute top-14 right-0 w-full min-w-[340px] bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="max-h-[450px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-purple-500/30">
                                            {/* Modüller, Kullanıcılar ve Görevler mapi burada kalıyor */}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sağ Taraf Bildirim & Profil */}
                            <div className="flex gap-4 text-lg items-center ml-2 border-l border-white/10 pl-6">
                                <Link href={route('profile.edit')} className="hover:scale-110 transition-transform text-white">👤</Link>
                                
                                {auth.user.role === 'admin' && (
                                    <Link href={route('admin.users')} className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 transition-all shadow-lg shadow-purple-500/10">⚙️</Link>
                                )}

                                {/* 🔔 BİLDİRİM DROPDOWN */}
                                <div className="relative" ref={notifRef}>
                                    <div 
                                        onClick={() => setIsNotifOpen(!isNotifOpen)} 
                                        className="hover:scale-110 transition-transform cursor-pointer relative text-white bg-white/5 p-2 rounded-full border border-white/10"
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#160d33] animate-pulse"></span>
                                        )}
                                    </div>

                                    {isNotifOpen && (
                                        <div className="absolute top-14 right-0 w-80 bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-3 border-b border-white/5 bg-[#160d33]/50 flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Logs</span>
                                                <button onClick={clearAll} className="text-[9px] font-bold text-purple-400 hover:text-purple-300 uppercase">Mark All Read</button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-500/30">
                                                {notifications.length > 0 ? (
                                                    notifications.map(n => (
                                                        <div 
                                                            key={n.id} 
                                                            onClick={() => markAsRead(n.id)}
                                                            className={`flex gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-all ${n.read ? 'opacity-40' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                                        >
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.read ? 'bg-slate-600' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'}`}></div>
                                                            <div className="flex flex-col gap-0.5 text-left overflow-hidden">
                                                                <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{n.time || 'now'}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-10 text-center text-slate-500 italic text-xs">No active logs detected.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}