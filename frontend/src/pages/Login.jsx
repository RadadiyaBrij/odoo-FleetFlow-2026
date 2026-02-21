import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.user, data.accessToken);
            toast.success(`Welcome session started, ${data.user.firstName}! 🚛`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Authentication failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper" style={{ display: 'flex' }}>
            {/* Brand Panel */}
            <div style={{
                width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '4rem', borderRight: '1px solid var(--border)',
                background: 'linear-gradient(160deg, var(--bg-card) 0%, var(--bg-body) 100%)',
                zIndex: 1
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
                    <div style={{ width: 44, height: 44, background: '#F5BF00', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 6px 20px rgba(245,191,0,0.4)' }}>🚛</div>
                    <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#F5BF00', letterSpacing: '-0.03em' }}>FleetFlow</span>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F5BF00', marginBottom: '1rem' }}>Fleet Management Platform</p>
                    <h1 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.05, color: 'var(--text-main)' }}>
                        Hassle-Free<br />
                        <span style={{ color: '#F5BF00' }}>Fleet &</span><br />
                        Logistics.
                    </h1>
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: '360px', fontSize: '0.95rem' }}>
                        The all-in-one platform for managing vehicles, drivers, trips, and fleet analytics with role-based precision.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2.5rem' }}>
                    {[{ v: '200+', l: 'Daily Trips' }, { v: '4', l: 'User Roles' }, { v: '99.9%', l: 'Uptime' }].map(s => (
                        <div key={s.l}>
                            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{s.v}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500, marginTop: 2 }}>{s.l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>Sign in</h2>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.4rem', fontSize: '0.9rem' }}>Access your logistics dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={16} />
                                <input required placeholder="your_username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={16} />
                                <input required type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: '3rem' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#F5BF00', textDecoration: 'none', fontWeight: 600 }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#F5BF00', fontWeight: 700, textDecoration: 'none' }}>Create Account →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
