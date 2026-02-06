import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { Role } from '../../types';
import clsx from 'clsx';
// @ts-ignore
import Lottie from 'lottie-react';

export const Login = () => {
  const { login } = useAuth();
  
  // State
  const [selectedRole, setSelectedRole] = useState<Role>(Role.TEACHER);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationData, setAnimationData] = useState<any>(null);

  // Fetch Animation
  useEffect(() => {
    fetch('/Online Learning.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Animation load failed", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!identifier || !password) throw new Error("ID Pengguna dan kata sandi wajib diisi");
      
      // 1. Call API
      const user = await ApiService.login(identifier, password);
      
      // 2. Role Validation
      if (user.role !== Role.ADMIN && user.role !== selectedRole) {
         throw new Error(`Akun ini tidak terdaftar sebagai ${getRoleLabel(selectedRole)}. Silakan ganti peran.`);
      }

      // 3. Success
      login(user);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kredensial anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (r: Role) => {
    switch(r) {
        case Role.TEACHER: return 'Guru Mapel';
        case Role.COUNSELOR: return 'Guru BK';
        case Role.PRINCIPAL: return 'Kepala Sekolah';
        default: return 'User';
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans overflow-hidden bg-[#FFF8F3]">
      
      {/* LEFT COLUMN - WARM ORANGE ENTERPRISE THEME */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 relative z-10 bg-white/60 backdrop-blur-sm border-r border-orange-100">
        
        {/* Warm Background Ambience (Left Side Only) */}
        <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-orange-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[20%] w-32 h-32 bg-amber-300/20 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="max-w-md w-full mx-auto relative z-20">
           {/* Mobile Logo (Visible only on small screens) */}
           <div className="lg:hidden mb-8 flex items-center gap-3">
              <img 
                 src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                 alt="Logo" 
                 className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-gray-800 tracking-tight">SMK EL MOSTHOFA</span>
           </div>

           <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                    <Building2 className="w-3.5 h-3.5" /> Sistem Manajemen Sekolah
                 </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight font-serif leading-tight">
                 Dashboard <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Login Area</span>
              </h1>
              <p className="text-gray-500 text-lg">
                 Selamat datang! Silakan masuk untuk mengakses panel akademik.
              </p>
           </div>

           {/* Role Switcher (Orange Accent) */}
           <div className="mb-8 p-1.5 bg-orange-50 rounded-2xl flex relative shadow-inner border border-orange-100/50">
              {[Role.TEACHER, Role.COUNSELOR, Role.PRINCIPAL].map((role) => (
                 <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={clsx(
                       "flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2",
                       selectedRole === role 
                          ? "bg-white text-orange-700 shadow-md ring-1 ring-orange-100 scale-[1.02]" 
                          : "text-gray-500 hover:text-orange-600 hover:bg-orange-100/50"
                    )}
                 >
                    {role === Role.PRINCIPAL && <ShieldCheck className={clsx("w-4 h-4", selectedRole === role ? "text-orange-500" : "text-gray-400")} />}
                    {getRoleLabel(role)}
                 </button>
              ))}
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Username Input */}
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">
                    NIP / ID Pengguna
                 </label>
                 <div className="relative group">
                    <div className="absolute left-4 top-3.5 w-10 h-10 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input 
                       type="text"
                       required
                       value={identifier}
                       onChange={(e) => setIdentifier(e.target.value)}
                       placeholder={selectedRole === Role.TEACHER ? "Masukkan NIP Guru" : "Masukkan ID Pengguna"}
                       className="w-full bg-white text-gray-900 placeholder-gray-400 pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium shadow-sm"
                    />
                 </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Kata Sandi
                    </label>
                    <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                       Lupa kata sandi?
                    </a>
                 </div>
                 <div className="relative group">
                    <div className="absolute left-4 top-3.5 w-10 h-10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input 
                       type={showPassword ? "text" : "password"}
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="Masukkan kata sandi anda"
                       className="w-full bg-white text-gray-900 placeholder-gray-400 pl-12 pr-12 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium shadow-sm"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-4 text-gray-400 hover:text-orange-600 focus:outline-none transition-colors"
                    >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              {/* Error Message */}
              {error && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {error}
                 </div>
              )}

              {/* Submit Button (Gradient Orange) */}
              <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4 border border-transparent"
              >
                 {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Memproses...</span>
                    </div>
                 ) : (
                    <>
                       Masuk Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                 )}
              </button>
           </form>

           <div className="mt-10 text-center border-t border-orange-100 pt-6">
              <p className="text-sm text-gray-400">
                 &copy; {new Date().getFullYear()} SMK El Mosthofa. <br className="sm:hidden"/> 
                 <span className="text-orange-600 font-medium ml-1">Secure Enterprise System.</span>
              </p>
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN - BRAND HERO WITH LOTTIE ANIMATION */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 relative overflow-hidden items-center justify-center flex-col text-white">
         
         {/* Abstract Patterns */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-tr-full pointer-events-none"></div>
         
         {/* Content Container */}
         <div className="relative z-10 text-center p-8 max-w-xl w-full flex flex-col items-center justify-center h-full">
             
             {/* PROMINENT LOGO & SCHOOL NAME */}
             <div className="mb-8 flex flex-col items-center gap-4 animate-in slide-in-from-top-4 duration-700">
                <img 
                   src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                   alt="Logo Sekolah" 
                   className="w-28 h-28 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg font-serif">
                       SMK EL MOSTHOFA
                    </h1>
                    <p className="text-brand-100 text-sm font-medium tracking-widest uppercase opacity-80 mt-1">
                        Pamekasan - Madura
                    </p>
                </div>
             </div>

             {/* MAIN ANIMATION (LOTTIE) */}
             <div className="w-full max-w-[450px] mb-8 relative">
                {animationData && (
                    <Lottie 
                        animationData={animationData} 
                        loop={true} 
                        className="w-full h-auto drop-shadow-xl"
                    />
                )}
             </div>
             
             <h2 className="text-2xl font-bold mb-3 leading-tight drop-shadow-md">
                Sistem Informasi Akademik <br/> & Absensi Digital
             </h2>
             <p className="text-brand-100 text-base leading-relaxed max-w-md mx-auto">
                Platform terintegrasi untuk efisiensi pengelolaan data siswa, pemantauan kehadiran, dan pelaporan akademik.
             </p>
         </div>
      </div>
    </div>
  );
};