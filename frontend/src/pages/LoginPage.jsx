import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');

  // Security challenge states
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
    }
  }, [location.state]);

  const loadNewCaptcha = async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.data.success) {
        setCaptchaToken(res.data.captchaToken);
        setCaptchaSvg(res.data.captchaSvg);
      }
    } catch (e) {
      console.error('Failed to reload CAPTCHA:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const resData = await login({
        email,
        password,
        captchaToken,
        captchaAnswer,
        mfaCode
      });

      if (resData.requiresMfa) {
        setRequiresMfa(true);
        setError('');
        setLoading(false);
        return;
      }

      if (resData.requiresCaptcha) {
        setRequiresCaptcha(true);
        setCaptchaToken(resData.captchaToken);
        setCaptchaSvg(resData.captchaSvg);
        setCaptchaAnswer('');
      }

      if (resData.success && !resData.requiresMfa) {
        navigate('/dashboard');
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to backend server. Please make sure the backend server is running on port 5000.');
      } else {
        const res = err.response.data;
        if (res?.requiresCaptcha) {
          setRequiresCaptcha(true);
          setCaptchaToken(res.captchaToken);
          setCaptchaSvg(res.captchaSvg);
          setCaptchaAnswer('');
        }
        setError(res?.error || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#09090b] w-full max-w-md p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        
        {/* Header Gold Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-['Cinzel'] font-black text-3xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic font-['Cinzel']">
            {requiresMfa ? 'Two-Factor Authentication' : 'Sign In to Jiffy Research'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">
            {requiresMfa 
              ? 'Enter the 6-digit verification code from your authenticator app'
              : 'Access your AI research workspaces & evidence repository'}
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!requiresMfa ? (
            <>
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
                    placeholder="alex.vance@gmail.com"
                    className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase text-zinc-300 tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-[#d2f235] hover:underline font-semibold">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>

              {/* CAPTCHA Challenge Step */}
              {requiresCaptcha && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Security CAPTCHA Verification
                    </span>
                    <button
                      type="button"
                      onClick={loadNewCaptcha}
                      className="text-amber-400 hover:text-amber-200 text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>
                  
                  {captchaSvg && (
                    <div
                      className="flex justify-center rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 py-1"
                      dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    />
                  )}

                  <input
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter mathematical result"
                    className="w-full bg-[#18181b] text-white text-xs rounded-xl px-4 py-2.5 border border-amber-500/40 focus:outline-none focus:border-amber-400 font-bold tracking-wider text-center"
                  />
                </div>
              )}
            </>
          ) : (
            /* MFA 2FA Code Input Step */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-3">
                <KeyRound className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-xs text-zinc-300 font-medium">
                  Two-factor authentication is active on this account. Open your Google Authenticator or TOTP app to retrieve your 6-digit security key.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider text-center">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#18181b] text-white text-lg font-mono font-bold tracking-[0.5em] text-center rounded-xl px-4 py-3 border border-indigo-500/50 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setRequiresMfa(false)}
                className="w-full text-xs text-zinc-400 hover:text-zinc-200 text-center block pt-1"
              >
                ← Back to Login
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? 'Authenticating...' : (requiresMfa ? 'Verify 2FA Code' : 'Sign In')}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6 font-medium">
          Don't have a research account?{' '}
          <Link to="/register" className="text-[#d2f235] hover:underline font-extrabold">
            Sign Up with Google
          </Link>
        </p>

      </div>
    </div>
  );
}
