
import React from 'react';
import { Save, School, Lock, Bell } from 'lucide-react';
import { Button } from '../../components/Button';

export const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
       <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
          <p className="text-gray-500 text-sm">Konfigurasi umum aplikasi sekolah.</p>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <School className="w-5 h-5 text-brand-600" /> Profil Sekolah
             </h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Sekolah</label>
                   <input type="text" defaultValue="SMK EL MOSTHOFA" className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
                   <input type="text" defaultValue="2024/2025" className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50" />
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea defaultValue="Pamekasan, Madura, Jawa Timur" className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50" />
             </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
             <Button>
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
             </Button>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-600" /> Keamanan & Akses
             </h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="font-semibold text-gray-800">Maintenance Mode</p>
                   <p className="text-sm text-gray-500">Nonaktifkan akses guru sementara waktu.</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                   <div className="w-6 h-6 bg-white rounded-full shadow border border-gray-300 absolute left-0"></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};