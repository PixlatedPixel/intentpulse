import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { COLORS } from '../constants';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      onLogin(data.token);
    } catch (err) {
      setError('Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#10B981]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#10B981]/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <LayoutDashboard className="text-[#10B981] w-8 h-8" />
            </div>
            <h1 className="text-white font-bold text-3xl tracking-tight mb-2">IntentPulse</h1>
            <p className="text-slate-400 text-sm">Secure Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-[#10B981] hover:bg-[#0D9668] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Authenticate
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};
