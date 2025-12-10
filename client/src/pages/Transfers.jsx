import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Transfers = () => {
    const { user } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [bases, setBases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        asset_id: '',
        quantity: 1,
        source_base_id: user.base_id || '',
        dest_base_id: ''
    });

    useEffect(() => {
        fetchHistory();
        fetchMeta();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/transactions`);
            setTransfers(res.data.filter(t => t.type === 'TRANSFER'));
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
                type: 'TRANSFER',
                ...formData
            });
            setIsModalOpen(false);
            fetchHistory();
        } catch (err) { alert(err.response?.data || err.message); }
    };

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <h1 className="text-4xl text-white uppercase tracking-widest title-underline">
                    Base <span className="text-orange-500">Transfers</span>
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    <ArrowRightLeft size={20} /> Initiate Transfer
                </button>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Asset</th>
                            <th className="p-4">Movement</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Auth By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[--glass-border]">
                        {transfers.map(t => (
                            <tr key={t.id} className="hover:bg-[--bg-secondary]">
                                <td className="p-4">{new Date(t.timestamp).toLocaleDateString()}</td>
                                <td className="p-4 font-medium">{t.asset_name}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-400">{t.source_base}</span>
                                        <ArrowRightLeft size={14} className="text-[--text-secondary]" />
                                        <span className="text-orange-400">{t.dest_base}</span>
                                    </div>
                                </td>
                                <td className="p-4">{t.quantity}</td>
                                <td className="p-4 text-[--text-secondary]">{t.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-panel p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Transfer Assets</h2>
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
                                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">From Base</label>
                                    <select
                                        className="input-field"
                                        value={formData.source_base_id}
                                        onChange={e => setFormData({ ...formData, source_base_id: e.target.value })}
                                        disabled={user.role !== 'admin'}
                                        required
                                    >
                                        <option value="">Select Base</option>
                                        {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">To Base</label>
                                    <select
                                        className="input-field"
                                        value={formData.dest_base_id}
                                        onChange={e => setFormData({ ...formData, dest_base_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Base</option>
                                        {bases.filter(b => b.id != formData.source_base_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
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

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-[--bg-tertiary] text-white flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 justify-center">Confirm Transfer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;
