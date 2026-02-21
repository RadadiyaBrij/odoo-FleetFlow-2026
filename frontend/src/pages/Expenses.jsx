import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, X, Edit2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Expenses() {
    const { can } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ vehicleId: '', expenseType: 'Fuel', amount: '', quantity: '', unit: 'Litres', expenseDate: '', notes: '' });

    const fetchData = async () => {
        try {
            const [e, v] = await Promise.all([api.get('/expenses'), api.get('/vehicles')]);
            setExpenses(e.data); setVehicles(v.data);
        } catch { toast.error('Failed to load expenses'); }
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/expenses/${editId}`, form);
                toast.success('Expense updated');
            } else {
                await api.post('/expenses', form);
                toast.success('Expense logged');
            }
            setShowModal(false); setEditId(null);
            setForm({ vehicleId: '', expenseType: 'Fuel', amount: '', quantity: '', unit: 'Litres', expenseDate: '', notes: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to save expense'); }
    };

    const openEdit = (exp) => {
        setEditId(exp.id);
        setForm({ vehicleId: exp.vehicleId, expenseType: exp.expenseType, amount: exp.amount, quantity: exp.quantity || '', unit: exp.unit || 'Litres', expenseDate: exp.expenseDate?.slice(0, 10), notes: exp.notes || '' });
        setShowModal(true);
    };

    const totalFuel = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
    const totalOther = expenses.filter(e => e.expenseType !== 'Fuel').reduce((s, e) => s + e.amount, 0);
    const total = totalFuel + totalOther;

    const TYPE_COLORS = { Fuel: '#f59e0b', Maintenance: '#818cf8', Toll: '#06b6d4', Other: '#94a3b8' };
    const EXPENSE_TYPES = ['Fuel', 'Maintenance', 'Toll', 'Insurance', 'Repair', 'Other'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Expense & Fuel Logging</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {can.manage.expenses ? 'Log and manage all fleet expenses & fuel records' : '🔍 View Only — Contact Financial Analyst to manage expenses'}
                    </p>
                </div>
                {can.manage.expenses && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => { setEditId(null); setShowModal(true); }}>
                        <Plus size={20} /> Log Expense
                    </button>
                )}
            </header>

            {/* KPI Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Fuel Cost', value: `₹${Math.round(totalFuel).toLocaleString()}`, color: '#f59e0b' },
                    { label: 'Other Expenses', value: `₹${Math.round(totalOther).toLocaleString()}`, color: '#818cf8' },
                    { label: 'Net Total', value: `₹${Math.round(total).toLocaleString()}`, color: '#4ade80' },
                ].map(c => (
                    <div key={c.label} style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>{c.label}</p>
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: c.color, marginTop: '0.5rem' }}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="table-wrapper" style={{ marginTop: 0 }}>
                <table>
                    <thead><tr>
                        <th>Vehicle</th><th>Type</th><th>Amount</th><th>Quantity</th><th>Date</th><th>Notes</th>
                        {can.manage.expenses && <th>Edit</th>}
                    </tr></thead>
                    <tbody>
                        {expenses.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>No expenses logged</td></tr>
                            : expenses.map(e => (
                                <tr key={e.id}>
                                    <td><div style={{ fontWeight: 600 }}>{e.vehicle?.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{e.vehicle?.licensePlate}</div></td>
                                    <td><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: `${TYPE_COLORS[e.expenseType] || '#94a3b8'}22`, color: TYPE_COLORS[e.expenseType] || '#94a3b8' }}>{e.expenseType}</span></td>
                                    <td style={{ fontWeight: 700 }}>₹{e.amount.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-dim)' }}>{e.quantity ? `${e.quantity} ${e.unit || ''}` : '—'}</td>
                                    <td>{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{e.notes || '—'}</td>
                                    {can.manage.expenses && <td><button onClick={() => openEdit(e)} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={14} /></button></td>}
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
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{editId ? 'Edit Expense' : 'Log New Expense'}</h2>
                                <button onClick={() => { setShowModal(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group"><label>Vehicle</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Expense Type</label>
                                        <select value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Date</label><input required type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Amount (₹)</label><input required type="number" step="0.01" placeholder="e.g. 4500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                                    <div className="form-group"><label>Quantity</label><input type="number" step="0.01" placeholder="e.g. 50" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                                </div>
                                {form.expenseType === 'Fuel' && (
                                    <div className="form-group"><label>Unit</label>
                                        <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ paddingLeft: '1rem' }}>
                                            <option>Litres</option><option>Gallons</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group"><label>Notes</label><input placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                                <button type="submit" className="btn-primary">{editId ? 'Update Expense' : 'Log Expense'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
