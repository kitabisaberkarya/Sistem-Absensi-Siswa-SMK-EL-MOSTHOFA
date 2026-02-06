import { Student, Role } from './types';

// PRODUCTION MODE: All constants are now empty. 
// Data must be fetched from ApiService.

export const CLASSES: string[] = []; 

export const SUBJECTS: string[] = [];

// Empty Mock Data
export const MOCK_STUDENTS: Student[] = [];

// Empty Mock Stats
export const MOCK_STATS = {
  totalStudents: 0,
  attendanceRate: 0,
  absentToday: 0,
  weeklyData: [],
  recentActivity: []
};