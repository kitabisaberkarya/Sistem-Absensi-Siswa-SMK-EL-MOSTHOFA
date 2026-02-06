import { User, Role, Student, SubmissionPayload, DashboardStats, CreateTeacherPayload, UpdateTeacherPayload, CreateStudentPayload, UpdateStudentPayload, ImportedTeacher, ImportedStudent, BackupData, BackupResponse, Major, Subject, ClassRoom, SemesterRecapEntry, TeacherHistoryLog } from '../types';

// --- CONFIGURATION ---
// IMPORTANT: Replace this URL with your deployed Web App URL from Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8VHc74QhiPOkKL-uahWjzNeztfRXMg996xLAe4qv0UALKm1zaViVAO8DeJbV1H088tg/exec';

// --- API HELPER ---
const fetchScript = async (action: string, payload: any = {}) => {
  // Production Check: Ensure URL is configured
  if (GOOGLE_SCRIPT_URL.includes('REPLACE_WITH_YOUR')) {
    console.error("API URL Not Configured. Please deploy Google Apps Script and update services/api.ts");
    throw new Error("Sistem belum terhubung ke Database. Hubungi Administrator.");
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      cache: 'no-store', // Disable caching to ensure fresh data
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
    const data = await fetchScript('login', { email, password });
    return data as User;
  },

  fetchStudentsByClass: async (className: string): Promise<Student[]> => {
    const data = await fetchScript('fetchStudentsByClass', { className });
    return (data || []) as Student[];
  },

  fetchAllStudents: async (): Promise<Student[]> => {
    const data = await fetchScript('fetchAllStudents');
    return (data || []) as Student[];
  },

  fetchTeachers: async (): Promise<User[]> => {
    const data = await fetchScript('fetchTeachers');
    return (data || []) as User[];
  },

  submitAttendance: async (payload: SubmissionPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('submitAttendance', payload);
    return { success: true, message: data.message };
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<{ success: boolean; message: string; id: string }> => {
    const data = await fetchScript('createTeacher', payload);
    return { success: true, message: data.message, id: data.id };
  },

  updateTeacher: async (payload: UpdateTeacherPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('updateTeacher', payload);
    return { success: true, message: data.message };
  },

  importTeachers: async (teachers: ImportedTeacher[]): Promise<{ success: boolean; message: string; count: number }> => {
    const data = await fetchScript('importTeachers', { teachers });
    return data;
  },

  createStudent: async (payload: CreateStudentPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createStudent', payload);
    return { success: true, message: data.message };
  },

  updateStudent: async (payload: UpdateStudentPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('updateStudent', payload);
    return { success: true, message: data.message };
  },

  deleteStudent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteStudent', { id });
    return { success: true, message: data.message };
  },

  importStudents: async (students: ImportedStudent[]): Promise<{ success: boolean; message: string; count: number }> => {
    const data = await fetchScript('importStudents', { students });
    return data;
  },

  // --- ACADEMIC SERVICES ---

  fetchMajors: async (): Promise<Major[]> => {
    const data = await fetchScript('fetchMajors');
    return (data || []) as Major[];
  },

  createMajor: async (payload: { code: string; name: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createMajor', payload);
    return { success: true, message: data.message };
  },
  
  deleteMajor: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteMajor', { id });
    return { success: true, message: data.message };
  },

  fetchSubjects: async (): Promise<Subject[]> => {
    const data = await fetchScript('fetchSubjects');
    return (data || []) as Subject[];
  },

  createSubject: async (payload: { code: string; name: string; category: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createSubject', payload);
    return { success: true, message: data.message };
  },

  deleteSubject: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteSubject', { id });
    return { success: true, message: data.message };
  },

  // --- CLASSES SERVICES ---
  fetchClasses: async (): Promise<ClassRoom[]> => {
    const data = await fetchScript('fetchClasses');
    return (data || []) as ClassRoom[];
  },

  createClass: async (payload: { name: string; level: string; major: string }): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('createClass', payload);
    return { success: true, message: data.message };
  },

  deleteClass: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('deleteClass', { id });
    return { success: true, message: data.message };
  },

  // --- REPORT SERVICES ---
  fetchSemesterRecap: async (classId: string, semester: string, year: string): Promise<SemesterRecapEntry[]> => {
    const data = await fetchScript('fetchSemesterRecap', { classId, semester, year });
    return (data || []) as SemesterRecapEntry[];
  },

  fetchTeacherHistory: async (teacherId: string): Promise<TeacherHistoryLog[]> => {
    const data = await fetchScript('fetchTeacherHistory', { teacherId });
    return (data || []) as TeacherHistoryLog[];
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
    const data = await fetchScript('fetchDashboardStats');
    if (!data) {
        // Return empty structure if no data yet to prevent crash
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
  }
};