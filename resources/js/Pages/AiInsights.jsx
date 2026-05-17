import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from 'axios';

export default function AiInsights({ auth, dbTalent = [], dbProjects = [] }) {
    const [taskDescription, setTaskDescription] = useState('');
    const [aiResults, setAiResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🧠 AI Motorunu Tetikleyen Fonksiyon
    const handleAiMatch = async (e) => {
        e.preventDefault();
        if (!taskDescription.trim()) return;

        setLoading(true);
        setError(null);
        setAiResults(null);

        try {
            const response = await axios.post('/api/ai/recommendations', {
                task_description: taskDescription
            });
            setAiResults(response.data.recommendations);
        } catch (err) {
            setError(err.response?.data?.error || 'Yapay Zeka motoruyla iletişim kurulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarHeader auth={auth} pageTitle="AI Insights">
            <Head title="AI Insights" />

            <div className="flex flex-col gap-4 sm:gap-8 pb-6 sm:pb-10 px-1 sm:px-0 mt-2 sm:mt-0">
                
                {/* 🧠 KAGGER ML GÖREV EŞLEŞTİRME MOTORU BİLEŞENİ */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col relative overflow-hidden">
                    <h3 className="text-white font-black text-base sm:text-lg tracking-tight mb-2 uppercase relative z-10 flex items-center gap-2">
                        🧠 Kaggle Predictive Matcher
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mb-4 relative z-10">
                        Choose a project task and let our AI analyze the required skills to recommend the best-suited team members from your talent pool. Just describe the task, and watch the magic happen!
                    </p>

                    <form onSubmit={handleAiMatch} className="space-y-4 relative z-10">
                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Example: Develop a responsive web application using React and Node.js..."
                            className="w-full p-3 sm:p-4 rounded-xl border border-purple-500/30 bg-[#0d0722]/60 text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                            rows="3"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                            {loading ? 'Analyzing...' : '🎯 Find Best Match'}
                        </button>
                    </form>

                    {/* Hata Mesajı Alanı */}
                    {error && (
                        <div className="mt-4 p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl text-xs relative z-10 animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* 🚀 AI SONUÇLARI PANELİ */}
                    {aiResults && (
                        <div className="mt-6 space-y-3 relative z-10 border-t border-white/10 pt-4 animate-fadeIn">
                            <h4 className="text-xs sm:text-sm font-black text-purple-400 uppercase tracking-wider">
                                Match Results:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {aiResults.map((result, idx) => (
                                    <Link 
                                        href={route('user.profile', result.user_id)}
                                        key={result.user_id} 
                                        className={`group block p-3 sm:p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] cursor-pointer ${
                                            idx === 0 
                                                ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                                : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <span className="font-bold text-xs sm:text-sm text-slate-200 block truncate group-hover:text-purple-400 transition-colors">
                                                    {result.name} {idx === 0 && '👑'}
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {result.badges && result.badges.length > 0 ? (
                                                        result.badges.map((badge, i) => (
                                                            <span key={`badge-${i}`} className="text-[8px] sm:text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                                                                {badge}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        result.matched_skills.map((s, i) => (
                                                            <span key={`skill-${i}`} className="text-[8px] sm:text-[9px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase">
                                                                {s}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`text-base sm:text-lg font-black ${result.match_score > 70 ? 'text-emerald-400' : result.match_score > 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    %{result.match_score}
                                                </span>
                                                <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-tighter">Match</span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                                                style={{ width: `${result.match_score}%` }}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 📌 Talent Optimization Matrix (Gerçek Veri) */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col relative overflow-hidden">
                    <h3 className="text-white font-black text-base sm:text-lg tracking-tight mb-4 sm:mb-6 uppercase relative z-10">Talent Optimization Matrix</h3>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 relative z-10 pb-2">
                        <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
                            <thead>
                                <tr className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] border-b border-white/10">
                                    <th className="pb-2 sm:pb-3 pl-2 w-1/3">Employee</th>
                                    <th className="pb-2 sm:pb-3 w-1/4">Skill Set</th>
                                    <th className="pb-2 sm:pb-3 w-1/6">Performance Index</th>
                                    <th className="pb-2 sm:pb-3 w-1/4">Growth Potential</th>
                                    <th className="pb-2 sm:pb-3 text-right pr-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dbTalent.map((employee, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 sm:py-4 pl-2">
                                            <Link href={employee.id ? route('user.profile', employee.id) : '#'} className="flex items-center gap-3 sm:gap-4 group/profile w-fit">
                                                <div className="relative transform transition-transform duration-300 group-hover/profile:scale-105 shrink-0">
                                                    <img 
                                                        src={employee.avatar ? `/storage/${employee.avatar}` : `https://ui-avatars.com/api/?name=${employee.name}&background=1a0b2e&color=8b5cf6&bold=true`} 
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-purple-500/30 object-cover shadow-[0_0_10px_rgba(168,85,247,0)] group-hover/profile:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-shadow"/>
                                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#160d33] rounded-full flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col overflow-hidden min-w-0">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover/profile:text-purple-400 transition-colors">
                                                        {employee.name}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                                                        {employee.email}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-3 sm:py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {employee.skills.map((skill, i) => (
                                                    <span key={i} className="text-[9px] sm:text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase whitespace-nowrap">{skill}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 sm:py-4">
                                            <span className={`text-xs font-black ${employee.performance > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                %{employee.performance}
                                            </span>
                                        </td>
                                        <td className="py-3 sm:py-4">
                                            <span className={`text-xs font-bold whitespace-nowrap ${employee.growth_raw > 0 ? 'text-emerald-400' : employee.growth_raw < 0 ? 'text-pink-500' : 'text-slate-400'}`}>
                                                {employee.growth} Skill Gain
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 📌 Projects Insights (Gerçek Veri) */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 sm:mb-6 relative z-10">
                        <h3 className="text-white font-black text-base sm:text-lg tracking-tight uppercase">Project Insights</h3>
                        <span className="text-slate-500 cursor-pointer hover:text-white text-lg sm:text-xl">⋮</span>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 relative z-10 pb-2">
                        <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
                            <thead>
                                <tr className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] border-b border-white/10">
                                    <th className="pb-2 sm:pb-3 pl-2 w-1/4">Task Name</th>
                                    <th className="pb-2 sm:pb-3 w-1/4 text-center">Complexity</th>
                                    <th className="pb-2 sm:pb-3 w-1/4 text-center">Assignment Reason</th>
                                    <th className="pb-2 sm:pb-3 w-1/4">Success Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dbProjects.map((task, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 sm:py-4 pl-2">
                                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate block max-w-[140px] sm:max-w-[200px]">{task.name}</span>
                                        </td>
                                        <td className="py-3 sm:py-4 text-center">
                                            <span className="text-xs font-black text-white">{task.complexity}★</span>
                                        </td>
                                        <td className="py-3 sm:py-4 text-center">
                                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-md whitespace-nowrap">{task.reason}</span>
                                        </td>
                                        <td className="py-3 sm:py-4 pr-4">
                                            <div className="flex flex-col gap-1.5 w-full">
                                                <div className="flex justify-between">
                                                    <span className={`text-[9px] sm:text-[10px] font-black ${task.confidence > 50 ? 'text-emerald-400' : 'text-pink-400'}`}>%{task.confidence}</span>
                                                    <span className="text-[7px] sm:text-[8px] text-slate-500 font-bold uppercase tracking-widest">Calculated Risk</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${task.confidence > 50 ? 'bg-emerald-500' : 'bg-pink-500'}`} 
                                                        style={{ width: `${task.confidence}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </SidebarHeader>
    );
}