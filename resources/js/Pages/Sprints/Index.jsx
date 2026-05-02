import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function SprintsIndex({ 
    auth, 
    initialSprints = [], 
    // 🌟 CONTROLLER'DAN GELEN DİNAMİK VERİLER 🌟
    availableBadges = [], 
    availableSkills = [] 
}) {
    const isAdmin = auth.user?.email === 'ayberk@test.com' || auth.user?.role === 'admin';

    // 🌟 Sadece Sprint'e Özel Stateler (İkiye Bölündü) 🌟
    const [isCreating, setIsCreating] = useState(false);
    const [newSprint, setNewSprint] = useState({ 
        name: '', 
        end_date: '', 
        badges: [], // Seçilen diller/teknolojiler
        skills: []  // Seçilen yetkinlikler
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

    // WebSockets (Gerçek Zamanlı Güncelleme)
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('sprints')
                .listen('SprintUpdated', () => {
                    router.reload({ only: ['initialSprints'], preserveState: true, preserveScroll: true });
                });
            return () => window.Echo.leaveChannel('sprints');
        }
    }, []);

    // Aksiyonlar
    const submitSprint = (e) => {
        e.preventDefault();
        
        // Formu gönderirken hem yeni ayrı kolonları hem de eskisi bozulmasın diye birleştirilmiş halini yolluyoruz.
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
        if (window.confirm(`"${task.title}" görevini bitti olarak işaretlemek istediğine emin misin?\n\n⚠️ BU İŞLEM GERİ ALINAMAZ!`)) {
            router.patch(`/tasks/${task.id}/toggle-completion`, {}, { preserveScroll: true });
        }
    };

    // 🌟 ORTAK TOGGLE FONKSİYONU (Hem Badge Hem Skill için) 🌟
    const toggleItem = (item, type) => {
        const list = newSprint[type].includes(item) 
            ? newSprint[type].filter(i => i !== item) 
            : [...newSprint[type], item];
        setNewSprint({ ...newSprint, [type]: list });
    };

    const handleJoinTask = (id) => router.post(`/tasks/${id}/join`, {}, { preserveScroll: true });
    
    // Sprint durumunu değiştirme
    const toggleStatus = (id, currentStatus) => {
        if (currentStatus === 'expired') return;
        const nextStatus = currentStatus === 'planned' ? 'active' : 'completed';
        router.put(`/sprints/${id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Active Sprints">
            <Head title="Active Sprints" />

            {/* 📌 SPRINT PANELİ */}
            <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl p-8">
                <div className="flex justify-between items-center mb-8 border-b border-purple-500/20 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Sprint & Task Management</h2>
                        <p className="text-emerald-400 text-xs mt-1 animate-pulse">🟢 WebSockets Active</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setIsCreating(!isCreating)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all">
                            {isCreating ? '✖ Cancel' : '➕ Create Sprint'}
                        </button>
                    )}
                </div>

                {/* Create Form */}
                {isCreating && isAdmin && (
                    <form onSubmit={submitSprint} className="bg-[#0f0822] p-6 rounded-2xl border border-emerald-500/30 mb-8 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 shadow-xl">
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Sprint Name</label>
                                <input type="text" required value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} className="w-full bg-[#1a0b2e] border border-purple-500/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Deadline</label>
                                <input type="date" required value={newSprint.end_date} onChange={e => setNewSprint({...newSprint, end_date: e.target.value})} className="w-full bg-[#1a0b2e] border border-purple-500/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]" />
                            </div>
                        </div>

                        {/* 🌟 İKİ KUTULU SEÇİM ALANI 🌟 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#160d33] p-5 rounded-xl border border-purple-500/10">
                            
                            {/* SOL: TECH STACK (Badges) */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-purple-400 tracking-widest uppercase border-b border-purple-500/20 pb-2 mb-1">Tech Stack (Badges)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableBadges.map(badge => (
                                        <button
                                            key={badge}
                                            type="button"
                                            onClick={() => toggleItem(badge, 'badges')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                newSprint.badges.includes(badge)
                                                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] border-transparent'
                                                    : 'bg-[#0f0822] border border-purple-500/30 text-slate-400 hover:border-purple-500/80 hover:text-slate-200'
                                            }`}
                                        >
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SAĞ: CORE SKILLS */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-blue-400 tracking-widest uppercase border-b border-blue-500/20 pb-2 mb-1">Required Core Skills</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableSkills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleItem(skill, 'skills')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                newSprint.skills.includes(skill)
                                                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border-transparent'
                                                    : 'bg-[#0f0822] border border-blue-500/30 text-slate-400 hover:border-blue-500/80 hover:text-slate-200'
                                            }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-black tracking-wide text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_25px_rgba(5,150,105,0.6)] transition-all">Launch Sprint</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {initialSprints.map((sprint) => {
                        // Veritabanından gelen veriyi ayıklama
                        const sprintSkills = sprint.required_skill ? sprint.required_skill.split(',').map(s => s.trim()) : [];
                        
                        return (
                            <div key={sprint.id} className={`bg-[#0f0822] border rounded-2xl p-6 shadow-lg flex flex-col ${sprint.status === 'expired' ? 'border-red-500/20 opacity-80' : 'border-purple-500/20'}`}>
                                
                                {/* Sprint Başlık ve Durum */}
                                <div className="flex justify-between items-start mb-5 border-b border-purple-500/10 pb-3 group">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-xl font-bold text-white truncate max-w-[200px]">{sprint.name}</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {/* Kartın içindeki yetenek etiketleri */}
                                            {sprintSkills.map((s, i) => {
                                                // Eğer bu etiket Badges tablosundan geldiyse mor, Skills tablosundan geldiyse mavi yap
                                                const isBadge = availableBadges.includes(s);
                                                return (
                                                    <span key={i} className={`text-[9px] px-2 py-0.5 rounded-md border uppercase font-bold tracking-wider ${
                                                        isBadge ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                                    }`}>
                                                        {s}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-3 font-medium tracking-wide">{sprint.status === 'expired' ? '⏳ EXPIRED: ' : '📅 DEADLINE: '} {sprint.end_date}</p>
                                    </div>
                                    <button onClick={() => toggleStatus(sprint.id, sprint.status)} disabled={sprint.status === 'expired'} className={`px-3 py-1.5 text-[10px] rounded-lg uppercase font-black border transition-all ${getStatusStyle(sprint.status)}`}>
                                        {sprint.status}
                                    </button>
                                </div>

                                {/* Görevler Listesi */}
                                <div className="space-y-3 mb-6 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-purple-500/20">
                                    {(sprint.tasks || []).map(task => {
                                        const isJoined = task.users?.some(u => u.id === auth.user.id);
                                        const isLocked = task.is_completed;

                                        return (
                                            <div key={task.id} className={`flex justify-between items-center bg-[#1a0b2e] border p-3 rounded-xl transition-all duration-500 ${isLocked ? 'opacity-30 grayscale pointer-events-none border-slate-800' : 'border-purple-500/10 hover:border-purple-500/30'}`}>
                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <button onClick={() => handleToggleCompletion(task)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${isLocked ? 'bg-emerald-500 border-emerald-500 text-[#0f0822] cursor-default' : 'border-slate-600 hover:border-emerald-500 text-transparent'}`}>
                                                        {isLocked ? '✓' : ''}
                                                    </button>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className={`text-sm truncate font-medium ${isLocked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                                                        {isLocked ? (
                                                            <span className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">🔒 COMPLETED</span>
                                                        ) : (
                                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{task.complexity_level}★ COMPLEXITY</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {task.users?.map((u, i) => (
                                                            <img key={i} src={u.avatar ? `/storage/${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`} className="w-7 h-7 rounded-full border-2 border-[#1a0b2e] object-cover" />
                                                        ))}
                                                    </div>
                                                    {!isLocked && sprint.status !== 'expired' && !isJoined && (
                                                        <button onClick={() => handleJoinTask(task.id)} className="text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md hover:bg-emerald-500/20 font-bold transition-all">
                                                            🙋‍♂️ JOIN
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Görev Ekleme Formu */}
                                {sprint.status !== 'expired' && (
                                    <div className="flex gap-2 mt-auto pt-4 border-t border-purple-500/10">
                                        <input type="text" value={newTaskData[sprint.id]?.title || ''} placeholder="New mission..." className="flex-1 bg-[#1a0b2e] border border-purple-500/20 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], title: e.target.value }})} onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(sprint.id)} />
                                        <select value={newTaskData[sprint.id]?.complexity || 5} onChange={(e) => setNewTaskData({...newTaskData, [sprint.id]: { ...newTaskData[sprint.id], complexity: parseInt(e.target.value) }})} className="w-[64px] bg-[#1a0b2e] text-slate-300 border border-purple-500/20 rounded-xl text-[10px] font-bold outline-none cursor-pointer appearance-none text-center">
                                            {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}★</option>)}
                                        </select>
                                        <button onClick={() => handleCreateTask(sprint.id)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black transition-all">ADD</button>
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