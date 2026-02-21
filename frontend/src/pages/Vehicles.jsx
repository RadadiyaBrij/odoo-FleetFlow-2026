import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Truck, Filter, MapPin, Hash, Weight, X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const [form, setForm] = useState({
        name: '',
        licensePlate: '',
        vehicleType: 'Truck',
        model: '',
        maxCapacityKg: '',
        status: 'Available'
    });

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (err) {
            toast.error('Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', {
                ...form,
                maxCapacityKg: parseFloat(form.maxCapacityKg)
            });
            toast.success('Asset registered successfully');
            setShowModal(false);
            setForm({ name: '', licensePlate: '', vehicleType: 'Truck', model: '', maxCapacityKg: '', status: 'Available' });
            fetchVehicles();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to add vehicle');
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        (v.name.toLowerCase().includes(search.toLowerCase()) || v.licensePlate.toLowerCase().includes(search.toLowerCase())) &&
        (filter === 'All' || v.status === filter)
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between mb-2">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Vehicle Registry</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Management of physical logistics assets and lifecycle</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px' }} onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Add Vehicle
                </button>
            </header>

            <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                    <Search className="input-icon" size={18} />
                    <input
                        placeholder="Search by name or plate..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '200px', paddingLeft: '1rem' }}>
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Out of Service">Out of Service</option>
                </select>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle Asset</th>
                            <th>Type & Model</th>
                            <th>Capacity</th>
                            <th>Mileage</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.map(v => (
                            <tr key={v.id}>
                                <td>
                                    <div className="cell-primary">{v.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                                        <Hash size={12} /> {v.licensePlate}
                                    </div>
                                </td>
                                <td>
                                    <div className="cell-primary">{v.vehicleType}</div>
                                    <div className="cell-secondary">{v.model}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Weight size={14} color="var(--text-dim)" /> {v.maxCapacityKg} kg
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{v.currentOdometer.toLocaleString()} km</td>
                                <td>
                                    <span className={`badge ${v.status === 'Available' ? 'badge-success' : v.status === 'On Trip' ? 'badge-warning' : 'badge-danger'}`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal">
                            <div className="flex-between mb-2">
                                <h2 style={{ fontSize: '1.5rem' }}>Register New Asset</h2>
                                <button className="btn-ghost" style={{ border: 'none' }} onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Internal Name</label>
                                        <input required placeholder="e.g. Truck-04" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>License Plate</label>
                                        <input required placeholder="ABC-1234" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Vehicle Type</label>
                                        <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                                            <option value="Truck">Truck (HMV Needed)</option>
                                            <option value="Van">Van (LMV Needed)</option>
                                            <option value="Bike">Bike (LMV Needed)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Max Capacity (kg)</label>
                                        <input required type="number" placeholder="5000" value={form.maxCapacityKg} onChange={e => setForm({ ...form, maxCapacityKg: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Model Details</label>
                                    <input placeholder="e.g. Ford F-150 / Volvo FH16" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                                </div>

                                <button type="submit" className="btn-primary">Register Asset</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
