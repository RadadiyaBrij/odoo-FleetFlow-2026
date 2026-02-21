import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wrench, X, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Maintenance() {
    const { can } = useAuth();
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', issueType: 'Engine Repair', description: '', cost: '', serviceDate: '' });

    const fetchData = async () => {
        try {
            const [l, v] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
            setLogs(l.data); setVehicles(v.data);
        } catch { toast.error('Failed to load maintenance logs'); }
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/maintenance', form);
            toast.success('Maintenance log created — vehicle set to In Shop');
            setShowModal(false);
            setForm({ vehicleId: '', issueType: 'Engine Repair', description: '', cost: '', serviceDate: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to create log'); }
    };

    const handleComplete = async (id) => {
        try {
            await api.patch(`/maintenance/${id}/complete`, { completedDate: new Date().toISOString(), technicianName: 'Workshop Team' });
            toast.success('Maintenance completed — vehicle set to Available');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to complete'); }
    };

    const STATUS_COLORS = { Pending: '#f59e0b', 'In Progress': '#818cf8', Completed: '#4ade80' };
    const ISSUE_TYPES = ['Engine Repair', 'Tire Change', 'Oil Service', 'Brake Service', 'Electrical', 'Body Work', 'Routine Check', 'Other'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Maintenance Logs</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {can.manage.maintenance ? 'Create service logs & complete maintenance (auto-updates vehicle status)' : '🔍 View Only — Contact Fleet Manager to manage maintenance'}
                    </p>
                </div>
                {can.manage.maintenance && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                        <Plus size={20} /> New Service Log
                    </button>
                )}
            </header>

            <div className="table-wrapper" style={{ marginTop: 0 }}>
                <table>
                    <thead><tr>
                        <th>Vehicle</th><th>Issue Type</th><th>Description</th><th>Cost</th><th>Service Date</th><th>Status</th>
                        {can.manage.maintenance && <th>Action</th>}
                    </tr></thead>
                    <tbody>
                        {logs.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>No maintenance logs found</td></tr>
                            : logs.map(l => (
                                <tr key={l.id}>
                                    <td><div style={{ fontWeight: 700 }}>{l.vehicle?.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{l.vehicle?.licensePlate}</div></td>
                                    <td>{l.issueType}</td>
                                    <td style={{ maxWidth: '200px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{l.description || '—'}</td>
                                    <td style={{ fontWeight: 700 }}>₹{l.cost.toLocaleString()}</td>
                                    <td>{new Date(l.serviceDate).toLocaleDateString('en-IN')}</td>
                                    <td><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: `${STATUS_COLORS[l.status] || '#94a3b8'}22`, color: STATUS_COLORS[l.status] || '#94a3b8' }}>{l.status}</span></td>
                                    {can.manage.maintenance && (
                                        <td>{l.status === 'Pending' && <button onClick={() => handleComplete(l.id)} style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Complete</button>}
                                            {l.status === 'Completed' && <CheckCircle size={16} color="#4ade80" />}</td>
                                    )}
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
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>New Service Log</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group"><label>Vehicle</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Issue Type</label>
                                        <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Service Date</label><input required type="date" value={form.serviceDate} onChange={e => setForm({ ...form, serviceDate: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label>Description</label><input placeholder="Describe the issue..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="form-group"><label>Estimated Cost (₹)</label><input required type="number" placeholder="e.g. 15000" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
                                <div style={{ background: 'rgba(245,158,11,0.07)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>⚠️ Vehicle Status Auto-Update</p>
                                    <p style={{ fontSize: '0.76rem', opacity: 0.8, marginTop: '2px' }}>Creating this log will automatically set the vehicle status to "In Shop". Completing it will set it back to "Available".</p>
                                </div>
                                <button type="submit" className="btn-primary">Create Service Log</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
