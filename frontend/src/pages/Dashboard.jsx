import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, Map, AlertTriangle, TrendingUp, DollarSign, Activity, Shield } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function StatCard({ label, value, icon, color, sub, accent = false }) {
    return (
        <motion.div variants={item} style={{
            padding: '1.5rem',
            background: accent ? `linear-gradient(135deg, ${color}18 0%, var(--bg-card) 60%)` : 'var(--bg-card)',
            borderRadius: '16px',
            border: `1px solid ${accent ? `${color}30` : 'var(--border)'}`,
            boxShadow: 'var(--card-shadow)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, opacity: 0.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value}</p>
                    {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{sub}</p>}
                </div>
                <div style={{ background: `${color}18`, padding: '0.7rem', borderRadius: '12px', color, border: `1px solid ${color}25` }}>{icon}</div>
            </div>
        </motion.div>
    );
}

function SectionHeader({ icon, title, color = 'var(--primary)' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ color }}>{icon}</div>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: 'var(--text-main)' }}>{title}</h2>
        </div>
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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const roleLabel = { MANAGER: 'Fleet Manager', DISPATCHER: 'Dispatcher', SAFETY_OFFICER: 'Safety Officer', ANALYST: 'Financial Analyst' };

    return (
        <motion.div initial="hidden" animate="show" variants={container}>
            {/* Header */}
            <motion.div variants={item} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-dim)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(245,191,0,0.2)' }}>
                            {roleLabel[role] || role}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--text-main)' }}>
                        {greeting}, <span style={{ color: 'var(--primary)' }}>{user?.firstName}</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Here's your live fleet intelligence dashboard
                    </p>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-sub)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p style={{ fontSize: '0.72rem', marginTop: '2px' }}>Auto-refreshing every 60s</p>
                </div>
            </motion.div>

            {/* Fleet KPIs */}
            <motion.div variants={item}>
                <SectionHeader icon={<Truck size={16} />} title="Fleet Overview" />
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <StatCard label="Active Fleet" value={kpi.activeFleet ?? '—'} icon={<Truck size={20} />} color="#F5BF00" accent sub={`of ${kpi.totalVehicles} vehicles`} />
                <StatCard label="Fleet Utilization" value={`${kpi.utilizationRate ?? 0}%`} icon={<Activity size={20} />} color="#38BDF8" sub="Active / Total ratio" />
                <StatCard label="In Maintenance" value={kpi.maintenanceAlerts ?? '—'} icon={<AlertTriangle size={20} />} color="#F97316" sub="Vehicles in shop" />
                <StatCard label="Awaiting Dispatch" value={kpi.pendingCargo ?? '—'} icon={<Map size={20} />} color="#A78BFA" sub="Cargo pending" />
            </div>

            {/* Operational KPIs */}
            {(role === 'MANAGER' || role === 'DISPATCHER') && (
                <>
                    <motion.div variants={item}>
                        <SectionHeader icon={<Map size={16} />} title="Operations Status" color="#38BDF8" />
                    </motion.div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                        <StatCard label="Active Trips" value={extra.activeTrips ?? '—'} icon={<Map size={18} />} color="#38BDF8" />
                        <StatCard label="Pending Trips" value={extra.pendingTrips ?? '—'} icon={<TrendingUp size={18} />} color="#F5BF00" />
                        <StatCard label="Available Vehicles" value={extra.availableVehicles ?? '—'} icon={<Truck size={18} />} color="#22C55E" />
                        <StatCard label="On-Duty Drivers" value={extra.availableDrivers ?? '—'} icon={<Users size={18} />} color="#A78BFA" />
                    </div>
                </>
            )}

            {/* Recent Trips */}
            {(role === 'MANAGER' || role === 'DISPATCHER') && trips.length > 0 && (
                <motion.div variants={item} style={{ marginBottom: '2.5rem' }}>
                    <SectionHeader icon={<Map size={16} />} title="Recent Deployments" color="#38BDF8" />
                    <div className="table-wrapper">
                        <table>
                            <thead><tr>
                                {['Trip ID', 'Route', 'Driver', 'Vehicle', 'Status'].map(h =>
                                    <th key={h}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {trips.map(t => {
                                    const STATUS = { Completed: { c: '#22C55E', bg: 'rgba(34,197,94,0.12)' }, Dispatched: { c: '#F5BF00', bg: 'rgba(245,191,0,0.12)' }, Draft: { c: 'var(--text-dim)', bg: 'var(--bg-input)' } };
                                    const s = STATUS[t.status] || STATUS.Draft;
                                    return (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-dim)' }}>#{t.tripNumber?.split('-').pop() || t.id.slice(0, 8)}</td>
                                            <td style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{t.originAddress} <span style={{ color: '#F5BF00', margin: '0 4px' }}>→</span> {t.destinationAddress}</td>
                                            <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{t.driver?.name}</td>
                                            <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{t.vehicle?.name}</td>
                                            <td><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.c, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.status}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Safety KPIs */}
            {(role === 'SAFETY_OFFICER' || role === 'MANAGER') && (
                <motion.div variants={item} style={{ marginBottom: '2.5rem' }}>
                    <SectionHeader icon={<Shield size={16} />} title="Safety & Compliance" color="#22C55E" />
                    <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: extra.expiredLicenses > 0 ? '1.25rem' : 0 }}>
                            <StatCard label="Expired Licenses" value={extra.expiredLicenses ?? '—'} icon={<AlertTriangle size={16} />} color="#EF4444" />
                            <StatCard label="Expiring ≤30d" value={extra.expiringLicenses ?? '—'} icon={<AlertTriangle size={16} />} color="#F5BF00" />
                            <StatCard label="Avg Safety Score" value={`${extra.avgSafetyScore ?? 0}%`} icon={<Shield size={16} />} color="#22C55E" />
                            <StatCard label="Suspended" value={extra.suspendedDrivers ?? '—'} icon={<Users size={16} />} color="#EF4444" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Financial KPIs */}
            {(role === 'ANALYST' || role === 'MANAGER') && (
                <motion.div variants={item}>
                    <SectionHeader icon={<DollarSign size={16} />} title="Financial Overview" color="#38BDF8" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        <StatCard label="Total Fuel Cost" value={`₹${(extra.totalFuelCost ?? 0).toLocaleString()}`} icon={<DollarSign size={18} />} color="#EF4444" />
                        <StatCard label="Fleet ROI" value={`+${extra.fleetROI ?? 0}%`} icon={<TrendingUp size={18} />} color="#22C55E" />
                        <StatCard label="Utilization" value={`${extra.utilizationRate ?? 0}%`} icon={<Activity size={18} />} color="#38BDF8" />
                        <StatCard label="Total Expenses" value={`₹${(extra.totalExpenses ?? 0).toLocaleString()}`} icon={<DollarSign size={18} />} color="#A78BFA" />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
