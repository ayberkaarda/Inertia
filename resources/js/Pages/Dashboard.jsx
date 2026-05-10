import SidebarHeader from '@/Layouts/SidebarHeaderLayout'; 
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard({ auth }) {
    const [activeTab, setActiveTab] = useState('sprints');
    const [aiSuggestion, setAiSuggestion] = useState(null); 

    const [stats, setStats] = useState({
        skill_match_rate: 0,
        avg_complexity: '0',
        bottleneck_alerts: 0,
        global_synergy: 0,
        efficiency_data: [],
        skill_balance: '0/10', 
        tasks: [],
        active_sprints_list: [],
        active_sprints: 0 
    });

    const fetchDashboardStats = () => {
        axios.get('/dashboard-stats') 
            .then(response => {
                setStats(prev => ({ ...prev, ...response.data }));
            })
            .catch(error => console.error("Sync Error:", error));
    };

    useEffect(() => {
        fetchDashboardStats();

        if (window.Echo) {
            const channel = window.Echo.channel('sprints')
                .listen('SprintUpdated', () => {
                    console.log("Dashboard: Data Synchronization Triggered.");
                    fetchDashboardStats();
                });
            return () => window.Echo.leaveChannel('sprints');
        }
    }, []);

    useEffect(() => {
        if (stats.tasks?.length > 0) {
            const suitableTask = stats.tasks.find(t => !t.is_completed && t.complexity_level >= 5 && t.complexity_level <= 8);
            if (suitableTask) {
                setAiSuggestion({
                    id: suitableTask.id,
                    message: `Neural Match: "${suitableTask.title}" task is optimal for your current skill set.`,
                });
            } else {
                setAiSuggestion(null);
            }
        }
    }, [stats.tasks]);

    return (
        <SidebarHeader auth={auth} pageTitle="Dashboard">
            <Head title="Inertia Dashboard" />

            <div className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-10 px-1 sm:px-0">
                
                {/* 📌 STATS GRID (Top) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    {[
                        { title: "Match Rate", value: `${stats.skill_match_rate}%`, icon: "⭐" },
                        { title: "Active Sprints", value: stats.active_sprints, icon: "🏃", onClick: () => router.visit(route('sprints.index')), isInteractive: true },
                        { title: "Bottleneck Alerts", value: stats.bottleneck_alerts, icon: "⚠️" },
                        { title: "Skill Balance", value: stats.skill_balance, icon: "📊" }
                    ].map((card, idx) => (
                        <div key={idx} onClick={card.onClick} className={`bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden transition-all ${card.isInteractive ? 'cursor-pointer hover:border-purple-400 hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                            <div className="z-10 relative">
                                <h3 className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</h3>
                                <p className="text-xl sm:text-3xl font-black text-white">{card.value}</p>
                            </div>
                            <div className="text-2xl sm:text-3xl opacity-20 absolute sm:relative right-2 top-2 sm:right-auto sm:top-auto z-0">{card.icon}</div>
                        </div>
                    ))}
                </div>

                {/* 📊 MID SECTION (Chart & Gauge) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Verimlilik Grafiği */}
                    <div className="lg:col-span-2 bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 min-h-[250px] sm:min-h-[350px] flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                            <div>
                                <h3 className="text-white font-black text-base sm:text-lg">Efficiency Tracking</h3>
                                <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"> -- </p>
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex items-center gap-1.5 sm:gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">Estimated</span></div>
                                <div className="flex items-center gap-1.5 sm:gap-2"><span className="w-2 h-2 rounded-full bg-pink-500"></span><span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">Actual</span></div>
                            </div>
                        </div>
                        <div className="w-full h-[180px] sm:h-[250px] flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.efficiency_data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/><stop offset="95%" stopColor="#d946ef" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                    <XAxis dataKey="month" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: '#130b29', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="estimated" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorE)" />
                                    <Area type="monotone" dataKey="actual" stroke="#d946ef" strokeWidth={3} fill="url(#colorA)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 📊 Global Synergy Gauge */}
                    <div className="bg-[#160d33]/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-purple-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
                        <h3 className="text-white font-black text-base sm:text-lg mb-1 uppercase tracking-tight">Team Synergy</h3>
                        <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase mb-6 sm:mb-8 tracking-[0.2em]">From all projects </p>
                        
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#1f1244" strokeWidth="8" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="url(#synergyMoodGrad)" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (stats.global_synergy || 0)) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-in-out" />
                                <defs>
                                    <linearGradient id="synergyMoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl sm:text-4xl mb-1 animate-bounce duration-[2000ms]">{stats.global_synergy >= 80 ? '🤩' : stats.global_synergy >= 50 ? '😊' : '😟'}</div>
                                <span className="text-4xl sm:text-5xl font-black text-white leading-none">{stats.global_synergy}%</span>
                                <span className={`text-[8px] sm:text-[9px] font-black mt-2 sm:mt-3 tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-colors duration-500 ${stats.global_synergy >= 80 ? 'text-emerald-400' : stats.global_synergy >= 50 ? 'text-amber-400' : 'text-red-500'}`}>
                                    {stats.global_synergy >= 80 ? 'Optimal ⚡' : stats.global_synergy >= 50 ? 'Average ' : 'Critical ⚠️'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📝 TABBED LOG AREA (Sprints & Tasks) & SIDE PANEL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Tabs ve Tablolar */}
                    <div className="lg:col-span-2 bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-[350px] sm:min-h-[450px]">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 border-b border-white/5 pb-4 gap-4 sm:gap-0">
                            <h3 className="text-white font-black text-base sm:text-xl tracking-tight uppercase">Active Logs</h3>
                            <div className="flex bg-black/40 p-1 rounded-lg sm:rounded-xl border border-purple-500/20 w-full sm:w-auto">
                                <button onClick={() => setActiveTab('sprints')} className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all ${activeTab === 'sprints' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>SPRINTS</button>
                                <button onClick={() => setActiveTab('tasks')} className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all ${activeTab === 'tasks' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>TASKS</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 relative">
                            <table className="w-full text-left min-w-[500px] sm:min-w-full">
                                <thead>
                                    <tr className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] border-b border-white/5">
                                        {activeTab === 'sprints' ? (
                                            <><th className="pb-3 sm:pb-4 pl-2">Active Sprint</th><th className="pb-3 sm:pb-4 text-center">Status</th><th className="pb-3 sm:pb-4 text-center">Deadline</th><th className="pb-3 sm:pb-4 text-right pr-4">Tasks</th></>
                                        ) : (
                                            <><th className="pb-3 sm:pb-4 pl-2">Tasks</th><th className="pb-3 sm:pb-4 text-center">Assigned</th><th className="pb-3 sm:pb-4 text-center">Match</th><th className="pb-3 sm:pb-4 text-right pr-4">Complexity</th></>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeTab === 'sprints' ? (
                                        stats.active_sprints_list?.length > 0 ? stats.active_sprints_list.map((s, i) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-all">
                                                <td className="py-3 sm:py-5 pl-2"><div className="flex flex-col"><span className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]">{s.name}</span><div className="flex flex-wrap gap-1 mt-1">{s.required_skill?.split(',').slice(0, 2).map((sk, si) => <span key={si} className="text-[7px] sm:text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase font-black">{sk.trim()}</span>)}</div></div></td>
                                                <td className="py-3 sm:py-5 text-center"><span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-black uppercase">Active</span></td>
                                                <td className="py-3 sm:py-5 text-center"><span className="text-[10px] sm:text-xs font-bold text-slate-300">{s.end_date}</span></td>
                                                <td className="py-3 sm:py-5 text-right pr-4"><span className="text-xs sm:text-sm font-black text-white">{s.tasks?.length || 0}</span></td>
                                            </tr>
                                        )) : <tr><td colSpan="4" className="py-10 sm:py-20 text-center text-slate-600 italic text-xs">No active deployments.</td></tr>
                                    ) : (
                                        stats.tasks?.filter(t => !t.is_completed).length > 0 ? stats.tasks.filter(t => !t.is_completed).map((t, i) => {
                                            const match = Math.max(10, 100 - (t.complexity_level * 5));
                                            return (
                                                <tr key={i} className="group hover:bg-white/5 transition-all">
                                                    <td className="py-3 sm:py-5 pl-2">
                                                        <div className="flex flex-col max-w-[120px] sm:max-w-[200px]">
                                                            <span className="text-xs sm:text-sm font-bold truncate text-slate-200 group-hover:text-purple-400" title={t.title}>{t.title}</span>
                                                            
                                                            {/* 🌟 RASTGELE SEÇİM VE MOR TAG TASARIMI BURASI */}
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {(() => {
                                                                    const skills = t.required_skills || t.requiredSkills || [];
                                                                    const badges = t.badges || [];
                                                                    let pool = [];

                                                                    if (skills.length > 0) {
                                                                        pool = [...skills];
                                                                    } else if (badges.length > 0) {
                                                                        pool = [...badges];
                                                                    }

                                                                    if (pool.length === 0) {
                                                                        return <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase truncate">GENERAL PROTOCOL</span>;
                                                                    }

                                                                    // Havuzu karıştır ve 2 tane al
                                                                    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 2);

                                                                    return selected.map((item, idx) => (
                                                                        <span key={idx} className="text-[7px] sm:text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase font-black shadow-sm">
                                                                            {item.name}
                                                                        </span>
                                                                    ));
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 sm:py-5 text-center"><div className="flex justify-center -space-x-1.5 sm:-space-x-2">{t.users?.slice(0, 3).map((u, ui) => <img key={ui} src={u.avatar ? `/storage/${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#160d33] shadow-lg object-cover" title={u.name} />)}</div></td>
                                                    <td className="py-3 sm:py-5 text-center"><span className={`text-[10px] sm:text-xs font-black ${match > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>%{match}</span></td>
                                                    <td className="py-3 sm:py-5 text-right pr-4"><div className="flex items-center justify-end gap-2 sm:gap-3"><span className="text-white text-[10px] sm:text-xs font-black font-mono">{t.complexity_level}</span><div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner"><div className={`h-full transition-all duration-1000 ${t.complexity_level > 7 ? 'bg-red-500' : 'bg-purple-500'}`} style={{width: `${t.complexity_level * 10}%`}}></div></div></div></td>
                                                </tr>
                                            );
                                        }) : <tr><td colSpan="4" className="py-10 sm:py-20 text-center text-slate-600 italic text-xs">No active tasks.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 💡 SIDE PANEL (AI & Alerts) */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Neural Suggestion */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-transparent backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/30 shadow-2xl">
                            <h3 className="text-purple-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6">Smart Suggestion</h3>
                            {aiSuggestion ? (
                                <div onClick={() => router.visit(route('sprints.index'))} className="p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-emerald-500/20 transition-all group">
                                    <div className="text-xl sm:text-2xl mb-2 sm:mb-3 group-hover:animate-bounce w-fit">🎯</div>
                                    <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">{aiSuggestion.message}</p>
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-10 opacity-30 text-[10px] sm:text-xs italic">Scanning neural activity...</div>
                            )}
                        </div>
                        
                        {/* Bottleneck Alert */}
                        <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-500/20 shadow-2xl">
                            <div className="flex items-center gap-2 sm:gap-3 text-red-500 mb-3 sm:mb-4 font-black text-[10px] sm:text-xs uppercase tracking-widest"><span className="animate-ping w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></span> Resource Alerts</div>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">Detected <span className="text-white font-bold">{stats.bottleneck_alerts}</span> complexity bottlenecks. Risk: <span className="text-red-400 font-bold">Moderate</span>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarHeader>
    );
}