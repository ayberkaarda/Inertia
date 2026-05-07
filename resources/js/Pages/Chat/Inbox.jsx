import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebarheader from '@/Layouts/SidebarHeaderLayout';

export default function Inbox({ auth, conversations }) {
    return (
        <Sidebarheader
            pageTitle="Inbox"
        >
            <Head title="Inbox" />

            <div className="flex flex-col gap-6 pb-10 max-w-5xl mx-auto mt-6">
                
                {/* Siberpunk Çerçeve (Ana Kutu) - Glassmorphism Efekti */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-2xl overflow-hidden relative">
                    
                    {/* Arka Plan Deseni (Hafif Matrix Noktaları) */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* Başlık Alanı */}
                    <div className="p-6 border-b border-purple-500/20 flex justify-between items-center bg-[#0f0822]/50 relative z-10">
                        <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-3 drop-shadow-md">
                            <span className="text-purple-500">💬</span> Chat History
                        </h3>
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                            {conversations.length} active conversations
                        </span>
                    </div>

                    {/* Mesaj Listesi */}
                    <div className="divide-y divide-purple-500/10 relative z-10">
                        {conversations.length === 0 ? (
                            // Hiç mesaj yoksa gösterilecek siberpunk boş durum tasarımı
                            <div className="p-16 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-inner transform transition-transform hover:scale-105">
                                    <svg className="w-10 h-10 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-slate-300 font-bold tracking-wide">No active conversations</p>
                                <p className="text-slate-500 text-sm mt-2">Start a new conversation to get started.</p>
                            </div>
                        ) : (
                            // Mesajları döngüye al
                            conversations.map((chat) => {
                                // Avatar Güvenliği (Resim yoksa UI Avatar kullan)
                                const receiverAvatar = chat.other_user.avatar 
                                    ? `/storage/${chat.other_user.avatar}` 
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.other_user.name)}&background=1a0b2e&color=8b5cf6&bold=true&size=128`;

                                return (
                                    <Link
                                        key={chat.id}
                                        href={`/chat/${chat.other_user.id}`}
                                        className="flex items-center justify-between p-5 hover:bg-purple-500/10 transition-all duration-300 ease-in-out group"
                                    >
                                        <div className="flex items-center space-x-5">
                                            
                                            {/* Profil Fotoğrafı / Neon Avatar */}
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-[#1a0b2e] flex items-center justify-center overflow-hidden border-2 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-all duration-300 group-hover:-rotate-3">
                                                    <img src={receiverAvatar} alt={chat.other_user.name} className="w-full h-full object-cover" />
                                                </div>
                                                {/* Aktif Işığı */}
                                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#160d33] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            </div>
                                            
                                            {/* İsim ve Son Mesaj */}
                                            <div className="flex flex-col justify-center">
                                                <h4 className="text-slate-200 font-black tracking-wide group-hover:text-purple-400 transition-colors drop-shadow-sm">
                                                    {chat.other_user.name}
                                                </h4>
                                                <p className="text-slate-400 text-sm truncate max-w-[200px] sm:max-w-xs md:max-w-md mt-0.5 group-hover:text-slate-300 transition-colors">
                                                    {chat.last_message}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Zaman Damgası */}
                                        <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest whitespace-nowrap bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-purple-500/30 group-hover:text-purple-300 transition-colors shadow-inner">
                                            {chat.time}
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Sidebarheader>
    );
}