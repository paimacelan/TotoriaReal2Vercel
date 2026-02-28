import React, { useState, useEffect } from 'react';
import { User, Student, Attendance } from './types';
import {
  loadData,
  saveStudent, deleteStudent, getStudentById,
  saveUser, deleteUser,
  saveAttendance, deleteAttendance,
  getSession, setSession,
  logAccess
} from './services/dataService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { StudentForm } from './components/StudentForm';
import { AttendanceManager } from './components/AttendanceManager';
import { TutorManager } from './components/TutorManager';
import { ReportsManager } from './components/ReportsManager';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<{ users: User[], students: Student[], attendances: Attendance[] }>({
    users: [], students: [], attendances: []
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentFormOpen, setStudentFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Load from Supabase
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      // Timeout de segurança: 20s para conexões lentas
      const timeout = setTimeout(() => {
        if (!cancelled) {
          console.warn('Supabase demorou demais. Permitindo login local.');
          // Não bloqueia mais o app — apenas libera a tela de login
          setIsLoading(false);
        }
      }, 20000);

      try {
        const loaded = await loadData();
        if (!cancelled) {
          setData(loaded);
          const session = getSession();
          if (session) {
            const found = loaded.users.find(u => u.id === session.id);
            if (found) setUser(found);
            else setSession(null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        if (!cancelled) {
          // Não bloqueia o app — apenas libera o loading para mostrar o login
          console.warn('Dados não carregados. Login de emergência disponível (ADM001).');
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const inputId = (form.elements.namedItem('username') as HTMLInputElement).value.trim();
    const inputPassword = (form.elements.namedItem('password') as HTMLInputElement).value.trim();

    // Modo offline / emergência: quando não há usuários carregados do Supabase
    if (data.users.length === 0) {
      const emergencyAdmin: User = { id: 'ADM001', name: 'Administrador', role: 'ADMIN' };
      setUser(emergencyAdmin);
      setSession(emergencyAdmin);
      logAccess(emergencyAdmin, 'login');
      return;
    }

    const found = data.users.find(u => u.id === inputId || u.name.toLowerCase().includes(inputId.toLowerCase()));

    // Login de emergência ADM001 sempre funciona
    if (!found && (inputId === 'ADM001' || inputId === '')) {
      const adminFallback = data.users.find(u => u.role === 'ADMIN') || data.users[0];
      const emergencyAdmin: User = { id: 'ADM001', name: 'Administrador', role: 'ADMIN' };
      const loginUser = adminFallback || emergencyAdmin;
      setUser(loginUser);
      setSession(loginUser);
      logAccess(loginUser, 'login');
      return;
    }

    if (!found) {
      alert('Usuário não encontrado. Tente ADM001.');
      return;
    }

    // Se tem senha, verificar
    if (found.password && found.password !== inputPassword) {
      alert('Senha incorreta!');
      return;
    }

    setUser(found);
    setSession(found);
    logAccess(found, 'login');
  };

  const handleLogout = () => {
    if (user) logAccess(user, 'logout');
    setUser(null);
    setSession(null);
  };

  const handleSaveStudent = async (studentData: Student) => {
    let studentToSave = { ...studentData };
    if (!studentToSave.id) {
      const count = data.students.length + 1;
      studentToSave.id = `ALU${String(count).padStart(3, '0')}`;
      // Ensure uniqueness
      let offset = 0;
      while (data.students.find(s => s.id === studentToSave.id)) {
        offset++;
        studentToSave.id = `ALU${String(count + offset).padStart(3, '0')}`;
      }
    }
    const saved = await saveStudent(studentToSave);
    if (saved) {
      setData(prev => {
        const exists = prev.students.find(s => s.id === saved.id);
        const newStudents = exists
          ? prev.students.map(s => s.id === saved.id ? saved : s)
          : [...prev.students, saved];
        return { ...prev, students: newStudents };
      });
    }
    setStudentFormOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (id: string) => {
    const ok = await deleteStudent(id);
    if (ok) {
      setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) }));
    }
  };

  const handleSaveAttendance = async (attendance: Attendance) => {
    const saved = await saveAttendance(attendance);
    if (saved) {
      setData(prev => ({ ...prev, attendances: [saved, ...prev.attendances] }));
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    const ok = await deleteAttendance(id);
    if (ok) {
      setData(prev => ({ ...prev, attendances: prev.attendances.filter(a => a.id !== id) }));
    }
  };

  const handleSaveUser = async (userData: User) => {
    let userToSave = { ...userData };
    if (!userToSave.id) {
      const prefix = userToSave.role === 'ADMIN' ? 'ADM' : 'TUT';
      const count = data.users.filter(u => u.id.startsWith(prefix)).length + 1;
      userToSave.id = `${prefix}${String(count).padStart(3, '0')}`;
      let offset = 0;
      while (data.users.find(u => u.id === userToSave.id)) {
        offset++;
        userToSave.id = `${prefix}${String(count + offset).padStart(3, '0')}`;
      }
    }
    const saved = await saveUser(userToSave);
    if (saved) {
      setData(prev => {
        const exists = prev.users.find(u => u.id === saved.id);
        const newUsers = exists
          ? prev.users.map(u => u.id === saved.id ? saved : u)
          : [...prev.users, saved];
        return { ...prev, users: newUsers };
      });
      // Update session if editing current user
      if (user && user.id === saved.id) {
        setUser(saved);
        setSession(saved);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (user && user.id === id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }
    const ok = await deleteUser(id);
    if (ok) {
      setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    }
  };

  // ─── Loading Screen ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-950 to-dark-950">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>

          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-gold-600 to-copper-500 text-white font-bold shadow-lg shadow-gold-900/20 hover:shadow-gold-500/20 hover:from-gold-500 hover:to-copper-400 transition-all flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 to-copper-600 text-white font-bold text-3xl mb-4 shadow-lg shadow-gold-900/50 animate-pulse">T</div>
          <p className="text-gray-400 mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // ─── Login Screen ─────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-950 to-dark-950">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-copper-500"></div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 to-copper-600 text-white font-bold text-3xl mb-4 shadow-lg shadow-gold-900/50">T</div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500">Tutorado</h1>
            <p className="text-gray-500 mt-2">Acesso Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Identificação</label>
              <input
                name="username"
                type="text"
                placeholder="Ex: ADM001 ou Nome"
                className="w-full mt-1 bg-dark-900 border border-white/10 rounded-lg p-3 text-gray-200 focus:border-gold-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="••••••"
                className="w-full mt-1 bg-dark-900 border border-white/10 rounded-lg p-3 text-gray-200 focus:border-gold-500 outline-none transition-colors"
              />
            </div>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-gold-600 to-copper-500 text-white font-bold shadow-lg shadow-gold-900/20 hover:shadow-gold-500/20 hover:from-gold-500 hover:to-copper-400 transition-all mt-4">
              Entrar no Sistema
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-600">
            <p>Dica: Use "ADM001" ou deixe vazio para entrar como Demo</p>
          </div>
          {data.users.length === 0 && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <p className="text-yellow-400 text-xs">⚠️ Modo offline — banco não conectado. Use <strong>ADM001</strong> para entrar.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main App ─────────────────────────────────────────────────────────────

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === 'dashboard' && (
        <Dashboard
          students={data.students}
          tutors={data.users}
          attendances={data.attendances}
          currentUser={user}
          onNavigateToStudent={async (id) => {
            setIsLoading(true);
            const s = await getStudentById(id);
            setIsLoading(false);
            if (s) {
              setEditingStudent(s);
              setStudentFormOpen(true);
            }
          }}
        />
      )}

      {currentPage === 'students' && (
        <StudentList
          students={data.students}
          currentUser={user}
          onAdd={() => { setEditingStudent(null); setStudentFormOpen(true); }}
          onEdit={async (s) => {
            setIsLoading(true);
            const fullStudent = await getStudentById(s.id);
            setIsLoading(false);
            setEditingStudent(fullStudent || s);
            setStudentFormOpen(true);
          }}
          onView={async (s) => {
            setIsLoading(true);
            const fullStudent = await getStudentById(s.id);
            setIsLoading(false);
            setEditingStudent(fullStudent || s);
            setStudentFormOpen(true);
          }}
          onDelete={handleDeleteStudent}
        />
      )}

      {currentPage === 'attendances' && (
        <AttendanceManager
          students={data.students}
          tutors={data.users}
          currentUser={user}
          attendances={data.attendances}
          onSave={handleSaveAttendance}
          onDelete={handleDeleteAttendance}
        />
      )}

      {currentPage === 'tutors' && (
        <TutorManager
          users={data.users}
          students={data.students}
          currentUser={user}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
        />
      )}

      {currentPage === 'reports' && (
        <ReportsManager
          students={data.students}
          tutors={data.users}
          attendances={data.attendances}
          currentUser={user}
        />
      )}

      {isStudentFormOpen && (
        <StudentForm
          initialData={editingStudent}
          tutors={data.users}
          onSave={handleSaveStudent}
          onCancel={() => { setStudentFormOpen(false); setEditingStudent(null); }}
        />
      )}
    </Layout>
  );
};

export default App;