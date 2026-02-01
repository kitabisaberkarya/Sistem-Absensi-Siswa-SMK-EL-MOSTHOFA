import { Student, Role } from './types';

export const CLASSES = ['10-IPA-1', '10-IPA-2', '10-IPS-1', '11-IPA-1', '11-IPS-1', '12-IPA-1'];

export const SUBJECTS = [
  'Matematika Wajib',
  'Matematika Peminatan',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Fisika',
  'Kimia',
  'Biologi',
  'Sejarah',
  'Ekonomi',
  'Sosiologi',
  'Geografi',
  'BK'
];

// Mock Students Data
export const MOCK_STUDENTS: Student[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `S${1000 + i}`,
  name: [
    "Ahmad Dahlan", "Budi Santoso", "Citra Kirana", "Dewi Sartika", "Eko Kurniawan",
    "Fajar Nugraha", "Gita Gutawa", "Hendra Setiawan", "Indah Permatasari", "Joko Anwar",
    "Kartini", "Lukman Sardi", "Maudy Ayunda", "Nicholas Saputra", "Opick",
    "Prilly Latuconsina", "Qory Sandioriva", "Raffi Ahmad", "Sule", "Tulus",
    "Ucok Baba", "Vino G. Bastian", "Wulan Guritno", "Xaverius", "Yuni Shara",
    "Zaskia Adya Mecca", "Agus Yudhoyono", "Bunga Citra Lestari", "Cakra Khan", "Desta"
  ][i],
  nis: `${202300 + i}`,
  className: CLASSES[i % CLASSES.length],
  gender: i % 2 === 0 ? 'L' : 'P'
}));

// Mock Stats Data
export const MOCK_STATS = {
  totalStudents: 450,
  attendanceRate: 94.5,
  absentToday: 12,
  weeklyData: [
    { day: 'Senin', present: 430, absent: 20 },
    { day: 'Selasa', present: 440, absent: 10 },
    { day: 'Rabu', present: 435, absent: 15 },
    { day: 'Kamis', present: 445, absent: 5 },
    { day: 'Jumat', present: 420, absent: 30 },
  ],
  recentActivity: [
    { class: '10-IPA-1', teacher: 'Pak Budi', time: '07:15' },
    { class: '11-IPS-1', teacher: 'Bu Ani', time: '07:20' },
    { class: '12-IPA-1', teacher: 'Pak Joko', time: '08:00' },
  ]
};