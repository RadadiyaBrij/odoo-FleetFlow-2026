import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, X, CheckSquare, Activity } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
    'On Duty': { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)' },
    'Taking a Break': { color: '#F5BF00', bg: 'rgba(245,191,0,0.12)', border: 'rgba(245,191,0,0.2)' },
    Suspended: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

const safetyColor = (s) => s >= 80 ? '#22C55E' : s >= 60 ? '#F5BF00' : '#EF4444';

export default function Performance() {
    const { can } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [showStatusModal, setShowStatusModal] = useState(null);
    const [newStatus, setNewStatus] = useState('On Duty');

    const fetchDrivers = async () => {
        try { const { data } = await api.get('/drivers'); setDrivers(data); }
        catch { toast.error('Failed to load driver performance'); }
    };
    useEffect(() => { fetchDrivers(); }, []);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/drivers/${showStatusModal}/status`, { status: newStatus });
            toast.success('Duty status updated');
            setShowStatusModal(null);
            fetchDrivers();
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
                <div>
                    <span className="chip-yellow" style={{ background: '#22C55E15', color: '#22C55E', borderColor: '#22C55E30', marginBottom: '0.4rem' }}>Safety Compliance</span>
                    <h1 className="page-title">Safety & Performance</h1>
                    <p className="page-subtitle">Monitor driver behavior and regulatory compliance</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Avg Safety Score', value: (drivers.reduce((s, d) => s + d.safetyScore, 0) / (drivers.length || 1)).toFixed(1), color: '#22C55E' },
                    { label: 'Active Drivers', value: drivers.filter(d => d.status === 'On Duty').length, color: '#38BDF8' },
                    { label: 'Total Complaints', value: drivers.reduce((s, d) => s + d.complaintsCount, 0), color: '#EF4444' },
                    { label: 'Completion Rate', value: '94%', color: '#F5BF00' }
                ].map(c => (
                    <div key={c.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: `4px solid ${c.color}`, boxShadow: 'var(--card-shadow)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Driver</th><th>License Expiry</th><th>Complaints</th><th>Safety Score</th><th>Status</th>{can.manage.performance && <th>Action</th>}</tr></thead>
                    <tbody>
                        {drivers.map(d => {
                            const expired = new Date(d.licenseExpiryDate) < new Date();
                            return (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.name}</td>
                                    <td>
                                        <span style={{ color: expired ? '#EF4444' : 'var(--text-sub)', fontWeight: expired ? 700 : 400 }}>
                                            {new Date(d.licenseExpiryDate).toLocaleDateString()}
                                            {expired && <Lock size={12} style={{ marginLeft: 6 }} />}
                                        </span>
                                    </td>
                                    <td style={{ color: d.complaintsCount > 0 ? '#EF4444' : 'var(--text-dim)' }}>{d.complaintsCount}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ flex: 1, height: 6, background: 'var(--bg-input)', borderRadius: 3, maxWidth: 60 }}>
                                                <div style={{ height: '100%', width: `${d.safetyScore}%`, background: safetyColor(d.safetyScore), borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontWeight: 800, color: safetyColor(d.safetyScore) }}>{d.safetyScore}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ background: STATUS_CONFIG[d.status]?.bg, color: STATUS_CONFIG[d.status]?.color, border: `1px solid ${STATUS_CONFIG[d.status]?.border}` }}>{d.status}</span>
                                    </td>
                                    {can.manage.performance && (
                                        <td>
                                            <button onClick={() => { setShowStatusModal(d.id); setNewStatus(d.status); }} className="btn-ghost" style={{ padding: '4px 8px' }}>
                                                <Activity size={13} /> Update
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showStatusModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal" style={{ maxWidth: 360 }}>
                            <div className="flex-between mb-2">
                                <h3 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Adjust Duty Status</h3>
                                <button onClick={() => setShowStatusModal(null)} className="btn-ghost" style={{ border: 'none' }}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleUpdateStatus}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                    {Object.keys(STATUS_CONFIG).map(s => (
                                        <div key={s} onClick={() => setNewStatus(s)} style={{
                                            padding: '12px 16px', borderRadius: 12, border: '1.5px solid', cursor: 'pointer',
                                            borderColor: newStatus === s ? STATUS_CONFIG[s].color : 'var(--border)',
                                            background: newStatus === s ? STATUS_CONFIG[s].bg : 'var(--bg-input)',
                                            color: newStatus === s ? STATUS_CONFIG[s].color : 'var(--text-sub)',
                                            fontWeight: 700, transition: 'all 0.15s'
                                        }}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: 0 }}>Confirm Status Update</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
