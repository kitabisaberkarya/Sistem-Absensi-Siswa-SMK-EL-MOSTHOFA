
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  ChevronDown, 
  Search, 
  School,
  User,
  LayoutList,
  Grid3X3,
  BookOpen
} from 'lucide-react';
import { Button } from '../../components/Button';
import clsx from 'clsx';
import { ReportService } from '../../services/ReportService';
import { ApiService } from '../../services/api';
import { SemesterRecapEntry, ClassRoom } from '../../types';

type ReportType = 'daily' | 'monthly' | 'student' | 'semester';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('daily');
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [isLoading, setIsLoading] = useState(false);

  // Semester State
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [semesterData, setSemesterData] = useState<SemesterRecapEntry[]>([]);

  // Load Classes
  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const classes = await ApiService.fetchClasses();
            const sorted = classes.sort((a, b) => a.name.localeCompare(b.name));
            setClassList(sorted);
            if (sorted.length > 0) setSelectedClass(sorted[0].name);
        } catch (e) {
            console.error(e);
        }
    };
    fetchClasses();
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    
    if (activeTab === 'semester') {
        try {
            const data = await ApiService.fetchSemesterRecap(selectedClass, selectedSemester, selectedYear);
            setSemesterData(data);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat data semester.");
        }
    } else {
        // Mock delay for other tabs as they rely on simple fetching or are static for now
        setTimeout(() => setIsLoading(false), 800);
    }
    
    setTimeout(() => setIsLoading(false), 500);
  };

  // Trigger load on tab change or filter change for Semester
  useEffect(() => {
    if (activeTab === 'semester') {
        handleGenerate();
    }
  }, [activeTab]);

  const handleExportPDF = () => {
    if (activeTab === 'semester') {
        ReportService.generateSemesterPDF({
            title: 'REKAPITULASI ABSENSI SEMESTER',
            subtitle: `Kelas ${selectedClass} - ${selectedSemester} ${selectedYear}`,
            date: `${selectedSemester} ${selectedYear}`,
            teacher: 'Administrator'
        }, semesterData);
        return;
    }
    alert("Export untuk format ini sedang dikembangkan untuk versi Realtime.");
  };

  const handleExportExcel = () => {
    if (activeTab === 'semester') {
        ReportService.generateSemesterExcel({
            title: 'REKAP ABSENSI SEMESTER',
            subtitle: `Kelas ${selectedClass} - ${selectedSemester} ${selectedYear}`,
            date: `${selectedSemester} ${selectedYear}`,
            teacher: 'Administrator'
        }, semesterData);
        return;
    }
    alert("Export untuk format ini sedang dikembangkan untuk versi Realtime.");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. Official Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
         <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">
                        Sistem Pelaporan Terpadu
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <School className="w-6 h-6 text-gray-700" />
                    Pusat Laporan & Arsip
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Tahun Ajaran 2024/2025 &bull; Semester Ganjil
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="text-gray-600 border-gray-300">
                    <Printer className="w-4 h-4 mr-2" /> Cetak Langsung
                </Button>
            </div>
         </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('daily')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'daily'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <LayoutList className="w-4 h-4" />
                Presensi Harian
            </button>
            <button
                onClick={() => setActiveTab('monthly')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'monthly'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <Grid3X3 className="w-4 h-4" />
                Rekap Bulanan
            </button>
            <button
                onClick={() => setActiveTab('semester')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'semester'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <BookOpen className="w-4 h-4" />
                Rekap Semester
            </button>
            <button
                onClick={() => setActiveTab('student')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'student'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <User className="w-4 h-4" />
                Laporan Individu
            </button>
         </nav>
      </div>

      {/* 3. Control Panel (Filter Bar) */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Common Filter: Class */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Kelas</label>
                <div className="relative">
                    <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium"
                    >
                        {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Dynamic Filters */}
            {activeTab === 'daily' && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Tanggal</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'monthly' && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Bulan</label>
                    <div className="relative">
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium"
                        >
                            <option value="0">Januari</option>
                            <option value="1">Februari</option>
                            <option value="2">Maret</option>
                            <option value="3">April</option>
                            <option value="4">Mei</option>
                            <option value="5">Juni</option>
                            <option value="6">Juli</option>
                            <option value="7">Agustus</option>
                            <option value="8">September</option>
                            <option value="9">Oktober</option>
                            <option value="10">November</option>
                            <option value="11">Desember</option>
                        </select>
                        <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            )}

            {activeTab === 'semester' && (
                <>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Semester</label>
                        <div className="relative">
                            <select 
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium"
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Tahun Ajaran</label>
                        <div className="relative">
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium"
                            >
                                <option value="2023/2024">2023/2024</option>
                                <option value="2024/2025">2024/2025</option>
                                <option value="2025/2026">2025/2026</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'student' && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Cari Siswa</label>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Nama atau NIS..." 
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                        />
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button 
                    onClick={handleGenerate} 
                    isLoading={isLoading}
                    className="flex-1 bg-brand-700 hover:bg-brand-800 text-white"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Tampilkan
                </Button>
            </div>
         </div>
      </div>

      {/* 4. Document Preview Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg min-h-[500px] flex flex-col">
         
         {/* Preview Toolbar */}
         <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live Preview</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportPDF} className="h-9 text-xs border-red-200 text-red-700 hover:bg-red-50">
                    <FileText className="w-3.5 h-3.5 mr-2" /> Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel} className="h-9 text-xs border-green-200 text-green-700 hover:bg-green-50">
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> Export Excel
                </Button>
            </div>
         </div>

         {/* Document Content */}
         <div className="flex-1 p-8 overflow-auto bg-gray-100">
            <div className="max-w-[210mm] mx-auto bg-white shadow-sm border border-gray-200 min-h-[297mm] p-[10mm] md:p-[15mm] relative text-sm">
                
                {/* KOP SURAT RESMI (Updated Layout) */}
                <div className="border-b-4 border-double border-gray-900 pb-4 mb-6 relative">
                    <div className="flex items-center justify-between px-2">
                        {/* Logo Yayasan (Kiri) */}
                        <img 
                            src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770438319/logo_yayan_at_tohiri_gg8vkq.png" 
                            alt="Logo Yayasan" 
                            className="w-16 h-16 md:w-20 md:h-20 object-contain"
                        />
                        
                        {/* Teks Tengah */}
                        <div className="flex-1 text-center px-4">
                            <h3 className="text-sm font-bold font-serif text-gray-800 tracking-wide">YAYASAN PENDIDIKAN ISLAM AT-TOHIRI</h3>
                            <h1 className="text-lg md:text-xl font-bold font-serif text-gray-900 uppercase tracking-wider my-1">SMK EL MOSTHOFA</h1>
                            <p className="text-[10px] md:text-xs text-gray-600 font-serif italic">Bidang Keahlian: Teknologi Informasi & Komunikasi, Bisnis & Manajemen</p>
                            <p className="text-[10px] md:text-xs text-gray-600 font-serif">Jalan Raya Pamekasan - Sumenep KM. 15, Pamekasan, Jawa Timur</p>
                            <p className="text-[9px] md:text-[10px] text-gray-500 mt-1">Telp: (0324) 123456 | Email: admin@elmosthofa.sch.id</p>
                        </div>

                        {/* Logo Sekolah (Kanan) */}
                        <img 
                            src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                            alt="Logo Sekolah" 
                            className="w-16 h-16 md:w-20 md:h-20 object-contain"
                        />
                    </div>
                </div>

                {/* REPORT TITLE */}
                <div className="text-center mb-6">
                    <h2 className="text-base font-bold underline uppercase text-gray-900 mb-1">
                        {activeTab === 'daily' ? 'LAPORAN PRESENSI HARIAN' : activeTab === 'monthly' ? 'REKAPITULASI PRESENSI BULANAN' : activeTab === 'semester' ? 'REKAP ABSENSI SEMESTER' : 'LAPORAN AKTIVITAS SISWA'}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {activeTab === 'daily' 
                            ? `Tanggal: ${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` 
                            : activeTab === 'monthly' 
                            ? `Periode: Bulan ${parseInt(selectedMonth)+1} / Tahun 2024`
                            : activeTab === 'semester'
                            ? `Semester ${selectedSemester} Tahun Ajaran ${selectedYear}`
                            : 'Semester Ganjil 2024/2025'
                        }
                    </p>
                </div>

                {/* TABLE CONTENT: SEMESTER (NEW) */}
                {activeTab === 'semester' && (
                    <table className="w-full border-collapse border border-gray-900 text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-600 p-2 w-10 text-center">No</th>
                                <th className="border border-gray-600 p-2 w-24 text-left">NIS</th>
                                <th className="border border-gray-600 p-2 text-left">Nama Siswa</th>
                                <th className="border border-gray-600 p-2 w-10 text-center">L/P</th>
                                <th className="border border-gray-600 p-2 w-12 text-center bg-green-50">H</th>
                                <th className="border border-gray-600 p-2 w-12 text-center bg-yellow-50">S</th>
                                <th className="border border-gray-600 p-2 w-12 text-center bg-blue-50">I</th>
                                <th className="border border-gray-600 p-2 w-12 text-center bg-red-50">A</th>
                                <th className="border border-gray-600 p-2 w-20 text-center">Presentase</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesterData.length > 0 ? semesterData.map((row, idx) => (
                                <tr key={row.studentId}>
                                    <td className="border border-gray-400 p-1.5 text-center">{idx + 1}</td>
                                    <td className="border border-gray-400 p-1.5 font-mono">{row.nis}</td>
                                    <td className="border border-gray-400 p-1.5 font-medium">{row.name}</td>
                                    <td className="border border-gray-400 p-1.5 text-center">{row.gender}</td>
                                    <td className="border border-gray-400 p-1.5 text-center font-bold bg-green-50/50">{row.present}</td>
                                    <td className="border border-gray-400 p-1.5 text-center">{row.sick}</td>
                                    <td className="border border-gray-400 p-1.5 text-center">{row.permission}</td>
                                    <td className="border border-gray-400 p-1.5 text-center font-bold text-red-600">{row.alpha}</td>
                                    <td className={clsx(
                                        "border border-gray-400 p-1.5 text-center font-bold",
                                        row.percentage >= 90 ? "text-green-600" :
                                        row.percentage >= 75 ? "text-blue-600" : "text-red-600"
                                    )}>
                                        {row.percentage}%
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="border border-gray-400 p-8 text-center text-gray-500 italic">
                                        Data belum tersedia. Silakan klik "Tampilkan".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                 {/* PLACEHOLDER FOR OTHER TABS */}
                 {activeTab !== 'semester' && (
                     <div className="text-center py-20 text-gray-500 italic border border-dashed border-gray-300 rounded">
                         Fitur laporan harian/bulanan akan menampilkan data real-time setelah Anda memilih parameter dan klik Tampilkan.
                     </div>
                 )}

                {/* SIGNATURE SECTION */}
                <div className="mt-12 flex justify-end">
                    <div className="text-center w-48">
                        <p className="text-xs mb-16">Pamekasan, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        <p className="text-xs font-bold underline">H. BUDI SANTOSO, S.Pd</p>
                        <p className="text-[10px]">NIP. 19850101 201001 1 001</p>
                    </div>
                </div>

            </div>
         </div>
      </div>
    </div>
  );
};
