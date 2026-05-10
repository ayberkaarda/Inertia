import React, { useState } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import SidebarHeader from '@/Layouts/SidebarHeaderLayout';

export default function UserManagement({ auth, users, allBadges, allSkills = [] }) {
    const [editingUser, setEditingUser] = useState(null);
    const [selectedBadges, setSelectedBadges] = useState([]);

    const [editingUserSkills, setEditingUserSkills] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState({});

    // 🛡️ Gözlemci Kontrolü
    const isObserver = auth.user.role === 'observer';

    const { data: userData, setData: setUserData, post: postUser, reset: resetUser } = useForm({
        name: '', email: '', password: '', role: 'user',
    });

    const { data: badgeData, setData: setBadgeData, post: postBadge, reset: resetBadge } = useForm({
        name: '', icon: null, category: 'frontend',
    });

    // 🌟 YENİ: Yetenek ekleme formu state'i
    const { data: skillData, setData: setSkillData, post: postSkill, reset: resetSkill } = useForm({
        name: '',
    });

    const handleAction = (callback) => {
        if (isObserver) {
            alert('🚫 SYSTEM DENIED: You are in Observer Mode. Changes are not allowed.');
            return;
        }
        callback();
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        handleAction(() => {
            postUser(route('admin.users.store'), { onSuccess: () => { resetUser(); alert('User created successfully! 🚀'); } });
        });
    };

    const handleCreateBadge = (e) => {
        e.preventDefault();
        handleAction(() => {
            postBadge(route('admin.badges.store'), { onSuccess: () => { resetBadge(); alert('Badge created successfully! 🏆'); } });
        });
    };

    // 🌟 YENİ: Yetenek Oluşturma Fonksiyonu
    const handleCreateSkill = (e) => {
        e.preventDefault();
        handleAction(() => {
            postSkill(route('admin.skills.store'), { onSuccess: () => { resetSkill(); alert('Skill created successfully! 🎯'); } });
        });
    };

    const handleDeleteBadge = (badgeId) => {
        handleAction(() => {
            if (confirm('Are you sure you want to delete this badge?')) {
                router.delete(route('admin.badges.destroy', badgeId));
            }
        });
    };

    // 🌟 YENİ: Yetenek Silme Fonksiyonu
    const handleDeleteSkill = (skillId) => {
        handleAction(() => {
            if (confirm('Are you sure you want to delete this skill?')) {
                router.delete(route('admin.skills.destroy', skillId));
            }
        });
    };

    const handleRoleChange = (userId, newRole) => {
        handleAction(() => {
            router.put(route('admin.users.role', userId), { role: newRole });
        });
    };

    const handleDelete = (userId) => {
        handleAction(() => {
            if (confirm('Are you sure you want to delete this user?')) {
                router.delete(route('admin.users.destroy', userId));
            }
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
        if (selectedBadges.includes(badgeId)) {
            setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
        } else {
            setSelectedBadges([...selectedBadges, badgeId]);
        }
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
        if (updated.hasOwnProperty(skillId)) {
            delete updated[skillId]; 
        } else {
            updated[skillId] = 1; 
        }
        setSelectedSkills(updated);
    };

    const updateSkillLevel = (skillId, level) => {
        if (isObserver) return;
        // 🌟 Max kontrolünü form içinde de zorluyoruz (10)
        let parsedLevel = parseInt(level) || 1;
        if (parsedLevel > 10) parsedLevel = 10;
        if (parsedLevel < 1) parsedLevel = 1;
        
        setSelectedSkills({ ...selectedSkills, [skillId]: parsedLevel });
    };

    const saveSkills = () => {
        handleAction(() => {
            const formattedSkills = Object.entries(selectedSkills).map(([id, level]) => ({
                id: parseInt(id),
                level: level
            }));

            router.post(route('admin.users.skills', editingUserSkills.id), { skills: formattedSkills }, { 
                onSuccess: () => setEditingUserSkills(null) 
            });
        });
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Management">
            <Head title="Admin Panel - Users" />

            <div className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-10 px-1 sm:px-0 mt-2 sm:mt-0">
                {isObserver && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-blue-400 animate-pulse">
                        <span className="text-base sm:text-xl">🛡️</span>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-tight">Neural Link: Observer Mode Active. Read-Only Access.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {/* 👤 KULLANICI OLUŞTURMA PANELİ */}
                    <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                        <h2 className="text-sm sm:text-xl font-black text-white tracking-wide mb-4 sm:mb-6 uppercase">Register New User</h2>
                        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Full Name</label>
                                <input disabled={isObserver} type="text" value={userData.name} onChange={e => setUserData('name', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed" placeholder="Ayberk Arda" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Email</label>
                                <input disabled={isObserver} type="email" value={userData.email} onChange={e => setUserData('email', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed" placeholder="ayberk20arda@gmail.com" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Password</label>
                                <input disabled={isObserver} type="password" value={userData.password} onChange={e => setUserData('password', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 mt-2 text-white w-full py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-sm font-black transition shadow-lg shadow-blue-500/20">
                                Register User
                            </button>
                        </form>
                    </div>

                    {/* 🎯 YETENEK (SKILL) OLUŞTURMA PANELİ */}
                    <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                        <h2 className="text-sm sm:text-xl font-black text-white tracking-wide mb-4 sm:mb-6 uppercase">Manage Skills</h2>
                        <form onSubmit={handleCreateSkill} className="flex flex-col gap-4 border-b border-white/5 pb-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Skill Name</label>
                                <input disabled={isObserver} type="text" value={skillData.name} onChange={e => setSkillData('name', e.target.value)} className="bg-[#110826] border border-emerald-500/30 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed" placeholder="e.g. PHP, Laravel, Angular..." />
                            </div>
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-sm font-black transition shadow-lg shadow-emerald-500/20">
                                Create New Skill
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {allSkills.map(skill => (
                                <div key={skill.id} className="relative group bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <span className="text-emerald-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase">{skill.name}</span>
                                    <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-400 hover:text-red-300 transition text-xs font-black ml-1">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🏆 ROZET OLUŞTURMA PANELİ */}
                <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                    <h2 className="text-sm sm:text-xl font-black text-white tracking-wide mb-4 sm:mb-6 uppercase">Manage Badges</h2>
                    <form onSubmit={handleCreateBadge} className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-end mb-6 sm:mb-8 border-b border-white/5 pb-6 sm:pb-8">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Badge Name</label>
                            <input disabled={isObserver} type="text" value={badgeData.name} onChange={e => setBadgeData('name', e.target.value)} className="bg-[#110826] border border-purple-500/30 text-slate-200 text-xs sm:text-sm rounded-xl block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed" placeholder="e.g. React" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Category</label>
                            <select disabled={isObserver} value={badgeData.category} onChange={e => setBadgeData('category', e.target.value)} className="bg-[#110826] border border-purple-500/30 text-slate-200 text-xs sm:text-sm rounded-xl block w-full p-2.5 sm:p-3 disabled:cursor-not-allowed">
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 sm:mb-2">Icon</label>
                            <input disabled={isObserver} type="file" onChange={e => setBadgeData('icon', e.target.files[0])} className="block w-full text-[10px] sm:text-xs text-slate-400 file:bg-purple-500/20 file:text-purple-400 file:px-3 file:py-1 file:rounded-lg file:border-0 file:mr-2 disabled:cursor-not-allowed" />
                        </div>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white w-full py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-sm font-black transition">
                            Create Badge
                        </button>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {allBadges.map(badge => (
                            <div key={badge.id} className="relative group bg-[#110826] border border-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 sm:gap-2">
                                <button onClick={() => handleDeleteBadge(badge.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-[8px] flex items-center justify-center transition shadow-lg z-20">✕</button>
                                <img src={`/storage/${badge.icon}`} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" alt="" />
                                <span className="text-white text-[10px] sm:text-xs font-bold truncate w-full text-center">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KULLANICI TABLOSU */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
                    <h2 className="text-base sm:text-2xl font-black text-white tracking-wide mb-4 sm:mb-6 uppercase">User Management</h2>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 pb-2">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-[10px] sm:text-sm uppercase tracking-widest">
                                    <th className="py-3 sm:py-4 px-2 sm:px-4">User</th>
                                    <th className="py-3 sm:py-4 px-2 sm:px-4">Role</th>
                                    <th className="py-3 sm:py-4 px-2 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                                            <div className="font-bold text-white text-xs sm:text-base">{user.name}</div>
                                            <div className="text-[10px] sm:text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                                                disabled={isObserver || user.id === auth.user.id || user.email === 'inertia@test.com'} 
                                                className="bg-[#110826] border border-purple-500/30 text-slate-200 text-[10px] sm:text-sm rounded-lg p-1.5 sm:p-2 disabled:cursor-not-allowed focus:ring-purple-500"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="observer">Observer</option>
                                            </select>
                                        </td>
                                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-right flex justify-end gap-1.5 sm:gap-3">
                                            <button onClick={() => openBadgeEditor(user)} className="bg-purple-500/20 text-purple-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-purple-500/30 transition">Edit Badges</button>
                                            
                                            <button onClick={() => openSkillEditor(user)} className="bg-blue-500/20 text-blue-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-blue-500/30 transition border border-blue-500/20">Edit Skills</button>
                                            
                                            {user.email !== 'inertia@test.com' && user.id !== auth.user.id && (
                                                <button onClick={() => handleDelete(user.id)} className="bg-red-500/20 text-red-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-red-500/30 transition">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL (Edit Badges) */}
                {editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[#1a0b2e] border border-purple-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-tight">Select Badges for <span className="text-purple-400">{editingUser.name}</span></h3>
                                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                                {allBadges.map(badge => (
                                    <label key={badge.id} className={`flex items-center gap-3 p-3 bg-[#110826] border rounded-xl transition ${selectedBadges.includes(badge.id) ? 'border-purple-500 bg-purple-500/10' : 'border-white/5'} ${isObserver ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        <input disabled={isObserver} type="checkbox" checked={selectedBadges.includes(badge.id)} onChange={() => toggleBadge(badge.id)} className="rounded text-purple-600 bg-black/50 border-white/20 focus:ring-0" />
                                        <img src={`/storage/${badge.icon}`} className="w-6 h-6 object-contain" alt="" />
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-200">{badge.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingUser(null)} className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition">Cancel</button>
                                <button onClick={saveBadges} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 sm:px-8 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-500/30 transition shadow-[0_0_15px_rgba(16,185,129,0.2)]">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL (Edit Skills & Levels) */}
                {editingUserSkills && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[#110826] border border-blue-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-tight">Assign Skills for <span className="text-blue-400">{editingUserSkills.name}</span></h3>
                                <button onClick={() => setEditingUserSkills(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-8">
                                {allSkills && allSkills.length > 0 ? allSkills.map(skill => {
                                    const isSelected = selectedSkills.hasOwnProperty(skill.id);
                                    return (
                                        <div key={skill.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#160d33] border rounded-xl transition ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'} ${isObserver ? 'opacity-50' : ''}`}>
                                            <label className={`flex items-center gap-3 ${isObserver ? 'cursor-not-allowed' : 'cursor-pointer'} flex-1`}>
                                                <input disabled={isObserver} type="checkbox" checked={isSelected} onChange={() => toggleSkill(skill.id)} className="rounded text-blue-600 bg-black/50 border-white/20 focus:ring-0" />
                                                <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-widest">{skill.name}</span>
                                            </label>
                                            
                                            {isSelected && (
                                                <div className="flex items-center gap-2 sm:ml-auto">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Level:</span>
                                                    {/* 🌟 MAX = 10 OLARAK GÜNCELLENDİ */}
                                                    <input 
                                                        disabled={isObserver} 
                                                        type="number" 
                                                        min="1" max="10" 
                                                        value={selectedSkills[skill.id] || 1} 
                                                        onChange={(e) => updateSkillLevel(skill.id, e.target.value)} 
                                                        className="w-16 sm:w-20 bg-black/50 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg p-1.5 text-center focus:ring-blue-500" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : <p className="text-slate-500 text-sm italic">No skills available in the system.</p>}
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingUserSkills(null)} className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition">Cancel</button>
                                <button onClick={saveSkills} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 sm:px-8 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-500/30 transition shadow-[0_0_15px_rgba(16,185,129,0.2)]">Save Skills</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarHeader>
    );
}