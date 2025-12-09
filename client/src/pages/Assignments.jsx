import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Assignments = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState('ASSIGN'); // ASSIGN or EXPEND
    const [formData, setFormData] = useState({
        asset_id: '',
        quantity: 1,
        source_base_id: user.base_id || '',
        recipient_name: '' // For assignment
    });

    useEffect(() => {
        fetchHistory();
        fetchMeta();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/transactions`);
            setHistory(res.data.filter(t => t.type === 'ASSIGN' || t.type === 'EXPEND'));
        } catch (err) { console.error(err); }
    };

    const fetchMeta = async () => {
        try {
            const assetRes = await axios.get(`${API_URL}/api/assets`);
            setAssets(assetRes.data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/transactions`, {
                type: actionType,
                ...formData
            });
            setIsModalOpen(false);
            fetchHistory();
        } catch (err) { alert(err.response?.data || err.message); }
    };

    const openModal = (type) => {
        setActionType(type);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col items-center mb-10 gap-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Assignments & Expenditures
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => openModal('ASSIGN')}
                        className="btn bg-[--accent-primary] text-white px-6 py-3 shadow-lg shadow-blue-500/20"
                    >
                        <Users size={20} /> Assign to Personnel
                    </button>
                    <button
                        onClick={() => openModal('EXPEND')}
                        className="btn bg-orange-600 text-white px-6 py-3 shadow-lg shadow-orange-600/20"
                    >
                        <AlertTriangle size={20} /> Record Expenditure
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[--bg-tertiary] text-[--text-secondary] text-xs uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Asset</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Recipient / Details</th>
                            <th className="p-4">Officer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[--glass-border]">
                        {history.map(t => (
                            <tr key={t.id} className="hover:bg-[--bg-secondary]">
                                <td className="p-4">{new Date(t.timestamp).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${t.type === 'ASSIGN' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="p-4 font-medium">{t.asset_name}</td>
                                <td className="p-4">{t.quantity}</td>
                                <td className="p-4">{t.recipient_name || '-'}</td>
                                <td className="p-4 text-[--text-secondary]">{t.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-panel p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">
                            {actionType === 'ASSIGN' ? 'Assign Asset to Personnel' : 'Record Asset Expenditure'}
                        </h2>
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

                            <div>
                                <label className="block text-sm mb-1">Quantity</label>
                                <input
                                    type="number" className="input-field" min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            {actionType === 'ASSIGN' && (
                                <div>
                                    <label className="block text-sm mb-1">Recipient Name / ID</label>
                                    <input
                                        type="text" className="input-field"
                                        value={formData.recipient_name}
                                        onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                                        required
                                        placeholder="e.g. Sgt. John Doe"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-[--bg-tertiary] text-white flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 justify-center">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
