import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const ROLE_COLORS = {
    MANAGER: '#F5BF00',
    DISPATCHER: '#38BDF8',
    SAFETY_OFFICER: '#F97316',
    ANALYST: '#A78BFA'
};

export default function Navbar() {
    const { user, role, logout } = useAuth();
    const { isLight, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    const initials = user
        ? `${(user.firstName || user.username || 'U')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()
        : 'U';
    const roleColor = ROLE_COLORS[role] || '#F5BF00';

    return (
        <header className="navbar">
            {/* Search Bar */}
            <div className="nav-search">
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                    type="text"
                    placeholder="Search for vehicles, trips or personnel..."
                    style={{ padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-input)' }}
                />
            </div>

            {/* Actions */}
            <div className="nav-actions">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        width: 40, height: 40, borderRadius: 10, background: 'var(--bg-input)',
                        border: '1.5px solid var(--border)', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {isLight ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Notifications */}
                <button
                    style={{
                        width: 40, height: 40, borderRadius: 10, background: 'var(--bg-input)',
                        border: '1.5px solid var(--border)', color: 'var(--text-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                >
                    <Bell size={18} />
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />

                {/* User Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingRight: '0.5rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{user?.firstName} {user?.lastName}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: roleColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>{role?.replace('_', ' ')}</p>
                    </div>

                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: `${roleColor}15`, border: `2px solid ${roleColor}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, color: roleColor, fontSize: '0.9rem'
                        }}>
                            {initials}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px', borderRadius: 10, color: '#EF4444',
                            background: 'transparent', border: '1px solid transparent', cursor: 'pointer'
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
