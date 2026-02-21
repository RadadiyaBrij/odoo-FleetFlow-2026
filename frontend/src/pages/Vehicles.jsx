import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Truck, X, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Vehicles() {
    const { can } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', licensePlate: '', vehicleType: 'Truck', model: '', maxCapacityKg: '', acquisitionCost: '' });

    const fetchVehicles = async () => {
        try { const { data } = await api.get('/vehicles'); setVehicles(data); }
        catch { toast.error('Failed to load vehicles'); }
    };
    useEffect(() => { fetchVehicles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', form);
            toast.success('Vehicle added to fleet!');
            setShowModal(false);
            setForm({ name: '', licensePlate: '', vehicleType: 'Truck', model: '', maxCapacityKg: '', acquisitionCost: '' });
            fetchVehicles();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to add vehicle'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vehicle?')) return;
        try { await api.delete(`/vehicles/${id}`); toast.success('Vehicle removed'); fetchVehicles(); }
        catch (err) { toast.error(err.response?.data?.error?.message || 'Cannot delete'); }
    };

    const STATUS_COLORS = { Available: '#4ade80', 'On Trip': '#818cf8', 'In Shop': '#f59e0b', 'Out of Service': '#f87171' };
    const filtered = vehicles.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.licensePlate.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Vehicle Registry</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {can.manage.vehicles ? 'Add, manage & remove fleet vehicles' : '🔍 View Only — Contact Fleet Manager to add vehicles'}
                    </p>
                </div>
                {can.manage.vehicles && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                        <Plus size={20} /> Add Vehicle
                    </button>
                )}
            </header>

            <input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', color: 'inherit', width: '100%', maxWidth: '360px' }} />

            <div className="table-wrapper" style={{ marginTop: 0 }}>
                <table>
                    <thead><tr>
                        <th>Vehicle</th><th>Type</th><th>Capacity</th><th>Odometer</th><th>Status</th>
                        {can.manage.vehicles && <th>Actions</th>}
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>No vehicles found</td></tr>
                            : filtered.map(v => (
                                <tr key={v.id}>
                                    <td><div style={{ fontWeight: 700 }}>{v.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{v.licensePlate}</div></td>
                                    <td>{v.vehicleType}</td>
                                    <td>{v.maxCapacityKg.toLocaleString()} kg</td>
                                    <td>{v.currentOdometer.toLocaleString()} km</td>
                                    <td><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: `${STATUS_COLORS[v.status] || '#94a3b8'}22`, color: STATUS_COLORS[v.status] || '#94a3b8' }}>{v.status}</span></td>
                                    {can.manage.vehicles && <td><button onClick={() => handleDelete(v.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button></td>}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Add New Vehicle</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Vehicle Name</label><input required placeholder="e.g. Volvo FH16" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                    <div className="form-group"><label>License Plate</label><input required placeholder="e.g. MH-01-XX-1234" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Vehicle Type</label>
                                        <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            <option>Truck</option><option>Van</option><option>Trailer</option><option>Tanker</option><option>Pickup</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Model</label><input required placeholder="e.g. 2023 Volvo FH" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Max Capacity (kg)</label><input required type="number" placeholder="e.g. 20000" value={form.maxCapacityKg} onChange={e => setForm({ ...form, maxCapacityKg: e.target.value })} /></div>
                                    <div className="form-group"><label>Acquisition Cost (₹)</label><input type="number" placeholder="e.g. 2500000" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} /></div>
                                </div>
                                <button type="submit" className="btn-primary">Add to Fleet</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
