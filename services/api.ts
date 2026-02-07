
import { User, Role, Student, SubmissionPayload, DashboardStats, CreateTeacherPayload, UpdateTeacherPayload, CreateStudentPayload, UpdateStudentPayload, ImportedTeacher, ImportedStudent, BackupData, BackupResponse, Major, Subject, ClassRoom, SemesterRecapEntry, TeacherHistoryLog, StudentHistoryLog } from '../types';

// --- CONFIGURATION ---
// IMPORTANT: Replace this URL with your deployed Web App URL from Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwd-VmNZeJj3R1PIh1fZerhR3KKQRlAvusfcbUhtej8QfEGMsN3CARirdvwliR7-6fDug/exec';

// --- CACHE STORE (Client Side) ---
// Menyimpan data statis agar tidak fetch berulang kali saat navigasi
const CACHE_STORE: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 30; // 30 Menit client cache untuk metadata

// --- API HELPER ---
const fetchScript = async (action: string, payload: any = {}, useCache = false) => {
  // Production Check: Ensure URL is configured
  if (GOOGLE_SCRIPT_URL.includes('REPLACE_WITH_YOUR')) {
    console.error("API URL Not Configured. Please deploy Google Apps Script and update services/api.ts");
    throw new Error("Sistem belum terhubung ke Database. Hubungi Administrator.");
  }

  // Check Cache
  const cacheKey = JSON.stringify({ action, payload });
  if (useCache && CACHE_STORE[cacheKey]) {
    const cached = CACHE_STORE[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[FAST LOAD] Serving ${action} from client cache`);
      return cached.data;
    }
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      // 'no-store' penting agar tidak cache browser level yang sulit dikontrol
      // Kita handle cache di level aplikasi (memory) atau server (GAS Cache)
      cache: 'no-store', 
      body: JSON.stringify({ action, ...payload }),
    });
    
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    
    // Set Cache if enabled
    if (useCache) {
      CACHE_STORE[cacheKey] = { data: result.data, timestamp: Date.now() };
    }

    return result.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Clear specific cache (misal setelah add data baru)
const invalidateCache = (keyPattern: string) => {
  Object.keys(CACHE_STORE).forEach(key => {
    if (key.includes(keyPattern)) delete CACHE_STORE[key];
  });
};

export interface PrincipalReportData {
  summary: {
    totalStudents: number;
    avgAttendance: number;
    totalAlpha: number;
    totalSick: number;
    totalPermission: number;
  };
  gradeComparison: {
    grade: string;
    attendance: number;
  }[];
  classPerformance: {
    className: string;
    percentage: number;
    predicate: string;
  }[];
}

// New Interface for Counseling Data
export interface CounselingData {
  student: Student;
  alpha: number;
  sick: number;
  permission: number;
  present: number;
  total: number;
  status: 'Aman' | 'Waspada' | 'Bahaya';
  lastOffense: string | null;
}

// New Interface for System Settings
export interface SystemSettings {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  foundationName: string;
  schoolLogo: string;
  foundationLogo: string;
  headmasterName?: string;
  headmasterNip?: string;
}

export const ApiService = {
  login: async (email: string, password?: string): Promise<User> => {
    const data = await fetchScript('login', { email, password });
    return data as User;
  },

  // --- STUDENTS ---
  
  fetchStudentsByClass: async (className: string): Promise<Student[]> => {
    // Data siswa per kelas cenderung statis dalam sesi pendek, kita cache
    const data = await fetchScript('fetchStudentsByClass', { className }, true);
    return (data || []) as Student[];
  },

  fetchAllStudents: async (): Promise<Student[]> => {
    const data = await fetchScript('fetchAllStudents', {}, true);
    return (data || []) as Student[];
  },

  fetchTeachers: async (): Promise<User[]> => {
    const data = await fetchScript('fetchTeachers', {}, true);
    return (data || []) as User[];
  },

  // --- ACTIONS (WRITE) ---
  // Aksi tulis (Create/Update/Delete) harus menghapus cache terkait agar data refresh

  submitAttendance: async (payload: SubmissionPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('submitAttendance', payload);
    // Saat absen disubmit, data dashboard & report berubah. Clear server cache via action logic di backend.
    return { success: true, message: data.message };
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<{ success: boolean; message: string; id: string }> => {
    const data = await fetchScript('createTeacher', payload);
    invalidateCache('fetchTeachers'); // Clear client cache
    return { success: true, message: data.message, id: data.id };
  },

  updateTeacher: async (payload: UpdateTeacherPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('updateTeacher', payload);
    invalidateCache('fetchTeachers');
    return { success: true, message: data.message };
  },

  importTeachers: async (teachers: ImportedTeacher[]): Promise<{ success: boolean; message: string; count: number }> => {
    const data = await fetchScript('importTeachers', { teachers });
    invalidateCache('fetchTeachers');
    return data;
  },

  createStudent: async (payload: CreateStudentPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createStudent', payload);
    invalidateCache('fetchStudents'); // Clear all student fetches
    return { success: true, message: data.message };
  },

  updateStudent: async (payload: UpdateStudentPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('updateStudent', payload);
    invalidateCache('fetchStudents');
    return { success: true, message: data.message };
  },

  deleteStudent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteStudent', { id });
    invalidateCache('fetchStudents');
    return { success: true, message: data.message };
  },

  importStudents: async (students: ImportedStudent[]): Promise<{ success: boolean; message: string; count: number }> => {
    const data = await fetchScript('importStudents', { students });
    invalidateCache('fetchStudents');
    return data;
  },

  // --- ACADEMIC SERVICES (HEAVY CACHING) ---
  // Data ini sangat jarang berubah.

  fetchMajors: async (): Promise<Major[]> => {
    const data = await fetchScript('fetchMajors', {}, true);
    return (data || []) as Major[];
  },

  createMajor: async (payload: { code: string; name: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createMajor', payload);
    invalidateCache('fetchMajors');
    return { success: true, message: data.message };
  },
  
  deleteMajor: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteMajor', { id });
    invalidateCache('fetchMajors');
    return { success: true, message: data.message };
  },

  fetchSubjects: async (): Promise<Subject[]> => {
    const data = await fetchScript('fetchSubjects', {}, true);
    return (data || []) as Subject[];
  },

  createSubject: async (payload: { code: string; name: string; category: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createSubject', payload);
    invalidateCache('fetchSubjects');
    return { success: true, message: data.message };
  },

  deleteSubject: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteSubject', { id });
    invalidateCache('fetchSubjects');
    return { success: true, message: data.message };
  },

  // --- CLASSES SERVICES ---
  fetchClasses: async (): Promise<ClassRoom[]> => {
    const data = await fetchScript('fetchClasses', {}, true);
    return (data || []) as ClassRoom[];
  },

  createClass: async (payload: { name: string; level: string; major: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createClass', payload);
    invalidateCache('fetchClasses');
    return { success: true, message: data.message };
  },

  deleteClass: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteClass', { id });
    invalidateCache('fetchClasses');
    return { success: true, message: data.message };
  },

  // --- REPORT SERVICES ---
  fetchSemesterRecap: async (classId: string, semester: string, year: string): Promise<SemesterRecapEntry[]> => {
    // Report bisa berat, tidak di cache di client side agar selalu realtime saat diminta, 
    // tapi backend akan mengoptimalkannya.
    const data = await fetchScript('fetchSemesterRecap', { classId, semester, year });
    return (data || []) as SemesterRecapEntry[];
  },

  fetchTeacherHistory: async (teacherId: string): Promise<TeacherHistoryLog[]> => {
    const data = await fetchScript('fetchTeacherHistory', { teacherId });
    return (data || []) as TeacherHistoryLog[];
  },

  fetchStudentHistory: async (studentId: string): Promise<StudentHistoryLog[]> => {
    const data = await fetchScript('fetchStudentHistory', { studentId });
    return (data || []) as StudentHistoryLog[];
  },

  fetchPrincipalReportData: async (month: string, year: string): Promise<PrincipalReportData> => {
    const data = await fetchScript('fetchPrincipalReportData', { month, year });
    return data as PrincipalReportData;
  },

  fetchCounselingData: async (): Promise<CounselingData[]> => {
    const data = await fetchScript('fetchCounselingData');
    return (data || []) as CounselingData[];
  },

  // --- BACKUP & RESTORE SERVICES ---

  createBackup: async (): Promise<BackupResponse> => {
    const data = await fetchScript('backupDatabase');
    return data;
  },

  restoreDatabase: async (backupData: BackupData): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('restoreDatabase', { data: backupData });
    return data;
  },

  fetchDashboardStats: async (): Promise<DashboardStats> => {
    // Dashboard sangat berat. Kita andalkan Server-Side Caching di GAS.
    const data = await fetchScript('fetchDashboardStats');
    if (!data) {
        return {
            totalStudents: 0,
            attendanceRate: 0,
            absentToday: 0,
            weeklyData: [],
            classRankings: [],
            teacherSubmissionRate: 0,
            atRiskStudents: [],
            absenteeComposition: [],
            systemLogs: [],
            totalApiRequests: 0,
            activeUsers: 0
        };
    }
    return data as DashboardStats;
  },

  // --- SETTINGS & UPLOAD SERVICES (NEW) ---
  
  getSystemSettings: async (): Promise<SystemSettings> => {
    const data = await fetchScript('getSystemSettings');
    return data;
  },

  saveSystemSettings: async (settings: Partial<SystemSettings>): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('saveSystemSettings', settings);
    return data;
  },

  uploadFile: async (file: File): Promise<{ success: boolean; url: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Data = reader.result as string;
                const result = await fetchScript('uploadFile', {
                    data: base64Data,
                    filename: file.name,
                    mimeType: file.type
                });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
    });
  }
};
