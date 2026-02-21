import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, Map, AlertTriangle, TrendingUp, DollarSign, Activity, Shield, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function StatCard({ label, value, icon, color, sub }) {
    return (
        <motion.div variants={item} style={{
            padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px',
            border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</p>
                    {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{sub}</p>}
                </div>
                <div style={{ background: `${color}22`, padding: '0.75rem', borderRadius: '12px', color }}>{icon}</div>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { user, role } = useAuth();
    const [kpi, setKpi] = useState({});
    const [extra, setExtra] = useState({});
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const kpiRes = await api.get('/analytics/kpi');
                setKpi(kpiRes.data);

                if (role === 'MANAGER' || role === 'DISPATCHER') {
                    const [op, tr] = await Promise.all([api.get('/analytics/operational'), api.get('/trips')]);
                    setExtra(op.data);
                    setTrips(tr.data.slice(0, 5));
                }
                if (role === 'MANAGER' || role === 'SAFETY_OFFICER') {
                    const safety = await api.get('/analytics/safety');
                    setExtra(prev => ({ ...prev, ...safety.data }));
                }
                if (role === 'MANAGER' || role === 'ANALYST') {
                    const fin = await api.get('/analytics/financial');
                    setExtra(prev => ({ ...prev, ...fin.data }));
                }
            } catch { toast.error('Failed to load dashboard'); }
        };
        fetchAll();
    }, [role]);

    const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <motion.div initial="hidden" animate="show" variants={container}>
            <motion.div variants={item} style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{greeting}, {user?.firstName}! 👋</h1>
                <p style={{ color: 'var(--text-dim)', marginTop: '0.4rem' }}>Here's your {role === 'MANAGER' ? 'full fleet' : role === 'DISPATCHER' ? 'operations' : role === 'SAFETY_OFFICER' ? 'safety' : 'financial'} overview</p>
            </motion.div>

            {/* Fleet KPIs — visible to all */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <StatCard label="Active Fleet" value={kpi.activeFleet ?? '—'} icon={<Truck size={22} />} color="#818cf8" sub={`${kpi.totalVehicles} total vehicles`} />
                <StatCard label="Fleet Utilization" value={`${kpi.utilizationRate ?? 0}%`} icon={<Activity size={22} />} color="#34d399" sub="Active / Total ratio" />
                <StatCard label="Maintenance Alerts" value={kpi.maintenanceAlerts ?? '—'} icon={<AlertTriangle size={22} />} color="#f59e0b" sub="Vehicles in shop" />
                <StatCard label="Pending Cargo" value={kpi.pendingCargo ?? '—'} icon={<Map size={22} />} color="#06b6d4" sub="Awaiting dispatch" />
            </div>

            {/* MANAGER / DISPATCHER — Operational KPIs */}
            {(role === 'MANAGER' || role === 'DISPATCHER') && (
                <motion.div variants={item} style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={18} color="var(--primary)" /> Operational Overview
                    </h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <StatCard label="Active Trips" value={extra.activeTrips ?? '—'} icon={<Map size={20} />} color="#818cf8" />
                        <StatCard label="Pending Trips" value={extra.pendingTrips ?? '—'} icon={<TrendingUp size={20} />} color="#f59e0b" />
                        <StatCard label="Available Vehicles" value={extra.availableVehicles ?? '—'} icon={<Truck size={20} />} color="#34d399" />
                        <StatCard label="Available Drivers" value={extra.availableDrivers ?? '—'} icon={<Users size={20} />} color="#06b6d4" />
                    </div>
                </motion.div>
            )}

            {/* MANAGER / DISPATCHER — Recent Trips */}
            {(role === 'MANAGER' || role === 'DISPATCHER') && trips.length > 0 && (
                <motion.div variants={item} style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🚚 Recent Trips</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>{['Trip #', 'Route', 'Driver', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: '0.78rem', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr></thead>
                        <tbody>
                            {trips.map(t => (
                                <tr key={t.id}>
                                    <td style={{ padding: '8px', fontSize: '0.85rem', fontFamily: 'monospace' }}>#{t.tripNumber?.slice(0, 8)}</td>
                                    <td style={{ padding: '8px', fontSize: '0.85rem' }}>{t.originAddress} → {t.destinationAddress}</td>
                                    <td style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{t.driver?.name}</td>
                                    <td style={{ padding: '8px' }}><span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: t.status === 'Completed' ? 'rgba(52,211,153,0.15)' : t.status === 'Dispatched' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.1)', color: t.status === 'Completed' ? '#34d399' : t.status === 'Dispatched' ? '#f59e0b' : '#94a3b8' }}>{t.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* SAFETY OFFICER / MANAGER — Safety KPIs */}
            {(role === 'SAFETY_OFFICER' || role === 'MANAGER') && (
                <motion.div variants={item} style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="#4ade80" /> Safety & Compliance</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        <StatCard label="Expired Licenses" value={extra.expiredLicenses ?? '—'} icon={<AlertTriangle size={18} />} color="#f87171" />
                        <StatCard label="Expiring ≤30 Days" value={extra.expiringLicenses ?? '—'} icon={<AlertTriangle size={18} />} color="#fbbf24" />
                        <StatCard label="Avg Safety Score" value={`${extra.avgSafetyScore ?? 0}%`} icon={<Shield size={18} />} color="#4ade80" />
                        <StatCard label="Suspended Drivers" value={extra.suspendedDrivers ?? '—'} icon={<Users size={18} />} color="#f87171" />
                    </div>
                    {(extra.expiredLicenses ?? 0) > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <p style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>🔒 {extra.expiredLicenses} driver(s) auto-suspended — expired licenses</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ANALYST / MANAGER — Financial KPIs */}
            {(role === 'ANALYST' || role === 'MANAGER') && (
                <motion.div variants={item} style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={18} color="#06b6d4" /> Financial Overview</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        <StatCard label="Total Fuel Cost" value={`₹${(extra.totalFuelCost ?? 0).toLocaleString()}`} icon={<DollarSign size={18} />} color="#f87171" />
                        <StatCard label="Fleet ROI" value={`+${extra.fleetROI ?? 0}%`} icon={<TrendingUp size={18} />} color="#4ade80" />
                        <StatCard label="Utilization Rate" value={`${extra.utilizationRate ?? 0}%`} icon={<Activity size={18} />} color="#818cf8" />
                        <StatCard label="Total Expenses" value={`₹${(extra.totalExpenses ?? 0).toLocaleString()}`} icon={<DollarSign size={18} />} color="#06b6d4" />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
