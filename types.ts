
export enum Role {
  TEACHER = 'TEACHER',       // Guru Mapel
  COUNSELOR = 'COUNSELOR',   // Guru BK
  PRINCIPAL = 'PRINCIPAL',   // Kepala Sekolah
  ADMIN = 'ADMIN',           // Admin Sistem
}

export type ViewState = 'dashboard' | 'teachers' | 'students' | 'reports' | 'mailbox' | 'settings' | 'backup';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  nip?: string;      // Optional for list view
  subject?: string;  // Optional for list view
  phone?: string;    // Optional for list view
  status?: string;   // Optional for list view
}

export enum AttendanceStatus {
  PRESENT = 'Hadir',
  PERMISSION = 'Izin',
  SICK = 'Sakit',
  ABSENT = 'Alpha',
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  className: string;
  gender: 'L' | 'P';
  parentPhone?: string; // New field for production
  address?: string;     // New field for production
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string; // Keterangan spesifik siswa
}

export interface SubmissionPayload {
  classId: string;
  subject: string;
  date: string;
  teacherId: string;
  topic: string; // Jurnal / Materi Pembahasan
  records: AttendanceRecord[];
}

// --- Bulk Import Types ---

export interface ImportedTeacher {
  no: string;
  name: string;
  code: string;
  subject: string;
}

export interface ImportedStudent {
  no: string;
  name: string;
  nis: string;
  className: string;
  gender: 'L' | 'P';
  parentPhone?: string;
  address?: string;
}

// --- Backup & Restore Types ---

export interface BackupData {
  timestamp: string;
  version: string;
  users: any[];
  students: any[];
  attendance: any[];
  logs: any[];
}

export interface BackupResponse {
  success: boolean;
  message: string;
  timestamp: string;
  driveLink?: string;
  data: BackupData;
}

// --- Extended Dashboard Types ---

export interface AtRiskStudent {
  id: string;
  name: string;
  className: string;
  alphaCount: number;
  sickCount: number;
  lastAbsent: string;
}

export interface ClassRanking {
  className: string;
  attendanceRate: number;
  label: 'Best' | 'Warning' | 'Neutral';
}

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export interface DashboardStats {
  // Common
  totalStudents: number;
  attendanceRate: number;
  absentToday: number;
  
  // Principal Specific
  weeklyData: { day: string; present: number; absent: number; }[];
  classRankings: ClassRanking[];
  teacherSubmissionRate: number;

  // Counselor Specific
  atRiskStudents: AtRiskStudent[];
  absenteeComposition: { name: string; value: number; color: string }[];

  // Admin Specific
  systemLogs: SystemLog[];
  totalApiRequests: number;
  activeUsers: number;
}

// --- User Management Types ---

export interface CreateTeacherPayload {
  fullName: string;
  nip: string; // Nomor Induk Pegawai
  email: string;
  password?: string; // Optional field for UI state, mandatory for API
  phone: string;
  subject: string;
  role: Role; // Added role field
  gender: 'L' | 'P';
  status: 'Active' | 'Inactive';
}

export interface CreateStudentPayload {
  name: string;
  nis: string;
  className: string;
  gender: 'L' | 'P';
  parentPhone: string;
  address: string;
}