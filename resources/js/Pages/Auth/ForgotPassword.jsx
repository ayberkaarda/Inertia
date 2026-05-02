import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

            <div className="min-h-screen bg-[#0f0822] flex flex-col items-center justify-center relative overflow-hidden font-sans">
                
                {/* Arka Plan Neon Efektleri */}
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 w-full flex flex-col items-center px-4">
                    
                    {/* Üstteki Logo Alanı */}
                    <Link href="/" className="mb-8 flex justify-center group">
                        <img 
                            src="/images/logo.png"  
                            alt="Inertia Logo" 
                            className="w-32 md:w-40 h-auto object-contain mix-blend-screen brightness-[1.3] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform duration-500 group-hover:scale-110" 
                        />
                    </Link>

                    {/* Ana Kutu */}
                    <div className="w-full sm:max-w-md px-8 py-10 bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-3xl sm:rounded-[2.5rem]">
                        
                        {/* Başlık ve Açıklama */}
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-black text-white tracking-tight mb-3">System Recovery</h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Forgot your password? No problem. Enter your email address and we’ll send you a secure link to set a new one.
                            </p>
                        </div>

                        {/* Başarı Mesajı (Mail gönderildiğinde çıkar) */}
                        {status && (
                            <div className="mb-6 font-medium text-xs text-emerald-400 text-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-5">
                            {/* Email Alanı */}
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full bg-[#1a0b2e] border ${errors.email ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all`}
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.email}</p>}
                            </div>

                            {/* Buton ve Geri Dönüş Linki */}
                            <div className="mt-2 flex flex-col gap-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className={`w-full bg-purple-600/80 hover:bg-purple-500 px-8 py-3.5 rounded-xl font-black tracking-widest uppercase text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all flex justify-center items-center ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Transmitting...' : 'Send Reset Link'}
                                </button>
                                
                                <div className="text-center">
                                    <Link href={route('login')} className="text-xs font-bold text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-wider">
                                        &larr; Back to Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}