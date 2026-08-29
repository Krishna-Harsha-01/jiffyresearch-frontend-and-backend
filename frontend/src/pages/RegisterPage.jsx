import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { ShieldCheck, AlertCircle, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Check } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c0-.2 0-.2 0 0z"
    />
    <path
      fill="#34A853"
      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
    />
  </svg>
);

export default function RegisterPage() {
  const [step, setStep] = useState('google'); // 'google' | 'password'
  const [verifiedGoogleUser, setVerifiedGoogleUser] = useState(null);

  // Password creation state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber;
  const isMatch = password === confirmPassword && confirmPassword.length > 0;

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '747543578312-rhkq2es0af937l4vj7okburrcpto9k1h.apps.googleusercontent.com';

  const onGoogleVerified = async (googleProfile) => {
    setError('');
    setLoading(true);

    try {
      // Check if user with this email is already registered
      const checkRes = await authService.checkEmail(googleProfile.email);
      if (checkRes.data?.exists) {
        setError('The account with this mail already exists. Please sign in instead.');
        setVerifiedGoogleUser(null);
        setStep('google');
        return;
      }

      setVerifiedGoogleUser(googleProfile);
      setStep('password');
    } catch (err) {
      console.warn('Check email network note:', err);
      // Even if network check fails, proceed to password step; backend googleAuth will validate
      setVerifiedGoogleUser(googleProfile);
      setStep('password');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialResponse = (response) => {
    if (!response?.credential) return;
    setError('');

    try {
      // Decode verified Google JWT token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      onGoogleVerified({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        googleId: payload.sub,
        avatar: payload.picture
      });
    } catch (err) {
      setError('Google verification failed. Please try again.');
    }
  };

  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google?.accounts?.id && CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('google-official-signup-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signup_with',
              width: 320,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('GSI Init note:', e);
        }
      }
    };

    if (step === 'google') {
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters, with 1 uppercase letter and 1 number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type your confirm password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.googleAuth({
        email: verifiedGoogleUser.email,
        name: verifiedGoogleUser.name,
        googleId: verifiedGoogleUser.googleId,
        avatar: verifiedGoogleUser.avatar,
        password,
        isSignUp: true
      });

      if (res.data.success) {
        // Navigate to login page with pre-filled email and success message
        navigate('/login', {
          state: {
            registeredEmail: verifiedGoogleUser.email,
            successMessage: 'Account created! Please sign in with your email and password.'
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#09090b] w-full max-w-md p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden text-center space-y-6">
        
        {/* Header Gold Logo & Title */}
        <div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-['Cinzel'] font-black text-3xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic font-['Cinzel']">
            {step === 'google' ? 'Create Account' : 'Create Password'}
          </h2>

          <p className="text-xs text-zinc-400 mt-2 font-medium">
            {step === 'google'
              ? 'Sign up with your Google account to get verified access to Jiffy Research.'
              : 'Set a password for your account to sign in securely.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col items-center justify-center gap-1.5 font-medium text-center">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('already exists') && (
              <Link 
                to="/login" 
                className="text-[#d2f235] hover:underline font-black text-xs mt-1 inline-flex items-center gap-1"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d2f235]" />
              </Link>
            )}
          </div>
        )}

        {step === 'google' ? (
          /* STEP 1: Official Google Sign-Up */
          <>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#d2f235]" />
                <span>Verified Identity Required</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Manual email creation is disabled. Please verify your identity with Google to create your research account.
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center justify-center">
              <div id="google-official-signup-btn" className="w-full flex justify-center min-h-[48px]"></div>
            </div>

            <p className="text-center text-xs text-zinc-400 pt-2 font-medium">
              Already registered?{' '}
              <Link to="/login" className="text-[#d2f235] hover:underline font-extrabold">
                Sign In with Email
              </Link>
            </p>
          </>
        ) : (
          /* STEP 2: Create Password for this Website */
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            
            {/* Verified Google Account Badge */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 truncate">
                  <span>Google Account Verified</span>
                </div>
                <div className="text-[11px] text-zinc-300 font-semibold truncate">
                  {verifiedGoogleUser?.email}
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 Upper, 1 Digit"
                  className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-11 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-zinc-400 hover:text-white transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password complexity hints */}
              {password.length > 0 && (
                <div className="mt-2 text-[11px] space-y-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
              className="w-full py-3.5 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? 'Saving Password...' : 'Save Password & Go to Sign In'}
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={() => setStep('google')}
              className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 block pt-1"
            >
              ← Choose another account
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
