import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Map, Navigation, ArrowRight, User as UserIcon, Truck as TruckIcon, X, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeightKg: '',
        originAddress: '',
        destinationAddress: '',
        estimatedFuelCost: ''
    });

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get('/trips'),
                api.get('/vehicles?status=Available'),
                api.get('/drivers?status=On Duty')
            ]);
            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data);
            setDrivers(driversRes.data);
        } catch (err) {
            toast.error('Logistics server busy');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', form);
            toast.success('Trip planned & validated!');
            setShowModal(false);
            setForm({ vehicleId: '', driverId: '', cargoWeightKg: '', originAddress: '', destinationAddress: '', estimatedFuelCost: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Dispatch failed');
        }
    };

    const updateStatus = async (id, action) => {
        try {
            const endpoint = action === 'dispatch' ? 'dispatch' : 'complete';
            const body = action === 'dispatch' ? { startOdometer: 1000 } : { endOdometer: 1150 }; // Simplified
            await api.patch(`/trips/${id}/${endpoint}`, body);
            toast.success(`Trip ${action === 'dispatch' ? 'Dispatched' : 'Completed'}`);
            fetchData();
        } catch (err) {
            toast.error('Status update failed');
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between mb-2">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Trip Dispatcher</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Dynamic route planning and cargo validation workspace</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px' }} onClick={() => setShowModal(true)}>
                    <Plus size={20} /> New Mission
                </button>
            </header>

            <div className="table-wrapper" style={{ marginTop: '3rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Route Mission</th>
                            <th>Assignment</th>
                            <th>Cargo Weight</th>
                            <th>Status</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map(trip => (
                            <tr key={trip.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="cell-primary">{trip.originAddress}</div>
                                        <ArrowRight size={14} color="var(--primary)" />
                                        <div className="cell-primary">{trip.destinationAddress}</div>
                                    </div>
                                    <div className="cell-secondary font-mono">#{trip.tripNumber}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TruckIcon size={14} color="var(--text-dim)" /> <span className="cell-secondary">{trip.vehicle?.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserIcon size={14} color="var(--text-dim)" /> <span className="cell-secondary">{trip.driver?.name}</span>
                                    </div>
                                </td>
                                <td><strong>{trip.cargoWeightKg} kg</strong></td>
                                <td>
                                    <span className={`badge ${trip.status === 'Completed' ? 'badge-success' : trip.status === 'Dispatched' ? 'badge-warning' : 'badge-ghost'}`}>
                                        {trip.status}
                                    </span>
                                </td>
                                <td>
                                    {trip.status === 'Draft' && <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => updateStatus(trip.id, 'dispatch')}>Dispatch</button>}
                                    {trip.status === 'Dispatched' && <button className="btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--success)', border: 'none', color: 'white', borderRadius: '4px' }} onClick={() => updateStatus(trip.id, 'complete')}>Mark Done</button>}
                                    {trip.status === 'Completed' && <CheckCircle2 size={18} color="var(--success)" />}
                                </td>
                            </tr>
                        ))}
                        {trips.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>No active deployments</td></tr>}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal">
                            <div className="flex-between mb-2">
                                <h2 style={{ fontSize: '1.5rem' }}>Plan New Cargo Route</h2>
                                <button className="btn-ghost" style={{ border: 'none' }} onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Assigned Vehicle (Available Only)</label>
                                        <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                            <option value="">Select Asset</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.maxCapacityKg}kg Cap)</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Mission Driver (On Duty)</label>
                                        <select required value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                                            <option value="">Select Personnel</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Cargo Weight (kg)</label>
                                        <input required type="number" placeholder="Enter weight..." value={form.cargoWeightKg} onChange={e => setForm({ ...form, cargoWeightKg: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Est. Fuel Cost ($)</label>
                                        <input type="number" step="0.01" placeholder="Estimation" value={form.estimatedFuelCost} onChange={e => setForm({ ...form, estimatedFuelCost: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Origin Address</label>
                                        <input required placeholder="Depot A" value={form.originAddress} onChange={e => setForm({ ...form, originAddress: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Destination Hub</label>
                                        <input required placeholder="Client Site Z" value={form.destinationAddress} onChange={e => setForm({ ...form, destinationAddress: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--primary)', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>DISPATCH NOTE</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>System will automatically verify Driver's license category against Vehicle weight capacity before submission.</p>
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
