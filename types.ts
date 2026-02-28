export type Role = 'ADMIN' | 'TUTOR';

export interface User {
  id: string; // ADM001 or TUT001
  name: string;
  role: Role;
  photo?: string;
  password?: string; // Optional for security/display handling
  studentCount?: number; // Calculated field
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  date: string; // ISO Date
  dimension: 'Cognitiva' | 'Socioemocional' | 'Comportamental' | 'Pessoal' | 'Acadêmica' | 'Profissional';
  subject: string;
  notes: string;
}

export interface Student {
  id: string; // ALU001
  tutorId: string;
  name: string;
  series: string; // e.g. "1ºSérie A"
  birthDate: string;
  phoneStudent: string;
  phoneGuardian: string;
  schoolsAttended: string;
  photo?: string;

  // Family
  fatherName: string;
  fatherAge: string;
  fatherJob: string;
  motherName: string;
  motherAge: string;
  motherJob: string;
  siblings: string; // Simplified text field for multiple siblings
  livingArrangement: string;

  // Resources & Routine
  hasDevice: string[]; // ['Celular', 'Tablet'...]
  hasInternet: boolean;
  hasPet: boolean;
  petDetails?: string;
  coursesExternal: boolean;
  courseDetails?: string;
  studyAtHome: boolean;
  studyTime?: string;
  likesReading: boolean;
  bookType?: string;
  sports: boolean;
  sportDetails?: string;
  leisureActivity: string;
  dislikesActivity: string;
  sleepTime: string;
  wakeTime: string;
  lifeProject: string;

  // Protagonism
  roles: string[]; // ['Líder de Turma', ...]

  // Performance Docs
  performanceDoc?: string; // Base64 or URL
  performanceDocType?: 'image' | 'pdf' | 'text';
}

export const SERIES_OPTIONS = [
  '6ºSérie', '7ºSérie', '8ºSérie', '9ºSérie',
  '1ºSérie', '2ºSérie', '3ºSérie'
];

export const CLASS_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const DIMENSIONS = ['Cognitiva', 'Socioemocional', 'Comportamental', 'Pessoal', 'Acadêmica', 'Profissional'];

export const LIVING_OPTIONS = ['Pais', 'Mãe', 'Pai', 'Avós', 'Outros'];