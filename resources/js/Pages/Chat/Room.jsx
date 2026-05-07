import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebarheader from '@/Layouts/SidebarHeaderLayout';
import axios from 'axios';

export default function Room({ auth, conversation, messages, receiver }) {
    const [messagesList, setMessagesList] = useState(messages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 🌟 Alıcının Avatarı
    const receiverAvatar = receiver.avatar 
        ? `/storage/${receiver.avatar}` 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name)}&background=1a0b2e&color=8b5cf6&bold=true&size=128`;

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesList]);

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
        <Sidebarheader pageTitle={`Comms: ${receiver.name}`}>
            <Head title={`Chat - ${receiver.name}`} />

            {/* 🌟 MOBİL UYUM: Yükseklik mobilde 100vh - 120px gibi bir esnekliğe alındı */}
            <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] max-w-5xl mx-auto mt-2 sm:pb-6 pb-2">
                
                <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-full overflow-hidden relative">
                    
                    {/* Matrix Arka Plan */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* 🌟 ÜST BAR (Mobilde padding'ler daraltıldı) */}
                    <div className="p-3 sm:p-4 border-b border-purple-500/20 bg-[#0f0822]/60 flex items-center justify-between relative z-10 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-6">
                            
                            {/* Geri Dön Butonu (Mobilde biraz küçüldü) */}
                            <Link href="/inbox" className="w-8 h-8 sm:w-10 sm:h-10 flex shrink-0 items-center justify-center rounded-full bg-white/5 text-purple-400 hover:bg-purple-600 hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-500/20">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>

                            <Link href={`/user-profile/${receiver.id}`} className="flex items-center space-x-3 sm:space-x-4 group overflow-hidden">
                                <div className="relative shrink-0">
                                    {/* Avatar Mobilde Küçültüldü */}
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1a0b2e] flex items-center justify-center overflow-hidden border-2 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all">
                                        <img src={receiverAvatar} alt={receiver.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0822] animate-pulse"></div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h2 className="font-black text-sm sm:text-base text-slate-200 tracking-wide truncate">
                                        {receiver.name}
                                    </h2>
                                    <p className="text-[9px] sm:text-[10px] text-purple-500/70 font-bold tracking-widest uppercase flex items-center gap-1">
                                        <span className="hidden sm:inline">View Profile</span>
                                        <span className="sm:hidden">Profile</span> &rarr;
                                    </p>
                                </div>
                            </Link>
                        </div>
                        
                        {/* Sağ Üst Radar: Mobilde sadece nokta kalır */}
                        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-black tracking-widest uppercase shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="hidden sm:inline">Encrypted</span>
                        </div>
                    </div>

                    {/* 🌟 MESAJLARIN LİSTELENDİĞİ ALAN (Mobilde padding kısıldı) */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 z-10 scrollbar-thin scrollbar-thumb-purple-500/30">
                        {messagesList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 font-mono text-xs sm:text-sm space-y-4 px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <p>[ CONNECTION ESTABLISHED ] <br className="hidden sm:block"/> Secure channel opened.</p>
                            </div>
                        ) : (
                            messagesList.map((msg) => {
                                const isMe = msg.sender_id === auth.user.id;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl text-sm md:text-base ${
                                            isMe 
                                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-br-none shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/50' 
                                            : 'bg-white/5 text-slate-200 rounded-bl-none border border-white/10 backdrop-blur-md'
                                        }`}>
                                            <p className="break-words leading-relaxed">{msg.body}</p>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] text-slate-500 mt-1 sm:mt-1.5 font-bold tracking-widest uppercase flex items-center gap-1">
                                            {msg.time} {isMe && <span className="text-purple-400">✓✓</span>}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 🌟 MESAJ GÖNDERME İNPUTU (Mobilde buton ikona dönüşür) */}
                    <div className="p-2 sm:p-4 bg-[#0f0822]/80 border-t border-purple-500/20 z-10 backdrop-blur-md">
                        <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3 items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type..."
                                className="flex-1 bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600 text-sm shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white w-12 h-11 sm:w-auto px-0 sm:px-6 py-0 sm:py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2"
                            >
                                <span className="hidden sm:inline">Send</span>
                                <svg className="w-5 h-5 sm:w-4 sm:h-4 ml-0 sm:ml-1 -rotate-45 sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </Sidebarheader>
    );
}