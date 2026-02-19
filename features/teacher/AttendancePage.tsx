
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ApiService } from '../../services/api';
import { Student, AttendanceStatus, AttendanceRecord, ClassRoom, Subject } from '../../types';
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
  FileText,
  Users,
  AlertTriangle,
  Database,
  Cloud,
  Loader2,
  CloudCheck
} from 'lucide-react';
import clsx from 'clsx';

export const AttendancePage = () => {
  const { user } = useAuth();
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Dynamic Data State
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Student Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [topic, setTopic] = useState(''); 
  
  // Attendance Logic State
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // --- AUTO SAVE STATE ---
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

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

  // Load Classes and Subjects on Mount
  useEffect(() => {
    const fetchData = async () => {
        setDataLoading(true);
        try {
            const [classes, subjects] = await Promise.all([
                ApiService.fetchClasses(),
                ApiService.fetchSubjects()
            ]);
            setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
            setSubjectList(subjects.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
            console.error("Failed to load metadata", err);
        } finally {
            setDataLoading(false);
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
          const data = await ApiService.fetchStudentsByClass(selectedClass);
          setStudents(data);
          setRecords({});
          setNotes({});
          setTopic('');
          setSaveStatus('idle');
          setLastSaved(null);
          isFirstRender.current = true; // Reset first render check
        } catch (error) {
          console.error("Failed to fetch students", error);
          alert("Gagal mengambil data siswa. Periksa koneksi internet.");
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setHasSearched(false);
    }
  }, [selectedClass]);

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
      // Skip auto-save if data is not loaded or it's the initial load
      if (isFirstRender.current) {
          isFirstRender.current = false;
          return;
      }
      if (!selectedClass || !selectedSubject || students.length === 0) return;
      if (Object.keys(records).length === 0 && !topic) return; // Nothing to save

      // Clear existing timer
      if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
      }

      setSaveStatus('saving');

      // Set new debounce timer (2 seconds)
      autoSaveTimerRef.current = setTimeout(async () => {
          try {
              const payloadRecords: AttendanceRecord[] = students.map(s => ({
                  studentId: s.id,
                  studentName: s.name,
                  status: records[s.id] || AttendanceStatus.PRESENT, // Default to present if not marked? Or handle partially? Let's send what we have.
                  note: notes[s.id] || ''
              }));

              // Filter only marked records if we want partial save, 
              // BUT for bulk day integrity, we usually send all.
              // Given the backend upsert logic, sending all is safe.
              
              await ApiService.submitAttendance({
                  classId: selectedClass,
                  subject: selectedSubject,
                  date: new Date().toISOString(),
                  teacherId: user?.id || 'unknown',
                  topic: topic || 'Jurnal harian', // Default topic if empty during draft
                  records: payloadRecords
              });
              
              setSaveStatus('saved');
              setLastSaved(new Date());

          } catch (error) {
              console.error("Auto save failed", error);
              setSaveStatus('error');
          }
      }, 2000); // 2 Seconds Debounce

      return () => {
          if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      };

  }, [records, notes, topic, selectedClass, selectedSubject]); // Dependencies

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

  // Manual Save (Finalize)
  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject) {
      alert("Mohon pilih Kelas dan Mata Pelajaran.");
      return;
    }
    if (!topic.trim()) {
      alert("Mohon isi Materi Pembahasan (Jurnal Kelas).");
      return;
    }

    setSubmitting(true);
    // Force immediate save (same logic as auto-save but blocking with UI feedback)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); // Cancel pending auto-save

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

      alert('Absensi berhasil diselesaikan dan tersimpan permanen!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Optional: Reset or redirect
      // setStudents([]); 
      
    } catch (error) {
      alert('Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
      setSaveStatus('saved');
      setLastSaved(new Date());
    }
  };

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

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.nis.includes(searchQuery)
    );
  }, [students, searchQuery]);

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
        <div className="bg-brand-600 p-6 text-white flex justify-between items-start">
          <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-200" />
                Input Absensi Harian
              </h2>
              <p className="text-brand-100 text-sm mt-1 opacity-90">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
          </div>
          
          {/* AUTO SAVE INDICATOR */}
          {selectedClass && (
              <div className="flex flex-col items-end">
                  <div className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                      saveStatus === 'saving' ? "bg-white/20 text-white animate-pulse" : 
                      saveStatus === 'saved' ? "bg-green-500/20 text-green-100 border border-green-400/30" :
                      saveStatus === 'error' ? "bg-red-500/20 text-red-100" : "opacity-0"
                  )}>
                      {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Menyimpan Cloud...</>}
                      {saveStatus === 'saved' && <><CloudCheck className="w-3 h-3" /> Tersimpan</>}
                      {saveStatus === 'error' && <><AlertTriangle className="w-3 h-3" /> Gagal Simpan</>}
                  </div>
                  {lastSaved && saveStatus === 'saved' && (
                      <span className="text-[10px] text-brand-200 mt-1 opacity-80">
                          Last saved: {lastSaved.toLocaleTimeString()}
                      </span>
                  )}
              </div>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border-gray-200 border bg-gray-50 p-3 pl-4 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-gray-700"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={dataLoading}
              >
                <option value="">{dataLoading ? "Memuat Data..." : "-- Pilih Kelas --"}</option>
                {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                disabled={dataLoading}
              >
                <option value="">{dataLoading ? "Memuat Data..." : "-- Pilih Mapel --"}</option>
                {subjectList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

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

      {/* --- CONDITIONAL RENDERING --- */}
      
      {loading && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-100 border-t-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Mengambil data siswa kelas {selectedClass}...</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
          
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
          </div>

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

                      <div className="flex-1 flex flex-col sm:flex-row gap-4 justify-between sm:items-center mt-2 md:mt-0">
                        <div className="grid grid-cols-4 gap-2 w-full sm:max-w-md">
                          {statusConfig.map((conf) => (
                            <button
                              key={conf.value}
                              onClick={() => handleStatusChange(student.id, conf.value)}
                              className={clsx(
                                "flex flex-col sm:flex-row items-center justify-center py-2 sm:py-2.5 px-2 rounded-lg border transition-all duration-200",
                                status === conf.value 
                                  ? conf.activeColor 
                                  : clsx("bg-white text-gray-500 border-gray-200 hover:border-gray-300", conf.color.split(' ')[0]) 
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
          </div>

          <div className="fixed bottom-6 right-6 z-40 left-6 md:left-auto flex flex-col items-end pointer-events-none">
             <div className="pointer-events-auto shadow-2xl shadow-brand-900/20 rounded-xl">
              <Button 
                onClick={handleSubmit} 
                isLoading={submitting} 
                disabled={!selectedClass || stats.marked === 0}
                className="py-4 px-8 rounded-xl font-bold text-base bg-brand-600 hover:bg-brand-700 text-white shadow-xl transform transition-transform active:scale-95 flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Selesai & Kunci Absensi</span>
              </Button>
             </div>
          </div>
        </div>
      )}

      {/* 3. STATE: EMPTY (Enhanced Warning) */}
      {!loading && hasSearched && students.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-red-200 shadow-sm animate-in fade-in zoom-in-95">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Database className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Data Siswa Tidak Ditemukan</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Kelas <strong>"{selectedClass}"</strong> belum memiliki data siswa yang terdaftar di database.
          </p>
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Mulai Kelas Baru</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Pilih <span className="font-semibold text-brand-600">Kelas</span> dan <span className="font-semibold text-brand-600">Mata Pelajaran</span> di bagian atas untuk memuat daftar siswa.
          </p>
        </div>
      )}

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
