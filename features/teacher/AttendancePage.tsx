import React, { useState, useEffect, useMemo } from 'react';
import { ApiService } from '../../services/api';
import { CLASSES, SUBJECTS } from '../../constants';
import { Student, AttendanceStatus, AttendanceRecord } from '../../types';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ReportPreviewModal } from '../../components/ReportPreviewModal';
import { ReportRow } from '../../services/ReportService';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Save, 
  Search, 
  BookOpen, 
  CheckSquare,
  Filter,
  Calendar,
  FileText
} from 'lucide-react';
import clsx from 'clsx';

export const AttendancePage = () => {
  const { user } = useAuth();
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [topic, setTopic] = useState(''); // Jurnal Materi
  
  // Attendance Logic State
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Status Configuration for UI
  const statusConfig = [
    { 
      value: AttendanceStatus.PRESENT, 
      label: 'Hadir', 
      short: 'H',
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', 
      activeColor: 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200',
      icon: CheckCircle2 
    },
    { 
      value: AttendanceStatus.SICK, 
      label: 'Sakit', 
      short: 'S',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', 
      activeColor: 'bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-200',
      icon: AlertCircle 
    },
    { 
      value: AttendanceStatus.PERMISSION, 
      label: 'Izin', 
      short: 'I',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 
      activeColor: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200',
      icon: Clock 
    },
    { 
      value: AttendanceStatus.ABSENT, 
      label: 'Alpha', 
      short: 'A',
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', 
      activeColor: 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200',
      icon: XCircle 
    },
  ];

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const data = await ApiService.fetchStudentsByClass(selectedClass);
          setStudents(data);
          // Reset records
          setRecords({});
          setNotes({});
          setTopic('');
        } catch (error) {
          console.error("Failed to fetch students", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }));
  };

  const markAllPresent = () => {
    const newRecords: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      newRecords[s.id] = AttendanceStatus.PRESENT;
    });
    setRecords(newRecords);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject) {
      alert("Mohon pilih Kelas dan Mata Pelajaran.");
      return;
    }
    if (!topic.trim()) {
      alert("Mohon isi Materi Pembahasan (Jurnal Kelas).");
      return;
    }

    // Validate if all students have status
    const unmarked = students.filter(s => !records[s.id]);
    if (unmarked.length > 0) {
      const confirm = window.confirm(`Ada ${unmarked.length} siswa belum diabsen. Mereka akan dianggap 'Hadir'. Lanjutkan?`);
      if (!confirm) return;
      
      // Auto-fill unmarked as present
      unmarked.forEach(s => {
        records[s.id] = AttendanceStatus.PRESENT;
      });
    }

    setSubmitting(true);
    try {
      const payloadRecords: AttendanceRecord[] = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: records[s.id] || AttendanceStatus.PRESENT,
        note: notes[s.id] || ''
      }));

      await ApiService.submitAttendance({
        classId: selectedClass,
        subject: selectedSubject,
        date: new Date().toISOString(),
        teacherId: user?.id || 'unknown',
        topic: topic,
        records: payloadRecords
      });

      setSuccessMsg('Data absensi & jurnal berhasil disimpan!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedClass('');
        setSelectedSubject('');
        setStudents([]);
        setTopic('');
      }, 2500);
      
    } catch (error) {
      alert('Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare data for report preview
  const getReportData = (): ReportRow[] => {
    return students.map((s, index) => ({
      no: index + 1,
      name: s.name,
      nis: s.nis,
      className: s.className,
      status: records[s.id] || 'Belum Diabsen',
      note: notes[s.id] || ''
    }));
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.nis.includes(searchQuery)
    );
  }, [students, searchQuery]);

  // Calculate Stats
  const stats = useMemo(() => {
    const total = students.length;
    const marked = Object.keys(records).length;
    const present = Object.values(records).filter(s => s === AttendanceStatus.PRESENT).length;
    const absent = marked - present;
    return { total, marked, present, absent };
  }, [students, records]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* 1. Header & Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-brand-600 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-200" />
            Input Absensi Harian
          </h2>
          <p className="text-brand-100 text-sm mt-1 opacity-90">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border-gray-200 border bg-gray-50 p-3 pl-4 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-gray-700"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border-gray-200 border bg-gray-50 p-3 pl-4 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-gray-700"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">-- Pilih Mapel --</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Jurnal Section - Mandatory */}
        {selectedClass && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
              <span>Materi Pembahasan / Jurnal Kelas</span>
              <span className="text-xs font-normal text-red-500">*Wajib diisi</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Bab 4 - Persamaan Kuadrat, Latihan Soal Halaman 45..."
              className="w-full rounded-xl border-gray-200 bg-yellow-50/50 p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[80px] text-sm"
            />
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-center shadow-sm animate-bounce">
          <CheckCircle2 className="w-6 h-6 mr-3 text-green-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-100 border-t-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Mengambil data siswa...</p>
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-[70px] z-30">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="text-sm text-gray-500 hidden md:block">
                Progress: <span className="font-bold text-brand-600">{stats.marked}/{stats.total}</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowReportModal(true)} 
                className="whitespace-nowrap flex-1 md:flex-none text-xs md:text-sm border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Rekap & Export
              </Button>

              <Button variant="outline" onClick={markAllPresent} className="whitespace-nowrap flex-1 md:flex-none text-xs md:text-sm">
                <CheckSquare className="w-4 h-4 mr-2" />
                Hadir Semua
              </Button>
            </div>

            {/* Progress Bar Mobile */}
            <div className="w-full md:hidden h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-500"
                style={{ width: `${(stats.marked / stats.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Student List Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.map((student) => {
              const status = records[student.id];
              const note = notes[student.id];

              return (
                <div 
                  key={student.id} 
                  className={clsx(
                    "group bg-white rounded-xl border transition-all duration-200 relative overflow-hidden",
                    status 
                      ? "border-gray-200 shadow-sm" 
                      : "border-l-4 border-l-brand-500 border-y-gray-200 border-r-gray-200 shadow-md transform scale-[1.01]"
                  )}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      
                      {/* Student Info */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className={clsx(
                          "w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-sm ring-2 ring-white",
                          student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                        )}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                              {student.nis}
                            </span>
                            <span>•</span>
                            <span>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls Wrapper */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-4 justify-between sm:items-center mt-2 md:mt-0">
                        
                        {/* Status Buttons */}
                        <div className="grid grid-cols-4 gap-2 w-full sm:max-w-md">
                          {statusConfig.map((conf) => (
                            <button
                              key={conf.value}
                              onClick={() => handleStatusChange(student.id, conf.value)}
                              className={clsx(
                                "flex flex-col sm:flex-row items-center justify-center py-2 sm:py-2.5 px-2 rounded-lg border transition-all duration-200",
                                status === conf.value 
                                  ? conf.activeColor 
                                  : clsx("bg-white text-gray-500 border-gray-200 hover:border-gray-300", conf.color.split(' ')[0]) // subtle hover bg
                              )}
                            >
                              <conf.icon className={clsx("w-5 h-5 sm:mr-2", status === conf.value ? "animate-pulse-once" : "")} />
                              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{conf.label}</span>
                              <span className="text-xs font-bold sm:hidden">{conf.short}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Permanent Note Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                           Keterangan / Catatan Perilaku
                         </label>
                         <input
                            type="text"
                            value={note || ''}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            placeholder={`Contoh: Izin pulang cepat karena sakit, atau Tidak membawa buku paket...`}
                            className="w-full text-sm p-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-gray-400"
                         />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                Tidak ada siswa yang ditemukan dengan nama "{searchQuery}"
              </div>
            )}
          </div>

          {/* Sticky Footer for Action */}
          <div className="fixed bottom-6 right-6 z-40 left-6 md:left-auto flex flex-col items-end pointer-events-none">
             <div className="pointer-events-auto shadow-2xl shadow-brand-900/20 rounded-xl">
              <Button 
                onClick={handleSubmit} 
                isLoading={submitting} 
                disabled={!selectedClass || stats.marked === 0}
                className="py-4 px-8 rounded-xl font-bold text-base bg-brand-600 hover:bg-brand-700 text-white shadow-xl transform transition-transform active:scale-95 flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Simpan Absensi ({stats.marked}/{stats.total})</span>
              </Button>
             </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Mulai Kelas Baru</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Pilih <span className="font-semibold text-brand-600">Kelas</span> dan <span className="font-semibold text-brand-600">Mata Pelajaran</span> di bagian atas untuk memuat daftar siswa.
          </p>
        </div>
      )}

      {/* Report Modal Integration */}
      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        data={getReportData()}
        meta={{
          title: 'Rekapitulasi Absensi Harian',
          subtitle: `${selectedClass} - ${selectedSubject}`,
          date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          teacher: user?.name
        }}
      />
    </div>
  );
};