import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, Link } from '@inertiajs/react';
import cardBgSrc from '@/assets/images/card-bg.webp';

// Varsayılan boş profil yapısı (Hata almamak için dışarıda tanımlıyoruz)
const defaultProfile = {
    id: 0,
    name: "Unknown User",
    email: "email@test.com",
    developer_title: "None Title",
    talentScore: 0,
    performance: 0,
    growth: "+0",
    skills: [],
    badges: [],
    recentActivities: [],
    activeSprints: [] // Bunu da ekledik
};

export default function Show({ auth, userProfile }) {
    // Eğer veri gelmediyse varsayılanı kullan, varsa geleni kullan
    const profile = userProfile || defaultProfile;

    // Avatar URL'ini güvenli bir şekilde oluştur
    const finalAvatar = profile.avatar 
    ? `/storage/${profile.avatar}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1a0b2e&color=8b5cf6&bold=true&size=256`;

    return (
        <SidebarHeader auth={auth} pageTitle={`${profile.name} - Profile Overview`}>
            <Head title={`${profile.name} - Profile`}><link rel="preload" as="image" href={cardBgSrc} /></Head>

            <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto">
                
                {/* 📌 Üst Banner ve Profil Kartı */}
                <div className="relative w-full rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl bg-[#160d33]/80 backdrop-blur-xl">
                    
                    {/* Banner Arka Planı */}
                    <div 
                        className="h-48 w-full relative group"
                        style={{
                            backgroundImage: `url(${cardBgSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#160d33] to-transparent"></div>
                        <div className="absolute top-4 left-4">
                            <Link href="/ai-insights" className="text-xs font-black text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md transition-all uppercase tracking-widest border border-white/10">
                                &larr; Back to last page
                            </Link>
                        </div>
                    </div>

                    {/* Profil Bilgileri */}
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16 z-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl border-4 border-[#0f0822] bg-[#1a0b2e] overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] transform transition-transform duration-500 group-hover:scale-105">
                                <img src={finalAvatar} alt={profile.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0f0822] rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            </div>
                        </div>

                        {/* İsim ve Ünvan */}
                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{profile.name}</h1>
                            <p className="text-sm font-bold text-purple-400 mt-1 tracking-widest uppercase">{profile.developer_title}</p>
                            <p className="text-xs text-slate-400 mt-1">{profile.email}</p>
                        </div>

                        {/* Hızlı İstatistikler & MESAJ BUTONU Kapsayıcısı */}
                        <div className="flex flex-col items-center md:items-end gap-4">
                            
                            {/* İstatistikler */}
                            <div className="flex gap-4">
                                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center backdrop-blur-md">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Talent Score</p>
                                    <p className="text-2xl font-black text-white">{profile.talentScore}<span className="text-sm text-slate-500">/10</span></p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl text-center backdrop-blur-md">
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Performance</p>
                                    <p className="text-2xl font-black text-emerald-400">%{profile.performance}</p>
                                </div>
                            </div>

                            {/* 🌟 YENİ EKLENEN: MESAJ GÖNDER BUTONU */}
                            {/* Sadece bakan kişi kendi profilinde değilse gösterilir */}
                            {auth.user.id !== profile.id && (
                                <Link 
                                    href={`/chat/${profile.id}`} 
                                    className="flex items-center gap-2 w-full justify-center md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all uppercase tracking-widest text-xs border border-purple-400/50 hover:border-purple-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Send a Message
                                </Link>
                            )}

                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SOL KOLON */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-white font-bold text-sm tracking-wide uppercase mb-6 flex items-center justify-between">
                                Acquired Badges
                                <span className="text-xs font-normal text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                                    {profile.badges?.length || 0} Unlocked
                                </span>
                            </h3>
                            
                            <div className="flex flex-wrap gap-3">
                                {profile.badges && profile.badges.length > 0 ? (
                                    profile.badges.map((badge, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 w-[calc(50%-6px)] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group">
                                            <img src={`/storage/${badge.icon}`} alt={badge.name} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{badge.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-6 text-slate-500 text-xs italic">No badges unlocked.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl flex-1">
                            <h3 className="text-white font-bold text-sm tracking-wide uppercase mb-8">Activity Timeline</h3>
                            <div className="relative border-l border-purple-500/20 ml-3 space-y-8 pb-4">
                                {profile.recentActivities && profile.recentActivities.length > 0 ? (
                                    profile.recentActivities.map((activity, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#160d33] border-2 border-purple-500 ring-4 ring-[#160d33]"></span>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{activity.action}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">{activity.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed">{activity.description}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pl-6 text-slate-500 text-sm">No recent activity.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarHeader>
    );
}