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
                `group flex items-center gap-4 px-6 py-4 mx-4 my-3 rounded-lg border border-slate-800 transition-all duration-300 shadow-md ${isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-900/40 border-amber-500 transform scale-105'
                    : 'bg-slate-900 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 hover:shadow-lg hover:-translate-y-1'
                }`
            }
        >
            <Icon size={20} />
            <span className="font-bold tracking-wider text-sm">{label}</span>
        </NavLink>
    );

    return (
        <nav className="w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
            {/* Logo Section */}
            <div className="p-8 text-center border-b border-slate-800">
                <h1 className="text-3xl font-black tracking-widest text-amber-500 uppercase font-[--font-heading] mb-1">
                    MAMS
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                    Asset Command
                </p>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-8 space-y-2">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/purchases" icon={ShoppingCart} label="Purchases" />
                <NavItem to="/transfers" icon={ArrowRightLeft} label="Transfers" />
                <NavItem to="/assignments" icon={Users} label="Assignments" />
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-amber-600 flex items-center justify-center text-white font-bold text-lg">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-wide">{user?.username}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            {user?.role?.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-red-900/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all text-xs font-bold uppercase tracking-wider rounded"
                >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
