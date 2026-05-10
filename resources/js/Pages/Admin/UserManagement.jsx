import React, { useState } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import SidebarHeader from '@/Layouts/SidebarHeaderLayout';

export default function UserManagement({ auth, users, allBadges, allSkills = [] }) {
    const [editingUser, setEditingUser] = useState(null);
    const [selectedBadges, setSelectedBadges] = useState([]);
    const [editingUserSkills, setEditingUserSkills] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState({});

    const isObserver = auth.user.role === 'observer';

    const { data: userData, setData: setUserData, post: postUser, reset: resetUser } = useForm({
        name: '', email: '', password: '', role: 'user',
    });

    const { data: badgeData, setData: setBadgeData, post: postBadge, reset: resetBadge } = useForm({
        name: '', icon: null, category: 'frontend',
    });

    const { data: skillData, setData: setSkillData, post: postSkill, reset: resetSkill } = useForm({
        name: '',
    });

    const handleAction = (callback) => {
        if (isObserver) {
            alert('🚫 SYSTEM DENIED: Observer Mode Active.');
            return;
        }
        callback();
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        handleAction(() => {
            postUser(route('admin.users.store'), { onSuccess: () => { resetUser(); alert('User created! 🚀'); } });
        });
    };

    const handleCreateBadge = (e) => {
        e.preventDefault();
        handleAction(() => {
            postBadge(route('admin.badges.store'), { onSuccess: () => { resetBadge(); alert('Badge created! 🏆'); } });
        });
    };

    const handleCreateSkill = (e) => {
        e.preventDefault();
        handleAction(() => {
            postSkill(route('admin.skills.store'), { onSuccess: () => { resetSkill(); alert('Skill created! 🎯'); } });
        });
    };

    const handleDeleteBadge = (badgeId) => {
        handleAction(() => {
            if (confirm('Delete badge?')) router.delete(route('admin.badges.destroy', badgeId));
        });
    };

    const handleDeleteSkill = (skillId) => {
        handleAction(() => {
            if (confirm('Delete skill?')) router.delete(route('admin.skills.destroy', skillId));
        });
    };

    const handleRoleChange = (userId, newRole) => {
        handleAction(() => {
            router.put(route('admin.users.role', userId), { role: newRole });
        });
    };

    const handleDelete = (userId) => {
        handleAction(() => {
            if (confirm('Delete user?')) router.delete(route('admin.users.destroy', userId));
        });
    };

    const openBadgeEditor = (user) => {
        setEditingUser(user);
        setSelectedBadges(user.badges.map(b => b.id));
    };

    const saveBadges = () => {
        handleAction(() => {
            router.post(route('admin.users.badges', editingUser.id), { badge_ids: selectedBadges }, { onSuccess: () => setEditingUser(null) });
        });
    };

    const toggleBadge = (badgeId) => {
        if (isObserver) return;
        setSelectedBadges(prev => prev.includes(badgeId) ? prev.filter(id => id !== badgeId) : [...prev, badgeId]);
    };

    const openSkillEditor = (user) => {
        const initialSkills = {};
        if (user.skills) {
            user.skills.forEach(skill => {
                initialSkills[skill.id] = skill.pivot?.proficiency_level || 1;
            });
        }
        setSelectedSkills(initialSkills);
        setEditingUserSkills(user);
    };

    const toggleSkill = (skillId) => {
        if (isObserver) return;
        const updated = { ...selectedSkills };
        if (updated.hasOwnProperty(skillId)) delete updated[skillId];
        else updated[skillId] = 1;
        setSelectedSkills(updated);
    };

    const updateSkillLevel = (skillId, level) => {
        if (isObserver) return;
        let val = Math.min(Math.max(parseInt(level) || 1, 1), 10);
        setSelectedSkills({ ...selectedSkills, [skillId]: val });
    };

    const saveSkills = () => {
        handleAction(() => {
            const formatted = Object.entries(selectedSkills).map(([id, level]) => ({ id: parseInt(id), level }));
            router.post(route('admin.users.skills', editingUserSkills.id), { skills: formatted }, { onSuccess: () => setEditingUserSkills(null) });
        });
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Management">
            <Head title="Admin Panel" />

            <div className="flex flex-col gap-6 pb-20 px-2 sm:px-0">
                
                {/* 🛡️ OBSERVER ALERT */}
                {isObserver && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 text-blue-400">
                        <span className="text-xl">🛡️</span>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Observer Mode: Read-Only Access.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 👤 REGISTER USER CARD */}
                    <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                        <h2 className="text-base sm:text-xl font-black text-white tracking-wide mb-6 uppercase">Register User</h2>
                        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Name</label>
                                    <input disabled={isObserver} type="text" value={userData.name} onChange={e => setUserData('name', e.target.value)} className="bg-[#0f0822] border border-blue-500/30 text-white text-sm rounded-xl w-full p-3 focus:ring-blue-500" placeholder="Ayberk Arda" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email</label>
                                    <input disabled={isObserver} type="email" value={userData.email} onChange={e => setUserData('email', e.target.value)} className="bg-[#0f0822] border border-blue-500/30 text-white text-sm rounded-xl w-full p-3 focus:ring-blue-500" placeholder="arda@test.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Password</label>
                                <input disabled={isObserver} type="password" value={userData.password} onChange={e => setUserData('password', e.target.value)} className="bg-[#0f0822] border border-blue-500/30 text-white text-sm rounded-xl w-full p-3 focus:ring-blue-500" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-black transition shadow-lg shadow-blue-500/20 uppercase tracking-widest">Register</button>
                        </form>
                    </div>

                    {/* 🎯 MANAGE SKILLS CARD */}
                    <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                        <h2 className="text-base sm:text-xl font-black text-white tracking-wide mb-6 uppercase">Manage Skills</h2>
                        <form onSubmit={handleCreateSkill} className="flex flex-col gap-4 mb-6">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0">Skill Name</label>
                            <div className="flex gap-2">
                                <input disabled={isObserver} type="text" value={skillData.name} onChange={e => setSkillData('name', e.target.value)} className="bg-[#0f0822] border border-emerald-500/30 text-white text-sm rounded-xl flex-1 p-3 focus:ring-emerald-500" placeholder="e.g. Laravel" />
                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 rounded-xl text-xs font-black transition">Add</button>
                            </div>
                        </form>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
                            {allSkills.map(skill => (
                                <div key={skill.id} className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 group">
                                    <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-tighter">{skill.name}</span>
                                    <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-400 hover:text-red-300 transition font-black">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🏆 MANAGE BADGES CARD */}
                <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                    <h2 className="text-base sm:text-xl font-black text-white tracking-wide mb-6 uppercase">Manage Badges</h2>
                    <form onSubmit={handleCreateBadge} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 border-b border-white/5 pb-8">
                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Badge Name</label>
                            <input disabled={isObserver} type="text" value={badgeData.name} onChange={e => setBadgeData('name', e.target.value)} className="bg-[#0f0822] border border-purple-500/30 text-white text-sm rounded-xl w-full p-3" placeholder="React" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Category</label>
                            <select disabled={isObserver} value={badgeData.category} onChange={e => setBadgeData('category', e.target.value)} className="bg-[#0f0822] border border-purple-500/30 text-white text-sm rounded-xl w-full p-3">
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Icon</label>
                            <input disabled={isObserver} type="file" onChange={e => setBadgeData('icon', e.target.files[0])} className="text-[10px] text-slate-400 file:bg-purple-500/20 file:text-purple-400 file:px-3 file:py-2 file:rounded-xl file:border-0" />
                        </div>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-black transition">Create Badge</button>
                    </form>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {allBadges.map(badge => (
                            <div key={badge.id} className="relative bg-[#0f0822] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 group">
                                <button onClick={() => handleDeleteBadge(badge.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl z-10">✕</button>
                                <img src={`/storage/${badge.icon}`} className="w-10 h-10 object-contain" alt="" />
                                <span className="text-white text-[10px] font-bold text-center">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 👥 USER TABLE CARD */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden">
                    <h2 className="text-base sm:text-xl font-black text-white tracking-wide mb-6 uppercase">User Management</h2>
                    <div className="overflow-x-auto -mx-5 sm:mx-0">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <tr>
                                    <th className="py-4 px-6">User / Identity</th>
                                    <th className="py-4 px-6">Access Role</th>
                                    <th className="py-4 px-6 text-right">Neural Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-5 px-6">
                                            <div className="font-black text-white text-sm">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 font-bold">{user.email}</div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                                                disabled={isObserver || user.id === auth.user.id || user.email === 'inertia@test.com'} 
                                                className="bg-[#0f0822] border border-purple-500/30 text-slate-200 text-xs rounded-xl p-2 focus:ring-purple-500"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="observer">Observer</option>
                                            </select>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openBadgeEditor(user)} className="bg-purple-500/10 text-purple-400 px-3 py-2 rounded-xl text-[10px] font-black hover:bg-purple-500/20 transition">Badges</button>
                                                <button onClick={() => openSkillEditor(user)} className="bg-blue-500/10 text-blue-400 px-3 py-2 rounded-xl text-[10px] font-black hover:bg-blue-500/20 transition border border-blue-500/20">Skills</button>
                                                {user.email !== 'inertia@test.com' && user.id !== auth.user.id && (
                                                    <button onClick={() => handleDelete(user.id)} className="bg-red-500/10 text-red-400 px-3 py-2 rounded-xl text-[10px] font-black hover:bg-red-500/20 transition">Delete</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL: BADGES */}
                {editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-[#1a0b2e] border border-purple-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-white uppercase italic">Syncing Badges: <span className="text-purple-400">{editingUser.name}</span></h3>
                                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                                {allBadges.map(badge => (
                                    <label key={badge.id} className={`flex items-center gap-3 p-4 bg-[#0f0822] border rounded-2xl transition cursor-pointer ${selectedBadges.includes(badge.id) ? 'border-purple-500 bg-purple-500/10' : 'border-white/5'}`}>
                                        <input type="checkbox" checked={selectedBadges.includes(badge.id)} onChange={() => toggleBadge(badge.id)} className="rounded text-purple-600 bg-black/50 border-white/20 focus:ring-0 w-5 h-5" />
                                        <img src={`/storage/${badge.icon}`} className="w-8 h-8 object-contain" alt="" />
                                        <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-auto">
                                <button onClick={() => setEditingUser(null)} className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 hover:text-white transition uppercase">Cancel</button>
                                <button onClick={saveBadges} className="bg-emerald-600 text-white px-10 py-3 rounded-xl text-xs font-black hover:bg-emerald-500 transition shadow-2xl">Save Neural Links</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: SKILLS */}
                {editingUserSkills && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-[#0f0822] border border-blue-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-white uppercase italic">Calibrating Skills: <span className="text-blue-400">{editingUserSkills.name}</span></h3>
                                <button onClick={() => setEditingUserSkills(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
                            </div>
                            <div className="flex flex-col gap-3 mb-10">
                                {allSkills.map(skill => {
                                    const active = selectedSkills.hasOwnProperty(skill.id);
                                    return (
                                        <div key={skill.id} className={`flex flex-col gap-3 p-4 bg-[#160d33] border rounded-2xl transition ${active ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`}>
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input type="checkbox" checked={active} onChange={() => toggleSkill(skill.id)} className="rounded text-blue-600 bg-black/50 border-white/20 focus:ring-0 w-5 h-5" />
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">{skill.name}</span>
                                                </label>
                                                {active && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-blue-400 uppercase">LVL:</span>
                                                        <input 
                                                            type="number" 
                                                            min="1" max="10" 
                                                            value={selectedSkills[skill.id] || 1} 
                                                            onChange={(e) => updateSkillLevel(skill.id, e.target.value)} 
                                                            className="w-16 bg-[#0f0822] border border-blue-500/30 text-blue-300 text-xs font-black rounded-lg p-2 text-center focus:ring-0" 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button onClick={() => setEditingUserSkills(null)} className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 hover:text-white transition uppercase">Abort</button>
                                <button onClick={saveSkills} className="bg-blue-600 text-white px-10 py-3 rounded-xl text-xs font-black hover:bg-blue-500 transition shadow-2xl uppercase">Upload Skills</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarHeader>
    );
}