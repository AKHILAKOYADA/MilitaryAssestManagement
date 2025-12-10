const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 mx-4 rounded-md transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-900/10 text-white border-l-4 border-emerald-500 shadow-lg shadow-emerald-900/20'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`
        }
    >
        <Icon size={18} className={({ isActive }) => isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
    </NavLink>
);

return (
    <nav className="w-64 h-screen bg-[#0b0f14] border-r border-gray-800 flex flex-col z-50">
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-800/50">
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Shield size={18} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-white leading-none">MILITARY ASSET</h1>
                <p className="text-[10px] text-gray-500 tracking-wider">Management System</p>
            </div>
        </div>

        <div className="px-6 pt-8 pb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Navigation</p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/purchases" icon={ShoppingCart} label="Purchases" />
            <NavItem to="/transfers" icon={ArrowRightLeft} label="Transfers" />
            <NavItem to="/assignments" icon={Users} label="Assignments" />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/50">
            <div className="flex items-center gap-2 text-gray-600">
                <Package size={14} />
                <span className="text-xs font-medium">Asset Management v1.0</span>
            </div>
        </div>
    </nav>
);
};

export default Navbar;
