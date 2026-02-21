import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Map, Wrench, DollarSign, Activity, BarChart2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_LABELS = {
    MANAGER: 'Fleet Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    ANALYST: 'Financial Analyst'
};

const ROLE_COLORS = {
    MANAGER: '#818cf8',
    DISPATCHER: '#34d399',
    SAFETY_OFFICER: '#f59e0b',
    ANALYST: '#06b6d4'
};

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
    const { user, role, can, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user ? `${(user.firstName || user.username || 'U')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase() : 'U';
    const color = ROLE_COLORS[role] || '#818cf8';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span style={{ fontSize: '1.5rem' }}>🚛</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FleetFlow</span>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1 }}>
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

            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%', background: `${color}22`,
                        border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color, flexShrink: 0
                    }}>
                        {initials}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>{ROLE_LABELS[role] || role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                    }}
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
