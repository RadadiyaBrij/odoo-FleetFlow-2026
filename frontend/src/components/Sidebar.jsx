import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Users, Map,
    Fuel, Wrench, BarChart3, LogOut
} from 'lucide-react';

export default function Sidebar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/vehicles', icon: <Truck size={20} />, label: 'Vehicles' },
        { to: '/drivers', icon: <Users size={20} />, label: 'Drivers' },
        { to: '/trips', icon: <Map size={20} />, label: 'Trips' },
        { to: '/logs/fuel', icon: <Fuel size={20} />, label: 'Fuel Logs' },
        { to: '/logs/maintenance', icon: <Wrench size={20} />, label: 'Maintenance' },
    ];

    return (
        <aside className="sidebar">
            <div className="flex-between mb-2 px-2">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>FleetFlow</h1>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Logged in as</p>
                <p style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{user.role}</p>
            </div>

            <nav className="flex-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '0.875rem 1rem',
                            color: isActive ? 'white' : 'var(--text-dim)',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            background: isActive ? 'var(--primary)' : 'transparent',
                            marginBottom: '0.5rem',
                            transition: 'all 0.2s',
                            fontWeight: isActive ? 600 : 500
                        })}
                    >
                        {item.icon} {item.label}
                    </NavLink>
                ))}
            </nav>

            <button className="btn-ghost" onClick={handleLogout} style={{
                display: 'flex', gap: '12px', marginTop: 'auto', padding: '1rem',
                background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)',
                borderRadius: '12px', cursor: 'pointer', width: '100%'
            }}>
                <LogOut size={20} /> Logout
            </button>
        </aside>
    );
}
