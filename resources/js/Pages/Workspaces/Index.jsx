import SidebarHeaderLayout from '@/Layouts/SidebarHeaderLayout';
import { Head } from '@inertiajs/react';

export default function WorkspacesIndex({ auth, dbStats = [], dbBoards = [], dbAuthors = [] }) {
    return (
        <SidebarHeaderLayout auth={auth} pageTitle="Workspaces">
            <Head title="Workspaces" />

            {/* Sadece sayfanın asıl içeriği (Gridler ve Tablolar) burada yer alıyor.
                Arka plan, Menüler, Header hepsi SidebarHeaderLayout içinde hallediliyor. */}
            <div className="flex flex-col gap-6">
                
                {/* 📌 STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {dbStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#160d33]/80 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 flex flex-col justify-center shadow-lg transition-transform hover:scale-[1.02]">
                            <h3 className="text-white text-sm font-bold mb-1">{stat.title}</h3>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* 📊 TABLES SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    
                    {/* SOL TABLO: Active Boards */}
                    <div className="lg:col-span-3 bg-[#160d33]/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-lg">Active Boards</h3>
                            <span className="text-slate-400 cursor-pointer hover:text-white">⋮</span>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 pr-2">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-bold border-b border-white/5">
                                        <th className="pb-3 pl-2">Board Name</th>
                                        <th className="pb-3 text-center">AI Match Health</th>
                                        <th className="pb-3 text-left">Complexity Level</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dbBoards.map((board, i) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-all">
                                            <td className="py-4 pl-2 text-sm font-bold text-slate-200">{board.name}</td>
                                            <td className="py-4 text-center text-sm font-bold text-slate-300">%{board.match}</td>
                                            <td className="py-4 pr-3 text-slate-300">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white text-sm font-bold font-mono w-4">{board.complexity}★</span>
                                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden shadow-inner">
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
                    <div className="lg:col-span-2 bg-[#160d33]/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-lg">Authors Table</h3>
                            <span className="text-slate-400 cursor-pointer hover:text-white">⋮</span>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/20 pr-2">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-bold border-b border-white/5">
                                        <th className="pb-3 pl-2">Member Profile</th>
                                        <th className="pb-3 text-center">Top Contributing Skill</th>
                                        <th className="pb-3 text-right pr-2">Workload</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dbAuthors.map((author, i) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-all">
                                            <td className="py-4 pl-2 text-sm font-bold text-slate-200">{author.name}</td>
                                            <td className="py-4 text-center text-sm font-bold text-slate-300">{author.skill}</td>
                                            <td className="py-4 text-right pr-2 text-sm font-bold text-slate-300">{author.workload}</td>
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