import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--bg-primary] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--bg-secondary)_0%,_var(--bg-primary)_100%)]"></div>

            <div className="glass-panel p-10 w-full max-w-md z-10 relative shadow-2xl border-t-4 border-orange-500">
                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-slate-800 rounded-full text-orange-500 shadow-lg border border-slate-700">
                        <Shield size={64} />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-center mb-2 text-white font-[--font-heading] tracking-widest uppercase">
                    MAMS <span className="text-orange-500">Login</span>
                </h2>
                <p className="text-center text-gray-500 mb-8 font-[--font-heading] text-xs tracking-[0.3em] uppercase">
                    Restricted Access Only
                </p>

                {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Identity</label>
                        <input
                            type="text"
                            className="input-field placeholder-slate-700 focus:border-orange-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="OPERATOR ID"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Access Key</label>
                        <input
                            type="password"
                            className="input-field placeholder-slate-700 focus:border-orange-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full justify-center mt-2 shadow-lg shadow-orange-900/30">
                        Authenticate
                    </button>

                    <div className="mt-6 p-4 bg-slate-800/50 rounded border border-slate-700 text-center">
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Debug Access</p>
                        <div className="text-[10px] text-slate-400 font-mono space-y-1">
                            <p>CDR: <span className="text-white">admin</span> / <span className="text-white">password123</span></p>
                            <p>OFF: <span className="text-white">cmdr_alpha</span> / <span className="text-white">password123</span></p>
                        </div>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        System v2.4 // Classified
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
