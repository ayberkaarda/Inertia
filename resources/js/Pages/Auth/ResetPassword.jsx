import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    // Sayfa değiştirilirse/kapanırsa güvenlik için şifre alanlarını sıfırla
    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />

            <div className="min-h-screen bg-[#0f0822] flex flex-col items-center justify-center relative overflow-hidden font-sans">
                
                {/* Arka Plan Neon Efektleri */}
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 w-full flex flex-col items-center px-4">
                    
                    <Link href="/" className="mb-8 flex justify-center group">
                        <img 
                            src="/images/logo.png"  
                            alt="Inertia Logo" 
                            className="w-32 md:w-40 h-auto object-contain mix-blend-screen brightness-[1.3] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform duration-500 group-hover:scale-110" 
                        />
                    </Link>

                    <div className="w-full sm:max-w-md px-8 py-10 bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-3xl sm:rounded-[2.5rem]">
                        
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-black text-white tracking-tight">Create New Password</h2>
                            <p className="text-[10px] text-purple-400 font-mono font-bold tracking-widest mt-2">
                                ENCRYPTING NEW CREDENTIALS
                            </p>
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-5">
                            {/* Email Alanı */}
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full bg-[#1a0b2e] border ${errors.email ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all`}
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    readOnly // Kullanıcının maili değiştirmesini önlemek istersen bu kalabilir, değilse silebilirsin.
                                />
                                {errors.email && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.email}</p>}
                            </div>

                            {/* Yeni Parola Alanı */}
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={`w-full bg-[#1a0b2e] border ${errors.password ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all`}
                                    autoComplete="new-password"
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.password}</p>}
                            </div>

                            {/* Parola Tekrar Alanı */}
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className={`w-full bg-[#1a0b2e] border ${errors.password_confirmation ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all`}
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.password_confirmation}</p>}
                            </div>

                            {/* Submit Butonu */}
                            <div className="mt-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className={`w-full bg-emerald-600/80 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-black tracking-widest uppercase text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_25px_rgba(5,150,105,0.6)] transition-all flex justify-center items-center ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Securing...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}