import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Shield, DollarSign, Download, Activity, Lock } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

function StatPill({ label, value, color, icon }) {
    return (
        <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: `3.5px solid ${color}`, boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {icon} {label}
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</p>
        </div>
    );
}

export default function Analytics() {
    const { role } = useAuth();
    const [data, setData] = useState({});
    const [safetyData, setSafetyData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (role === 'MANAGER') {
                    const [kpi, safety, financial] = await Promise.all([
                        api.get('/analytics/kpi'),
                        api.get('/analytics/safety'),
                        api.get('/analytics/financial')
                    ]);
                    setData({ ...kpi.data, ...financial.data });
                    setSafetyData(safety.data);
                } else if (role === 'SAFETY_OFFICER') {
                    const s = await api.get('/analytics/safety');
                    setSafetyData(s.data);
                } else if (role === 'ANALYST') {
                    const f = await api.get('/analytics/financial');
                    setData(f.data);
                }
            } catch (err) {
                console.error('Analytics Fetch Error:', err);
                toast.error('Failed to load intelligence data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [role]);

    const handleExport = () => {
        if (!data.monthlySummary || data.monthlySummary.length === 0) {
            toast.error('No data available to export');
            return;
        }
        toast.success('Preparing data export...');
        const rows = [['Month', 'Fuel Cost', 'Maintenance', 'Total'], ...data.monthlySummary.map(m => [m.month, m.fuelCost, m.maintenanceCost, m.total])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FleetFlow_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    if (loading) return <div className="flex-center" style={{ height: '60vh' }}><div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 800 }}>Loading Intel...</div></div>;

    const monthlySummary = data.monthlySummary || [];
    const maxExpenditure = monthlySummary.length > 0 ? Math.max(...monthlySummary.map(x => x.total)) : 1;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <span className="chip-yellow" style={{ background: '#A78BFA15', color: '#A78BFA', borderColor: '#A78BFA30', marginBottom: '0.4rem' }}>Business Intelligence</span>
                    <h1 className="page-title">Fleet Analytics</h1>
                    <p className="page-subtitle">Historical trends and real-time operational metrics</p>
                </div>
                {(role === 'ANALYST' || role === 'MANAGER') && monthlySummary.length > 0 && (
                    <button onClick={handleExport} className="btn-ghost" style={{ background: 'var(--primary-dim)', color: 'var(--primary)', borderColor: 'var(--primary-glow)', padding: '0.6rem 1.2rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Download size={15} /> Export Report
                    </button>
                )}
            </div>

            {(role === 'MANAGER' || role === 'ANALYST') && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <StatPill label="Fleet Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} color="#22C55E" icon={<TrendingUp size={12} />} />
                        <StatPill label="Operational Cost" value={`₹${(data.totalOperationalCost || 0).toLocaleString()}`} color="#F97316" icon={<Activity size={12} />} />
                        <StatPill label="Advanced ROI" value={`${data.fleetROI || 0}%`} color="#38BDF8" icon={<TrendingUp size={12} />} />
                        <StatPill label="Net Expenses" value={`₹${(data.totalExpenses || 0).toLocaleString()}`} color="#A78BFA" icon={<DollarSign size={12} />} />
                    </div>

                    {monthlySummary.length > 0 && (
                        <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--card-shadow)' }}>
                            <div className="flex-between mb-2">
                                <h3 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Monthly Expenditure Trend</h3>
                                <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                    <span style={{ color: '#F5BF00' }}>● Fuel</span>
                                    <span style={{ color: '#A78BFA' }}>● Maintenance</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5rem', height: 180, paddingLeft: '1rem', overflowX: 'auto' }}>
                                {monthlySummary.map(m => {
                                    const fuelH = (m.fuelCost / maxExpenditure) * 160;
                                    const maintH = (m.maintenanceCost / maxExpenditure) * 160;
                                    return (
                                        <div key={m.month} style={{ flex: 1, minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 24, display: 'flex', flexDirection: 'column-reverse', background: 'var(--bg-input)', borderRadius: 4, height: 160, overflow: 'hidden' }}>
                                                <div style={{ height: fuelH, background: '#F5BF00' }} />
                                                <div style={{ height: maintH, background: '#A78BFA' }} />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>{m.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {(role === 'MANAGER' || role === 'SAFETY_OFFICER') && (
                <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>Compliance Health Score</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <StatPill label="License Expired" value={safetyData.expiredLicenses || 0} color="#EF4444" icon={<Shield size={12} />} />
                        <StatPill label="Avg Driver Score" value={`${safetyData.avgSafetyScore || 0}%`} color="#22C55E" icon={<Activity size={12} />} />
                        <StatPill label="Suspended" value={safetyData.suspendedDrivers || 0} color="#F97316" icon={<Lock size={12} />} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
