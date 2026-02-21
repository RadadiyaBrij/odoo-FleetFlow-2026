import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Truck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'DISPATCHER'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Split fullName into firstName and lastName for the backend
            const nameParts = form.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            await api.post('/auth/register', {
                username: form.username,
                email: form.email,
                password: form.password,
                firstName,
                lastName,
                role: form.role
            });
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">
                    <Truck color="white" size={32} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Join FleetFlow</h1>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Create your logistics account</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                required
                                placeholder="Username"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                required
                                placeholder="Full Name"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                required
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="icon-btn"
                                style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <select
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            style={{ paddingLeft: '1rem' }}
                        >
                            <option value="MANAGER">Manager</option>
                            <option value="DISPATCHER">Dispatcher</option>
                            <option value="SAFETY_OFFICER">Safety Officer</option>
                            <option value="ANALYST">Financial Analyst</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary">Create Account</button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div >
    );
}
