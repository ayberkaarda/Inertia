import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, Link } from '@inertiajs/react'; // Link componenti import edildi

export default function AiInsights({ auth, dbTalent = [], dbProjects = [] }) {
    return (
        <SidebarHeader auth={auth} pageTitle="AI Insights">
            <Head title="AI Insights" />

            <div className="flex flex-col gap-8 pb-10">
                
                {/* 📌 Talent Optimization Matrix (Gerçek Veri) */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col">
                    <h3 className="text-white font-black text-lg tracking-tight mb-6 uppercase">Talent Optimization Matrix</h3>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-white/10">
                                    <th className="pb-3 pl-2 w-1/3">Employee</th>
                                    <th className="pb-3 w-1/4">Skill Set</th>
                                    <th className="pb-3 w-1/6">Performance Index</th>
                                    <th className="pb-3 w-1/4">Growth Potential</th>
                                    <th className="pb-3 text-right pr-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dbTalent.map((employee, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        
                                        {/* Tıklanabilir Profil Alanı Başlangıcı */}
                                        <td className="py-4 pl-2">
                                            {/* Rota adını (profile.show) kendi sistemine göre düzenleyebilirsin */}
                                            <Link href={employee.id ? route('user.profile', employee.id) : '#'} className="flex items-center gap-4 group/profile w-fit">
                                                <div className="relative transform transition-transform duration-300 group-hover/profile:scale-105">
                                                <img 
                                                /* Önce veritabanındaki avatarı kontrol et, yoksa UI-Avatars'ı kullan */
                                                src={employee.avatar ? `/storage/${employee.avatar}` : `https://ui-avatars.com/api/?name=${employee.name}&background=1a0b2e&color=8b5cf6&bold=true`} 
                                                className="w-10 h-10 rounded-xl border border-purple-500/30 object-cover shadow-[0_0_10px_rgba(168,85,247,0)] group-hover/profile:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-shadow"/>
                                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#160d33] rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                </div>
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-sm font-bold text-slate-200 truncate group-hover/profile:text-purple-400 transition-colors">
                                                        {employee.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 truncate">
                                                        {employee.email}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        {/* Tıklanabilir Profil Alanı Sonu */}

                                        <td className="py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {employee.skills.map((skill, i) => (
                                                    <span key={i} className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase">{skill}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-xs font-black ${employee.performance > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                %{employee.performance}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                        <span className={`text-xs font-bold ${employee.growth_raw > 0 ? 'text-emerald-400' : employee.growth_raw < 0 ? 'text-pink-500' : 'text-slate-400'}`}>
                                        {employee.growth} Skill Gain
                                        </span>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <button className="text-[11px] font-bold text-slate-500 hover:text-purple-400 transition-colors uppercase">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 📌 Projects Insights (Gerçek Veri) */}
                <div className="bg-[#160d33]/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-black text-lg tracking-tight uppercase">Project Confidence Insights</h3>
                        <span className="text-slate-500 cursor-pointer hover:text-white text-xl">⋮</span>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-white/10">
                                    <th className="pb-3 pl-2 w-1/4">Task Name</th>
                                    <th className="pb-3 w-1/4 text-center">Complexity</th>
                                    <th className="pb-3 w-1/4 text-center">Assignment Reason</th>
                                    <th className="pb-3 w-1/4">Success Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dbProjects.map((task, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2">
                                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate block max-w-[200px]">{task.name}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-xs font-black text-white">{task.complexity}★</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-md">{task.reason}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex flex-col gap-1.5 w-full">
                                                <div className="flex justify-between">
                                                    <span className={`text-[10px] font-black ${task.confidence > 50 ? 'text-emerald-400' : 'text-pink-400'}`}>%{task.confidence}</span>
                                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Calculated Risk</span>
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