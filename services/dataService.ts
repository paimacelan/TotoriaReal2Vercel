import { supabase } from './supabase';
import { User, Student, Attendance } from '../types';

// ─── Mapeamento snake_case (Supabase) → camelCase (TypeScript) ───────────────

const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  role: row.role,
  photo: row.photo ?? undefined,
  password: row.password ?? undefined,
});

const mapStudent = (row: any): Student => ({
  id: row.id,
  tutorId: row.tutor_id,
  name: row.name,
  series: row.series ?? '',
  birthDate: row.birth_date ?? '',
  phoneStudent: row.phone_student ?? '',
  phoneGuardian: row.phone_guardian ?? '',
  schoolsAttended: row.schools_attended ?? '',
  photo: row.photo ?? undefined,
  fatherName: row.father_name ?? '',
  fatherAge: row.father_age ?? '',
  fatherJob: row.father_job ?? '',
  motherName: row.mother_name ?? '',
  motherAge: row.mother_age ?? '',
  motherJob: row.mother_job ?? '',
  siblings: row.siblings ?? '',
  livingArrangement: row.living_arrangement ?? '',
  hasDevice: row.has_device ?? [],
  hasInternet: row.has_internet ?? false,
  hasPet: row.has_pet ?? false,
  petDetails: row.pet_details ?? undefined,
  coursesExternal: row.courses_external ?? false,
  courseDetails: row.course_details ?? undefined,
  studyAtHome: row.study_at_home ?? false,
  studyTime: row.study_time ?? undefined,
  likesReading: row.likes_reading ?? false,
  bookType: row.book_type ?? undefined,
  sports: row.sports ?? false,
  sportDetails: row.sport_details ?? undefined,
  leisureActivity: row.leisure_activity ?? '',
  dislikesActivity: row.dislikes_activity ?? '',
  sleepTime: row.sleep_time ?? '',
  wakeTime: row.wake_time ?? '',
  lifeProject: row.life_project ?? '',
  roles: row.roles ?? [],
  performanceDoc: row.performance_doc ?? undefined,
  performanceDocType: row.performance_doc_type ?? undefined,
});

const mapAttendance = (row: any): Attendance => ({
  id: row.id,
  studentId: row.student_id,
  studentName: row.student_name,
  tutorId: row.tutor_id,
  tutorName: row.tutor_name,
  date: row.date ? String(row.date).substring(0, 10) : '',
  dimension: row.dimension,
  subject: row.subject,
  notes: row.notes,
});

// ─── Mapeamento camelCase (TypeScript) → snake_case (Supabase) ───────────────

const studentToRow = (s: Student) => ({
  id: s.id,
  tutor_id: s.tutorId,
  name: s.name,
  series: s.series,
  birth_date: s.birthDate,
  phone_student: s.phoneStudent,
  phone_guardian: s.phoneGuardian,
  schools_attended: s.schoolsAttended,
  photo: s.photo ?? null,
  father_name: s.fatherName,
  father_age: s.fatherAge,
  father_job: s.fatherJob,
  mother_name: s.motherName,
  mother_age: s.motherAge,
  mother_job: s.motherJob,
  siblings: s.siblings,
  living_arrangement: s.livingArrangement,
  has_device: s.hasDevice,
  has_internet: s.hasInternet,
  has_pet: s.hasPet,
  pet_details: s.petDetails ?? null,
  courses_external: s.coursesExternal,
  course_details: s.courseDetails ?? null,
  study_at_home: s.studyAtHome,
  study_time: s.studyTime ?? null,
  likes_reading: s.likesReading,
  book_type: s.bookType ?? null,
  sports: s.sports,
  sport_details: s.sportDetails ?? null,
  leisure_activity: s.leisureActivity,
  dislikes_activity: s.dislikesActivity,
  sleep_time: s.sleepTime,
  wake_time: s.wakeTime,
  life_project: s.lifeProject,
  roles: s.roles,
  performance_doc: s.performanceDoc ?? null,
  performance_doc_type: s.performanceDocType ?? null,
});

const userToRow = (u: User) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  photo: u.photo ?? null,
  password: u.password ?? null,
});

const attendanceToRow = (a: Attendance) => ({
  id: a.id,
  student_id: a.studentId,
  student_name: a.studentName,
  tutor_id: a.tutorId,
  tutor_name: a.tutorName,
  date: a.date,
  dimension: a.dimension,
  subject: a.subject,
  notes: a.notes,
});

// ─── Carregamento inicial ─────────────────────────────────────────────────────

export const loadData = async (): Promise<{
  users: User[];
  students: Student[];
  attendances: Attendance[];
}> => {
  // Otimização: Carregar apenas colunas essenciais para o Dashboard e Listas
  // Detalhes completos são carregados sob demanda via getStudentById

  const userColumns = 'id, name, role, photo, password';

  // Reduzido de ~40 colunas para apenas 5 essenciais
  const studentColumns = 'id, tutor_id, name, series, birth_date';

  // Apenas colunas usadas no Dashboard e AttendanceManager
  const attendanceColumns = 'id, student_id, student_name, tutor_id, tutor_name, date, dimension, subject, notes';

  const [usersRes, studentsRes, attendancesRes] = await Promise.all([
    supabase.from('users').select(userColumns).order('id'),
    supabase.from('students').select(studentColumns).order('id'),
    supabase.from('attendances').select(attendanceColumns).order('date', { ascending: false }),
  ]);

  if (usersRes.error) console.error('Erro ao carregar usuários:', usersRes.error.message);
  if (studentsRes.error) console.error('Erro ao carregar alunos:', studentsRes.error.message);
  if (attendancesRes.error) console.error('Erro ao carregar presenças:', attendancesRes.error.message);

  return {
    users: (usersRes.data ?? []).map(mapUser),
    students: (studentsRes.data ?? []).map(mapStudent),
    attendances: (attendancesRes.data ?? []).map(mapAttendance),
  };
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*') // Carrega tudo, inclusive a foto
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao carregar aluno completo:', id, error.message);
    return null;
  }
  return mapStudent(data);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*') // Carrega tudo, inclusive a foto
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao carregar usuário completo:', id, error.message);
    return null;
  }
  return mapUser(data);
};

// ─── Alunos ───────────────────────────────────────────────────────────────────

export const saveStudent = async (student: Student): Promise<Student | null> => {
  const row = studentToRow(student);
  const { data, error } = await supabase
    .from('students')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar aluno:', error.message);
    return null;
  }
  return mapStudent(data);
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir aluno:', error.message);
    return false;
  }
  return true;
};

// ─── Usuários ─────────────────────────────────────────────────────────────────

export const saveUser = async (user: User): Promise<User | null> => {
  const row = userToRow(user);
  const { data, error } = await supabase
    .from('users')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar usuário:', error.message);
    return null;
  }
  return mapUser(data);
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir usuário:', error.message);
    return false;
  }
  return true;
};

// ─── Presenças ────────────────────────────────────────────────────────────────

export const saveAttendance = async (attendance: Attendance): Promise<Attendance | null> => {
  const row = attendanceToRow(attendance);
  const { data, error } = await supabase
    .from('attendances')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar presença:', error.message);
    return null;
  }
  return mapAttendance(data);
};

export const deleteAttendance = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('attendances').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir presença:', error.message);
    return false;
  }
  return true;
};

// ─── Sessão local (sem Supabase Auth) ────────────────────────────────────────

const SESSION_KEY = 'tutorado_current_user';

export const getSession = (): User | null => {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
};

export const setSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

// ─── Log de acesso (login / logout) ──────────────────────────────────────────

export const logAccess = (user: User, action: 'login' | 'logout'): void => {
  // Fire-and-forget: não bloqueia a UI em caso de falha
  supabase.from('access_logs').insert({
    user_id: user.id,
    user_name: user.name,
    role: user.role,
    action,
    logged_at: new Date().toISOString(),
    user_agent: navigator.userAgent.substring(0, 250),
  }).then(({ error }) => {
    if (error) console.warn('Falha ao registrar log de acesso:', error.message);
  });
};

