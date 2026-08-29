import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setError('No verification token found in URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await authService.verifyEmail({ token });
        if (res.data.success) {
          setSuccess(true);
          if (res.data.user) {
            handleAuthSuccess(res.data.user, res.data.token);
          }
        } else {
          setError(res.data.error || 'Verification failed.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired verification token.');
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-[#09090b] w-full max-w-md p-8 rounded-3xl border border-zinc-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1c23] via-[#090a0f] to-[#050507] border border-[#c58b41]/60 shadow-xl flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8 text-[#d4af37]" />
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight italic font-['Cinzel']">
          Email Verification
        </h2>

        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-[#d2f235] animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">Validating verification token...</p>
          </div>
        ) : success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Account Verified!</h3>
            <p className="text-xs text-emerald-300">
              Your email has been verified successfully. You now have full access to all research workspace capabilities.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Verification Failed</h3>
            <p className="text-xs text-rose-300">{error}</p>
            <Link
              to="/login"
              className="block w-full py-3 rounded-full bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
