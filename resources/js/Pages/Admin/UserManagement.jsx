import React, { useState } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import SidebarHeader from '@/Layouts/SidebarHeaderLayout';

export default function UserManagement({ auth, users, allBadges }) {
    const [editingUser, setEditingUser] = useState(null);
    const [selectedBadges, setSelectedBadges] = useState([]);

    // 🛡️ YENİ: Gözlemci Kontrolü
    const isObserver = auth.user.role === 'observer';

    const { data: userData, setData: setUserData, post: postUser, processing: userProcessing, reset: resetUser, errors: userErrors } = useForm({
        name: '', email: '', password: '', role: 'user',
    });

    const { data: badgeData, setData: setBadgeData, post: postBadge, processing: badgeProcessing, reset: resetBadge, errors: badgeErrors } = useForm({
        name: '', icon: null, category: 'frontend',
    });

    // 🛡️ YENİ: Engelleyici Fonksiyon
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

    const handleDeleteBadge = (badgeId) => {
        handleAction(() => {
            if (confirm('Are you sure you want to delete this badge?')) {
                router.delete(route('admin.badges.destroy', badgeId));
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
        // Editör açılabilir ama kaydetme butonu kilitlenecek
        setEditingUser(user);
        setSelectedBadges(user.badges.map(b => b.id));
    };

    const saveBadges = () => {
        handleAction(() => {
            router.post(route('admin.users.badges', editingUser.id), { badge_ids: selectedBadges }, { onSuccess: () => setEditingUser(null) });
        });
    };

    const toggleBadge = (badgeId) => {
        if (isObserver) return; // Gözlemci kutucukları da işaretleyemesin
        if (selectedBadges.includes(badgeId)) {
            setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
        } else {
            setSelectedBadges([...selectedBadges, badgeId]);
        }
    };

    return (
        <SidebarHeader auth={auth} pageTitle="User Management">
            <Head title="Admin Panel - Users" />

            <div className="flex flex-col gap-6 pb-10">
                
                {/* 🛡️ GÖZLEMCİ UYARI BARI */}
                {isObserver && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 text-blue-400 animate-pulse">
                        <span>🛡️</span>
                        <span className="text-xs font-black uppercase tracking-widest">Neural Link: Observer Mode Active. System is Read-Only.</span>
                    </div>
                )}

                {/* 👤 KULLANICI OLUŞTURMA PANELİ */}
                <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                    <h2 className="text-xl font-black text-white tracking-wide mb-6 uppercase">Register New User</h2>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                            <input disabled={isObserver} type="text" value={userData.name} onChange={e => setUserData('name', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                            <input disabled={isObserver} type="email" value={userData.email} onChange={e => setUserData('email', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                            <input disabled={isObserver} type="password" value={userData.password} onChange={e => setUserData('password', e.target.value)} className="bg-[#110826] border border-blue-500/30 text-slate-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 disabled:cursor-not-allowed" />
                        </div>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl text-sm font-black transition shadow-lg shadow-purple-500/20 disabled:opacity-50">
                            Register User
                        </button>
                    </form>
                </div>

                {/* 🏆 ROZET OLUŞTURMA VE SİLME PANELİ */}
                <div className={`bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl ${isObserver ? 'opacity-60' : ''}`}>
                    <h2 className="text-xl font-black text-white tracking-wide mb-6 uppercase">Manage Badges</h2>
                    <form onSubmit={handleCreateBadge} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8 border-b border-white/5 pb-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Badge Name</label>
                            <input disabled={isObserver} type="text" value={badgeData.name} onChange={e => setBadgeData('name', e.target.value)} className="bg-[#110826] border border-purple-500/30 text-slate-200 text-sm rounded-xl block w-full p-3 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                            <select disabled={isObserver} value={badgeData.category} onChange={e => setBadgeData('category', e.target.value)} className="bg-[#110826] border border-purple-500/30 text-slate-200 text-sm rounded-xl block w-full p-3 disabled:cursor-not-allowed">
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Icon (Image)</label>
                            <input disabled={isObserver} type="file" onChange={e => setBadgeData('icon', e.target.files[0])} className="block w-full text-sm text-slate-400 file:bg-purple-500/20 file:text-purple-400 disabled:cursor-not-allowed" />
                        </div>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl text-sm font-black transition">
                            Create Badge
                        </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {allBadges.map(badge => (
                            <div key={badge.id} className="relative group bg-[#110826] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2">
                                <button onClick={() => handleDeleteBadge(badge.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center transition shadow-lg">✕</button>
                                <img src={`/storage/${badge.icon}`} className="w-10 h-10 object-contain" alt="" />
                                <span className="text-white text-xs font-bold">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KULLANICI TABLOSU */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white tracking-wide mb-6 uppercase">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-sm uppercase">
                                    <th className="py-4 px-4">User</th>
                                    <th className="py-4 px-4">Role</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-white font-bold">{user.name}</td>
                                        <td className="py-4 px-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                                                disabled={isObserver || user.id === auth.user.id || user.email === 'inertia@test.com'} 
                                                className="bg-[#110826] border border-purple-500/30 text-slate-200 text-sm rounded-lg p-2 disabled:cursor-not-allowed"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="observer">Observer</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4 text-right flex justify-end gap-3">
                                            <button onClick={() => openBadgeEditor(user)} className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold">Edit Badges</button>
                                            {user.email !== 'inertia@test.com' && user.id !== auth.user.id && (
                                                <button onClick={() => handleDelete(user.id)} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold">Delete</button>
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
                    <div className="bg-[#2a1354] border border-purple-500/40 rounded-3xl p-6 shadow-2xl mt-4">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <h3 className="text-lg font-bold uppercase">Select Badges for {editingUser.name}</h3>
                            <button onClick={() => setEditingUser(null)}>✕ Close</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {allBadges.map(badge => (
                                <label key={badge.id} className={`flex items-center gap-3 p-3 bg-[#110826] border rounded-xl ${isObserver ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input disabled={isObserver} type="checkbox" checked={selectedBadges.includes(badge.id)} onChange={() => toggleBadge(badge.id)} />
                                    <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={saveBadges} className="bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-xl text-sm font-bold">Save Changes</button>
                    </div>
                )}
            </div>
        </SidebarHeader>
    );
}