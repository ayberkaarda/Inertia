import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebarheader from '@/Layouts/SidebarHeaderLayout';

export default function Inbox({ auth, conversations }) {
    return (
        <Sidebarheader
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-200 leading-tight">Conservation (Inbox)</h2>}
        >
            <Head title="Inbox" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Siberpunk Çerçeve (Ana Kutu) */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
                        
                        {/* Başlık Alanı */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                            <h3 className="text-lg font-bold text-purple-400 tracking-wider">
                                SOHBET GEÇMİŞİ
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                                {conversations.length} Aktif Bağlantı
                            </span>
                        </div>

                        {/* Mesaj Listesi */}
                        <div className="divide-y divide-gray-800">
                            {conversations.length === 0 ? (
                                // Hiç mesaj yoksa gösterilecek boş durum tasarımı
                                <div className="p-10 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400">Ağda henüz aktif bir iletişim bulunamadı.</p>
                                    <p className="text-gray-600 text-sm mt-1">Profillere gidip mesaj atmaya başla!</p>
                                </div>
                            ) : (
                                // Mesajları döngüye al
                                conversations.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/chat/${chat.other_user.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-gray-800/80 transition-all duration-200 ease-in-out group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            
                                            {/* Profil Fotoğrafı / Neon Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-purple-200 font-bold text-xl overflow-hidden border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all">
                                                {chat.other_user.avatar ? (
                                                    <img src={`/storage/${chat.other_user.avatar}`} alt={chat.other_user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    chat.other_user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            
                                            {/* İsim ve Son Mesaj */}
                                            <div>
                                                <h4 className="text-gray-200 font-semibold group-hover:text-purple-300 transition-colors">
                                                    {chat.other_user.name}
                                                </h4>
                                                <p className="text-gray-500 text-sm truncate max-w-xs md:max-w-md">
                                                    {chat.last_message}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Zaman Damgası */}
                                        <div className="text-gray-500 text-xs font-mono whitespace-nowrap">
                                            {chat.time}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </Sidebarheader>
    );
}