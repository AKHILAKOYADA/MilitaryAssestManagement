import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
            <div>
                {/* Page Title placeholder or Breadcrumbs could go here, but image shows page specific titles below */}
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">{user?.username || 'System Administrator'}</p>
                        <p className="text-xs text-red-500 font-bold tracking-wider uppercase">{user?.role || 'ADMINISTRATOR'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                        <User size={20} />
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-sm font-medium transition-colors"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
