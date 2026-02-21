import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, UserCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
    AVAILABLE: { color: '#22C55E', label: 'AVAILABLE' },
    'ON DUTY': { color: '#38BDF8', label: 'ON DUTY' },
    'ON LEAVE': { color: '#F97316', label: 'ON LEAVE' },
    SUSPENDED: { color: '#EF4444', label: 'SUSPENDED' },
};

export default function Drivers() {
    const { can } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: 'LMV' });

    const fetchDrivers = async () => {
        try { const { data } = await api.get('/drivers'); setDrivers(data); }
        catch { toast.error('Failed to load personnel'); }
    };
    useEffect(() => { fetchDrivers(); }, []);

    const filtered = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase()));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', form);
            toast.success('Personnel enrolled');
            setShowModal(false);
            setForm({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: 'LMV' });
            fetchDrivers();
        } catch (err) {
            const serverError = err.response?.data?.error?.message || err.response?.data?.message || 'Check license data';
            toast.error(serverError);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/drivers/${id}/status`, { status: newStatus });
            toast.success(`Personnel status: ${newStatus}`);
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Update failed');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <span className="chip-blue" style={{ marginBottom: '0.4rem' }}>Personnel Registry</span>
                    <h1 className="page-title">Driver Profiles</h1>
                    <p className="page-subtitle">Manage certified fleet personnel and compliance</p>
                </div>
                {can.manage.drivers && (
                    <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Enroll Driver
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', maxWidth: 360, marginBottom: '2rem' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input placeholder="Search driver or license ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '3rem' }} />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Full Name</th><th>Compliance ID</th><th>Category</th><th>Safety Score</th><th>Trips</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{d.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{d.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-sub)' }}>{d.licenseNumber}</td>
                                <td><span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>{d.licenseCategory}</span></td>
                                <td style={{ fontWeight: 800, color: d.safetyScore >= 80 ? '#22C55E' : d.safetyScore >= 60 ? '#F5BF00' : '#EF4444' }}>{d.safetyScore}%</td>
                                <td style={{ color: 'var(--text-sub)' }}>{d.tripsCompleted}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="badge" style={{
                                            background: `${STATUS_CONFIG[d.status]?.color || '#94A3B8'}15`,
                                            color: STATUS_CONFIG[d.status]?.color || '#94A3B8',
                                            border: `1px solid ${STATUS_CONFIG[d.status]?.color || '#94A3B8'}30`
                                        }}>{d.status}</span>

                                        {can.manage.drivers && d.status !== 'ON DUTY' && (
                                            <select
                                                value={d.status}
                                                onChange={(e) => handleStatusUpdate(d.id, e.target.value)}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px',
                                                    background: 'var(--bg-input)',
                                                    color: 'var(--text-main)',
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="AVAILABLE">Available</option>
                                                <option value="ON LEAVE">Leave</option>
                                                <option value="SUSPENDED">Suspend</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <h2 className="page-title mb-2" style={{ fontSize: '1.5rem' }}>Personal Record</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Full Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>License ID</label><input required value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} /></div>
                                    <div className="form-group"><label>Expiry Date</label><input type="date" required value={form.licenseExpiryDate} onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label>License Category</label>
                                    <select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })}>
                                        <option value="LMV">LMV (Light Vehicle)</option>
                                        <option value="HMV">HMV (Heavy Vehicle)</option>
                                        <option value="Both">Both Classes</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary">Enroll Personnel</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
