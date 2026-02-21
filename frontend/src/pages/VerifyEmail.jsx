import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Truck } from 'lucide-react';
import api from '../api/axios';

export default function VerifyEmail() {
     const [searchParams] = useSearchParams();
     const token = searchParams.get('token');
     const [status, setStatus] = useState('verifying'); // verifying, success, error
     const [error, setError] = useState('');
     const called = useRef(false);

     useEffect(() => {
          if (!token) {
               setStatus('error');
               setError('Invalid verification link.');
               return;
          }

          if (called.current) return;
          called.current = true;

          const verify = async () => {
               try {
                    await api.get(`/auth/verify-email?token=${token}`);
                    setStatus('success');
               } catch (err) {
                    // If it's already verified, we might get an error but we should perhaps check if it's already done
                    setStatus('error');
                    setError(err.response?.data?.error?.message || 'Verification failed. The link may be expired.');
               }
          };

          verify();
     }, [token]);

     return (
          <div className="auth-wrapper">
               <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo">
                         <Truck color="white" size={32} />
                    </div>

                    {status === 'verifying' && (
                         <div style={{ padding: '2rem 0' }}>
                              <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying your email</h1>
                              <p style={{ color: 'var(--text-dim)' }}>Please wait a moment...</p>
                         </div>
                    )}

                    {status === 'success' && (
                         <div style={{ padding: '2rem 0' }}>
                              <CheckCircle size={48} style={{ margin: '0 auto 1.5rem', color: '#10b981' }} />
                              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Email Verified!</h1>
                              <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Your account is now active. You can proceed to log in.</p>
                              <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                   Go to Login
                              </Link>
                         </div>
                    )}

                    {status === 'error' && (
                         <div style={{ padding: '2rem 0' }}>
                              <XCircle size={48} style={{ margin: '0 auto 1.5rem', color: '#ef4444' }} />
                              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verification Failed</h1>
                              <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>{error}</p>
                              <Link to="/register" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                   Back to Registration
                              </Link>
                         </div>
                    )}
               </div>
          </div>
     );
}
