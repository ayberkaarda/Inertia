import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function SprintsIndex({ 
    auth, 
    initialSprints = [], 
    availableBadges = [], 
    availableSkills = [] 
}) {
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'observer'; 
    const realIsAdmin = auth.user?.role === 'admin';

    const [isCreating, setIsCreating] = useState(false);
    const [newSprint, setNewSprint] = useState({ 
        name: '', 
        end_date: '', 
        badges: [], 
        skills: [] 
    });
    const [newTaskData, setNewTaskData] = useState({});

    // 🌟 DÜZENLEME (EDIT) STATELERİ 🌟
    const [editingSprintId, setEditingSprintId] = useState(null);
    const [editSprintData, setEditSprintData] = useState({ name: '', end_date: '' });

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState({ title: '', complexity_level: 5 });

    const getStatusStyle = (status) => {
        const styles = {
            active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30',
            planned: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
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

    // --- SPRINT FONKSİYONLARI ---
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

    const startEditSprint = (sprint) => {
        setEditingSprintId(sprint.id);
        setEditSprintData({ name: sprint.name, end_date: sprint.end_date });
    };

    const saveSprintEdit = (id) => {
        router.put(`/sprints/${id}`, editSprintData, {
            preserveScroll: true,
            onSuccess: () => setEditingSprintId(null)
        });
    };

    const deleteSprint = (id) => {
        if (window.confirm("Bu Sprint'i İÇİNDEKİ GÖREVLERLE BİRLİKTE silmek istediğinize emin misiniz?")) {
            router.delete(`/sprints/${id}`, { preserveScroll: true });
        }
    };

    const toggleStatus = (id, currentStatus) => {
        if (currentStatus === 'expired' || currentStatus === 'completed') return;
        const nextStatus = currentStatus === 'planned' ? 'active' : 'completed';
        
        const confirmMsg = nextStatus === 'completed' 
            ? "Sprint'i tamamlamak içindeki tüm görevleri kilitler. Devam edilsin mi?" 
            : `Sprint durumunu '${nextStatus}' yap?`;

        if (window.confirm(confirmMsg)) {
            router.put(`/sprints/${id}/status`, { status: nextStatus }, { preserveScroll: true });
        }
    };

    // --- TASK FONKSİYONLARI ---
    const handleCreateTask = (sprintId) => {
        const data = newTaskData[sprintId];
        if (!data?.title?.trim()) return;
        router.post(`/sprints/${sprintId}/tasks`, { title: data.title, complexity_level: data.complexity || 5 }, {
            preserveScroll: true, onSuccess: () => setNewTaskData({ ...newTaskData, [sprintId]: { title: '', complexity: 5 } })
        });
    };

    const handleToggleCompletion = (task, sprintStatus) => {
        if (task.is_completed || sprintStatus === 'completed' || sprintStatus === 'expired') return;
        if (window.confirm(`Görev "${task.title}" tamamlandı olarak işaretlensin mi?`)) {
            router.patch(`/tasks/${task.id}/toggle-completion`, {}, { preserveScroll: true });
        }
    };

    const handleJoinTask = (id) => router.post(`/tasks/${id}/join`, {}, { preserveScroll: true });

    const startEditTask = (task) => {
        setEditingTaskId(task.id);
        setEditTaskData({ title: task.title, complexity_level: task.complexity_level });
    };

    const saveTaskEdit = (id) => {
        router.put(`/tasks/${id}`, editTaskData, {
            preserveScroll: true,
            onSuccess: () => setEditingTaskId(null)
        });
    };

    const deleteTask = (id) => {
        if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
            router.delete(`/tasks/${id}`, { preserveScroll: true });
        }
    };

    const toggleItem = (item, type) => {
        const list = newSprint[type].includes(item) 
            ? newSprint[type].filter(i => i !== item) 
            : [...newSprint[type], item];
        setNewSprint({ ...newSprint, [type]: list });
    };

    const checkUserAccess = (sprint) => {
        return sprint.tasks?.some(task => task.users?.some(u => u.id === auth.user.id));
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Sprints">
            <Head title="Active Sprints" />

            <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
                
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
                                        <button key={skill} type="button" onClick={() => toggleItem(skill, 'skills')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${newSprint.skills.includes(skill) ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0f0822] border border-purple-500/30 text-slate-400 hover:text-slate-200'}`}>{skill}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all">Launch Mission</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {initialSprints.map((sprint) => {
                        const sprintSkills = sprint.required_skill ? sprint.required_skill.split(',').map(s => s.trim()) : [];
                        const isSprintOver = sprint.status === 'completed' || sprint.status === 'expired';
                        const hasAccess = checkUserAccess(sprint);

                        return (
                            <div key={sprint.id} className={`bg-[#0f0822] border rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col transition-all relative ${isSprintOver ? 'border-slate-700/50 bg-[#0a0516]' : 'border-purple-500/20 hover:border-purple-500/40'}`}>
                                
                                {/* 🌟 DROPBOX KASA BUTONU */}
                                {hasAccess ? (
                                    <button 
                                        onClick={() => router.visit(route('dropbox.index'))}
                                        className="absolute top-4 sm:top-6 right-20 sm:right-28 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all group z-10"
                                        title="Open Sprint Vault"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
                                    </button>
                                ) : (
                                    <div className="absolute top-4 sm:top-6 right-20 sm:right-28 bg-slate-800/30 border border-slate-700/30 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed z-10" title="You must join a task to access this vault.">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Locked</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4 border-b border-purple-500/10 pb-3 mt-8 sm:mt-0">
                                    <div className="flex-1 pr-2 min-w-0 mt-2 sm:mt-0">
                                        
                                        {/* 🌟 SPRINT İSİM VE DÜZENLEME ALANI */}
                                        {editingSprintId === sprint.id ? (
                                            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                                <input type="text" value={editSprintData.name} onChange={e => setEditSprintData({...editSprintData, name: e.target.value})} className="bg-[#1a0b2e] border border-blue-500/50 rounded-lg text-sm text-white px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 flex-1" />
                                                <input type="date" value={editSprintData.end_date} onChange={e => setEditSprintData({...editSprintData, end_date: e.target.value})} className="bg-[#1a0b2e] border border-blue-500/50 rounded-lg text-sm text-white px-3 py-1.5 outline-none [color-scheme:dark] w-full sm:w-36" />
                                                <div className="flex gap-1">
                                                    <button onClick={() => saveSprintEdit(sprint.id)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold">💾 Save</button>
                                                    <button onClick={() => setEditingSprintId(null)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold">✖</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <h3 className={`text-base sm:text-xl font-bold truncate ${isSprintOver ? 'text-slate-500' : 'text-white'}`}>{sprint.name}</h3>
                                                {/* 🌟 SPRINT DÜZENLE/SİL BUTONLARI */}
                                                {realIsAdmin && !isSprintOver && (
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => startEditSprint(sprint)} className="text-blue-400 hover:text-blue-300 text-sm hover:scale-110 transition-transform">✏️</button>
                                                        <button onClick={() => deleteSprint(sprint.id)} className="text-red-400 hover:text-red-300 text-sm hover:scale-110 transition-transform">🗑️</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {sprintSkills.map((s, i) => (
                                                <span key={i} className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-tight ${isSprintOver ? 'bg-slate-900 text-slate-600 border-slate-800' : (availableBadges.includes(s) ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30')}`}>{s}</span>
                                            ))}
                                        </div>
                                        {editingSprintId !== sprint.id && (
                                            <p className="text-[8px] sm:text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">{sprint.status === 'expired' ? '⌛ EXPIRED' : '📅 DEADLINE'}: {sprint.end_date}</p>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggleStatus(sprint.id, sprint.status)} 
                                        disabled={isSprintOver} 
                                        className={`shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] rounded-lg uppercase font-black border transition-all ${getStatusStyle(sprint.status)} ${isSprintOver ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
                                    >
                                        {sprint.status}
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4 flex-1 overflow-y-auto max-h-[250px] sm:max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-purple-500/20">
                                    {(sprint.tasks || []).map(task => {
                                        const isJoined = task.users?.some(u => u.id === auth.user.id);
                                        const isLocked = task.is_completed || isSprintOver;

                                        return (
                                            <div key={task.id}>
                                                {/* 🌟 GÖREV SATIRI İÇİ DÜZENLEME FORMU */}
                                                {editingTaskId === task.id ? (
                                                    <div className="flex flex-col sm:flex-row gap-2 items-center w-full bg-[#1a0b2e] p-2.5 rounded-xl border border-blue-500/50 shadow-inner">
                                                        <input type="text" value={editTaskData.title} onChange={e => setEditTaskData({...editTaskData, title: e.target.value})} className="flex-1 w-full bg-transparent border-b border-blue-500/30 text-xs text-white px-2 py-1 outline-none focus:border-emerald-500 transition-colors" />
                                                        <select value={editTaskData.complexity_level} onChange={e => setEditTaskData({...editTaskData, complexity_level: parseInt(e.target.value)})} className="bg-[#0f0822] border border-blue-500/30 text-slate-300 text-xs outline-none rounded p-1">
                                                            {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}★</option>)}
                                                        </select>
                                                        <div className="flex gap-1 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                                                            <button onClick={() => saveTaskEdit(task.id)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 px-3 py-1 rounded text-xs font-bold transition-colors">💾 Kaydet</button>
                                                            <button onClick={() => setEditingTaskId(null)} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-1 rounded text-xs font-bold transition-colors">✖</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // 🌟 STANDART GÖREV SATIRI
                                                    <div className={`group flex justify-between items-center bg-[#1a0b2e] border p-2 sm:p-3 rounded-xl transition-all ${isLocked ? 'opacity-40 grayscale border-slate-800' : 'border-purple-500/10 hover:border-purple-500/30'}`}>
                                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                            <button 
                                                                onClick={() => handleToggleCompletion(task, sprint.status)} 
                                                                disabled={isLocked}
                                                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${task.is_completed ? 'bg-emerald-500 border-emerald-500 text-[#0f0822]' : 'border-slate-600 hover:border-emerald-500 text-transparent'}`}
                                                            >
                                                                {task.is_completed ? '✓' : ''}
                                                            </button>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className={`text-xs sm:text-sm truncate font-medium ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                                                                <span className="text-[7px] sm:text-[8px] text-slate-500 font-black uppercase">{task.is_completed ? 'Completed' : (isSprintOver ? 'Sprint Locked' : `${task.complexity_level}★ COMPLEXITY`)}</span>
                                                            </div>
                                                        </div>

                                                        {/* 🌟 GÖREV DÜZENLE/SİL BUTONLARI (Hover'da Çıkar) */}
                                                        {realIsAdmin && !isLocked && (
                                                            <div className="hidden group-hover:flex items-center gap-1.5 mx-2 shrink-0">
                                                                <button onClick={() => startEditTask(task)} className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-transform" title="Görevi Düzenle">✏️</button>
                                                                <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300 hover:scale-110 transition-transform" title="Görevi Sil">🗑️</button>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex -space-x-1.5">
                                                                {task.users?.slice(0, 3).map((u, i) => (
                                                                    <img key={i} src={u.avatar ? `/storage/${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-[#1a0b2e] object-cover shadow-lg" title={u.name} />
                                                                ))}
                                                            </div>
                                                            {!isLocked && !isJoined && (
                                                                <button onClick={() => handleJoinTask(task.id)} className="text-[8px] sm:text-[9px] text-emerald-400 border border-emerald-500/30 px-1.5 py-1 rounded hover:bg-emerald-500/20 font-black uppercase tracking-tighter transition-colors">JOIN</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {sprint.tasks?.length === 0 && (
                                        <div className="text-center py-8 opacity-20 text-[10px] uppercase font-black tracking-widest text-slate-400 border-2 border-dashed border-slate-800 rounded-xl">No missions assigned</div>
                                    )}
                                </div>

                                {!isSprintOver && (
                                    <div className="flex gap-1.5 mt-auto pt-3 border-t border-purple-500/10">
                                        <input 
                                            type="text" 
                                            value={newTaskData[sprint.id]?.title || ''} 
                                            placeholder="Add mission..." 
                                            className="flex-1 bg-[#1a0b2e] border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500/50 transition-colors" 
                                            onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], title: e.target.value }})} 
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(sprint.id)} 
                                        />
                                        <select 
                                            value={newTaskData[sprint.id]?.complexity || 5} 
                                            onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], complexity: parseInt(e.target.value) }})} 
                                            className="w-[45px] sm:w-[60px] bg-[#1a0b2e] text-slate-400 border border-purple-500/20 rounded-lg text-[9px] font-bold outline-none text-center appearance-none"
                                        >
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