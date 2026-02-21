import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ShieldCheck, Mail, Calendar, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Drivers() {
    const { can } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: 'LMV', status: 'On Duty' });

    const fetchDrivers = async () => {
        try { const { data } = await api.get('/drivers'); setDrivers(data); }
        catch { toast.error('Failed to load drivers'); }
    };
    useEffect(() => { fetchDrivers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', form);
            toast.success('Driver profile created');
            setShowModal(false);
            setForm({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: 'LMV', status: 'On Duty' });
            fetchDrivers();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to add driver'); }
    };

    const isExpired = (d) => new Date(d.licenseExpiryDate) < new Date();
    const STATUS_COLORS = { 'On Duty': '#4ade80', 'Taking a Break': '#fbbf24', Suspended: '#f87171' };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>HR & Compliance</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Personnel management and driver safety oversight</p>
                </div>
                {can.manage.vehicles && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                        <Plus size={20} /> New Driver
                    </button>
                )}
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {drivers.map(d => (
                    <motion.div key={d.id} className="glass-card" style={{ padding: '1.75rem', borderLeft: `4px solid ${STATUS_COLORS[d.status] || '#94a3b8'}` }}>
                        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{d.name}</h3>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg-input)', color: 'var(--primary)' }}>{d.licenseCategory}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${STATUS_COLORS[d.status] || '#94a3b8'}22`, color: STATUS_COLORS[d.status] || '#94a3b8' }}>{d.status}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>SAFETY SCORE</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: d.safetyScore >= 80 ? '#4ade80' : d.safetyScore >= 60 ? '#fbbf24' : '#f87171' }}>{d.safetyScore}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}><Mail size={14} /> {d.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}><ShieldCheck size={14} /> {d.licenseNumber}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: isExpired(d) ? '#f87171' : 'var(--text-dim)' }}>
                                <Calendar size={14} /> Expires: {new Date(d.licenseExpiryDate).toLocaleDateString('en-IN')}
                                {isExpired(d) && <><AlertCircle size={12} /> <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>EXPIRED</span></>}
                            </div>
                        </div>

                        <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <div><p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Trips Completed</p><p style={{ fontWeight: 700 }}>{d.tripsCompleted}</p></div>
                            {can.manage.drivers && <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>Edit Profile</button>}
                        </div>
                    </motion.div>
                ))}
                {drivers.length === 0 && <p style={{ color: 'var(--text-dim)', padding: '2rem' }}>No drivers found.</p>}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Add Driver Profile</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group"><label>Full Name</label><input required placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Email</label><input required type="email" placeholder="rahul@fleet.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                    <div className="form-group"><label>Phone</label><input required placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>License Number</label><input required placeholder="DL-2025-98765" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} /></div>
                                    <div className="form-group"><label>Expiry Date</label><input required type="date" value={form.licenseExpiryDate} onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label>License Category</label>
                                    <select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                        <option value="LMV">LMV (Vans & Small Trucks)</option>
                                        <option value="HMV">HMV (Heavy Trucks)</option>
                                        <option value="Both">LMV + HMV</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary">Create Profile</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
