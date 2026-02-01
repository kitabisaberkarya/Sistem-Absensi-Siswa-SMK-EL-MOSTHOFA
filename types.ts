export enum Role {
  TEACHER = 'TEACHER',       // Guru Mapel
  COUNSELOR = 'COUNSELOR',   // Guru BK
  PRINCIPAL = 'PRINCIPAL',   // Kepala Sekolah
  ADMIN = 'ADMIN',           // Admin Sistem
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
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