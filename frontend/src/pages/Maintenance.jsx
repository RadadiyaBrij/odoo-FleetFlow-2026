import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Wrench } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
    Pending: { color: '#F5BF00', bg: 'rgba(245,191,0,0.12)', border: 'rgba(245,191,0,0.2)' },
    'In Progress': { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.2)' },
    Completed: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)' },
};

const ISSUE_TYPES = ['Engine Repair', 'Tire Change', 'Oil Service', 'Brake Service', 'Electrical', 'Body Work', 'Routine Check', 'Other'];

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
            toast.success('Service log created');
            setShowModal(false);
            setForm({ vehicleId: '', issueType: 'Engine Repair', description: '', cost: '', serviceDate: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to create log'); }
    };

    const handleComplete = async (id) => {
        try {
            await api.patch(`/maintenance/${id}/complete`, { completedDate: new Date().toISOString(), technicianName: 'Workshop Team' });
            toast.success('✅ Maintenance done');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to complete'); }
    };

    const totalCost = logs.reduce((s, l) => s + l.cost, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
                <div>
                    <span className="chip-yellow" style={{ background: '#F9731615', color: '#F97316', borderColor: '#F9731630', marginBottom: '0.4rem' }}>Workshop</span>
                    <h1 className="page-title">Maintenance Logs</h1>
                    <p className="page-subtitle">Track vehicle health and service history</p>
                </div>
                {can.manage.maintenance && (
                    <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> New Service Log
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem', maxWidth: 640 }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #F5BF00', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Pending Jobs</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F5BF00' }}>{logs.filter(l => l.status === 'Pending').length}</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #22C55E', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Completed</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22C55E' }}>{logs.filter(l => l.status === 'Completed').length}</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #38BDF8', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total Cost</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38BDF8' }}>₹{Math.round(totalCost).toLocaleString()}</p>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Vehicle</th><th>Issue Type</th><th>Description</th><th>Cost</th><th>Date</th><th>Status</th>{can.manage.maintenance && <th>Action</th>}</tr></thead>
                    <tbody>
                        {logs.map(l => (
                            <tr key={l.id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{l.vehicle?.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{l.vehicle?.licensePlate}</div>
                                </td>
                                <td><span className="badge" style={{ background: '#F9731615', color: '#F97316', border: '1px solid #F9731630' }}>{l.issueType}</span></td>
                                <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{l.description}</td>
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{l.cost.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-dim)' }}>{new Date(l.serviceDate).toLocaleDateString()}</td>
                                <td>
                                    <span className="badge" style={{ background: STATUS_CONFIG[l.status]?.bg, color: STATUS_CONFIG[l.status]?.color, border: `1px solid ${STATUS_CONFIG[l.status]?.border}` }}>{l.status}</span>
                                </td>
                                {can.manage.maintenance && (
                                    <td>
                                        {l.status === 'Pending' && (
                                            <button onClick={() => handleComplete(l.id)} className="btn-ghost" style={{ padding: '4px 10px', color: '#22C55E', borderColor: '#22C55E30' }}>
                                                <CheckCircle2 size={14} /> Finish
                                            </button>
                                        )}
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
                            <div className="flex-between mb-2">
                                <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Log Service</h2>
                                <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: 6, border: 'none' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group"><label>Vehicle</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Issue Type</label>
                                        <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })}>
                                            {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Service Date</label><input type="date" required value={form.serviceDate} onChange={e => setForm({ ...form, serviceDate: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label>Cost (₹)</label><input type="number" required placeholder="0.00" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} /></div>
                                <div className="form-group"><label>Description</label><textarea rows="3" placeholder="Description of work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '0.75rem 1rem' }} /></div>
                                <button type="submit" className="btn-primary">Create Workshop Log</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
