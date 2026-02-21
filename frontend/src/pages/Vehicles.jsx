import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
    Available: { color: '#22C55E' },
    'On Trip': { color: '#F5BF00' },
    'In Shop': { color: '#F97316' },
    'Out of Service': { color: '#EF4444' },
};

export default function Vehicles() {
    const { can } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', licensePlate: '', vehicleType: 'Truck', model: '', maxCapacityKg: '', acquisitionCost: '' });

    const fetchVehicles = async () => {
        try { const { data } = await api.get('/vehicles'); setVehicles(data); }
        catch { toast.error('Failed to load fleet'); }
    };
    useEffect(() => { fetchVehicles(); }, []);

    const filtered = vehicles.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', form);
            toast.success('Asset added to registry');
            setShowModal(false);
            setForm({ name: '', licensePlate: '', vehicleType: 'Truck', model: '', maxCapacityKg: '', acquisitionCost: '' });
            fetchVehicles();
        } catch { toast.error('Check details and retry'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <span className="chip-yellow" style={{ marginBottom: '0.4rem' }}>Asset Registry</span>
                    <h1 className="page-title">Fleet Management</h1>
                    <p className="page-subtitle">Configure and monitor your vehicle inventory</p>
                </div>
                {can.manage.vehicles && (
                    <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Register Vehicle
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', maxWidth: 360, marginBottom: '2rem' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input placeholder="Search asset or license..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '3rem' }} />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Asset Name</th><th>Type</th><th>Plate</th><th>Capacity</th><th>Status</th>{can.manage.vehicles && <th>Action</th>}</tr></thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v.id}>
                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{v.name} <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: '0.75rem' }}>— {v.model}</span></td>
                                <td><span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>{v.vehicleType}</span></td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-sub)' }}>{v.licensePlate}</td>
                                <td style={{ color: 'var(--text-sub)' }}>{v.maxCapacityKg} kg</td>
                                <td>
                                    <span className="badge" style={{
                                        background: `${STATUS_CONFIG[v.status]?.color}15`,
                                        color: STATUS_CONFIG[v.status]?.color,
                                        border: `1px solid ${STATUS_CONFIG[v.status]?.color}30`
                                    }}>{v.status}</span>
                                </td>
                                {can.manage.vehicles && (
                                    <td>
                                        <button onClick={async () => { if (confirm('Remove?')) { await api.delete(`/vehicles/${v.id}`); fetchVehicles(); } }} className="btn-ghost" style={{ padding: 6, color: '#EF4444', borderColor: '#EF444430' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <h2 className="page-title mb-2" style={{ fontSize: '1.5rem' }}>Add Asset</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                    <div className="form-group"><label>License Plate</label><input required value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Type</label>
                                        <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                                            <option>Truck</option><option>Van</option><option>Trailer</option><option>Tanker</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Model Ref</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label>Capacity (kg)</label><input type="number" value={form.maxCapacityKg} onChange={e => setForm({ ...form, maxCapacityKg: Number(e.target.value) })} /></div>
                                <button type="submit" className="btn-primary">Save to Inventory</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
