import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, DollarSign } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const TYPE_CONFIG = {
    Fuel: { color: '#F5BF00', bg: 'rgba(245,191,0,0.12)', border: 'rgba(245,191,0,0.2)' },
    Maintenance: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)' },
    Toll: { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.2)' },
    Insurance: { color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)' },
    Repair: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.2)' },
    Other: { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
};

const EXPENSE_TYPES = Object.keys(TYPE_CONFIG);

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
        } catch { toast.error('Failed to load data'); }
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await api.put(`/expenses/${editId}`, form); toast.success('Expense updated'); }
            else { await api.post('/expenses', form); toast.success('Expense logged!'); }
            setShowModal(false); setEditId(null);
            setForm({ vehicleId: '', expenseType: 'Fuel', amount: '', quantity: '', unit: 'Litres', expenseDate: '', notes: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed to save'); }
    };

    const totalFuel = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
    const totalOther = expenses.filter(e => e.expenseType !== 'Fuel').reduce((s, e) => s + e.amount, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
                <div>
                    <span className="chip-blue" style={{ marginBottom: '0.4rem' }}>Finance</span>
                    <h1 className="page-title">Expense Registry</h1>
                    <p className="page-subtitle">Manage fuel, tolls, and operational costs</p>
                </div>
                {can.manage.expenses && (
                    <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => { setEditId(null); setShowModal(true); }}>
                        <Plus size={18} /> Log Expense
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem', maxWidth: 680 }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #F5BF00', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Fuel Cost</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F5BF00' }}>₹{Math.round(totalFuel).toLocaleString()}</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #A78BFA', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Operating</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A78BFA' }}>₹{Math.round(totalOther).toLocaleString()}</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', borderLeft: '4px solid #38BDF8', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38BDF8' }}>₹{Math.round(totalFuel + totalOther).toLocaleString()}</p>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead><tr><th>Vehicle</th><th>Category</th><th>Amount</th><th>Qty/Unit</th><th>Date</th>{can.manage.expenses && <th>Action</th>}</tr></thead>
                    <tbody>
                        {expenses.map(e => (
                            <tr key={e.id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{e.vehicle?.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{e.vehicle?.licensePlate}</div>
                                </td>
                                <td><span className="badge" style={{ background: TYPE_CONFIG[e.expenseType].bg, color: TYPE_CONFIG[e.expenseType].color, border: `1px solid ${TYPE_CONFIG[e.expenseType].border}` }}>{e.expenseType}</span></td>
                                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{e.amount.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-sub)' }}>{e.quantity || '—'} {e.unit}</td>
                                <td style={{ color: 'var(--text-dim)' }}>{new Date(e.expenseDate).toLocaleDateString()}</td>
                                {can.manage.expenses && (
                                    <td>
                                        <button onClick={() => { setEditId(e.id); setForm({ ...e, expenseDate: e.expenseDate.slice(0, 10) }); setShowModal(true); }} className="btn-ghost" style={{ padding: 6 }}>
                                            <Edit2 size={13} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal">
                            <h2 className="page-title mb-2" style={{ fontSize: '1.5rem' }}>{editId ? 'Edit Record' : 'Log New Expense'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group"><label>Vehicle</label>
                                    <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                        <option value="">Select Asset</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Type</label>
                                        <select value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })}>
                                            {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Date</label><input type="date" required value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} /></div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group"><label>Amount (₹)</label><input type="number" required step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                                    <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                                </div>
                                <div className="form-group"><label>Notes</label><textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ padding: '0.75rem 1rem' }} /></div>
                                <div className="flex-between gap-1 mt-1">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, marginTop: 0 }}>Save Ledger Entry</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
