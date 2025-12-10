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
            className={`glass-panel p-6 flex flex-col justify-between group min-h-[140px] ${onClick ? 'cursor-pointer hover:border-gold-500/50' : ''}`}
        >
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-[--text-muted] text-xs uppercase tracking-widest mb-2 font-bold">{label}</p>
                    <h3 className="text-4xl font-black font-[--font-heading] text-white tracking-widest drop-shadow-lg">{value}</h3>
                </div>
                <div className={`p-3 rounded bg-[--bg-tertiary] text-[--text-gold] shadow-inner`}>
                    <Icon size={24} />
                </div>
            </div>

            {/* Subtle background icon */}
            <Icon size={100} className="absolute -bottom-4 -right-4 opacity-5 text-[--text-gold]" />
        </div>
    );

    if (!metrics) return <div className="p-10 text-[--text-gold] flex justify-center items-center"><span className="animate-spin mr-2">⟳</span> Loading Command Center...</div>;

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <div className="text-center">
                    <h1 className="text-4xl text-white mb-2 uppercase tracking-widest title-underline">
                        Base <span className="text-gold">Operations</span>
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-[--bg-secondary] p-2 rounded flex gap-4 items-center shadow-lg border border-[--border-subtle]">
                    <div className="flex items-center gap-2 border-r border-[--border-subtle] pr-6 pl-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[--text-muted]">Range</span>
                        <input
                            type="date" name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="bg-[--bg-primary] border border-[--border-subtle] rounded p-1 text-sm text-[--text-primary] focus:border-[--accent-primary] outline-none"
                        />
                        <span className="text-[--text-muted]">-</span>
                        <input
                            type="date" name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="bg-[--bg-primary] border border-[--border-subtle] rounded p-1 text-sm text-[--text-primary] focus:border-[--accent-primary] outline-none"
                        />
                    </div>
                    <div className="pr-2">
                        <select
                            name="equipment_type"
                            value={filters.equipment_type}
                            onChange={handleFilterChange}
                            className="bg-[--bg-primary] border border-[--border-subtle] rounded p-1 text-sm text-[--text-primary] focus:border-[--accent-primary] outline-none min-w-[150px]"
                        >
                            <option value="">ALL ASSETS</option>
                            {assets.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-10 mb-8">
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
