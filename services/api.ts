
import { MOCK_STUDENTS } from '../constants';
import { User, Role, Student, SubmissionPayload, DashboardStats, CreateTeacherPayload, CreateStudentPayload, ImportedTeacher } from '../types';

// --- CONFIGURATION ---
// IMPORTANT: Replace this URL with your deployed Web App URL from Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFU3xRbFQzb2uQ__9QeLJxHrZ7B0BK27Ey_zYRn4PT7FrtNhzhnNQZc_LiinYYfamW8A/exec';

// --- API HELPER ---
const fetchScript = async (action: string, payload: any = {}) => {
  // Check if URL is configured
  if (GOOGLE_SCRIPT_URL.includes('REPLACE_WITH_YOUR')) {
    console.warn("API URL not configured. Using Mock Data Fallback.");
    // Simulate Network Delay for mock fallback
    await new Promise(r => setTimeout(r, 800));
    return null; // Triggers fallback logic below
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }),
    });
    
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const ApiService = {
  login: async (email: string, password?: string): Promise<User> => {
    // Send password to backend
    const data = await fetchScript('login', { email, password });
    
    // Fallback to Mock if script not ready
    if (!data) {
       // Mock Login Logic
       if (email.includes('admin')) return { id: 'u_admin_01', name: 'Administrator IT', email, role: Role.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Admin&background=1e1b4b&color=fff' };
       if (email.includes('kepsek')) return { id: 'u_kepsek_01', name: 'Dr. Hartono, M.Pd', email, role: Role.PRINCIPAL, avatar: 'https://ui-avatars.com/api/?name=Kepala+Sekolah&background=0f172a&color=fff' };
       if (email.includes('bk')) return { id: 'u_bk_01', name: 'Ibu Ratna (BK)', email, role: Role.COUNSELOR, avatar: 'https://ui-avatars.com/api/?name=Guru+BK&background=be185d&color=fff' };
       // Default Teacher
       return { id: 'u_teacher_01', name: 'Budi Santoso, S.Pd', email, role: Role.TEACHER, avatar: 'https://ui-avatars.com/api/?name=Guru+Mapel&background=3b82f6&color=fff' };
    }
    
    return data as User;
  },

  fetchStudentsByClass: async (className: string): Promise<Student[]> => {
    const data = await fetchScript('fetchStudentsByClass', { className });
    // Mock Fallback
    if (!data) return MOCK_STUDENTS.filter(s => s.className === className);
    return data as Student[];
  },

  // NEW: Fetch all students for Admin List
  fetchAllStudents: async (): Promise<Student[]> => {
    const data = await fetchScript('fetchAllStudents');
    if (!data) return MOCK_STUDENTS;
    return data as Student[];
  },

  // NEW: Fetch all teachers for Admin List
  fetchTeachers: async (): Promise<User[]> => {
    const data = await fetchScript('fetchTeachers');
    if (!data) {
        return Array.from({ length: 10 }).map((_, i) => ({
            id: `T_${i}`,
            name: ['Budi Santoso, S.Pd', 'Siti Aminah, M.Pd', 'Joko Anwar, S.Si', 'Rina Nose, S.Hum'][i % 4],
            email: `guru.${i}@sekolah.sch.id`,
            role: Role.TEACHER,
            nip: `198${i}0101 201001 1 00${i}`,
            subject: ['Matematika', 'Bahasa Indonesia', 'Fisika', 'Sejarah'][i % 4],
            phone: '08123456789',
            status: i % 5 === 0 ? 'Inactive' : 'Active',
            avatar: `https://ui-avatars.com/api/?name=Guru+${i}&background=random`
        }));
    }
    return data;
  },

  submitAttendance: async (payload: SubmissionPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('submitAttendance', payload);
    if (!data) return { success: true, message: 'Data absensi berhasil disimpan! (MOCK)' };
    return { success: true, message: data.message };
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<{ success: boolean; message: string; id: string }> => {
    // Ensure payload includes password
    const data = await fetchScript('createTeacher', payload);
    if (!data) {
         if(payload.email.includes("error")) throw new Error("Email exists (Mock)");
         return { success: true, message: `Guru ${payload.fullName} berhasil ditambahkan (MOCK).`, id: `T_MOCK_${Date.now()}` };
    }
    return { success: true, message: data.message, id: data.id };
  },

  importTeachers: async (teachers: ImportedTeacher[]): Promise<{ success: boolean; message: string; count: number }> => {
    const data = await fetchScript('importTeachers', { teachers });
    if (!data) {
      return { success: true, message: `Berhasil mengimpor ${teachers.length} guru (MOCK).`, count: teachers.length };
    }
    return data;
  },

  createStudent: async (payload: CreateStudentPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createStudent', payload);
    if (!data) return { success: true, message: 'Siswa berhasil ditambahkan (MOCK).' };
    return { success: true, message: data.message };
  },

  fetchDashboardStats: async (): Promise<DashboardStats> => {
    const data = await fetchScript('fetchDashboardStats');
    
    // Mock Fallback
    if (!data) {
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
        ],
        absenteeComposition: [
          { name: 'Sakit', value: 12, color: '#eab308' },
          { name: 'Izin', value: 8, color: '#3b82f6' },
          { name: 'Alpha', value: 4, color: '#ef4444' },
        ],
        systemLogs: [
          { id: 'L01', user: 'System', action: 'Using Mock Data (Config URL)', timestamp: 'Now', status: 'Success' },
        ],
        totalApiRequests: 0,
        activeUsers: 1
      };
    }
    
    return data as DashboardStats;
  }
};