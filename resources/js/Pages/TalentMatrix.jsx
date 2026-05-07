import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, Link } from '@inertiajs/react';
import cardBgSrc from '@/assets/images/card-bg.webp';

export default function TalentMatrix({ 
    auth, 
    talentScore, 
    dbCompetencies = [], 
    dbLearningPathNewest = [], 
    dbLearningPathYesterday = [],
    topBadge = null
}) {
    
    // İkon Renklendirici Yardımcı Fonksiyonlar
    const getPathIcon = (type) => {
        if (type === 'out') return <span className="text-red-500 border border-red-500/30 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs shrink-0">↓</span>;
        if (type === 'in') return <span className="text-emerald-500 border border-emerald-500/30 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs shrink-0">↑</span>;
        return <span className="text-slate-400 border border-slate-500/30 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs shrink-0">!</span>;
    };

    const getPathColor = (type) => {
        if (type === 'out') return "text-red-500";
        if (type === 'in') return "text-emerald-500";
        return "text-slate-400";
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Talent Matrix">
            <Head title="Talent Matrix"><link rel="preload" as="image" href={cardBgSrc} /></Head>

            {/* 🌟 MOBİL UYUM: Ana padding ve gap kısıldı */}
            <div className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-10 px-1 sm:px-0">
                
                {/* 📌 ÜST SATIR: Skill Profile & Talent Score */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    
                    {/* Sol Üst Kart: Skill Profile */}
                    <div 
                        className="relative border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden min-h-[160px] sm:min-h-[200px] flex flex-col justify-between group"
                        style={{
                            backgroundImage: `url(${cardBgSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-[#0f0822]/50 sm:bg-[#0f0822]/40 pointer-events-none transition-opacity duration-500 group-hover:bg-[#0f0822]/30"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-white font-bold text-base sm:text-lg tracking-wide drop-shadow-md">Skill Profile</h3>
                            
                            {/* Dinamik Rozet İkonu */}
                            <div className="bg-white/10 p-1.5 sm:p-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center min-w-[40px] min-h-[40px] sm:min-w-[50px] sm:min-h-[50px] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {topBadge ? (
                                <img 
                                src={`/storage/${topBadge.icon}`} 
                                alt={topBadge.name} 
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                            ) : (
                                <span className="font-black text-sm sm:text-xl text-slate-300">N/A</span>
                            )}
                            </div>
                        </div>

                        <div className="relative z-10 mt-6 sm:mt-8">
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md truncate">{auth.user.name}</h2>
                            <p className="text-xs sm:text-sm font-bold text-purple-300 sm:text-slate-300 mt-0.5 sm:mt-1 tracking-widest drop-shadow-sm truncate">{auth.user.developer_title}</p>
                        </div>
                    </div>

                    {/* Sağ Üst Kart: Talent Score */}
                    <div 
                        className="relative border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden min-h-[160px] sm:min-h-[200px] flex flex-col justify-between group"
                        style={{
                            backgroundImage: `url(${cardBgSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-[#0f0822]/50 sm:bg-[#0f0822]/40 pointer-events-none transition-opacity duration-500 group-hover:bg-[#0f0822]/30"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-white font-bold text-base sm:text-lg tracking-wide drop-shadow-md">Talent Score</h3>
                            <span className="text-slate-300 cursor-pointer text-lg sm:text-xl hover:text-white transition-colors drop-shadow-sm">•••</span>
                        </div>

                        <div className="relative z-10 mt-6 sm:mt-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md leading-none">{talentScore}<span className="text-lg sm:text-xl text-slate-400 font-bold">/10</span></h2>
                                <p className="text-[10px] sm:text-sm font-bold text-purple-300 sm:text-slate-300 mt-1 sm:mt-2 tracking-widest drop-shadow-sm uppercase">AI Evaluated</p>
                            </div>
                            <div className="hidden sm:block text-4xl mb-2 opacity-50 drop-shadow-xl">{talentScore > 7 ? '🚀' : talentScore > 4 ? '⚙️' : '⚠️'}</div>
                        </div>
                    </div>
                </div>

                {/* 📌 ALT SATIR: Competency Breakdown & Learning Path */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    
                    {/* Sol Alt: Competency Breakdown */}
                    <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
                        <h3 className="text-white font-bold text-sm sm:text-base tracking-wide mb-4 sm:mb-6 uppercase">Competency Breakdown</h3>
                        
                        <div className="flex flex-col gap-3 sm:gap-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 pr-1">
                            {dbCompetencies.length > 0 ? dbCompetencies.map((comp) => (
                                <div key={comp.id} className="bg-[#110826] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex justify-between items-center group hover:border-purple-500/30 transition-colors">
                                    <div className="flex flex-col min-w-0 pr-2">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{comp.category}</h4>
                                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">{comp.skill}</p>
                                        <p className="text-[9px] sm:text-[11px] font-bold text-purple-400 mt-1 uppercase tracking-wider">Tasks: {comp.tasks}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                                        <button className="text-[9px] sm:text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-md transition-colors">
                                            <span className="hidden sm:inline w-1 h-3 bg-red-500 rounded-sm"></span> DEL
                                        </button>
                                        <button className="text-[9px] sm:text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-widest flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md transition-colors">
                                            <span className="hidden sm:inline w-3 h-1 bg-slate-300 rounded-sm transform rotate-45"></span> EDIT
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-xs sm:text-sm text-center py-6 sm:py-10 border border-dashed border-white/5 rounded-2xl">No active competencies found.</div>
                            )}
                        </div>
                    </div>

                    {/* Sağ Alt: Learning Path & Evolution */}
                    <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
                        <h3 className="text-white font-bold text-sm sm:text-base tracking-wide mb-4 sm:mb-6 uppercase">Learning Path & Evolution</h3>
                        
                        <div className="flex flex-col overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-purple-500/20">
                            
                            {/* NEWEST SECTION */}
                            <div className="mb-4">
                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 sm:mb-4">LATEST ACTIVITY</h4>
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    {dbLearningPathNewest.length > 0 ? dbLearningPathNewest.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 sm:gap-4">
                                            <div className="mt-0.5 sm:mt-1">{getPathIcon(item.type)}</div>
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">{item.skill}</span>
                                                    <span className={`text-[10px] sm:text-xs font-bold shrink-0 ${getPathColor(item.type)}`}>{item.status}</span>
                                                </div>
                                                <span className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 whitespace-pre-line leading-relaxed">{item.time}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-[10px] text-slate-600 italic">No recent activity detected.</div>
                                    )}
                                </div>
                            </div>

                            {/* PAST SECTION */}
                            {dbLearningPathYesterday.length > 0 && (
                                <div>
                                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 sm:mb-4 mt-4 sm:mt-6 border-t border-white/5 pt-4 sm:pt-6">PAST HISTORY</h4>
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        {dbLearningPathYesterday.map((item) => (
                                            <div key={item.id} className="flex items-start gap-3 sm:gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                                <div className="mt-0.5 sm:mt-1">{getPathIcon(item.type)}</div>
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="text-xs sm:text-sm font-bold text-slate-300 truncate">{item.skill}</span>
                                                        <span className={`text-[10px] sm:text-xs font-bold shrink-0 ${getPathColor(item.type)}`}>{item.status}</span>
                                                    </div>
                                                    <span className="text-[9px] sm:text-[11px] text-slate-600 mt-0.5 sm:mt-1 whitespace-pre-line leading-relaxed">{item.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </SidebarHeader>
    );
}