import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { authService } from '../services/api';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [step, setStep] = useState(tokenParam ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res.data.message || 'If an account exists, password reset instructions have been sent.');
      if (res.data.resetToken) {
        setDevToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const [googleVerifiedUser, setGoogleVerifiedUser] = useState(null);
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '208857379966-8pcekt5qt94bhnnucs4f52qctr7eldja.apps.googleusercontent.com';

  const handleGoogleCredentialResponse = (response) => {
    if (!response?.credential) return;
    setError('');

    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      setGoogleVerifiedUser(payload);
      setEmail(payload.email);
      setStep('reset');
    } catch (err) {
      setError('Google verification failed. Please try again or use the email reset link.');
    }
  };

  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google?.accounts?.id && CLIENT_ID && step === 'request') {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('google-recovery-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signin_with',
              width: 320,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('GSI recovery note:', e);
        }
      }
    };

    if (step === 'request') {
      if (window.google?.accounts?.id) {
        initGoogleGSI();
      } else {
        const interval = setInterval(() => {
          if (window.google?.accounts?.id) {
            initGoogleGSI();
            clearInterval(interval);
          }
        }, 300);
        return () => clearInterval(interval);
      }
    }
  }, [CLIENT_ID, step]);

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters, with 1 uppercase letter and 1 number.');
      return;
    }

    setLoading(true);

    try {
      if (googleVerifiedUser) {
        // Reset via Google verification
        const res = await authService.googleAuth({
          email: googleVerifiedUser.email,
          name: googleVerifiedUser.name,
          googleId: googleVerifiedUser.sub,
          avatar: googleVerifiedUser.picture,
          password: newPassword
        });

        if (res.data.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login', {
              state: {
                registeredEmail: googleVerifiedUser.email,
                successMessage: 'Password successfully reset! Please sign in with your new password.'
              }
            });
          }, 1500);
        }
      } else {
        // Reset via single-use reset token
        const res = await authService.resetPassword({ token, newPassword });
        if (res.data.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login', {
              state: {
                successMessage: 'Password updated! Please sign in with your new password.'
              }
            });
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#09090b] w-full max-w-md p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic font-['Cinzel']">
            {step === 'request' ? 'Password Recovery' : 'Set New Password'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">
            {step === 'request'
              ? 'Enter your registered email address to receive single-use reset instructions'
              : 'Enter your single-use reset token and choose a secure new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-emerald-300">
              All active sessions have been invalidated for security. Redirecting to login...
            </p>
          </div>
        ) : step === 'request' ? (
          /* Step 1: Email Request Form & Google Recovery */
          <div className="space-y-5">
            
            {/* Fast Track: Verify with Google to Reset Password */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <KeyRound className="w-4 h-4 text-[#d2f235]" />
                <span>Instant Google Identity Recovery</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Verify your Google account to reset your password immediately without waiting for an email link.
              </p>
              <div className="pt-1 flex justify-center">
                <div id="google-recovery-btn" className="w-full flex justify-center min-h-[44px]"></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">or reset via email</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleRequestReset} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
                  />
                </div>
              </div>

              {message && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <p className="text-xs text-emerald-400 font-medium leading-relaxed">
                    {message}
                  </p>
                  {devToken && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        Demo Environment: Reset Token Generated
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setToken(devToken);
                          setStep('reset');
                        }}
                        className="w-full py-2 rounded-lg bg-amber-400 text-black font-extrabold text-xs cursor-pointer"
                      >
                        Use Demo Token to Reset Password Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? 'Processing...' : 'Send Password Reset Link'}
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                type="button"
                onClick={() => setStep('reset')}
                className="w-full text-xs text-zinc-400 hover:text-white text-center block pt-2 underline cursor-pointer"
              >
                Already have a reset token? Click here
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Confirm Reset Form */
          <form onSubmit={handleConfirmReset} className="space-y-4">
            
            {/* Google Verified Banner */}
            {googleVerifiedUser ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-emerald-300">Identity Verified via Google</div>
                  <div className="text-[11px] text-zinc-300 font-semibold truncate">{googleVerifiedUser?.email}</div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider text-left">
                  Single-Use Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from your email"
                  className="w-full bg-[#18181b] text-white text-xs rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1 text-left">
                  * Check your email inbox or use Google Identity Recovery to reset without a token.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider text-left">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 Upper, 1 Digit"
                  className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
                />
              </div>

              {/* Password complexity hints */}
              {newPassword.length > 0 && (
                <div className="mt-2 text-[11px] space-y-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 text-left">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> At least 8 characters long
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> At least one uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> At least one numeric digit (0-9)
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full py-3.5 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={() => {
                setGoogleVerifiedUser(null);
                setStep('request');
              }}
              className="w-full text-xs text-zinc-400 hover:text-white text-center block pt-2 underline cursor-pointer"
            >
              ← Back to recovery options
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-400 mt-6 font-medium">
          Remember your password?{' '}
          <Link to="/login" className="text-[#d2f235] hover:underline font-extrabold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
