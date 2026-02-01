import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { Button } from '../../components/Button';
import { School, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email || !password) throw new Error("Email dan password wajib diisi");
      const user = await ApiService.login(email);
      login(user);
    } catch (err) {
      setError('Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCreds = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans overflow-hidden">
      
      {/* LEFT SIDE - Branding (Static & Professional) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-700 mt-10">
          <div className="inline-flex items-center gap-3 mb-8 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
            <School className="w-5 h-5 text-brand-200" />
            <span className="text-sm font-semibold tracking-wide text-brand-100 uppercase">Sistem Informasi Sekolah</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            SMK EL MOSTHOFA <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-brand-100">
              Pamekasan Madura
            </span>
          </h1>
          <p className="text-lg text-brand-100 max-w-md leading-relaxed opacity-90">
            Platform digital terintegrasi untuk manajemen absensi, monitoring kedisiplinan, dan evaluasi akademik menuju standar pendidikan 2026.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 text-sm font-medium text-brand-200 mt-auto">
           <div className="flex items-center gap-3 bg-brand-800/30 p-3 rounded-lg border border-brand-500/30">
             <CheckCircle2 className="w-5 h-5 text-yellow-400" />
             <span>Real-time Monitoring</span>
           </div>
           <div className="flex items-center gap-3 bg-brand-800/30 p-3 rounded-lg border border-brand-500/30">
             <ShieldCheck className="w-5 h-5 text-yellow-400" />
             <span>Secure Data Access</span>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form (Modern & Warm) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Ambient Warm Background Elements (The Orange/Yellow Variation) */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>

        <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="bg-brand-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
              <School className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">SMK EL MOSTHOFA</h2>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border-t-4 border-t-amber-500 border-x border-b border-white/60">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">Secure Login</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang</h2>
              <p className="text-sm text-gray-500 mt-2">Masuk untuk mengakses dashboard akademik.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Sekolah</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-brand-600" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all sm:text-sm shadow-sm"
                      placeholder="nama@sekolah.sch.id"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-600" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all sm:text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                className="py-4 rounded-xl text-base font-bold shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all active:scale-[0.98] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600"
              >
                Masuk ke Sistem <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
            
            {/* Quick Access / Demo Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">
                Pilih Peran (Demo Mode)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDemoCreds('guru@sekolah.sch.id')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Guru Mapel
                </button>
                <button
                  onClick={() => setDemoCreds('bk@sekolah.sch.id')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-pink-400 hover:bg-pink-50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div> Guru BK
                </button>
                <button
                  onClick={() => setDemoCreds('kepsek@sekolah.sch.id')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Kepala Sekolah
                </button>
                <button
                  onClick={() => setDemoCreds('admin@sekolah.sch.id')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div> Administrator
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400/80 font-medium">
            &copy; {new Date().getFullYear()} SMK EL MOSTHOFA. Integrated System.
          </p>
        </div>
      </div>
    </div>
  );
};