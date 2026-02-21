import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, User as UserIcon, Truck as TruckIcon, X, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Trips() {
    const { can } = useAuth();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeightKg: '', originAddress: '', destinationAddress: '', estimatedFuelCost: '' });

    const fetchData = async () => {
        try {
            const [tr, ve, dr] = await Promise.all([api.get('/trips'), api.get('/vehicles?status=Available'), api.get('/drivers?status=On Duty')]);
            setTrips(tr.data); setVehicles(ve.data); setDrivers(dr.data);
        } catch { toast.error('Failed to load trip data'); }
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', form);
            toast.success('Trip planned & dispatched!');
            setShowModal(false);
            setForm({ vehicleId: '', driverId: '', cargoWeightKg: '', originAddress: '', destinationAddress: '', estimatedFuelCost: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Dispatch failed'); }
    };

    const updateStatus = async (id, action) => {
        try {
            const body = action === 'dispatch' ? { startOdometer: 1000 } : { endOdometer: 1150 };
            await api.patch(`/trips/${id}/${action}`, body);
            toast.success(`Trip ${action === 'dispatch' ? 'Dispatched' : 'Completed'}`);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Update failed'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Trip Dispatcher</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {can.manage.trips ? 'Plan, dispatch & complete cargo routes' : '🔍 View Only — Contact Dispatcher to manage trips'}
                    </p>
                </div>
                {can.manage.trips && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                        <Plus size={20} /> New Mission
                    </button>
                )}
            </header>

            <div className="table-wrapper" style={{ marginTop: 0 }}>
                <table>
                    <thead><tr><th>Route Mission</th><th>Assignment</th><th>Cargo Weight</th><th>Status</th><th>Operation</th></tr></thead>
                    <tbody>
                        {trips.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No active deployments</td></tr>
                            : trips.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: 600 }}>{t.originAddress}</span>
                                            <ArrowRight size={14} color="var(--primary)" />
                                            <span style={{ fontWeight: 600 }}>{t.destinationAddress}</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '2px' }}>#{t.tripNumber?.slice(0, 10)}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><TruckIcon size={13} color="var(--text-dim)" /> {t.vehicle?.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><UserIcon size={13} color="var(--text-dim)" /> {t.driver?.name}</div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{t.cargoWeightKg} kg</td>
                                    <td><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: t.status === 'Completed' ? 'rgba(74,222,128,0.15)' : t.status === 'Dispatched' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.1)', color: t.status === 'Completed' ? '#4ade80' : t.status === 'Dispatched' ? '#f59e0b' : '#94a3b8' }}>{t.status}</span></td>
                                    <td>
                                        {can.manage.trips && t.status === 'Draft' && <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => updateStatus(t.id, 'dispatch')}>Dispatch</button>}
                                        {can.manage.trips && t.status === 'Dispatched' && <button style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => updateStatus(t.id, 'complete')}>Mark Done</button>}
                                        {t.status === 'Completed' && <CheckCircle2 size={18} color="#4ade80" />}
                                        {!can.manage.trips && t.status !== 'Completed' && <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>View Only</span>}
                                    </td>
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
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Plan New Cargo Route</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Assigned Vehicle (Available Only)</label>
                                        <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            <option value="">Select Asset</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.maxCapacityKg}kg)</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Mission Driver (On Duty)</label>
                                        <select required value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            <option value="">Select Personnel</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Cargo Weight (kg)</label><input required type="number" placeholder="e.g. 5000" value={form.cargoWeightKg} onChange={e => setForm({ ...form, cargoWeightKg: e.target.value })} /></div>
                                    <div className="form-group"><label>Est. Fuel Cost (₹)</label><input type="number" step="0.01" placeholder="e.g. 3500" value={form.estimatedFuelCost} onChange={e => setForm({ ...form, estimatedFuelCost: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Origin Address</label><input required placeholder="Depot A, Mumbai" value={form.originAddress} onChange={e => setForm({ ...form, originAddress: e.target.value })} /></div>
                                    <div className="form-group"><label>Destination Hub</label><input required placeholder="Client Site, Pune" value={form.destinationAddress} onChange={e => setForm({ ...form, destinationAddress: e.target.value })} /></div>
                                </div>
                                <div style={{ background: 'rgba(99,102,241,0.07)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>DISPATCH NOTE</p>
                                    <p style={{ fontSize: '0.76rem', opacity: 0.8, marginTop: '2px' }}>System auto-validates driver license category vs vehicle capacity before submission.</p>
                                </div>
                                <button type="submit" className="btn-primary">Plan & Dispatch</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
