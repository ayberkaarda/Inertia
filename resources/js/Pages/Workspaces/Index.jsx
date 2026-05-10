import SidebarHeaderLayout from '@/Layouts/SidebarHeaderLayout';
import { Head } from '@inertiajs/react';

export default function WorkspacesIndex({ auth, dbStats = [], dbBoards = [], dbAuthors = [] }) {
    return (
        <SidebarHeaderLayout auth={auth} pageTitle="Workspaces">
            <Head title="Workspaces" />

            <div className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-10 px-1 sm:px-0 mt-2 sm:mt-0">
                
                {/* 📌 STATS CARDS */}
                {/* 🌟 MOBİL UYUM: Mobilde 2'li grid yapılarak alan tasarrufu sağlandı */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    {dbStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-purple-500/20 flex flex-col justify-center shadow-lg transition-transform hover:scale-[1.02]">
                            <h3 className="text-slate-400 text-[10px] sm:text-sm font-bold mb-1 uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-xl sm:text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* 📊 TABLES SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">
                    
                    {/* SOL TABLO: Active Boards */}
                    <div className="lg:col-span-3 bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-[300px] sm:min-h-[400px]">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-white font-bold text-base sm:text-lg uppercase tracking-tight">Active Boards</h3>
                            <span className="text-slate-400 cursor-pointer hover:text-white">⋮</span>
                        </div>

                        {/* 🌟 MOBİL UYUM: Yatay kaydırma desteği */}
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 pb-2">
                            <table className="w-full text-left min-w-[450px] sm:min-w-full">
                                <thead>
                                    <tr className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                        <th className="pb-3 pl-2">Board Name</th>
                                        <th className="pb-3 text-center">AI Health</th>
                                        <th className="pb-3 text-left">Complexity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dbBoards.map((board, i) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-all">
                                            <td className="py-3 sm:py-4 pl-2 text-xs sm:text-sm font-bold text-slate-200">{board.name}</td>
                                            <td className="py-3 sm:py-4 text-center text-xs sm:text-sm font-black text-emerald-400">%{board.match}</td>
                                            <td className="py-3 sm:py-4 pr-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-white text-xs font-bold font-mono w-4">{board.complexity}★</span>
                                                    <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${board.complexity > 7 ? 'bg-red-500' : 'bg-purple-500'}`} 
                                                            style={{width: `${board.complexity * 10}%`}}
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

                    {/* SAĞ TABLO: Authors Table */}
                    <div className="lg:col-span-2 bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-[300px] sm:min-h-[400px]">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-white font-bold text-base sm:text-lg uppercase tracking-tight">Authors Table</h3>
                            <span className="text-slate-400 cursor-pointer hover:text-white">⋮</span>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 pb-2">
                            <table className="w-full text-left min-w-[400px] sm:min-w-full">
                                <thead>
                                    <tr className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                        <th className="pb-3 pl-2">Profile</th>
                                        <th className="pb-3 text-center">Top Skill</th>
                                        <th className="pb-3 text-right pr-2">Workload</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dbAuthors.map((author, i) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-all">
                                            <td className="py-3 sm:py-4 pl-2 text-xs sm:text-sm font-bold text-slate-200">{author.name}</td>
                                            <td className="py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-purple-400 uppercase">{author.skill}</td>
                                            <td className="py-3 sm:py-4 text-right pr-2 text-xs sm:text-sm font-black text-slate-300">{author.workload}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </SidebarHeaderLayout>
    );
}