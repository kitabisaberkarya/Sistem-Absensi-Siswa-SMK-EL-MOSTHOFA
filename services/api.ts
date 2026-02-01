import { MOCK_STUDENTS } from '../constants';
import { User, Role, Student, SubmissionPayload, DashboardStats } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  login: async (email: string): Promise<User> => {
    await delay(800); 

    if (email.includes('admin')) {
      return {
        id: 'u_admin_01',
        name: 'Administrator IT',
        email,
        role: Role.ADMIN,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=1e1b4b&color=fff'
      };
    }

    if (email.includes('kepsek')) {
      return {
        id: 'u_kepsek_01',
        name: 'Dr. Hartono, M.Pd',
        email,
        role: Role.PRINCIPAL,
        avatar: 'https://ui-avatars.com/api/?name=Kepala+Sekolah&background=0f172a&color=fff'
      };
    }

    if (email.includes('bk')) {
      return {
        id: 'u_bk_01',
        name: 'Ibu Ratna (BK)',
        email,
        role: Role.COUNSELOR,
        avatar: 'https://ui-avatars.com/api/?name=Guru+BK&background=be185d&color=fff'
      };
    }
    
    return {
      id: 'u_teacher_01',
      name: 'Budi Santoso, S.Pd',
      email,
      role: Role.TEACHER,
      avatar: 'https://ui-avatars.com/api/?name=Guru+Mapel&background=3b82f6&color=fff'
    };
  },

  fetchStudentsByClass: async (className: string): Promise<Student[]> => {
    await delay(500);
    return MOCK_STUDENTS.filter(s => s.className === className);
  },

  submitAttendance: async (payload: SubmissionPayload): Promise<{ success: boolean; message: string }> => {
    await delay(1200);
    console.log("Submitting to Google Sheets:", payload);
    return { success: true, message: 'Data absensi berhasil disimpan!' };
  },

  fetchDashboardStats: async (): Promise<DashboardStats> => {
    await delay(1000);
    
    // Mock Data Construction
    return {
      totalStudents: 450,
      attendanceRate: 94.2,
      absentToday: 24,
      
      weeklyData: [
        { day: 'Senin', present: 430, absent: 20 },
        { day: 'Selasa', present: 440, absent: 10 },
        { day: 'Rabu', present: 435, absent: 15 },
        { day: 'Kamis', present: 445, absent: 5 },
        { day: 'Jumat', present: 420, absent: 30 },
      ],
      
      classRankings: [
        { className: '12-IPA-1', attendanceRate: 99.5, label: 'Best' },
        { className: '10-IPA-2', attendanceRate: 98.2, label: 'Neutral' },
        { className: '11-IPS-1', attendanceRate: 88.5, label: 'Warning' },
      ],
      
      teacherSubmissionRate: 85,

      atRiskStudents: [
        { id: 'S1024', name: 'Yuni Shara', className: '11-IPS-1', alphaCount: 5, sickCount: 2, lastAbsent: 'Hari ini' },
        { id: 'S1018', name: 'Sule', className: '10-IPA-1', alphaCount: 4, sickCount: 8, lastAbsent: 'Kemarin' },
        { id: 'S1029', name: 'Desta', className: '12-IPA-1', alphaCount: 3, sickCount: 0, lastAbsent: '2 Hari lalu' },
      ],

      absenteeComposition: [
        { name: 'Sakit', value: 12, color: '#eab308' },
        { name: 'Izin', value: 8, color: '#3b82f6' },
        { name: 'Alpha', value: 4, color: '#ef4444' },
      ],

      systemLogs: [
        { id: 'L01', user: 'Pak Budi', action: 'Submit Absensi 10-IPA-1', timestamp: '07:15', status: 'Success' },
        { id: 'L02', user: 'Bu Ani', action: 'Submit Absensi 11-IPS-1', timestamp: '07:20', status: 'Success' },
        { id: 'L03', user: 'System', action: 'Auto-Backup Database', timestamp: '00:00', status: 'Success' },
        { id: 'L04', user: 'Unknown', action: 'Failed Login Attempt', timestamp: '06:30', status: 'Failed' },
      ],
      totalApiRequests: 15420,
      activeUsers: 45
    };
  }
};