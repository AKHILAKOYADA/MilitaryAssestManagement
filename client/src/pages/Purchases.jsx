import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Purchases = () => {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [assets, setAssets] = useState([]);
    const [bases, setBases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        asset_id: '',
        quantity: 1,
        dest_base_id: user.base_id || ''
    });

    useEffect(() => {
        fetchHistory();
        fetchMeta();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/transactions`);
            setPurchases(res.data.filter(t => t.type === 'PURCHASE'));
        } catch (err) { console.error(err); }
    };

    const fetchMeta = async () => {
        try {
            const [assetRes, baseRes] = await Promise.all([
                axios.get(`${API_URL}/api/assets`),
                axios.get(`${API_URL}/api/bases`)
            ]);
            setAssets(assetRes.data);
            setBases(baseRes.data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/transactions`, {
                type: 'PURCHASE',
                ...formData
            });
            setIsModalOpen(false);
            fetchHistory();
        } catch (err) { alert(err.response?.data || err.message); }
    };

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Procurement Log
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-6 py-3 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Record New Purchase
                </button>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[--bg-tertiary] text-[--text-secondary] text-xs uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Asset</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Base</th>
                            <th className="p-4">Recorded By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[--glass-border]">
                        {purchases.map(p => (
                            <tr key={p.id} className="hover:bg-[--bg-secondary]">
                                <td className="p-4">{new Date(p.timestamp).toLocaleDateString()}</td>
                                <td className="p-4 font-medium">{p.asset_name}</td>
                                <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">{p.type}</span></td>
                                <td className="p-4">{p.quantity}</td>
                                <td className="p-4">{p.dest_base}</td>
                                <td className="p-4 text-[--text-secondary]">{p.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-panel p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Record New Purchase</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Asset</label>
                                <select
                                    className="input-field"
                                    value={formData.asset_id}
                                    onChange={e => setFormData({ ...formData, asset_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Asset</option>
                                    {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Quantity</label>
                                <input
                                    type="number" className="input-field" min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            {user.role === 'admin' && (
                                <div>
                                    <label className="block text-sm mb-1">Destination Base</label>
                                    <select
                                        className="input-field"
                                        value={formData.dest_base_id}
                                        onChange={e => setFormData({ ...formData, dest_base_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Base</option>
                                        {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-[--bg-tertiary] text-white flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 justify-center">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
