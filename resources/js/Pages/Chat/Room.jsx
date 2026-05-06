import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebarheader from '@/Layouts/SidebarHeaderLayout';
import axios from 'axios';

export default function Room({ auth, conversation, messages, receiver }) {
    const [messagesList, setMessagesList] = useState(messages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 🌟 YENİ MESAJLARI DİNLE (LARAVEL REVERB / ECHO BÜYÜSÜ)
    useEffect(() => {
        // Kanalı dinlemeye başla
        window.Echo.private(`chat.${conversation.id}`)
            .listen('MessageSent', (e) => {
                // Eğer gelen mesajı atan kişi ben değilsem, listeye ekle
                // (Kendi mesajlarımızı axios ile gönderirken zaten ekliyoruz)
                if (e.message.sender_id !== auth.user.id) {
                    setMessagesList((prev) => [...prev, e.message]);
                }
            });

        // Sayfadan çıkınca kanaldan ayrıl (Hafıza sızıntısını önler)
        return () => {
            window.Echo.leave(`chat.${conversation.id}`);
        };
    }, [conversation.id, auth.user.id]);

    // 🌟 OTOMATİK AŞAĞI KAYDIRMA (Yeni mesaj gelince)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesList]);

    // 🌟 MESAJ GÖNDERME (Sayfa Yenilenmeden)
    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;

        const tempMessage = newMessage;
        setNewMessage(''); // Input'u anında temizle (Hızlı hissiyat)

        try {
            // Arka plana mermiyi ateşle
            const response = await axios.post(`/chat/${conversation.id}/message`, {
                body: tempMessage
            });
            
            // Başarılı olursa kendi ekranımdaki listeye ekle
            setMessagesList((prev) => [...prev, response.data]);
        } catch (error) {
            console.error("Mesaj gönderilemedi:", error);
            setNewMessage(tempMessage); // Hata olursa silinen mesajı geri getir
        }
    };

    return (
        <Sidebarheader
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Link href="/inbox" className="text-gray-400 hover:text-purple-400 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-200 leading-tight">
                        Encrypted Comms: <span className="text-purple-400">{receiver.name}</span>
                    </h2>
                </div>
            }
        >
            <Head title={`Chat - ${receiver.name}`} />

            <div className="py-8 h-[calc(100vh-8rem)]">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 h-full flex flex-col">
                    
                    {/* Siberpunk Çerçeve (Ana Sohbet Kutusu) */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col h-full overflow-hidden relative">
                        
                        {/* Arka Plan Deseni (Opsiyonel Matrix Havası) */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {/* 🌟 MESAJLARIN LİSTELENDİĞİ ALAN */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar">
                            {messagesList.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    Bağlantı kuruldu. İlk mesajı göndererek iletişimi başlat.
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
                                                {msg.time} {isMe && '✓'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} /> {/* Otomatik kaydırma hedefi */}
                        </div>

                        {/* 🌟 MESAJ GÖNDERME İNPUTU */}
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