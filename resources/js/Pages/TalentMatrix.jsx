import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head } from '@inertiajs/react';
import cardBgSrc from '@/assets/images/card-bg.png';

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
        if (type === 'out') return <span className="text-red-500 border border-red-500/30 rounded-full w-6 h-6 flex items-center justify-center text-xs">↓</span>;
        if (type === 'in') return <span className="text-emerald-500 border border-emerald-500/30 rounded-full w-6 h-6 flex items-center justify-center text-xs">↑</span>;
        return <span className="text-slate-400 border border-slate-500/30 rounded-full w-6 h-6 flex items-center justify-center text-xs">!</span>;
    };

    const getPathColor = (type) => {
        if (type === 'out') return "text-red-500";
        if (type === 'in') return "text-emerald-500";
        return "text-slate-400";
    };

    return (
        <SidebarHeader auth={auth} pageTitle="Talent Matrix">
            <Head title="Talent Matrix" />

            <div className="flex flex-col gap-6 pb-10">
                
                {/* 📌 ÜST SATIR: Skill Profile & Talent Score */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Sol Üst Kart: Skill Profile */}
                    <div 
                        className="relative border border-purple-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[200px] flex flex-col justify-between group"
                        style={{
                            backgroundImage: `url(${cardBgSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Okunabilirliği artıran hafif karartma katmanı */}
                        <div className="absolute inset-0 bg-[#0f0822]/40 pointer-events-none transition-opacity duration-500 group-hover:bg-[#0f0822]/20"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-white font-bold text-lg tracking-wide">Skill Profile Card</h3>
                            {/* Dinamik Rozet İkonu */}
                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center min-w-[50px] min-h-[50px] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {topBadge ? (
                                <img 
                                src={`/storage/${topBadge.icon}`} 
                                alt={topBadge.name} 
                                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                            ) : (
                                <span className="font-black text-xl text-slate-300">N/A</span>
                            )}
                            </div>
                        </div>

                        <div className="relative z-10 mt-8">
                            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{auth.user.name}</h2>
                            <p className="text-sm font-bold text-slate-300 mt-1 tracking-widest drop-shadow-sm">{auth.user.developer_title}</p>
                        </div>
                    </div>

                    {/* Sağ Üst Kart: Talent Score */}
                    <div 
                        className="relative border border-purple-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[200px] flex flex-col justify-between group"
                        style={{
                            backgroundImage: `url(${cardBgSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Okunabilirliği artıran hafif karartma katmanı */}
                        <div className="absolute inset-0 bg-[#0f0822]/40 pointer-events-none transition-opacity duration-500 group-hover:bg-[#0f0822]/20"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-white font-bold text-lg tracking-wide">Talent Score</h3>
                            <span className="text-slate-300 cursor-pointer text-xl hover:text-white transition-colors drop-shadow-sm">•••</span>
                        </div>

                        <div className="relative z-10 mt-8">
                            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{talentScore}<span className="text-xl text-slate-300">/10</span></h2>
                            <p className="text-sm font-bold text-slate-300 mt-1 tracking-widest drop-shadow-sm">Calculated by AI.</p>
                        </div>
                    </div>
                </div>

                {/* 📌 ALT SATIR: Competency Breakdown & Learning Path */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Sol Alt: Competency Breakdown */}
                    <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl flex flex-col">
                        <h3 className="text-white font-bold text-base tracking-wide mb-6">Competency Breakdown</h3>
                        
                        <div className="flex flex-col gap-4">
                            {dbCompetencies.length > 0 ? dbCompetencies.map((comp) => (
                                <div key={comp.id} className="bg-[#110826] border border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:border-purple-500/30 transition-colors">
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-bold text-slate-200">{comp.category}</h4>
                                        <p className="text-[11px] text-slate-500 mt-1">{comp.skill}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Total Tasks: {comp.tasks}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1 h-3 bg-red-500 rounded-sm"></span> DELETE
                                        </button>
                                        <button className="text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-3 h-1 bg-slate-300 rounded-sm transform rotate-45"></span> EDIT
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-sm text-center py-4">No active competencies found.</div>
                            )}
                        </div>
                    </div>

                    {/* Sağ Alt: Learning Path & Evolution */}
                    <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl flex flex-col">
                        <h3 className="text-white font-bold text-base tracking-wide mb-6">Learning Path & Evolution</h3>
                        
                        <div className="flex flex-col overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-purple-500/20">
                            
                            {/* NEWEST SECTION */}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">LATEST ACTIVITY</h4>
                                <div className="flex flex-col gap-4">
                                    {dbLearningPathNewest.map((item) => (
                                        <div key={item.id} className="flex items-start gap-4">
                                            <div className="mt-1">{getPathIcon(item.type)}</div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-slate-200">{item.skill}</span>
                                                    <span className={`text-xs font-bold ${getPathColor(item.type)}`}>{item.status}</span>
                                                </div>
                                                <span className="text-[11px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PAST SECTION */}
                            {dbLearningPathYesterday.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 mt-6">PAST HISTORY</h4>
                                    <div className="flex flex-col gap-4">
                                        {dbLearningPathYesterday.map((item) => (
                                            <div key={item.id} className="flex items-start gap-4">
                                                <div className="mt-1">{getPathIcon(item.type)}</div>
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-bold text-slate-200">{item.skill}</span>
                                                        <span className={`text-xs font-bold ${getPathColor(item.type)}`}>{item.status}</span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">{item.time}</span>
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