import { useState } from 'react';
import { ShieldCheck, Zap, Globe, Mail, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SignUp = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
                    <p className="text-slate-500 font-medium italic">Join the next generation of productivity.</p>
                </div>

                <div className="card shadow-2xl shadow-slate-200/50 p-10 animate-in fade-in zoom-in-95 duration-300">
                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                            <p className="text-slate-500 text-sm mt-1">Start managing your projects today.</p>
                        </div>

                        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">{error}</div>}

                        <div className="space-y-4">
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl transition-all outline-none font-medium text-slate-700"
                                />
                            </div>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                            {!loading && <ArrowRight size={20} />}
                        </button>

                        <p className="text-center text-sm text-slate-500">
                            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
                        </p>
                    </form>
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
            </div>
        </div>
    );
};

export default SignUp;
