import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, X, Fuel, Wrench, Calendar, DollarSign, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Logs({ type }) {
    const isFuel = type === 'fuel';
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const emptyFuelForm = { vehicleId: '', amount: '', quantity: '', expenseDate: new Date().toISOString().split('T')[0], notes: '', expenseType: 'Fuel' };
    const emptyServiceForm = { vehicleId: '', issueType: '', description: '', cost: '', serviceDate: new Date().toISOString().split('T')[0] };
    const [form, setForm] = useState(isFuel ? emptyFuelForm : emptyServiceForm);

    const fetchLogs = async () => {
        try {
            const url = isFuel ? '/expenses?expenseType=Fuel' : '/maintenance';
            const [logsRes, vehiclesRes] = await Promise.all([
                api.get(url),
                api.get('/vehicles')
            ]);
            setLogs(logsRes.data);
            setVehicles(vehiclesRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchLogs();
    }, [isFuel]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isFuel) {
                await api.post('/expenses', form);
            } else {
                await api.post('/maintenance', form);
            }
            toast.success(`${isFuel ? 'Fuel' : 'Service'} log added successfully!`);
            setShowModal(false);
            setForm(isFuel ? emptyFuelForm : emptyServiceForm);
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Action failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="logs-container"
        >
            <div className="flex-between mb-2">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{isFuel ? '⛽ Fuel Monitoring' : '🔧 Service History'}</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {isFuel ? 'Comprehensive tracking of fleet energy consumption' : 'Asset health and preventative maintenance records'}
                    </p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Add {isFuel ? 'Entry' : 'Record'}
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading...</div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle Details</th>
                                {isFuel ? (
                                    <><th>Quantity (L)</th><th>Cost</th><th>Efficiency</th></>
                                ) : (
                                    <><th>Issue Type</th><th>Amount</th><th>Status</th></>
                                )}
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="cell-primary">{log.vehicle?.name}</div>
                                        <div className="cell-secondary">{log.vehicle?.licensePlate}</div>
                                    </td>
                                    {isFuel ? (
                                        <>
                                            <td>{log.quantity} L</td>
                                            <td><strong style={{ color: 'var(--success)' }}>${log.amount}</strong></td>
                                            <td>{log.vehicle?.currentOdometer > 0 ? (log.vehicle.currentOdometer / log.quantity).toFixed(2) + ' km/L' : '--'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td><span style={{ background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: '8px' }}>{log.issueType}</span></td>
                                            <td><strong style={{ color: 'var(--success)' }}>${log.cost}</strong></td>
                                            <td>
                                                <span className={`badge ${log.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    <td>{new Date(isFuel ? log.expenseDate : log.serviceDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal"
                        >
                            <div className="flex-between mb-2">
                                <h2 style={{ fontSize: '1.5rem' }}>Add New {isFuel ? 'Fuel' : 'Service'} Log</h2>
                                <button className="btn-ghost" style={{ padding: '8px', border: 'none' }} onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Vehicle Asset</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                        <option value="">Select vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                                    </select>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>{isFuel ? 'Liters Pumped' : 'Service Type'}</label>
                                        <input
                                            required
                                            type={isFuel ? 'number' : 'text'}
                                            step="0.01"
                                            value={isFuel ? form.quantity : form.issueType}
                                            onChange={e => setForm({ ...form, [isFuel ? 'quantity' : 'issueType']: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{isFuel ? 'Total Cost ($)' : 'Estimated Cost ($)'}</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={isFuel ? form.amount : form.cost}
                                            onChange={e => setForm({ ...form, [isFuel ? 'amount' : 'cost']: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Date of Activity</label>
                                    <input
                                        type="date"
                                        value={isFuel ? form.expenseDate : form.serviceDate}
                                        onChange={e => setForm({ ...form, [isFuel ? 'expenseDate' : 'serviceDate']: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{isFuel ? 'Additional Notes' : 'Service Description'}</label>
                                    <textarea
                                        rows="3"
                                        value={isFuel ? form.notes : form.description}
                                        onChange={e => setForm({ ...form, [isFuel ? 'notes' : 'description']: e.target.value })}
                                        style={{ height: 'auto' }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary">
                                    Complete {isFuel ? 'Fueling' : 'Registration'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
