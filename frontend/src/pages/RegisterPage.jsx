import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters, with 1 uppercase letter and 1 number.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, password);
      if (res && res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to backend server. Please make sure the backend server is running on port 5000.');
      } else {
        const details = err.response.data?.details;
        if (details && details.length > 0) {
          setError(details.map(d => d.message).join(', '));
        } else {
          setError(err.response.data?.error || 'Registration failed. Please try again.');
        }
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
            Create Research Account
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">
            Join the AI-powered research & knowledge discovery studio
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alex Vance"
                className="w-full bg-[#18181b] text-white text-xs rounded-xl pl-11 pr-4 py-3 border border-zinc-800 focus:outline-none focus:border-[#d2f235] transition-colors font-medium"
              />
            </div>
          </div>

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
            <label className="block text-xs font-black uppercase text-zinc-300 mb-1.5 tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full btn-recraft-lime text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? 'Setting up Workspace...' : 'Register & Start Research'}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-[#d2f235] hover:underline font-extrabold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
