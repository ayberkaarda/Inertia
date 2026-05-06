import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebarheader from '@/Layouts/SidebarHeaderLayout';
import axios from 'axios';

export default function Room({ auth, conversation, messages, receiver }) {
    const [messagesList, setMessagesList] = useState(messages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 🌟 YENİ: Alıcının Avatarını Güvenli Şekilde Oluştur (Tıpkı Profil sayfasındaki gibi)
    const receiverAvatar = receiver.avatar 
        ? `/storage/${receiver.avatar}` 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name)}&background=1a0b2e&color=8b5cf6&bold=true&size=128`;

    // Yeni mesajları dinle (Reverb)
    useEffect(() => {
        window.Echo.private(`chat.${conversation.id}`)
            .listen('MessageSent', (e) => {
                if (e.message.sender_id !== auth.user.id) {
                    setMessagesList((prev) => [...prev, e.message]);
                }
            });

        return () => {
            window.Echo.leave(`chat.${conversation.id}`);
        };
    }, [conversation.id, auth.user.id]);

    // Otomatik aşağı kaydır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesList]);

    // Mesaj gönder
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage = newMessage;
        setNewMessage(''); 

        try {
            const response = await axios.post(`/chat/${conversation.id}/message`, {
                body: tempMessage
            });
            setMessagesList((prev) => [...prev, response.data]);
        } catch (error) {
            console.error("Mesaj gönderilemedi:", error);
            setNewMessage(tempMessage); 
        }
    };

    return (
        <Sidebarheader
            user={auth.user}
            header={
                <div className="flex items-center space-x-6">
                    {/* 🌟 1. GERİ DÖN BUTONU */}
                    <Link href="/inbox" className="text-gray-400 hover:text-purple-400 transition" title="Gelen Kutusuna Dön">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>

                    {/* 🌟 2. TIKLANABİLİR PROFİL KARTI (SİBERPUNK) */}
                    {/* DİKKAT: Projendeki profil url yapısı /users/id veya /profile/id şeklindeyse burayı ona göre uyarla! */}
                    <Link href={`/user/${receiver.id}`} className="flex items-center space-x-3 group">
                        
                        {/* Avatar Çerçevesi */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-[#1a0b2e] flex items-center justify-center overflow-hidden border-2 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] group-hover:scale-105 transition-all duration-300">
                                <img src={receiverAvatar} alt={receiver.name} className="w-full h-full object-cover" />
                            </div>
                            {/* Online/Aktif Noktası (Yeşil Işık) */}
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        </div>
                        
                        {/* İsim ve Profil Linki */}
                        <div className="flex flex-col">
                            <h2 className="font-bold text-lg text-gray-200 leading-tight group-hover:text-purple-400 transition-colors drop-shadow-md">
                                {receiver.name}
                            </h2>
                            <p className="text-[10px] text-purple-500/70 font-mono tracking-widest uppercase flex items-center gap-1 group-hover:text-purple-400 transition-colors">
                                View Profile 
                                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </p>
                        </div>

                    </Link>
                </div>
            }
        >
            <Head title={`Chat - ${receiver.name}`} />

            <div className="py-8 h-[calc(100vh-8rem)]">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 h-full flex flex-col">
                    
                    {/* Siberpunk Çerçeve (Ana Sohbet Kutusu) */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col h-full overflow-hidden relative">
                        
                        {/* Arka Plan Deseni */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {/* MESAJLARIN LİSTELENDİĞİ ALAN */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar">
                            {messagesList.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20 font-mono text-sm">
                                    [BAĞLANTI KURULDU] <br/> Güvenli hat açıldı. İlk veriyi gönder.
                                </div>
                            ) : (
                                messagesList.map((msg) => {
                                    const isMe = msg.sender_id === auth.user.id;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                                                isMe 
                                                ? 'bg-purple-600 text-white rounded-br-none shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                                                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                            }`}>
                                                <p className="break-words">{msg.body}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-1 font-mono">
                                                {msg.time} {isMe && '✓✓'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* MESAJ GÖNDERME İNPUTU */}
                        <div className="p-4 bg-gray-950 border-t border-gray-800 z-10">
                            <form onSubmit={sendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Terminal'e mesaj yaz..."
                                    className="flex-1 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(147,51,234,0.4)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"
                                >
                                    Gönder
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </Sidebarheader>
    );
}