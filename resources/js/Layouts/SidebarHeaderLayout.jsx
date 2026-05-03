import { Link, router, Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import backgroundImageSrc from '@/assets/images/backgroundbg.png';

export default function SidebarHeaderLayout({ children, pageTitle = "Platform" }) {
    // 1. Verileri ve arama cephaneliğini usePage ile Shared Data'dan çekiyoruz
    // Varsayılan boş dizi [] ataması kritik! Başka sayfada çökmeyi engeller.
    const { 
        auth, 
        search_workspaces = [], 
        search_tasks = [], 
        search_users = [], 
        search_sprints = [] 
    } = usePage().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const searchRef = useRef(null);
    const notifRef = useRef(null);

    // 2. Bildirimler
    const notifications = auth.user?.notifications || [];
    const unreadCount = notifications.filter(n => n.read_at === null).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔍 1. SABİT SAYFALAR
    const pages = [
        { name: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { name: 'Active Sprints', url: route('sprints.index'), icon: '🏃' },
        { name: 'Workspaces', url: route('workspaces.index'), icon: '🖥️' },
        { name: 'Ai Insights', url: route('ai.index'), icon: '🤖' },
        { name: 'Talent Matrix', url: route('talent-matrix.index'), icon: '🌐' },
        { name: 'Profile Settings', url: route('profile.edit'), icon: '👤' },
    ];

    // 🔍 2. FİLTRELEME MANTIĞI (Arama kelimesine göre hepsini ayrı ayrı süzüyoruz)
    const query = searchTerm.toLowerCase();
    const filteredPages = pages.filter(p => p.name.toLowerCase().includes(query));
    const filteredWorkspaces = search_workspaces.filter(w => w.name.toLowerCase().includes(query));
    const filteredTasks = search_tasks.filter(t => t.title.toLowerCase().includes(query));
    const filteredUsers = search_users.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    const filteredSprints = search_sprints.filter(s => s.name.toLowerCase().includes(query));

    const hasNoResults = filteredPages.length === 0 && filteredWorkspaces.length === 0 && 
                         filteredTasks.length === 0 && filteredUsers.length === 0 && filteredSprints.length === 0;

    // 🔔 Bildirim Fonksiyonları
    const markAsRead = (id) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => console.log("Notification marked as read")
        });
    };

    const clearAll = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true
        });
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
                            {/* 🔍 Arama Çubuğu */}
                            <div className="relative" ref={searchRef}>
                                <div className="bg-[#0f0822] border border-purple-500/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 focus-within:border-purple-500/60 w-64 focus-within:w-96 shadow-inner">
                                    <span className="text-slate-400 text-sm">🔍</span>
                                    <input type="text" placeholder="Search pages, tasks, users..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }} onFocus={() => setIsSearchOpen(true)} className="bg-transparent border-none text-sm text-white focus:ring-0 w-full outline-none placeholder-slate-600" />
                                </div>
                                
                                {isSearchOpen && searchTerm && (
                                    <div className="absolute top-14 right-0 w-full min-w-[340px] bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="max-h-[450px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-purple-500/30">
                                             
                                            {/* Sonuç Yoksa */}
                                            {hasNoResults && (
                                                <div className="p-4 text-center text-sm text-slate-500 italic">No results found for "{searchTerm}"</div>
                                            )}

                                            {/* Sayfalar */}
                                            {filteredPages.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Pages</div>
                                                    {filteredPages.map((page, idx) => (
                                                        <Link key={`page-${idx}`} href={page.url} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <span>{page.icon}</span> {page.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Kullanıcılar */}
                                            {filteredUsers.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Users</div>
                                                    {filteredUsers.map((user) => (
                                                        <Link key={`user-${user.id}`} href="#" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold overflow-hidden border border-purple-500/30">
                                                                {user.avatar ? <img src={`/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover"/> : user.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="leading-tight">{user.name}</span>
                                                                <span className="text-[10px] text-slate-500">{user.email}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Görevler (Tasks) */}
                                            {filteredTasks.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Tasks</div>
                                                    {filteredTasks.map((task) => (
                                                        <Link key={`task-${task.id}`} href="#" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <span className="text-blue-400">📋</span> 
                                                            <span className="truncate">{task.title}</span>
                                                            <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400">Lvl {task.complexity_level}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Çalışma Alanları (Workspaces) */}
                                            {filteredWorkspaces.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Workspaces</div>
                                                    {filteredWorkspaces.map((workspace) => (
                                                        <Link key={`ws-${workspace.id}`} href={`/workspaces/${workspace.slug}`} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <span className="text-emerald-400">🖥️</span> {workspace.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Sprintler */}
                                            {filteredSprints.length > 0 && (
                                                <div className="mb-1">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Sprints</div>
                                                    {filteredSprints.map((sprint) => (
                                                        <Link key={`sprint-${sprint.id}`} href="#" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <span className="text-orange-400">🏃</span> {sprint.name}
                                                            <span className="ml-auto text-[9px] uppercase font-bold text-slate-500">{sprint.status}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sağ Taraf Bildirim & Profil */}
                            <div className="flex gap-4 text-lg items-center ml-2 border-l border-white/10 pl-6">
                                <Link href={route('profile.edit')} className="hover:scale-110 transition-transform text-white">👤</Link>
                                
                                {auth.user?.role === 'admin' && (
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
                                                            className={`flex gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-all ${n.read_at ? 'opacity-40' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                                        >
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.read_at ? 'bg-slate-600' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'}`}></div>
                                                            <div className="flex flex-col gap-0.5 text-left overflow-hidden">
                                                                <p className="text-xs text-slate-200 leading-snug">{n.data?.message || n.message}</p>
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{n.created_at_human || 'now'}</span>
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