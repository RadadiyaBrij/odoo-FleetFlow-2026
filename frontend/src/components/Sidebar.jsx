import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Map, Wrench, DollarSign, Activity, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', page: 'dashboard' },
    { to: '/vehicles', icon: <Truck size={20} />, label: 'Vehicles', page: 'vehicles' },
    { to: '/drivers', icon: <Users size={20} />, label: 'Drivers', page: 'drivers' },
    { to: '/trips', icon: <Map size={20} />, label: 'Trips', page: 'trips' },
    { to: '/maintenance', icon: <Wrench size={20} />, label: 'Maintenance', page: 'maintenance' },
    { to: '/expenses', icon: <DollarSign size={20} />, label: 'Expenses', page: 'expenses' },
    { to: '/performance', icon: <Activity size={20} />, label: 'Performance', page: 'performance' },
    { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics', page: 'analytics' },
];

export default function Sidebar() {
    const { can } = useAuth();

    return (
        <aside className="sidebar">
            {/* Branding */}
            <div className="sidebar-logo">
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#F5BF00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(245,191,0,0.4)'
                }}>🚛</div>
                <div>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#F5BF00', letterSpacing: '-0.04em' }}>FleetFlow</span>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Logistics v2.0</div>
                </div>
            </div>

            <div style={{ padding: '1.5rem 1.5rem 0.5rem', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Operational Menu
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.filter(item => can.access[item.page]).map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / System Status */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>System Secure</span>
                </div>
            </div>
        </aside>
    );
}
