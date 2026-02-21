import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Lock, X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Performance() {
    const { can } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [showStatusModal, setShowStatusModal] = useState(null);
    const [newStatus, setNewStatus] = useState('On Duty');

    const fetchDrivers = async () => {
        try { const { data } = await api.get('/drivers'); setDrivers(data); }
        catch { toast.error('Failed to load driver data'); }
    };
    useEffect(() => { fetchDrivers(); }, []);

    const now = new Date();
    const isExpired = (d) => new Date(d.licenseExpiryDate) < now;
    const isExpiringSoon = (d) => {
        const exp = new Date(d.licenseExpiryDate);
        const in30 = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
        return exp >= now && exp <= in30;
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/drivers/${showStatusModal}/status`, { status: newStatus });
            toast.success('Driver status updated');
            setShowStatusModal(null);
            fetchDrivers();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to update status'); }
    };

    const STATUS_COLORS = { 'On Duty': '#4ade80', 'Taking a Break': '#fbbf24', Suspended: '#f87171' };
    const safetyColor = (s) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header style={{ marginBottom: '2rem' }}>
                <div className="flex-between">
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Driver Performance & Safety</h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                            {can.manage.performance ? 'Manage driver status, safety scores & license compliance' : '🔍 View Only — Contact Safety Officer to update driver status'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>
                            🔒 {drivers.filter(d => isExpired(d)).length} Expired Licenses
                        </div>
                        <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                            ⚠️ {drivers.filter(d => isExpiringSoon(d)).length} Expiring Soon
                        </div>
                    </div>
                </div>
            </header>

            <div className="table-wrapper" style={{ marginTop: 0 }}>
                <table>
                    <thead><tr>
                        <th>Driver</th><th>License #</th><th>Expiry</th><th>Completion Rate</th><th>Safety Score</th><th>Complaints</th><th>Status</th>
                        {can.manage.performance && <th>Actions</th>}
                    </tr></thead>
                    <tbody>
                        {drivers.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>No drivers found</td></tr>
                            : drivers.map(d => {
                                const expired = isExpired(d);
                                const expiring = isExpiringSoon(d);
                                const rate = d.tripsCompleted > 0 ? Math.min(Math.round((d.tripsCompleted / (d.tripsCompleted + d.complaintsCount + 1)) * 100), 100) : 0;
                                return (
                                    <tr key={d.id} style={{ opacity: expired ? 0.8 : 1 }}>
                                        <td><div style={{ fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{d.email}</div></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.licenseNumber}</td>
                                        <td>
                                            <span style={{ color: expired ? '#f87171' : expiring ? '#fbbf24' : 'inherit', fontWeight: expired || expiring ? 700 : 400 }}>
                                                {new Date(d.licenseExpiryDate).toLocaleDateString('en-IN')}
                                            </span>
                                            {expired && <span style={{ marginLeft: '6px', fontSize: '0.68rem', background: 'rgba(239,68,68,0.2)', padding: '1px 6px', borderRadius: '8px', color: '#f87171', fontWeight: 700 }}>EXPIRED</span>}
                                            {expiring && !expired && <span style={{ marginLeft: '6px', fontSize: '0.68rem', background: 'rgba(245,158,11,0.2)', padding: '1px 6px', borderRadius: '8px', color: '#fbbf24', fontWeight: 700 }}>SOON</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '3px' }}>
                                                    <div style={{ height: '100%', width: `${rate}%`, background: safetyColor(rate), borderRadius: '3px', transition: 'width 0.5s' }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '32px' }}>{rate}%</span>
                                            </div>
                                        </td>
                                        <td><span style={{ fontWeight: 800, color: safetyColor(d.safetyScore), fontSize: '1.05rem' }}>{d.safetyScore.toFixed(1)}</span><span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>/100</span></td>
                                        <td style={{ fontWeight: d.complaintsCount > 0 ? 700 : 400, color: d.complaintsCount > 0 ? '#f87171' : 'inherit' }}>{d.complaintsCount}</td>
                                        <td>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: `${STATUS_COLORS[d.status] || '#94a3b8'}22`, color: STATUS_COLORS[d.status] || '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                {expired && <Lock size={10} />}{d.status}
                                            </span>
                                        </td>
                                        {can.manage.performance && (
                                            <td><button onClick={() => { setShowStatusModal(d.id); setNewStatus(d.status); }} style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Update Status</button></td>
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
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal" style={{ maxWidth: '400px' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Update Driver Status</h2>
                                <button onClick={() => setShowStatusModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpdateStatus}>
                                <div className="form-group"><label>New Duty Status</label>
                                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ paddingLeft: '1rem' }}>
                                        <option value="On Duty">On Duty</option>
                                        <option value="Taking a Break">Taking a Break</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary">Update Status</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
