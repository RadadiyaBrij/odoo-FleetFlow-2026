import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ROLES = [
    { value: 'MANAGER', label: 'Fleet Manager', color: '#F5BF00', desc: 'Full control' },
    { value: 'DISPATCHER', label: 'Dispatcher', color: '#38BDF8', desc: 'Trips & routes' },
    { value: 'SAFETY_OFFICER', label: 'Safety Officer', color: '#F97316', desc: 'Compliance' },
    { value: 'ANALYST', label: 'Financial Analyst', color: '#A78BFA', desc: 'Costs & ROI' },
];

export default function Register() {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', role: 'DISPATCHER' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const nameParts = form.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            await api.post('/auth/register', { username: form.username, email: form.email, password: form.password, firstName, lastName, role: form.role });
            toast.success('Account enrolled successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper">
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <div style={{ width: 40, height: 40, background: '#F5BF00', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 6px 20px rgba(245,191,0,0.4)' }}>🚛</div>
                    <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#F5BF00', letterSpacing: '-0.03em' }}>FleetFlow</span>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', padding: '2.5rem', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>Create Account</h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.4rem', fontSize: '0.88rem' }}>Join the logistics intelligence network</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={16} />
                                    <input required placeholder="id_fleet" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <UserCheck className="input-icon" size={16} />
                                    <input required placeholder="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Fleet Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={16} />
                                <input required type="email" placeholder="name@fleetflow.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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

                        <div className="form-group">
                            <label>Operational Role</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '0.4rem' }}>
                                {ROLES.map(r => (
                                    <div key={r.value} onClick={() => setForm({ ...form, role: r.value })} style={{
                                        padding: '0.75rem 0.85rem', borderRadius: 10, cursor: 'pointer',
                                        border: `1.5px solid ${form.role === r.value ? r.color : 'var(--border)'}`,
                                        background: form.role === r.value ? `${r.color}10` : 'var(--bg-input)',
                                        transition: 'all 0.18s'
                                    }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.78rem', color: form.role === r.value ? r.color : 'var(--text-sub)' }}>{r.label}</p>
                                        <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: 2 }}>{r.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing…' : 'Enroll Personnel Account'}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                        Already registered?{' '}
                        <Link to="/login" style={{ color: '#F5BF00', fontWeight: 700, textDecoration: 'none' }}>Sign In →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
