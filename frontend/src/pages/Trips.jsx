import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, SendHorizonal, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CONFIG = {
    Draft: { color: 'var(--text-dim)', bg: 'var(--bg-input)', border: 'var(--border)', label: 'IDLE' },
    Dispatched: { color: '#F5BF00', bg: 'rgba(245,191,0,0.12)', border: 'rgba(245,191,0,0.2)', label: 'ACTIVE' },
    Completed: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)', label: 'DONE' },
    Cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'ABORTED' },
};

export default function Trips() {
    const { can } = useAuth();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ tripNumber: '', vehicleId: '', driverId: '', originAddress: '', destinationAddress: '', cargoDescription: '', cargoWeightKg: '', estimatedRevenue: '', scheduledDeparture: '' });

    const fetchAll = async () => {
        try {
            const [tr, v, d] = await Promise.all([api.get('/trips'), api.get('/vehicles'), api.get('/drivers')]);
            setTrips(tr.data); setVehicles(v.data); setDrivers(d.data);
        } catch { toast.error('Check network'); }
    };
    useEffect(() => { fetchAll(); }, []);

    const handleDispatch = async (id) => {
        try { await api.patch(`/trips/${id}/dispatch`); toast.success('Dispatch successful'); fetchAll(); }
        catch { toast.error('Dispatch failed'); }
    };

    const handleComplete = async (id) => {
        try { await api.patch(`/trips/${id}/complete`, { actualArrival: new Date().toISOString() }); toast.success('Route completed'); fetchAll(); }
        catch { toast.error('Update failed'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try { await api.post('/trips', form); setShowModal(false); fetchAll(); toast.success('Route mapped'); }
        catch { toast.error('Check trip data'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
                <div>
                    <span className="chip-yellow" style={{ marginBottom: '0.4rem' }}>Operations</span>
                    <h1 className="page-title">Trip Management</h1>
                    <p className="page-subtitle">Map routes, dispatch assets, and track delivery status</p>
                </div>
                {can.manage.trips && (
                    <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Plan Route
                    </button>
                )}
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Reference</th><th>Route Plan</th><th>Asset / Personnel</th><th>Cargo</th><th>Status</th>{can.manage.trips && <th>Dispatch</th>}</tr></thead>
                    <tbody>
                        {trips.map(t => {
                            const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.Draft;
                            return (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)', fontSize: '0.75rem' }}>#{t.tripNumber?.slice(-6) || t.id.slice(0, 6)}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.originAddress}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={10} /> {t.destinationAddress}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-sub)' }}>{t.vehicle?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{t.driver?.name}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-sub)' }}>{t.cargoWeightKg}kg <br /> <span style={{ fontSize: '0.7rem' }}>{t.cargoDescription}</span></td>
                                    <td><span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{sc.label}</span></td>
                                    {can.manage.trips && (
                                        <td>
                                            {t.status === 'Draft' && (
                                                <button onClick={() => handleDispatch(t.id)} className="btn-ghost" style={{ padding: '4px 10px', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}>
                                                    <SendHorizonal size={12} /> Start
                                                </button>
                                            )}
                                            {t.status === 'Dispatched' && (
                                                <button onClick={() => handleComplete(t.id)} className="btn-ghost" style={{ padding: '4px 10px', color: '#22C55E', borderColor: '#22C55E30' }}>
                                                    <CheckCircle2 size={12} /> Stop
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <h2 className="page-title mb-2" style={{ fontSize: '1.5rem' }}>New Dispatch</h2>
                            <form onSubmit={handleCreate}>
                                <div className="form-group"><label>Asset</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                        <option value="">Select Transport</option>
                                        {vehicles.filter(v => v.status === 'Available').map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Personnel</label>
                                    <select required value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                                        <option value="">Select Driver</option>
                                        {drivers.filter(d => d.status === 'On Duty').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Origin</label><input required value={form.originAddress} onChange={e => setForm({ ...form, originAddress: e.target.value })} /></div>
                                    <div className="form-group"><label>Destination</label><input required value={form.destinationAddress} onChange={e => setForm({ ...form, destinationAddress: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Weight (kg)</label><input type="number" required value={form.cargoWeightKg} onChange={e => setForm({ ...form, cargoWeightKg: Number(e.target.value) })} /></div>
                                    <div className="form-group"><label>Cargo Ref</label><input value={form.cargoDescription} onChange={e => setForm({ ...form, cargoDescription: e.target.value })} /></div>
                                </div>
                                <button type="submit" className="btn-primary">Execute Route Plan</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
