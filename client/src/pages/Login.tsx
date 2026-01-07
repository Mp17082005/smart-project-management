import { useState } from 'react';
import { ShieldCheck, Zap, Globe, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isForgotMode, setIsForgotMode] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loginData = { ...formData, email: formData.email.toLowerCase().trim() };
            const res = await api.post('/auth/login', loginData);
            localStorage.setItem('token', res.data.token);
            await refreshUser();
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email: formData.email });
            setMessage(res.data.msg);
            if (res.data.tempPass) {
                setMessage(`Recovery message: ${res.data.msg}. (Dev Mode temp pass: ${res.data.tempPass})`);
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Could not send recovery email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-6">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">ProjectFlow</h1>
                    <p className="text-slate-500 font-medium italic">Elevating team productivity, one task at a time.</p>
                </div>

                <div className="card shadow-2xl shadow-slate-200/50 p-10 animate-in fade-in zoom-in-95 duration-300">
                    {!isForgotMode ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                                <p className="text-slate-500 text-sm mt-1">Please log in to your account.</p>
                            </div>

                            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-pulse">{error}</div>}

                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl transition-all outline-none font-medium text-slate-700"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl transition-all outline-none font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotMode(true)}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                                {!loading && <ArrowRight size={20} />}
                            </button>

                            <p className="text-center text-sm text-slate-500">
                                Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                                <p className="text-slate-500 text-sm mt-1">Enter your email to receive a recovery code.</p>
                            </div>

                            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                            {message && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold">{message}</div>}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl transition-all outline-none font-medium text-slate-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Recovery Email"}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIsForgotMode(false); setError(''); setMessage(''); }}
                                className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center gap-2 text-slate-500 italic text-[10px] font-bold">
                        <Zap size={14} className="text-amber-500" />
                        Fast Interface
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 italic text-[10px] font-bold text-right justify-end">
                        <Globe size={14} className="text-blue-500" />
                        Global Access
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] mt-10">
                    By continuing, you agree to ProjectFlow's <a href="#" className="underline font-bold text-slate-500">Terms of Service</a> and <a href="#" className="underline font-bold text-slate-500">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default Login;
