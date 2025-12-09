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
                `group flex items-center gap-4 px-6 py-4 mx-0 border-l-2 transition-all duration-200 ease-out relative overflow-hidden ${isActive
                    ? 'border-[--accent-cyan] bg-[--accent-cyan]/10 text-[--accent-cyan]'
                    : 'border-transparent text-[--text-secondary] hover:bg-[--accent-cyan]/5 hover:text-white hover:border-[--accent-cyan]/50'
                }`
            }
        >
            <Icon size={20} className="relative z-10" />
            <span className="font-medium relative z-10 tracking-widest font-[--font-heading] uppercase text-sm">{label}</span>
            {/* Scanline effect for active */}
            {({ isActive }) => isActive && <div className="absolute inset-0 bg-gradient-to-r from-[--accent-cyan]/10 to-transparent"></div>}
        </NavLink>
    );

    return (
        <nav className="w-72 h-screen bg-[--bg-secondary] border-r border-[#1e293b] flex flex-col relative z-50">
            {/* Logo Section */}
            <div className="p-8 pb-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[--accent-cyan] to-transparent opacity-50"></div>

                <h1 className="text-3xl font-black tracking-widest text-[--accent-cyan] uppercase font-[--font-heading] mb-1 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                    MAMS
                </h1>
                <p className="text-[10px] font-bold text-[--text-secondary] tracking-[0.2em] uppercase">
                    Tactical Asset Cmd
                </p>

                <div className="mt-6 flex justify-between items-center px-4">
                    <span className="h-[1px] w-3 bg-[--accent-cyan]"></span>
                    <span className="text-[10px] text-[--text-muted]">SYS.ONLINE</span>
                    <span className="h-[1px] w-3 bg-[--accent-cyan]"></span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-8 space-y-1">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/purchases" icon={ShoppingCart} label="Purchases" />
                <NavItem to="/transfers" icon={ArrowRightLeft} label="Transfers" />
                <NavItem to="/assignments" icon={Users} label="Assignments" />
            </div>

            {/* User Profile Section */}
            <div className="p-6">
                <div className="bg-[--bg-tertiary] border border-[--border-tech] p-4 relative">
                    {/* Corner accents */}
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[--accent-cyan]"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-[--accent-cyan]"></div>

                    <div className="mb-4">
                        <p className="text-xs text-[--text-secondary] uppercase tracking-wider mb-1">Commander</p>
                        <p className="text-sm font-bold text-white tracking-wide font-[--font-mono]">{user?.username}</p>
                        <p className="text-[10px] uppercase tracking-wider text-[--accent-warning] mt-1">
                            [{user?.role?.replace('_', ' ')}]
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <LogOut size={14} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
