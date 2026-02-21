import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Truck, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
     const [searchParams] = useSearchParams();
     const token = searchParams.get('token');
     const navigate = useNavigate();

     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [showPass, setShowPass] = useState(false);
     const [loading, setLoading] = useState(false);

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (password !== confirmPassword) {
               return toast.error('Passwords do not match');
          }
          if (password.length < 6) {
               return toast.error('Password must be at least 6 characters');
          }

          setLoading(true);
          try {
               const { data } = await api.post('/auth/reset-password', { token, password });
               toast.success(data.message);
               navigate('/login');
          } catch (err) {
               toast.error(err.response?.data?.error?.message || 'Failed to reset password');
          } finally {
               setLoading(false);
          }
     };

     if (!token) {
          return (
               <div className="auth-wrapper">
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                         <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Invalid Link</h1>
                         <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>This password reset link is invalid or has expired.</p>
                         <Link to="/forgot-password" size={16} className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                              Request New Link
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="auth-wrapper">
               <div className="auth-card">
                    <div className="auth-logo">
                         <Truck color="white" size={32} />
                    </div>

                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Set New Password</h1>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Please enter your new password below.</p>

                    <form onSubmit={handleSubmit}>
                         <div className="form-group">
                              <div className="input-wrapper">
                                   <Lock className="input-icon" size={18} />
                                   <input
                                        required
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="New Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
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
                              <div className="input-wrapper">
                                   <Lock className="input-icon" size={18} />
                                   <input
                                        required
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                   />
                              </div>
                         </div>

                         <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              {loading && <Loader2 className="animate-spin" size={18} />}
                              {loading ? 'Updating...' : 'Reset Password'}
                         </button>
                    </form>

                    <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                         <Link to="/login" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <ArrowLeft size={16} /> Back to Sign In
                         </Link>
                    </p>
               </div>
          </div>
     );
}
