import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, TrendingDown, Package, Shield } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        equipment_type: ''
    });
    const [bases, setBases] = useState([]);
    const [assets, setAssets] = useState([]);
    const [showNetDetails, setShowNetDetails] = useState(false);

    useEffect(() => {
        // Fetch Base/Asset metadata for filters
        const fetchMeta = async () => {
            try {
                if (user.role === 'admin') {
                    const basesRes = await axios.get(`${API_URL}/api/bases`);
                    setBases(basesRes.data);
                }
                const assetsRes = await axios.get(`${API_URL}/api/assets`);
                // Unique types
                const types = [...new Set(assetsRes.data.map(a => a.type))];
                setAssets(types);
            } catch (err) { console.error(err); }
        };
        fetchMeta();
    }, [user]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const query = new URLSearchParams(filters).toString();
                const res = await axios.get(`${API_URL}/api/dashboard?${query}`);
                setMetrics(res.data);
            } catch (err) { console.error(err); }
        };
        fetchMetrics();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const StatCard = ({ label, value, subtext, icon: Icon, colorClass, borderColorClass, onClick }) => (
        <div
            onClick={onClick}
            className={`bg-[#1e2329] p-6 rounded-lg border-t-4 ${borderColorClass} shadow-xl relative overflow-hidden group min-h-[160px] flex flex-col justify-between ${onClick ? 'cursor-pointer hover:border-gold-500/50' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                        <div className={`p-1 rounded bg-gray-700/50 text-gray-400`}>
                            <Icon size={14} />
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1">{value}</h3>
                    <p className="text-xs text-gray-500 font-medium">{subtext}</p>
                </div>
            </div>
            {/* Hover Effect */}
            <div className={`absolute -bottom-6 -right-6 text-white opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                <Icon size={120} />
            </div>
        </div>
    );

    if (!metrics) return <div className="p-10 text-emerald-500 flex justify-center items-center font-mono">LOADING SYSTEM DATA...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-gray-400 text-sm">Welcome back, {user?.username || 'System Administrator'}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1e2329] text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                    <span className="text-xs">▼</span> Filters
                </button>
            </div>

            <div className="grid grid-cols-4 gap-8 mb-8">
                <StatCard
                    label="Opening Balance"
                    value={metrics.openingBalance.toLocaleString()}
                    subtext="Total assets at start"
                    icon={Package}
                    borderColorClass="border-emerald-500"
                    colorClass="text-emerald-500"
                />
                <StatCard
                    label="Current Balance"
                    value={metrics.closingBalance.toLocaleString()}
                    subtext="Available inventory"
                    icon={Shield} // or Pulse
                    borderColorClass="border-blue-500"
                    colorClass="text-blue-500"
                />
                <StatCard
                    label="Net Movement"
                    value={(metrics.netMovement > 0 ? '+' : '') + metrics.netMovement}
                    subtext="Click for details"
                    icon={TrendingUp}
                    borderColorClass="border-cyan-500"
                    colorClass="text-cyan-500"
                    onClick={() => setShowNetDetails(!showNetDetails)}
                />
                <StatCard
                    label="Assigned"
                    value={metrics.details.assigned || 0} // Ensure assigned is in metrics or use mock
                    subtext="To personnel"
                    icon={Users} // Assuming Users icon for Assigned
                    borderColorClass="border-orange-500"
                    colorClass="text-orange-500"
                />
            </div>

            {showNetDetails && (
                <div className="glass-panel p-6 mb-8 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-[--accent-primary]">
                    <h3 className="text-lg font-bold mb-4 border-b border-[--border-subtle] pb-2 font-[--font-heading] uppercase tracking-wider text-[--text-gold]">Movement Breakdown</h3>
                    <div className="grid grid-cols-3 gap-8 text-center bg-[--bg-primary]/30 p-4 rounded border border-[--border-subtle]">
                        <div>
                            <p className="text-xs text-[--text-muted] uppercase tracking-widest mb-1">Procured</p>
                            <p className="text-2xl font-bold text-[--text-gold]">+{metrics.details.purchases}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[--text-muted] uppercase tracking-widest mb-1">Inbound</p>
                            <p className="text-2xl font-bold text-emerald-400">+{metrics.details.transferIn}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[--text-muted] uppercase tracking-widest mb-1">Outbound</p>
                            <p className="text-2xl font-bold text-red-500">-{metrics.details.transferOut}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[--border-subtle] pb-2">
                    <h3 className="text-lg font-bold font-[--font-heading] uppercase tracking-wider text-white">
                        Activity Log
                    </h3>
                </div>

                <div className="h-64 flex flex-col items-center justify-center text-[--text-secondary] bg-[--bg-primary] rounded border border-[--border-subtle]">
                    <BarChart3 size={48} className="mb-4 opacity-20 text-[--text-muted]" />
                    <p className="text-xs tracking-widest font-bold">NO HISTORICAL TRENDS AVAILABLE</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
