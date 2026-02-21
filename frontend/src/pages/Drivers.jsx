import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ShieldCheck, Mail, Phone, Calendar, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        licenseCategory: 'LMV',
        status: 'On Duty'
    });

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            toast.error('Failed to load personnel');
        } finally {
            setLoading(false);
        }
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
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to add driver');
        }
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between mb-2">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>HR & Compliance</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Personnel management and driver safety oversight</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px' }} onClick={() => setShowModal(true)}>
                    <Plus size={20} /> New Driver
                </button>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                {drivers.map(driver => (
                    <motion.div
                        key={driver.id}
                        className="glass-card"
                        style={{ padding: '2rem', borderLeft: `4px solid ${driver.status === 'On Duty' ? 'var(--success)' : driver.status === 'Suspended' ? 'var(--danger)' : 'var(--text-dim)'}` }}
                    >
                        <div className="flex-between mb-2" style={{ marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{driver.name}</h3>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--primary)' }}>{driver.licenseCategory}</span>
                                    <span className={`badge ${driver.status === 'On Duty' ? 'badge-success' : 'badge-danger'}`}>{driver.status}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SAFETY SCORE</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: driver.safetyScore >= 90 ? 'var(--success)' : 'var(--warning)' }}>{driver.safetyScore}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                <Mail size={16} /> {driver.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                <ShieldCheck size={16} /> {driver.licenseNumber}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: isExpired(driver.licenseExpiryDate) ? 'var(--danger)' : 'var(--text-dim)' }}>
                                <Calendar size={16} /> Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                                {isExpired(driver.licenseExpiryDate) && <AlertCircle size={14} />}
                            </div>
                        </div>

                        <div className="flex-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Trips Completed</p>
                                <p style={{ fontWeight: 700 }}>{driver.tripsCompleted}</p>
                            </div>
                            <button className="btn-ghost" style={{ padding: '8px 16px' }}>Edit Profile</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal">
                            <div className="flex-between mb-2">
                                <h2 style={{ fontSize: '1.5rem' }}>Add Driver Profile</h2>
                                <button className="btn-ghost" style={{ border: 'none' }} onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input required placeholder="e.g. Alex Johnson" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input required type="email" placeholder="alex@fleetflow.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input required placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>License Number</label>
                                        <input required placeholder="DL-998877" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input required type="date" value={form.licenseExpiryDate} onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>license Category</label>
                                    <select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })}>
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
