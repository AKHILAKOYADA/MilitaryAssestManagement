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
            className={`glass-panel p-6 flex items-start justify-between relative overflow-hidden group ${onClick ? 'cursor-pointer hover:bg-[--bg-tertiary]' : ''}`}
        >
            <div className="z-10">
                <p className="text-[--text-secondary] text-sm font-medium mb-1">{label}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
                <Icon size={24} />
            </div>
            {/* Hover glow */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-all`}></div>
        </div>
    );

    if (!metrics) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                        Base Operations Dashboard
                    </h1>
                    <p className="text-[--text-secondary] text-lg">Overview of asset movements and logistics</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4 glass-panel p-3 rounded-2xl shadow-lg items-center text-[--text-secondary]">
                    <div className="flex items-center gap-2 border-r border-[--glass-border] pr-4">
                        <span className="text-xs uppercase tracking-wider font-semibold">Period</span>
                        <input
                            type="date" name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="bg-transparent border-none text-sm text-[--text-primary] focus:ring-0 focus:outline-none cursor-pointer"
                        />
                        <span>-</span>
                        <input
                            type="date" name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="bg-transparent border-none text-sm text-[--text-primary] focus:ring-0 focus:outline-none cursor-pointer"
                        />
                    </div>
                    <div className="pl-2">
                        <select
                            name="equipment_type"
                            value={filters.equipment_type}
                            onChange={handleFilterChange}
                            className="bg-transparent border-none text-sm text-[--text-primary] focus:ring-0 focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="" className="bg-[--bg-primary]">All Equipment</option>
                            {assets.map(t => <option key={t} value={t} className="bg-[--bg-secondary]">{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard label="Opening Balance" value={metrics.openingBalance} icon={Package} color="blue" />
                <StatCard
                    label="Net Movement"
                    value={(metrics.netMovement > 0 ? '+' : '') + metrics.netMovement}
                    icon={metrics.netMovement >= 0 ? TrendingUp : TrendingDown}
                    color={metrics.netMovement >= 0 ? "emerald" : "red"}
                    onClick={() => setShowNetDetails(!showNetDetails)}
                />
                <StatCard label="Closing Balance" value={metrics.closingBalance} icon={Shield} color="indigo" />
                <StatCard label="Expended" value={metrics.details.expended} icon={BarChart3} color="orange" />
            </div>

            {showNetDetails && (
                <div className="glass-panel p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4 border-b border-[--glass-border] pb-2">Net Movement Breakdown</h3>
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-sm text-[--text-secondary]">Purchases</p>
                            <p className="text-2xl font-bold text-emerald-400">+{metrics.details.purchases}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[--text-secondary]">Transfers In</p>
                            <p className="text-2xl font-bold text-blue-400">+{metrics.details.transferIn}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[--text-secondary]">Transfers Out</p>
                            <p className="text-2xl font-bold text-red-400">-{metrics.details.transferOut}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-4">Activity Overview</h3>
                <div className="h-64 flex items-center justify-center text-[--text-secondary]">
                    {/* Placeholder for a chart. Need data series over time to do a real chart. */}
                    <p>Select date range to view trends</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
