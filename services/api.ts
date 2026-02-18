
import { 
  User, Role, Student, Major, Subject, ClassRoom, 
  SubmissionPayload,
  CreateTeacherPayload, UpdateTeacherPayload, ImportedTeacher, ImportedUser,
  CreateStudentPayload, UpdateStudentPayload, ImportedStudent,
  BackupData, BackupResponse, DashboardStats,
  SemesterRecapEntry, StudentHistoryLog, TeacherHistoryLog,
  PrincipalReportData, CounselingData, SystemSettings 
} from '../types';

// Re-export for other files using ApiService
export type { 
  PrincipalReportData, CounselingData, SystemSettings, TeacherHistoryLog 
};

export interface FullAttendanceLog {
    logId: string;
    date: string;
    className: string;
    subject: string;
    teacherId: string;
    topic: string;
    studentCount: number;
    timestamp: string;
    teacherName?: string; 
}

// --- CONFIGURATION ---
// URL Deployment Google Apps Script (Web App)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywUxDx3E2wXmishI9C0iTDJj2eugqxk0hZIaxibNcfdDEoxffuxctd3mDkIarWjsxlyw/exec';

// FetchScript Implementation
const fetchScript = async (action: string, params: any = {}, useCache = false): Promise<any> => {
  
  // 1. GAS Environment (Sidebar/Modal inside Sheets)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.google && window.google.script) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      window.google.script.run
        .withSuccessHandler((response: any) => {
           if (response && response.status === 'success') {
             resolve(response.data);
           } else if (response && response.status === 'error') {
             reject(new Error(response.message));
           } else {
             resolve(response);
           }
        })
        .withFailureHandler((error: any) => {
          reject(error);
        })
        .clientApi({ action, ...params });
    });
  } 
  
  // 2. Web Mode (Standalone App / Localhost)
  // Connects via HTTP POST to the provided Web App URL
  else if (GOOGLE_SCRIPT_URL) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            // Using text/plain avoids CORS Preflight (OPTIONS) requests which GAS doesn't handle natively
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({ action, ...params })
        });

        const result = await response.json();

        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || 'Error from Google Apps Script');
        }
    } catch (error) {
        console.warn(`[API] Failed to connect to GAS URL for action: ${action}`, error);
        // Fallthrough to mocks if offline/error for dev experience
    }
  }

  // 3. Dev Mode Mocks (Fallback if no connection)
  console.warn(`[DEV] Using Mock Data for: ${action}`, params);
  
  if (action === 'fetchDashboardStats') {
      return { 
          totalStudents: 100, attendanceRate: 95, absentToday: 5, 
          weeklyData: [], classRankings: [], teacherSubmissionRate: 80, 
          atRiskStudents: [], absenteeComposition: [], systemLogs: [], 
          totalApiRequests: 0, activeUsers: 10 
      };
  }
  if (action === 'fetchClasses') return [];
  if (action === 'fetchSubjects') return [];
  if (action === 'fetchMajors') return [];
  if (action === 'getSystemSettings') return { 
      schoolName: 'Dev School', 
      schoolAddress: 'Address', 
      schoolPhone: '000', 
      schoolEmail: 'test@dev.com',
      schoolWebsite: 'dev.com', 
      foundationName: 'Foundation', 
      schoolLogo: '', 
      foundationLogo: '' 
  };
  
  return {};
};

export const ApiService = {
  login: async (email: string, password?: string): Promise<User> => {
    return await fetchScript('login', { email, password });
  },
  
  // Teachers & Users
  fetchTeachers: async (): Promise<User[]> => {
    const data = await fetchScript('fetchTeachers', {}, true);
    return (data || []) as User[];
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
    return await fetchScript('importTeachers', { teachers });
  },
  importGlobalUsers: async (users: ImportedUser[]): Promise<{ success: boolean; message: string; count: number }> => {
    return await fetchScript('importGlobalUsers', { users });
  },

  // Students
  fetchStudentsByClass: async (className: string): Promise<Student[]> => {
    const data = await fetchScript('fetchStudentsByClass', { className }, true);
    return (data || []) as Student[];
  },
  fetchAllStudents: async (): Promise<Student[]> => {
    const data = await fetchScript('fetchAllStudents', {}, true);
    return (data || []) as Student[];
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
    return await fetchScript('importStudents', { students });
  },

  // Academics
  fetchMajors: async (): Promise<Major[]> => {
    const data = await fetchScript('fetchMajors', {}, true);
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
    const data = await fetchScript('fetchSubjects', {}, true);
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
  importSubjects: async (subjects: any[]): Promise<{ success: boolean; message: string; count: number }> => {
    return await fetchScript('importSubjects', { subjects });
  },
  fetchClasses: async (): Promise<ClassRoom[]> => {
    const data = await fetchScript('fetchClasses', {}, true);
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

  // Attendance & Reports
  submitAttendance: async (payload: SubmissionPayload): Promise<{ success: boolean; message: string }> => {
    const data = await fetchScript('submitAttendance', payload);
    return { success: true, message: data.message };
  },
  fetchSemesterRecap: async (classId: string, semester: string, year: string): Promise<SemesterRecapEntry[]> => {
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
  fetchFullAttendanceLogs: async (): Promise<FullAttendanceLog[]> => {
    const data = await fetchScript('fetchFullAttendanceLogs');
    return (data || []) as FullAttendanceLog[];
  },

  // Dashboard & System
  fetchDashboardStats: async (): Promise<DashboardStats> => {
    const data = await fetchScript('fetchDashboardStats');
    return data as DashboardStats;
  },
  createBackup: async (): Promise<BackupResponse> => {
    return await fetchScript('backupDatabase');
  },
  restoreDatabase: async (backupData: BackupData): Promise<{ success: boolean; message: string }> => {
    return await fetchScript('restoreDatabase', { data: backupData });
  },
  getSystemSettings: async (): Promise<SystemSettings> => {
    return await fetchScript('getSystemSettings');
  },
  saveSystemSettings: async (settings: Partial<SystemSettings>): Promise<{ success: boolean; message: string }> => {
    return await fetchScript('saveSystemSettings', settings);
  },
  uploadFile: async (file: File): Promise<{ success: boolean; url: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                // Remove data:image/png;base64, prefix
                const base64Data = (reader.result as string).split(',')[1];
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
