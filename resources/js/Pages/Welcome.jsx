import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to Inertia" />
            
            <div className="min-h-screen bg-[#0f0822] flex flex-col items-center justify-center relative overflow-hidden font-sans">
                
                {/* Arka Plan Neon Efektleri */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 text-center max-w-3xl px-6">
                    
                    {/* Projenin Kendi Logosu (Kutucuk Kaldırıldı) */}
                    <div className="mb-8 flex justify-center">
                        <img 
                            src="/images/logo.png"  
                            alt="Inertia Logo" 
                            className="w-40 md:w-48 h-auto object-contain mix-blend-screen brightness-[1.3] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform hover:scale-105" 
                        />
                    </div>

                    {/* Başlık */}
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-xl">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                            Real Time Workspace
                        </span>
                    </h1>

                    {/* Açıklama Metni */}
                    <p className="text-slate-400 text-base md:text-lg mb-12 leading-relaxed font-medium max-w-xl mx-auto">
                        Use the email address and password provided to you by your administrator to log in to the system. External registrations are not allowed.
                    </p>

                    {/* Aksiyon Butonları */}
                    <div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center px-10 py-4 text-sm font-black tracking-widest text-white uppercase transition-all duration-300 bg-emerald-600/80 border border-emerald-500/50 rounded-xl hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                            >
                                Enter Workspace &rarr;
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center px-10 py-4 text-sm font-black tracking-widest text-white uppercase transition-all duration-300 bg-[#1a0b2e] border border-purple-500/50 rounded-xl hover:bg-purple-600/30 hover:border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]"
                            >
                                System Login &rarr;
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}