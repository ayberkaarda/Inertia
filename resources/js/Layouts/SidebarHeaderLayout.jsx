import { Link, router, Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// 🌟 HIZ TAVSİYESİ 1: Resmin formatını .webp olarak değiştirdik!
// (Lütfen png dosyanı internetten webp'ye çevirip klasöre atmayı unutma)
import backgroundImageSrc from '@/assets/images/backgroundbg.webp';

export default function SidebarHeaderLayout({ children, pageTitle = "Platform" }) {
    const { auth } = usePage().props; 

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const searchRef = useRef(null);
    const notifRef = useRef(null);

    const [searchData, setSearchData] = useState({
        workspaces: [], tasks: [], users: [], sprints: []
    });

    useEffect(() => {
        axios.get('/dashboard-stats') 
            .then(response => {
                const data = response.data;
                setSearchData({
                    workspaces: data.search_workspaces || [],
                    tasks: data.search_tasks || [],
                    users: data.search_users || [],
                    sprints: data.search_sprints || []
                });
            })
            .catch(error => console.log("Search data could not be loaded:", error));
    }, []);

    const [notificationsList, setNotificationsList] = useState(auth.user?.notifications || []);

    useEffect(() => {
        setNotificationsList(auth.user?.notifications || []);
    }, [auth.user?.notifications]);

    useEffect(() => {
        if (auth.user?.id && window.Echo) {
            window.Echo.private(`user.${auth.user.id}`)
                .listen('.NewNotification', (e) => {
                    console.log("new notification :", e.notification);
                    setNotificationsList((prev) => [e.notification, ...prev]);
                });

            return () => {
                window.Echo.leave(`user.${auth.user.id}`);
            };
        }
    }, [auth.user?.id]);

    const unreadCount = notificationsList.filter(n => n.read_at === null).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pages = [
        { name: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { name: 'Active Sprints', url: route('sprints.index'), icon: '🏃' },
        { name: 'Workspaces', url: route('workspaces.index'), icon: '🖥️' },
        { name: 'Ai Insights', url: route('ai.index'), icon: '🤖' },
        { name: 'Talent Matrix', url: route('talent-matrix.index'), icon: '🌐' },
        // 🌟 DROPBOX ARAMA MOTORUNA EKLENDİ
        { name: 'Dropbox Vault', url: route('dropbox.index'), icon: '📦' },
        { name: 'Profile Settings', url: route('profile.edit'), icon: '👤' },
        { name: 'Inbox', url: '/inbox', icon: '💬' },
    ];

    const query = searchTerm.toLowerCase();
    const filteredPages = pages.filter(p => p.name.toLowerCase().includes(query));
    const filteredWorkspaces = searchData.workspaces.filter(w => (w.name || '').toLowerCase().includes(query));
    const filteredTasks = searchData.tasks.filter(t => (t.title || '').toLowerCase().includes(query));
    const filteredUsers = searchData.users.filter(u => (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query));
    const filteredSprints = searchData.sprints.filter(s => (s.name || '').toLowerCase().includes(query));

    const hasNoResults = filteredPages.length === 0 && filteredWorkspaces.length === 0 && 
                         filteredTasks.length === 0 && filteredUsers.length === 0 && filteredSprints.length === 0;

    const handleNotificationClick = (n) => {
        if (!n.read_at) {
            axios.post(`/notifications/${n.id}/read`).then(() => {
                setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item));
            });
        }

        try {
            const parsedData = JSON.parse(n.message);
            if (parsedData.link) {
                setIsNotifOpen(false); 
                router.visit(parsedData.link); 
            }
        } catch (e) {}
    };

    const getNotifText = (msg) => {
        try {
            const parsed = JSON.parse(msg);
            return parsed.text || msg;
        } catch (e) {
            return msg; 
        }
    };

    const clearAll = () => {
        router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    };

    return (
        // 🌟 HIZ TAVSİYESİ 2: Sınıflara bg-[#0f0822] ekledik. Resim yüklenene kadar koyu siberpunk renk bekleyecek!
        <div className="min-h-screen font-sans text-slate-200 bg-cover bg-center bg-fixed bg-[#0f0822]" style={{ backgroundImage: `url(${backgroundImageSrc})` }}>
            
            {/* 🌟 HIZ TAVSİYESİ 3: Tarayıcıya bu resmi en yüksek öncelikle indirmesini söylüyoruz! */}
            <Head title={pageTitle}>
                <link rel="preload" as="image" href={backgroundImageSrc} />
            </Head>

            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-[#0f0822]/80 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div className="max-w-[1600px] mx-auto flex lg:gap-6 p-2 sm:p-4 lg:p-6 relative">
                
                <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-[#160d33]/95 lg:bg-[#160d33]/80 backdrop-blur-xl border-r border-purple-500/20 p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:rounded-3xl lg:border lg:h-[calc(100vh-48px)] lg:top-6 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="absolute top-6 right-6 lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/20 border border-white/10 transition-colors"
                    >
                        ✕
                    </button>

                    <div className="flex items-center justify-center mb-10 mt-4 lg:mt-0">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            <img src="/images/logo.png" alt="Logo" className="h-24 lg:h-28 w-auto brightness-[1.3] scale-125" />
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-2 overflow-y-auto scrollbar-none pb-10">
                        <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('dashboard') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🏠</span> Dashboard</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('ai.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('ai.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🤖</span> Ai Insights</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('workspaces.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('workspaces.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🖥️</span> Workspaces</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('talent-matrix.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('talent-matrix.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>🌐</span> Talent Matrix</Link>
                        
                        {/* 🌟 DROPBOX SOL MENÜYE EKLENDİ */}
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('dropbox.index')} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${route().current('dropbox.*') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>📦</span> Dropbox</Link>
                        
                        <div className="mt-6 mb-2 text-xs font-bold text-slate-500 tracking-widest uppercase pl-4">Account</div>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('profile.edit')} className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"><span>👤</span> Profile</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href="/inbox" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${typeof window !== 'undefined' && window.location.pathname.includes('/inbox') || typeof window !== 'undefined' && window.location.pathname.includes('/chat') ? 'bg-purple-600/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span>💬</span> Inbox</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={route('logout')} method="post" as="button" className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"><span>🚪</span> Sign Out</Link>
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col gap-4 lg:gap-6 w-full max-w-full">
                    
                    <header className="flex justify-between items-center bg-[#160d33]/50 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-purple-500/10 relative z-50">
                        
                        <div className="flex items-center gap-3 lg:gap-0">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg bg-white/5 text-purple-400 border border-white/10 hover:bg-purple-500/20 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>

                            <div className="text-xs sm:text-sm font-medium text-slate-300 hidden sm:block">
                                <span className="opacity-50">🏠 /</span> <span className="text-white ml-1">{pageTitle}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="relative" ref={searchRef}>
                                <div className="bg-[#0f0822] border border-purple-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 transition-all duration-300 focus-within:border-purple-500/60 w-32 sm:w-48 lg:w-64 focus-within:w-48 sm:focus-within:w-64 lg:focus-within:w-96 shadow-inner">
                                    <span className="text-slate-400 text-xs sm:text-sm">🔍</span>
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }} onFocus={() => setIsSearchOpen(true)} className="bg-transparent border-none text-xs sm:text-sm text-white focus:ring-0 w-full outline-none placeholder-slate-600 px-0 py-0" />
                                </div>
                                
                                {isSearchOpen && searchTerm && (
                                    <div className="absolute top-12 right-0 w-[85vw] max-w-[340px] bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="max-h-[60vh] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-purple-500/30">
                                            {hasNoResults && (
                                                <div className="p-4 text-center text-sm text-slate-500 italic">No results found for "{searchTerm}"</div>
                                            )}

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

                                            {filteredUsers.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Users</div>
                                                    {filteredUsers.map((user) => (
                                                        <Link key={`user-${user.id}`} href={`/user-profile/${user.id}`} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
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

                                            {filteredTasks.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Tasks</div>
                                                    {filteredTasks.map((task) => (
                                                        <Link key={`task-${task.id}`} href="/sprints" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
                                                            <span className="text-blue-400">📋</span> 
                                                            <span className="truncate">{task.title}</span>
                                                            <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400">Lvl {task.complexity_level}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

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

                                            {filteredSprints.length > 0 && (
                                                <div className="mb-1">
                                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-1">Sprints</div>
                                                    {filteredSprints.map((sprint) => (
                                                        <Link key={`sprint-${sprint.id}`} href="/sprints" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition text-sm">
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

                            <div className="flex gap-2 sm:gap-4 text-sm sm:text-lg items-center sm:ml-2 border-l border-white/10 pl-2 sm:pl-6">
                                <Link href={route('profile.edit')} className="hover:scale-110 transition-transform text-white hidden sm:block">👤</Link>
                                
                                {(auth.user?.role === 'admin' || auth.user?.role === 'observer') && (
                                    <Link href={route('admin.users')} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/20 border border-purple-500/30 transition-all shadow-lg shadow-purple-500/10 text-sm sm:text-base">⚙️</Link>
                                )}

                                <div className="relative" ref={notifRef}>
                                    <div 
                                        onClick={() => setIsNotifOpen(!isNotifOpen)} 
                                        className="hover:scale-110 transition-transform cursor-pointer relative text-white bg-white/5 p-1.5 sm:p-2 rounded-full border border-white/10 text-sm sm:text-base"
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-[#160d33] animate-pulse"></span>
                                        )}
                                    </div>

                                    {isNotifOpen && (
                                        <div className="absolute top-12 sm:top-14 right-0 w-[85vw] max-w-[320px] bg-[#1a0b2e] border border-purple-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-3 border-b border-white/5 bg-[#160d33]/50 flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Logs</span>
                                                <button onClick={clearAll} className="text-[9px] font-bold text-purple-400 hover:text-purple-300 uppercase">Mark All Read</button>
                                            </div>
                                            <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-500/30">
                                                
                                                {notificationsList.length > 0 ? (
                                                    notificationsList.map(n => (
                                                        <div 
                                                            key={n.id} 
                                                            onClick={() => handleNotificationClick(n)}
                                                            className={`flex gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-all ${n.read_at ? 'opacity-40' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                                        >
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.read_at ? 'bg-slate-600' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'}`}></div>
                                                            <div className="flex flex-col gap-0.5 text-left overflow-hidden">
                                                                <p className="text-xs text-slate-200 leading-snug">{getNotifText(n.message)}</p>
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

                    <main className="flex-1 max-w-full overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}