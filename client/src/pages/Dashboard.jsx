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

    const StatCard = ({ label, value, icon: Icon, color, onClick }) => (
        <div
            onClick={onClick}
            className={`glass-panel p-6 flex flex-col justify-between relative overflow-hidden group min-h-[140px] ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="z-10 flex justify-between items-start">
                <div>
                    <p className="text-[--text-secondary] text-xs uppercase tracking-widest font-[--font-mono] mb-2">{label}</p>
                    <h3 className="text-4xl font-bold font-[--font-heading] text-white tracking-wider">{value}</h3>
                </div>
                <div className={`p-2 border border-${color}-500/30 text-${color}-400`}>
                    <Icon size={20} />
                </div>
            </div>

            {/* Tactical Deco */}
            <div className="absolute bottom-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <Icon size={60} strokeWidth={1} />
            </div>
        </div>
    );

    if (!metrics) return <div className="p-10 font-[--font-mono] text-[--accent-cyan] animate-pulse">Initializing Tactical Feed...</div>;

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-[0.2em] font-[--font-heading] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        Base <span className="text-[--accent-cyan]">Operations</span> Dashboard
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-[--text-secondary] text-xs font-[--font-mono] tracking-widest">
                        <span className="w-2 h-2 bg-[--accent-olive] rounded-full animate-pulse"></span>
                        <span>LIVE DATA FEED // ENCRYPTED</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-panel p-2 flex gap-4 items-center overflow-visible z-20 bg-[--bg-secondary]">
                    <div className="flex items-center gap-2 border-r border-[--border-tech] pr-6 pl-2">
                        <span className="text-[10px] uppercase tracking-widest font-[--font-mono] text-[--text-muted]">Range</span>
                        <input
                            type="date" name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="bg-transparent border border-[--border-subtle] p-1 text-sm text-[--text-primary] focus:border-[--accent-cyan] outline-none font-[--font-mono]"
                        />
                        <span className="text-[--accent-cyan]">-</span>
                        <input
                            type="date" name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="bg-transparent border border-[--border-subtle] p-1 text-sm text-[--text-primary] focus:border-[--accent-cyan] outline-none font-[--font-mono]"
                        />
                    </div>
                    <div className="pr-2">
                        <select
                            name="equipment_type"
                            value={filters.equipment_type}
                            onChange={handleFilterChange}
                            className="bg-[--bg-primary] border border-[--border-subtle] p-1 text-sm text-[--text-primary] focus:border-[--accent-cyan] outline-none font-[--font-mono] min-w-[150px]"
                        >
                            <option value="">ALL ASSETS</option>
                            {assets.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Stock" value={metrics.openingBalance} icon={Package} color="blue" />
                <StatCard
                    label="Net Flow"
                    value={(metrics.netMovement > 0 ? '+' : '') + metrics.netMovement}
                    icon={metrics.netMovement >= 0 ? TrendingUp : TrendingDown}
                    color={metrics.netMovement >= 0 ? "emerald" : "red"}
                    onClick={() => setShowNetDetails(!showNetDetails)}
                />
                <StatCard label="Current Stock" value={metrics.closingBalance} icon={Shield} color="cyan" />
                <StatCard label="Expenditure" value={metrics.details.expended} icon={BarChart3} color="orange" />
            </div>

            {showNetDetails && (
                <div className="glass-panel p-6 mb-8 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-[--accent-warning]">
                    <h3 className="text-lg font-bold mb-4 border-b border-[--border-tech] pb-2 font-[--font-heading] uppercase tracking-wider text-[--accent-warning]">Movement Breakdown</h3>
                    <div className="grid grid-cols-3 gap-8 text-center bg-[--bg-primary]/50 p-4 border border-[--border-subtle]">
                        <div>
                            <p className="text-xs text-[--text-secondary] uppercase tracking-widest mb-1">Procured</p>
                            <p className="text-2xl font-bold font-[--font-mono] text-[--accent-cyan]">+{metrics.details.purchases}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[--text-secondary] uppercase tracking-widest mb-1">Inbound</p>
                            <p className="text-2xl font-bold font-[--font-mono] text-emerald-400">+{metrics.details.transferIn}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[--text-secondary] uppercase tracking-widest mb-1">Outbound</p>
                            <p className="text-2xl font-bold font-[--font-mono] text-red-500">-{metrics.details.transferOut}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel p-6 relative">
                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 bg-[url('https://patterns.ibthemespro.com/images/pattern-09.png')] opacity-5 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 border-b border-[--border-tech] pb-2">
                    <h3 className="text-lg font-bold font-[--font-heading] uppercase tracking-wider text-white">
                        <span className="text-[--accent-cyan] mr-2">///</span>
                        Activity Log
                    </h3>
                    <div className="text-[10px] font-[--font-mono] text-[--text-muted]">
                        SECURE CONNECTION ESTABLISHED
                    </div>
                </div>

                <div className="h-64 flex flex-col items-center justify-center text-[--text-secondary] border border-dashed border-[--border-subtle] bg-[--bg-primary]/30 relative">
                    <div className="absolute top-0 left-0 p-2 text-[--accent-cyan]/50">Checking live feeds...</div>
                    <BarChart3 size={48} className="mb-4 opacity-20 text-[--accent-cyan]" />
                    <p className="font-[--font-mono] text-xs tracking-widest">NO HISTORICAL TRENDS AVAILABLE</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
