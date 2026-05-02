import React, { useState } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react'; // useForm eklendi
import SidebarHeader from '@/Layouts/SidebarHeaderLayout';

export default function UserManagement({ auth, users, allBadges }) {
    const [editingUser, setEditingUser] = useState(null);
    const [selectedBadges, setSelectedBadges] = useState([]);

    // 🚀 Yeni Rozet Oluşturma Formu
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        icon: null,
    });

    const handleCreateBadge = (e) => {
        e.preventDefault();
        post(route('admin.badges.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleRoleChange = (userId, newRole) => {
        router.put(route('admin.users.role', userId), { role: newRole });
    };

    const handleDelete = (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', userId));
        }
    };

    const openBadgeEditor = (user) => {
        setEditingUser(user);
        setSelectedBadges(user.badges.map(b => b.id));
    };

    const saveBadges = () => {
        router.post(route('admin.users.badges', editingUser.id), { badge_ids: selectedBadges }, {
            onSuccess: () => setEditingUser(null)
        });
    };

    const toggleBadge = (badgeId) => {
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
                
                {/* 🏆 YENİ: ROZET OLUŞTURMA PANELİ */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-black text-white tracking-wide mb-6">Create New Badge</h2>
                    <form onSubmit={handleCreateBadge} className="flex flex-wrap items-end gap-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Badge Name</label>
                            <input 
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="bg-[#110826] border border-purple-500/30 text-slate-200 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3"
                                placeholder="e.g. Vue.js or React"
                            />
                            {errors.name && <div className="text-red-400 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Badge Icon (Image)</label>
                            <input 
                                type="file"
                                onChange={e => setData('icon', e.target.files[0])}
                                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                            />
                            {errors.icon && <div className="text-red-400 text-xs mt-1">{errors.icon}</div>}
                        </div>

                        <button 
                            type="submit"
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl text-sm font-black transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            {processing ? 'Uploading...' : 'Create Badge'}
                        </button>
                    </form>
                </div>

                {/* KULLANICI LİSTESİ TABLOSU */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white tracking-wide">User & Role Management</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-sm uppercase tracking-widest">
                                    <th className="py-4 px-4">User</th>
                                    <th className="py-4 px-4">Role</th>
                                    <th className="py-4 px-4">Badges</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-white">{user.name}</div>
                                            <div className="text-xs text-slate-400">{user.email}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={user.id === auth.user.id}
                                                className="bg-[#110826] border border-purple-500/30 text-slate-200 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
                                            >
                                                <option value="user">General User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.badges.length > 0 ? user.badges.map(b => (
                                                    <div key={b.id} className="flex items-center gap-1.5 bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-1 rounded">
                                                        <img src={`/storage/${b.icon}`} className="w-4 h-4 object-contain" alt="" />
                                                        <span className="text-[10px] font-bold">{b.name}</span>
                                                    </div>
                                                )) : <span className="text-slate-500 text-xs">No Badges</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right flex justify-end gap-3">
                                            <button 
                                                onClick={() => openBadgeEditor(user)}
                                                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                            >
                                                Edit Badges
                                            </button>
                                            {user.id !== auth.user.id && (
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ROZET DÜZENLEME PANELİ (MODAL GİBİ) */}
                {editingUser && (
                    <div className="bg-[#2a1354] border border-purple-500/40 rounded-3xl p-6 shadow-2xl mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Select Badges for <span className="text-purple-400">{editingUser.name}</span></h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕ Close</button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                            {allBadges.map(badge => (
                                <label key={badge.id} className={`flex items-center gap-3 p-3 bg-[#110826] border rounded-xl cursor-pointer transition ${selectedBadges.includes(badge.id) ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 hover:border-purple-500/30'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox text-purple-500 rounded bg-white/10 border-white/20 focus:ring-0 focus:ring-offset-0"
                                        checked={selectedBadges.includes(badge.id)}
                                        onChange={() => toggleBadge(badge.id)}
                                    />
                                    <img src={`/storage/${badge.icon}`} className="w-6 h-6 object-contain" alt={badge.name} />
                                    <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={saveBadges}
                                className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/40 px-6 py-2 rounded-xl text-sm font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SidebarHeader>
    );
}