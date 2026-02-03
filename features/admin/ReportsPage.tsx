
import React from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '../../components/Button';

export const ReportsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
       <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h2>
          <p className="text-gray-500 text-sm">Unduh data absensi dan statistik sekolah.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Laporan Harian */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <FileText className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Laporan Harian</h3>
             <p className="text-sm text-gray-500 mb-6">Rekap absensi seluruh kelas per hari ini.</p>
             <Button variant="outline" fullWidth className="justify-between">
                Download PDF <Download className="w-4 h-4" />
             </Button>
          </div>

          {/* Card Laporan Bulanan */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                <Calendar className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Laporan Bulanan</h3>
             <p className="text-sm text-gray-500 mb-6">Akumulasi kehadiran siswa bulan ini.</p>
             <Button variant="outline" fullWidth className="justify-between">
                Download Excel <Download className="w-4 h-4" />
             </Button>
          </div>

           {/* Card Custom */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                <Filter className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Laporan Kustom</h3>
             <p className="text-sm text-gray-500 mb-6">Filter berdasarkan kelas dan rentang tanggal.</p>
             <Button variant="outline" fullWidth className="justify-between">
                Buat Laporan <Download className="w-4 h-4" />
             </Button>
          </div>
       </div>

       <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-bold text-yellow-800 mb-2">Catatan Sistem</h4>
          <p className="text-sm text-yellow-700">
             Fitur laporan lengkap akan menggunakan data real-time dari Google Sheets. Pastikan sinkronisasi data berjalan lancar sebelum mengunduh laporan periode panjang.
          </p>
       </div>
    </div>
  );
};