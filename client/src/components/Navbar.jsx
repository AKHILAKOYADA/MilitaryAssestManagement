import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowRightLeft, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `group flex items-center gap-4 px-6 py-3 mx-2 rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden ${isActive
                    ? 'bg-gradient-to-r from-[--accent-primary] to-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                    : 'text-[--text-secondary] hover:bg-[--bg-tertiary] hover:text-white hover:translate-x-1'
                }`
            }
        >
            <Icon size={20} className="relative z-10" />
            <span className="font-medium relative z-10 tracking-wide">{label}</span>
            {/* Subtle glow effect for active state */}
            {({ isActive }) => isActive && <div className="absolute inset-0 bg-white/10 blur-sm"></div>}
        </NavLink>
    );

    return (
        <nav className="w-72 h-screen bg-[--bg-secondary] border-r border-[--glass-border] flex flex-col py-6 relative z-50">
            {/* Logo Section - Centered */}
            <div className="mb-10 px-6 text-center">
                <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase">
                        MAMS
                    </h1>
                </div>
                <p className="text-xs font-semibold text-[--text-secondary] tracking-widest uppercase opacity-70">
                    Military Asset Management
                </p>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[--glass-border] to-transparent mx-auto mt-6"></div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 space-y-3">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/purchases" icon={ShoppingCart} label="Purchases" />
                <NavItem to="/transfers" icon={ArrowRightLeft} label="Transfers" />
                <NavItem to="/assignments" icon={Users} label="Assignments" />
            </div>

            {/* User Profile Section */}
            <div className="px-6 mt-6">
                <div className="glass-panel p-4 bg-[--bg-primary]/50 border-[--glass-border]">
                    <div className="text-center mb-3">
                        <p className="text-sm font-bold text-white tracking-wide">{user?.username}</p>
                        <p className="text-[10px] uppercase tracking-wider text-[--accent-secondary] font-bold mt-1">
                            {user?.role?.replace('_', ' ')}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
