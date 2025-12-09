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
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="glass-panel p-8 w-full max-w-md z-10 relative">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
                        <Shield size={48} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Secure Access</h2>
                <p className="text-center text-[--text-secondary] mb-8">Military Asset Management System</p>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[--text-secondary] mb-1">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Entet username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[--text-secondary] mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full justify-center mt-6">
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-[--text-secondary]">
                    Mock Credentials: <br />
                    admin / password123 <br />
                    cmdr_alpha / password123
                </div>
            </div>
        </div>
    );
};

export default Login;
