import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login Page" />

            <div className="min-h-screen bg-[#0f0822] flex flex-col items-center justify-center relative overflow-hidden font-sans">
                
                {/* Arka Plan Neon Efektleri */}
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 w-full flex flex-col items-center px-4">
                    
                    {/* Üstteki Logo Alanı (Tıklanınca Welcome'a döner) */}
                    <Link href="/" className="mb-8 flex justify-center group">
                        <img 
                            src="/images/logo.png"  
                            alt="Platform Logo" 
                            className="w-32 md:w-40 h-auto object-contain mix-blend-screen brightness-[1.3] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform duration-500 group-hover:scale-110" 
                        />
                    </Link>

                    {/* Ana Login Kutusu */}
                    <div className="w-full sm:max-w-md px-8 py-10 bg-[#160d33]/80 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-3xl sm:rounded-[2.5rem]">
                        
                        {/* Kutu İçi Başlık */}
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-black text-white tracking-tight">Authorization</h2>
                            <p className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest mt-2 flex items-center justify-center gap-2">
                                Login the System
                            </p>
                        </div>

                        {/* Parola sıfırlama vb. durum mesajları */}
                        {status && (
                            <div className="mb-6 font-medium text-xs text-emerald-400 text-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
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
                                    className={`w-full bg-[#1a0b2e] border ${errors.email ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all`}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.email}</p>}
                            </div>

                            {/* Password Alanı */}
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={`w-full bg-[#1a0b2e] border ${errors.password ? 'border-red-500/50' : 'border-purple-500/30'} rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all`}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-wide">{errors.password}</p>}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-5 h-5 bg-[#1a0b2e] border border-purple-500/30 rounded-md group-hover:border-emerald-500/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="absolute opacity-0 w-full h-full cursor-pointer"
                                        />
                                        {/* Özel Checkbox İkonu */}
                                        {data.remember && (
                                            <svg className="w-3.5 h-3.5 text-emerald-400 pointer-events-none drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </div>
                                    <span className="ml-3 text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-bold text-purple-400 hover:text-emerald-400 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className={`w-full bg-emerald-600/80 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-black tracking-widest uppercase text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_25px_rgba(5,150,105,0.6)] transition-all flex justify-center items-center ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}