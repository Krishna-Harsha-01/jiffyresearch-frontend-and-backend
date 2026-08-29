import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const { user, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successName, setSuccessName] = useState('');
  const navigate = useNavigate();

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '747543578312-rhkq2es0af937l4vj7okburrcpto9k1h.apps.googleusercontent.com';

  // If user is already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setError('');
    setLoading(true);

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

      const res = await loginWithGoogle({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        googleId: payload.sub,
        avatar: payload.picture
      });

      if (res?.success) {
        setSuccessName(payload.name || payload.email);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 600);
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.response?.data?.error || 'Authentication with Google failed. Please try again.');
    } finally {
      setLoading(false);
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

          const btnContainer = document.getElementById('google-unified-auth-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              width: 320,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('GSI Init note:', e);
        }
      }
    };

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
  }, [CLIENT_ID]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#09090b] w-full max-w-md p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden text-center space-y-6">
        
        {/* Subtle decorative gold/amber glow in background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#d4af37]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#d2f235]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header Gold Brand Logo & Title */}
        <div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-['Cinzel'] font-black text-3xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3e0aa] via-[#d4af37] to-[#a67c1e] select-none">
              J
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic font-['Cinzel']">
            Jiffy Research
          </h2>

          <p className="text-xs text-zinc-400 mt-2 font-medium leading-relaxed max-w-xs mx-auto">
            1-Click Google Authentication. Instant access to your AI research workspaces with zero passwords.
          </p>
        </div>

        {/* Success / Redirect Banner */}
        {successName && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Welcome, {successName}! Launching workspace...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 font-medium text-center">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication Box */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#d2f235]" />
              <span>Direct Google Sign-In</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign in once with your Google account. Your session stays permanently active until you log out or delete your account.
            </p>
          </div>

          <div className="pt-2 flex flex-col items-center justify-center min-h-[50px]">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-[#d2f235] font-bold py-3">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Authenticating with Google...</span>
              </div>
            ) : (
              <div id="google-unified-auth-btn" className="w-full flex justify-center min-h-[48px]"></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
