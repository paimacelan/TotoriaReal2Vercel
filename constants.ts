import { User, Student, Attendance } from './types';

// Helper to generate dates relative to today
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_USERS: User[] = [
  { id: 'ADM001', name: 'Diretora Maria Silva', role: 'ADMIN', photo: 'https://picsum.photos/200/200?random=1' },
  { id: 'TUT001', name: 'Prof. Carlos Santos', role: 'TUTOR', photo: 'https://picsum.photos/200/200?random=2' },
  { id: 'TUT002', name: 'Prof. Ana Oliveira', role: 'TUTOR', photo: 'https://picsum.photos/200/200?random=3' },
];

export const INITIAL_STUDENTS: Student[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `ALU00${i + 1}`,
  tutorId: i < 5 ? 'TUT001' : 'TUT002',
  name: [
    'João Pedro Alves', 'Mariana Costa', 'Pedro Henrique', 'Lucas Lima', 'Beatriz Souza',
    'Fernanda Rocha', 'Gabriel Pereira', 'Isabela Dias', 'Rafael Martins', 'Julia Ferreira'
  ][i],
  series: i % 2 === 0 ? '1ºSérie A' : '2ºSérie B',
  birthDate: i === 0 ? daysAgo(5) : '2008-05-15', // Make first student have birthday recently
  phoneStudent: '(11) 99999-9999',
  phoneGuardian: '(11) 98888-8888',
  schoolsAttended: 'Escola Municipal Central',
  fatherName: 'Roberto',
  fatherAge: '45',
  fatherJob: 'Engenheiro',
  motherName: 'Cláudia',
  motherAge: '42',
  motherJob: 'Professora',
  siblings: 'Marcos (12), Paula (8)',
  livingArrangement: 'Pais',
  hasDevice: ['Celular'],
  hasInternet: true,
  hasPet: true,
  petDetails: 'Cachorro Rex',
  coursesExternal: false,
  studyAtHome: true,
  studyTime: '2 horas',
  likesReading: true,
  bookType: 'Ficção',
  sports: true,
  sportDetails: 'Futebol',
  leisureActivity: 'Jogar video-game',
  dislikesActivity: 'Lavar louça',
  sleepTime: '22:00',
  wakeTime: '06:30',
  lifeProject: 'Ser Engenheiro de Software',
  roles: i % 3 === 0 ? ['Líder de Turma'] : [],
  photo: `https://picsum.photos/200/200?random=${10 + i}`
}));

export const INITIAL_ATTENDANCES: Attendance[] = [
  {
    id: 'ATD001',
    studentId: 'ALU001',
    studentName: 'João Pedro Alves',
    tutorId: 'TUT001',
    tutorName: 'Prof. Carlos Santos',
    date: daysAgo(1),
    dimension: 'Acadêmica',
    subject: 'Notas baixas em Matemática',
    notes: 'Aluno comprometeu-se a estudar mais.'
  },
  {
    id: 'ATD002',
    studentId: 'ALU002',
    studentName: 'Mariana Costa',
    tutorId: 'TUT001',
    tutorName: 'Prof. Carlos Santos',
    date: daysAgo(2),
    dimension: 'Pessoal',
    subject: 'Conflito com colegas',
    notes: 'Conversa realizada com a turma.'
  },
  {
    id: 'ATD003',
    studentId: 'ALU006',
    studentName: 'Fernanda Rocha',
    tutorId: 'TUT002',
    tutorName: 'Prof. Ana Oliveira',
    date: daysAgo(0),
    dimension: 'Profissional',
    subject: 'Orientação Vocacional',
    notes: 'Interesse em Medicina.'
  }
];