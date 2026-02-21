import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Truck, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
     const [email, setEmail] = useState('');
     const [loading, setLoading] = useState(false);
     const [submitted, setSubmitted] = useState(false);

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
               const { data } = await api.post('/auth/forgot-password', { email });
               toast.success(data.message);
               setSubmitted(true);
          } catch (err) {
               toast.error(err.response?.data?.error?.message || 'Something went wrong');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="auth-wrapper">
               <div className="auth-card">
                    <div className="auth-logo">
                         <Truck color="white" size={32} />
                    </div>

                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Forgot Password?</h1>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
                         {submitted
                              ? "Check your email for a reset link."
                              : "Enter your email and we'll send you a link to reset your password."}
                    </p>

                    {!submitted ? (
                         <form onSubmit={handleSubmit}>
                              <div className="form-group">
                                   <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                             required
                                             type="email"
                                             placeholder="Email Address"
                                             value={email}
                                             onChange={e => setEmail(e.target.value)}
                                        />
                                   </div>
                              </div>

                              <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                   {loading && <Loader2 className="animate-spin" size={18} />}
                                   {loading ? 'Sending Link...' : 'Send Reset Link'}
                              </button>
                         </form>
                    ) : (
                         <button onClick={() => setSubmitted(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
                              Didn't get the email? Try again
                         </button>
                    )}

                    <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                         <Link to="/login" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <ArrowLeft size={16} /> Back to Sign In
                         </Link>
                    </p>
               </div>
          </div>
     );
}
