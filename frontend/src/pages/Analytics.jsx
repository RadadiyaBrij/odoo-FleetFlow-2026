import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Shield, DollarSign, Download } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

function KpiCard({ label, value, color, icon }) {
    return (
        <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color }}>
                {icon}<span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>{label}</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</p>
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
                    const [kpi, safety, financial] = await Promise.all([api.get('/analytics/kpi'), api.get('/analytics/safety'), api.get('/analytics/financial')]);
                    setData({ ...kpi.data, ...financial.data }); setSafetyData(safety.data);
                } else if (role === 'SAFETY_OFFICER') {
                    const s = await api.get('/analytics/safety'); setSafetyData(s.data);
                } else if (role === 'ANALYST') {
                    const f = await api.get('/analytics/financial'); setData(f.data);
                }
            } catch { toast.error('Failed to load analytics'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [role]);

    const handleExport = () => {
        const rows = [['Month', 'Fuel Cost', 'Maintenance Cost', 'Total'], ...(data.monthlySummary || []).map(m => [m.month, m.fuelCost, m.maintenanceCost, m.total])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `FleetFlow_${new Date().toISOString().slice(0, 10)}.csv` });
        a.click(); toast.success('Report exported!');
    };

    if (loading) return <div style={{ color: 'var(--text-dim)', padding: '3rem', textAlign: 'center' }}>Loading analytics…</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Operational Analytics & Reports</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {role === 'MANAGER' && 'Full fleet — utilization, safety & financial overview'}
                        {role === 'SAFETY_OFFICER' && 'Safety & license compliance reports'}
                        {role === 'ANALYST' && 'Full financial reports — fuel, maintenance & ROI'}
                    </p>
                </div>
                {(role === 'ANALYST' || role === 'MANAGER') && (
                    <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        <Download size={18} /> Export CSV
                    </button>
                )}
            </header>

            {/* Financial KPIs — ANALYST + MANAGER */}
            {(role === 'MANAGER' || role === 'ANALYST') && (
                <>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        <KpiCard label="Total Fuel Cost" value={`₹${(data.totalFuelCost ?? 0).toLocaleString()}`} color="#f87171" icon={<DollarSign size={18} />} />
                        <KpiCard label="Fleet ROI" value={`+${data.fleetROI ?? 0}%`} color="#4ade80" icon={<TrendingUp size={18} />} />
                        <KpiCard label="Utilization Rate" value={`${data.utilizationRate ?? 0}%`} color="#818cf8" icon={<BarChart2 size={18} />} />
                        <KpiCard label="Total Expenses" value={`₹${(data.totalExpenses ?? 0).toLocaleString()}`} color="#06b6d4" icon={<DollarSign size={18} />} />
                    </div>

                    {/* Top 5 Costliest Vehicles bar chart */}
                    {(data.vehicleCosts?.length ?? 0) > 0 && (
                        <div style={{ padding: '1.75rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18} color="var(--primary)" /> Top 5 Costliest Vehicles</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '160px', paddingBottom: '1rem' }}>
                                {data.vehicleCosts.map((v, i) => {
                                    const pct = Math.max((v.totalCost / (data.vehicleCosts[0]?.totalCost || 1)) * 100, 5);
                                    const colors = ['#818cf8', '#a78bfa', '#06b6d4', '#4ade80', '#fbbf24'];
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>₹{Math.round(v.totalCost / 1000)}k</span>
                                            <div style={{ width: '100%', height: `${pct}%`, background: colors[i], borderRadius: '6px 6px 0 0', minHeight: '8px' }} />
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.2 }}>{v.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Monthly Summary Table */}
                    {(data.monthlySummary?.length ?? 0) > 0 && (
                        <div className="table-wrapper" style={{ marginTop: 0 }}>
                            <div style={{ padding: '1.25rem 1.5rem 0' }}><h3 style={{ fontWeight: 700 }}>📅 Monthly Financial Summary</h3></div>
                            <table>
                                <thead><tr><th>Month</th><th>Fuel Cost</th><th>Maintenance</th><th>Net Total</th></tr></thead>
                                <tbody>
                                    {data.monthlySummary.map(m => (
                                        <tr key={m.month}>
                                            <td style={{ fontWeight: 600 }}>{m.month}</td>
                                            <td>₹{m.fuelCost.toLocaleString()}</td>
                                            <td>₹{m.maintenanceCost.toLocaleString()}</td>
                                            <td style={{ fontWeight: 700, color: m.total > 50000 ? '#f87171' : '#4ade80' }}>₹{m.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Safety Reports — SAFETY_OFFICER + MANAGER */}
            {(role === 'SAFETY_OFFICER' || role === 'MANAGER') && (
                <div style={{ padding: '1.75rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', marginTop: '2rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="#4ade80" /> Safety & Compliance Report</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <KpiCard label="Expired Licenses" value={safetyData.expiredLicenses ?? 0} color="#f87171" icon={<Shield size={16} />} />
                        <KpiCard label="Expiring ≤30 Days" value={safetyData.expiringLicenses ?? 0} color="#fbbf24" icon={<Shield size={16} />} />
                        <KpiCard label="Avg Safety Score" value={`${safetyData.avgSafetyScore ?? 0}%`} color="#4ade80" icon={<TrendingUp size={16} />} />
                        <KpiCard label="Suspended Drivers" value={safetyData.suspendedDrivers ?? 0} color="#f87171" icon={<Shield size={16} />} />
                    </div>
                    {(safetyData.expiredLicenses ?? 0) === 0 && (safetyData.expiringLicenses ?? 0) === 0 ? (
                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: '12px' }}>
                            <p style={{ color: '#10b981', fontWeight: 600 }}>✅ All driver licenses are valid. Fleet is fully compliant.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(safetyData.expiredLicenses ?? 0) > 0 && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '12px' }}><p style={{ color: '#f87171', fontWeight: 600 }}>🔒 {safetyData.expiredLicenses} driver(s) auto-suspended — expired licenses</p></div>}
                            {(safetyData.expiringLicenses ?? 0) > 0 && <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '1rem', borderRadius: '12px' }}><p style={{ color: '#fbbf24', fontWeight: 600 }}>⚠️ {safetyData.expiringLicenses} driver license(s) expiring within 30 days</p></div>}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
