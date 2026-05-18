import SidebarHeader from '@/Layouts/SidebarHeaderLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useRef } from 'react';

export default function DropboxIndex({ auth, sprints }) {
    const [selectedSprint, setSelectedSprint] = useState(sprints.length > 0 ? sprints[0] : null);
    const fileInputRef = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!data.file || !selectedSprint) return;

        post(route('dropbox.store', selectedSprint.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('file');
                if (fileInputRef.current) fileInputRef.current.value = "";
                const updatedSprint = sprints.find(s => s.id === selectedSprint.id);
                if (updatedSprint) setSelectedSprint(updatedSprint);
            },
        });
    };

    const handleDelete = (fileId) => {
        if (confirm('Are you sure you want to delete this file?')) {
            router.delete(route('dropbox.destroy', fileId), {
                preserveScroll: true,
                onSuccess: () => {
                    const updatedSprint = sprints.find(s => s.id === selectedSprint.id);
                    if (updatedSprint) setSelectedSprint(updatedSprint);
                }
            });
        }
    };

    const isSprintActive = selectedSprint?.status === 'active';

    return (
        <SidebarHeader auth={auth} pageTitle="Sprint Dropbox">
            <Head title="Sprint Dropbox" />

            {/* 🌟 Mobilde padding azaltıldı, gap dengelendi */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto pb-10 px-2 sm:px-0 mt-2 sm:mt-0">
                
                {/* SOL KOLON: ERİŞİLEBİLEN SPRİNTLER */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl">
                        <h3 className="text-white font-black text-xs sm:text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Accessible Dropboxes
                        </h3>
                        
                        {sprints.length === 0 ? (
                            <div className="text-[10px] sm:text-xs text-slate-500 italic p-4 bg-white/5 rounded-xl text-center">
                                You are not assigned to any tasks. You need to join a task to access a Sprint's Dropbox.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 max-h-[30vh] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500/30">
                                {sprints.map((sprint) => (
                                    <button
                                        key={sprint.id}
                                        onClick={() => setSelectedSprint(sprint)}
                                        className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-300 flex justify-between items-center ${
                                            selectedSprint?.id === sprint.id
                                                ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                                : 'bg-[#0d0722]/50 border-white/5 hover:border-purple-500/30'
                                        }`}
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className={`text-xs sm:text-sm font-bold truncate ${selectedSprint?.id === sprint.id ? 'text-purple-300' : 'text-slate-300'}`}>
                                                {sprint.name}
                                            </span>
                                            <span className={`text-[8px] sm:text-[9px] uppercase font-black mt-1 w-fit px-1.5 py-0.5 rounded ${sprint.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {sprint.status}
                                            </span>
                                        </div>
                                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md shrink-0">
                                            {sprint.files?.length || 0} FILES
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SAĞ KOLON: DOSYALAR VE YÜKLEME EKRANI */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4 sm:gap-6">
                    {selectedSprint ? (
                        <>
                            {isSprintActive ? (
                                <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <h3 className="text-white font-black text-xs sm:text-sm tracking-widest uppercase mb-4 relative z-10 flex items-center gap-2">
                                        <span className="text-emerald-400">🔓</span> Upload to {selectedSprint.name}
                                    </h3>
                                    
                                    <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center relative z-10">
                                        <div className="flex-1 w-full relative">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label 
                                                htmlFor="file-upload"
                                                className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 p-4 border-2 border-dashed border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500 cursor-pointer transition-all text-[10px] sm:text-sm text-emerald-100/70 font-bold text-center"
                                            >
                                                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                                <span className="truncate max-w-[200px] sm:max-w-full">{data.file ? data.file.name : 'Click to select a file (Max 10MB)'}</span>
                                            </label>
                                            {errors.file && <span className="text-pink-500 text-[9px] sm:text-xs absolute -bottom-5 left-0">{errors.file}</span>}
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            disabled={!data.file || processing}
                                            className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0 sm:h-[56px]"
                                        >
                                            {processing ? 'UPLOADING...' : 'UPLOAD FILE'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-[#0f0822]/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[120px]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div className="flex flex-col items-center justify-center text-center relative z-10">
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        <h3 className="text-red-400 font-black text-xs sm:text-sm tracking-widest uppercase mb-1">Vault Locked</h3>
                                        <p className="text-slate-400 text-[10px] sm:text-xs">This sprint has expired. New uploads are disabled.</p>
                                    </div>
                                </div>
                            )}

                            {/* YÜKLENEN DOSYALARIN LİSTESİ */}
                            <div className="bg-[#160d33]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-2xl flex-1">
                                <h3 className="text-white font-black text-xs sm:text-sm tracking-widest uppercase mb-4 sm:mb-6 flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                    Vault Arsenal
                                </h3>

                                <div className="flex flex-col gap-2 sm:gap-3">
                                    {sprints.find(s => s.id === selectedSprint.id)?.files?.length > 0 ? (
                                        sprints.find(s => s.id === selectedSprint.id).files.map((file) => (
                                            <div key={file.id} className="group flex flex-row items-center justify-between p-3 sm:p-4 bg-[#0d0722]/50 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all">
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                                        <span className="text-[8px] sm:text-[10px] font-black text-purple-400 uppercase">{file.file_type || 'FILE'}</span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <a href={`/storage/${file.file_path}`} target="_blank" download className="text-xs sm:text-sm font-bold text-slate-200 hover:text-purple-400 transition-colors truncate block w-full pr-2">
                                                            {file.file_name}
                                                        </a>
                                                        {/* 🌟 Mobilde detaylar alt alta düşmemesi için flex-wrap eklendi */}
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] sm:text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                                                            <span className="font-bold text-emerald-400">{file.uploader?.name}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>{formatBytes(file.file_size)}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>{new Date(file.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isSprintActive && file.user_id === auth.user.id && (
                                                    <button 
                                                        onClick={() => handleDelete(file.id)}
                                                        className="p-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors sm:opacity-0 sm:group-hover:opacity-100 shrink-0 ml-2"
                                                    >
                                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 sm:py-10 border-2 border-dashed border-white/5 rounded-2xl">
                                            <p className="text-slate-500 text-xs sm:text-sm font-bold px-4">No files have been dropped here yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-[#160d33]/80 backdrop-blur-xl p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center h-full min-h-[300px] sm:min-h-[400px]">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            <h3 className="text-white font-black text-sm sm:text-lg tracking-widest uppercase mb-2">Vault Selector</h3>
                            <p className="text-slate-500 text-[10px] sm:text-sm max-w-md px-4">Select an accessible Sprint from the menu to open the Dropbox and share resources with your team.</p>
                        </div>
                    )}
                </div>

            </div>
        </SidebarHeader>
    );
}