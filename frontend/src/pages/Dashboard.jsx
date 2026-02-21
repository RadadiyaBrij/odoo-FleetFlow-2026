import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, AlertTriangle, Activity, Package, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState({
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        pendingCargo: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics/kpi');
                setStats(data);
            } catch (err) {
                toast.error('Failed to update KPIs');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <header className="mb-2">
                <div className="flex-between">
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Command Center</h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Welcome back, {user.firstName}. Here is your fleet's status.</p>
                    </div>
                    <div className="flex" style={{ gap: '1rem' }}>
                        <span className="badge badge-success" style={{ padding: '8px 16px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'currentColor', borderRadius: '50%', marginRight: '8px' }}></div>
                            System Online
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
                <StatCard
                    variants={item}
                    label="Active Fleet"
                    value={stats.activeFleet}
                    icon={<Truck size={24} />}
                    color="#818cf8"
                    trend="+2.5% from last month"
                />
                <StatCard
                    variants={item}
                    label="In Maintenance"
                    value={stats.maintenanceAlerts}
                    icon={<AlertTriangle size={24} />}
                    color="#f87171"
                    trend="-1 in shop today"
                />
                <StatCard
                    variants={item}
                    label="Utilization Rate"
                    value={`${stats.utilizationRate}%`}
                    icon={<Activity size={24} />}
                    color="#4ade80"
                    trend="Optimal threshold met"
                />
                <StatCard
                    variants={item}
                    label="Pending Loads"
                    value={stats.pendingCargo}
                    icon={<Package size={24} />}
                    color="#fbbf24"
                    trend="3 arriving shortly"
                />
            </div>

            <div className="grid-2 mt-1" style={{ marginTop: '2rem' }}>
                {/* Role Specific Views */}
                {(user.role === 'MANAGER' || user.role === 'ANALYST') && (
                    <motion.div variants={item} className="glass-card" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={20} color="var(--primary)" /> Financial Performance
                        </h2>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '1rem', paddingBottom: '1rem' }}>
                            <div style={{ flex: 1, background: 'var(--primary)', height: '80%', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, background: 'var(--bg-input)', height: '60%', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, background: 'var(--primary)', height: '90%', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, background: 'var(--bg-input)', height: '40%', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, background: 'var(--primary)', height: '75%', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '1rem' }}>Revenue vs Operating Cost (Current Quarter)</p>
                    </motion.div>
                )}

                {user.role === 'SAFETY_OFFICER' && (
                    <motion.div variants={item} className="glass-card" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={20} color="var(--success)" /> Compliance Alerts
                        </h2>
                        <div className="space-y-4">
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <p style={{ fontWeight: 600, color: '#f87171' }}>License Expiry Warning</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Driver Sarah Jenkins - Expiry in 3 days</p>
                            </div>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                                <p style={{ fontWeight: 600, color: '#fbbf24' }}>Upcoming Inspection</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Truck-12 (XYZ-5544) due for service</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div variants={item} className="glass-card" style={{ padding: '2rem', background: 'var(--bg-card)', gridColumn: user.role === 'DISPATCHER' ? 'span 2' : 'auto' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Global Fleet Map</h2>
                    <div style={{ height: '300px', background: 'var(--bg-input)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', opacity: 0.2, backgroundImage: 'radial-gradient(var(--text-dim) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <Activity color="var(--primary)" size={48} className="animate-pulse" />
                        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 12px var(--success)' }}></div>
                        <div style={{ position: 'absolute', bottom: '30%', right: '40%', width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '50%', boxShadow: '0 0 12px var(--warning)' }}></div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

const StatCard = ({ label, value, icon, color, trend, variants }) => (
    <motion.div
        variants={variants}
        className="glass-card"
        style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px' }}
    >
        <div className="flex-between mb-1" style={{ marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                {icon}
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>{label}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{value}</h3>
            </div>
        </div>
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {trend}
        </div>
    </motion.div>
);
