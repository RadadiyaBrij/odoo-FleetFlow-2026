import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, Home, BarChart2,
    Sun, Moon, LogOut,
    Truck, Users, Map, Wrench, DollarSign, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const ROLE_COLORS = {
    MANAGER: '#F5BF00',
    DISPATCHER: '#38BDF8',
    SAFETY_OFFICER: '#F97316',
    ANALYST: '#A78BFA'
};

const NAV_ITEMS = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', page: 'dashboard' },
    { to: '/vehicles', icon: Truck, label: 'Vehicles', page: 'vehicles' },
    { to: '/drivers', icon: Users, label: 'Drivers', page: 'drivers' },
    { to: '/trips', icon: Map, label: 'Trips', page: 'trips' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance', page: 'maintenance' },
    { to: '/expenses', icon: DollarSign, label: 'Expenses', page: 'expenses' },
    { to: '/performance', icon: Activity, label: 'Performance', page: 'performance' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', page: 'analytics' },
];

export default function Navbar({ expanded, setExpanded }) {
    const { user, role, logout, can } = useAuth();
    const { isLight, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    const initials = user
        ? `${(user.firstName || user.username || 'U')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()
        : 'U';
    const roleColor = ROLE_COLORS[role] || '#F5BF00';

    const MenuItem = ({ to, icon: Icon, label, isActive, onClick }) => (
        <button
            onClick={onClick || (() => navigate(to))}
            className={`nav-action-item ${isActive ? 'active' : ''}`}
            title={!expanded ? label : ''}
        >
            <Icon size={20} strokeWidth={2} />
            <AnimatePresence>
                {expanded && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );

    return (
        <aside
            className={`navbar ${expanded ? 'expanded' : ''}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {/* Brand / Toggle */}
            <div className="nav-brand">
                <Menu size={24} />
                <AnimatePresence>
                    {expanded && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}
                        >
                            FleetFlow
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Sections */}
            <div className="nav-section">
                {NAV_ITEMS.filter(item => can?.access?.[item.page]).map((item) => (
                    <MenuItem
                        key={item.to}
                        {...item}
                        isActive={location.pathname === item.to}
                    />
                ))}
            </div>

            {/* Footer Actions */}
            <div className="nav-footer">
                <MenuItem
                    icon={isLight ? Moon : Sun}
                    label={isLight ? "Dark Mode" : "Light Mode"}
                    onClick={toggleTheme}
                />

                {/* User Profile */}
                <div className="user-profile" onClick={() => expanded ? null : setExpanded(true)}>
                    <div className="user-avatar" style={{ background: `${roleColor}15`, borderColor: roleColor, color: roleColor }}>
                        {initials}
                    </div>
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                className="user-info"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                <span className="user-role" style={{ color: roleColor }}>{role?.replace('_', ' ')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {expanded && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
