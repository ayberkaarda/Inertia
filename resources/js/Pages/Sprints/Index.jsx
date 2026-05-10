import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function SprintsIndex({ 
    auth, 
    initialSprints = [], 
    availableBadges = [], 
    availableSkills = [] 
}) {
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'observer'; // Observer da görebilir ama kilitli olacak
    const realIsAdmin = auth.user?.role === 'admin';

    const [isCreating, setIsCreating] = useState(false);
    const [newSprint, setNewSprint] = useState({ 
        name: '', 
        end_date: '', 
        badges: [], 
        skills: [] 
    });
    const [newTaskData, setNewTaskData] = useState({});

    const getStatusStyle = (status) => {
        const styles = {
            active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
            planned: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            completed: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
            expired: 'bg-red-500/20 text-red-400 border-red-500/50 line-through'
        };
        return styles[status] || 'bg-slate-500/20 text-slate-400';
    };

    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('sprints')
                .listen('SprintUpdated', () => {
                    router.reload({ only: ['initialSprints'], preserveState: true, preserveScroll: true });
                });
            return () => window.Echo.leaveChannel('sprints');
        }
    }, []);

    const submitSprint = (e) => {
        e.preventDefault();
        const payload = {
            name: newSprint.name,
            end_date: newSprint.end_date,
            badges: newSprint.badges.join(', '), 
            core_skills: newSprint.skills.join(', '), 
            required_skill: [...newSprint.badges, ...newSprint.skills].join(', ')
        };

        router.post('/sprints', payload, {
            preserveScroll: true,
            onSuccess: () => { 
                setIsCreating(false); 
                setNewSprint({ name: '', end_date: '', badges: [], skills: [] }); 
            }
        });
    };

    const handleCreateTask = (sprintId) => {
        const data = newTaskData[sprintId];
        if (!data?.title?.trim()) return;
        router.post(`/sprints/${sprintId}/tasks`, { title: data.title, complexity_level: data.complexity || 5 }, {
            preserveScroll: true, onSuccess: () => setNewTaskData({ ...newTaskData, [sprintId]: { title: '', complexity: 5 } })
        });
    };

    const handleToggleCompletion = (task) => {
        if (task.is_completed) return;
        if (window.confirm(`Mark "${task.title}" as completed?`)) {
            router.patch(`/tasks/${task.id}/toggle-completion`, {}, { preserveScroll: true });
        }
    };

    const toggleItem = (item, type) => {
        const list = newSprint[type].includes(item) 
            ? newSprint[type].filter(i => i !== item) 
            : [...newSprint[type], item];
        setNewSprint({ ...newSprint, [type]: list });
    };

    const handleJoinTask = (id) => router.post(`/tasks/${id}/join`, {}, { preserveScroll: true });
    
    const toggleStatus = (id, currentStatus) => {
        if (currentStatus === 'expired') return;
        const nextStatus = currentStatus === 'planned' ? 'active' : 'completed';
        router.put(`/sprints/${id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Sprints">
            <Head title="Active Sprints" />

            {/* 📌 MAIN CONTAINER */}
            <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
                
                {/* 🌟 HEADER: Mobilde buton tam genişlik olur */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 border-b border-purple-500/20 pb-4 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-bold text-white uppercase tracking-tight">Sprint Task Board </h2>
                        <p className="text-emerald-400 text-[10px] sm:text-xs mt-1 animate-pulse font-black uppercase tracking-widest">🟢 Neural Link Active</p>
                    </div>
                    {realIsAdmin && (
                        <button onClick={() => setIsCreating(!isCreating)} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95">
                            {isCreating ? '✖ Cancel' : '➕ Create Sprint'}
                        </button>
                    )}
                </div>

                {/* CREATE SPRINT FORM */}
                {isCreating && realIsAdmin && (
                    <form onSubmit={submitSprint} className="bg-[#0f0822] p-4 sm:p-6 rounded-2xl border border-emerald-500/30 mb-8 flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-4 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                            <div className="flex-1">
                                <label className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 block">Sprint name</label>
                                <input type="text" required value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} className="w-full bg-[#1a0b2e] border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-all" placeholder="Project X..." />
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5 block">Deadline</label>
                                <input type="date" required value={newSprint.end_date} onChange={e => setNewSprint({...newSprint, end_date: e.target.value})} className="w-full bg-[#1a0b2e] border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]" />
                            </div>
                        </div>

                        {/* 🌟 SELECTORS: Mobilde alt alta, desktopta yan yana */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 bg-[#160d33] p-4 sm:p-5 rounded-xl border border-purple-500/10">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black text-purple-400 tracking-widest uppercase border-b border-purple-500/20 pb-2 mb-1">Tech Stack</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableBadges.map(badge => (
                                        <button key={badge} type="button" onClick={() => toggleItem(badge, 'badges')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${newSprint.badges.includes(badge) ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#0f0822] border border-purple-500/30 text-slate-400 hover:text-slate-200'}`}>{badge}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black text-blue-400 tracking-widest uppercase border-b border-blue-500/20 pb-2 mb-1">Core Skills</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSkills.map(skill => (
                                        <button key={skill} type="button" onClick={() => toggleItem(skill, 'skills')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${newSprint.skills.includes(skill) ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0f0822] border border-blue-500/30 text-slate-400 hover:text-slate-200'}`}>{skill}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all">Launch Mission</button>
                        </div>
                    </form>
                )}

                {/* SPRINTS GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {initialSprints.map((sprint) => {
                        const sprintSkills = sprint.required_skill ? sprint.required_skill.split(',').map(s => s.trim()) : [];
                        
                        return (
                            <div key={sprint.id} className={`bg-[#0f0822] border rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col transition-all hover:border-purple-500/40 ${sprint.status === 'expired' ? 'border-red-500/20 opacity-80' : 'border-purple-500/20'}`}>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-purple-500/10 pb-3">
                                    <div className="flex-1 pr-2 min-w-0">
                                        <h3 className="text-base sm:text-xl font-bold text-white truncate">{sprint.name}</h3>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {sprintSkills.map((s, i) => (
                                                <span key={i} className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-tight ${availableBadges.includes(s) ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30'}`}>{s}</span>
                                            ))}
                                        </div>
                                        <p className="text-[8px] sm:text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">{sprint.status === 'expired' ? '⌛ EXP' : '📅 DL'}: {sprint.end_date}</p>
                                    </div>
                                    <button onClick={() => toggleStatus(sprint.id, sprint.status)} disabled={sprint.status === 'expired'} className={`shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] rounded-lg uppercase font-black border transition-all ${getStatusStyle(sprint.status)}`}>
                                        {sprint.status}
                                    </button>
                                </div>

                                {/* Tasks List */}
                                <div className="space-y-2 mb-4 flex-1 overflow-y-auto max-h-[250px] sm:max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-purple-500/20">
                                    {(sprint.tasks || []).map(task => {
                                        const isJoined = task.users?.some(u => u.id === auth.user.id);
                                        const isLocked = task.is_completed;

                                        return (
                                            <div key={task.id} className={`flex justify-between items-center bg-[#1a0b2e] border p-2 sm:p-3 rounded-xl transition-all ${isLocked ? 'opacity-30 grayscale pointer-events-none border-slate-800' : 'border-purple-500/10 hover:border-purple-500/30'}`}>
                                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                    <button onClick={() => handleToggleCompletion(task)} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${isLocked ? 'bg-emerald-500 border-emerald-500 text-[#0f0822]' : 'border-slate-600 hover:border-emerald-500 text-transparent'}`}>
                                                        {isLocked ? '✓' : ''}
                                                    </button>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-xs sm:text-sm truncate font-medium ${isLocked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                                                        <span className="text-[7px] sm:text-[8px] text-slate-500 font-black uppercase">{isLocked ? 'Locked' : `${task.complexity_level}★ COMPLEXITY`}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-2 shrink-0">
                                                    <div className="flex -space-x-1.5">
                                                        {task.users?.slice(0, 3).map((u, i) => (
                                                            <img key={i} src={u.avatar ? `/storage/${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-[#1a0b2e] object-cover shadow-lg" title={u.name} />
                                                        ))}
                                                    </div>
                                                    {!isLocked && sprint.status !== 'expired' && !isJoined && (
                                                        <button onClick={() => handleJoinTask(task.id)} className="text-[8px] sm:text-[9px] text-emerald-400 border border-emerald-500/30 px-1.5 py-1 rounded hover:bg-emerald-500/20 font-black uppercase tracking-tighter">JOIN</button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Task Add Bar */}
                                {sprint.status !== 'expired' && (
                                    <div className="flex gap-1.5 mt-auto pt-3 border-t border-purple-500/10">
                                        <input type="text" value={newTaskData[sprint.id]?.title || ''} placeholder="Add mission..." className="flex-1 bg-[#1a0b2e] border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500/50 transition-colors" onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], title: e.target.value }})} onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(sprint.id)} />
                                        <select value={newTaskData[sprint.id]?.complexity || 5} onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], complexity: parseInt(e.target.value) }})} className="w-[45px] sm:w-[60px] bg-[#1a0b2e] text-slate-400 border border-purple-500/20 rounded-lg text-[9px] font-bold outline-none text-center appearance-none">
                                            {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}★</option>)}
                                        </select>
                                        <button onClick={() => handleCreateTask(sprint.id)} className="bg-purple-600/20 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-lg active:scale-95">ADD</button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </SidebarHeader>
    );
}