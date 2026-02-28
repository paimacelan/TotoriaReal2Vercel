import React from 'react';
import { User, Student, Attendance } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Calendar, Users, FileCheck, Award, Printer, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  students: Student[];
  tutors: User[];
  attendances: Attendance[];
  currentUser: User;
  onNavigateToStudent: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, tutors, attendances, currentUser, onNavigateToStudent }) => {
  const { theme, toggleTheme } = useTheme();
  // Calculations
  const totalStudents = students.length;
  const totalTutors = tutors.filter(u => u.role === 'TUTOR').length;
  const totalAttendances = attendances.length;

  // Chart Data: Attendances by Tutor
  const COLORS = ['#D4A32B', '#E07C56', '#64748B', '#AA8222', '#B36345', '#94A3B8', '#80611A'];

  const tutorStats = tutors.map((tutor, index) => ({
    name: tutor.name.split(' ').slice(0, 2).join(' '), // First + Last name
    count: attendances.filter(a => a.tutorId === tutor.id).length,
    fill: COLORS[index % COLORS.length]
  })).filter(t => t.count > 0);

  // Chart Data: Dimensions (todas as 6 dimensões suportadas)
  const ALL_DIMENSIONS = [
    { name: 'Cognitiva', color: '#D4A32B' }, // Gold
    { name: 'Socioemocional', color: '#E07C56' }, // Copper
    { name: 'Comportamental', color: '#64748B' }, // Slate
    { name: 'Pessoal', color: '#8B5CF6' }, // Purple
    { name: 'Acadêmica', color: '#10B981' }, // Emerald
    { name: 'Profissional', color: '#3B82F6' }, // Blue
  ];
  const dimensionStats = ALL_DIMENSIONS
    .map(d => ({ ...d, value: attendances.filter(a => a.dimension === d.name).length }))
    .filter(d => d.value > 0);

  // Top 20 Students
  const topStudents = [...students].map(s => ({
    ...s,
    attendanceCount: attendances.filter(a => a.studentId === s.id).length
  }))
    .sort((a, b) => b.attendanceCount - a.attendanceCount)
    .slice(0, 20);

  // Birthdays this month
  const currentMonth = new Date().getMonth() + 1;
  const birthdayStudents = students.filter(s => {
    const month = new Date(s.birthDate).getMonth() + 1;
    return month === currentMonth;
  });

  const handlePrint = () => {
    window.print();
  };

  const StatCard = ({ label, value, icon: Icon, gradient }: any) => (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300 bg-white dark:bg-transparent shadow-sm dark:shadow-none print:bg-white print:border-gray-200 print:text-black">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform print:hidden`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider print:text-gray-600">{label}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2 print:text-black">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg print:hidden`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-400 print:text-black print:bg-none">
            Painel de Controle
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 print:text-gray-600">Bem-vindo(a), {currentUser.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-white dark:bg-dark-800 text-gray-400 hover:text-gold-500 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors no-print shadow-sm dark:shadow-none"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 text-gold-600 dark:text-gold-400 border border-gold-500/20 rounded-lg hover:bg-gold-500/10 transition-colors no-print shadow-sm dark:shadow-none"
          >
            <Printer size={16} /> Imprimir Relatórios
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <StatCard label="Total Alunos" value={totalStudents} icon={Users} gradient="from-blue-500 to-cyan-400" />
        <StatCard label="Total Tutores" value={totalTutors} icon={Award} gradient="from-purple-500 to-pink-500" />
        <StatCard label="Atendimentos" value={totalAttendances} icon={FileCheck} gradient="from-gold-500 to-yellow-300" />
        <StatCard label="Aniversariantes" value={birthdayStudents.length} icon={Calendar} gradient="from-copper-500 to-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">

        {/* Chart 1 */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 bg-white dark:bg-transparent shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold-500 rounded-full"></span>
            Atendimentos por Tutor
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tutorStats}>
                <XAxis dataKey="name" stroke="#94A3B8" interval={0} tick={{ fontSize: 12 }} />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const count = Number(payload[0].value);
                      const percent = totalAttendances > 0 ? ((count / totalAttendances) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-[#1E1E24] border border-[#333] p-2 rounded shadow-lg">
                          <p className="text-white font-medium mb-1">{label}</p>
                          <p className="text-gold-400 text-sm">
                            {count} atendimentos ({percent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  formatter={(value) => {
                    const item = tutorStats.find(t => t.name === value);
                    const percent = item ? ((item.count / totalAttendances) * 100).toFixed(1) : 0;
                    return <span className="text-gray-600 dark:text-gray-300 text-sm font-medium ml-1">{value} ({percent}%)</span>;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tutorStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-transparent shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Dimensão dos Atendimentos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dimensionStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dimensionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E1E24', borderColor: '#333', color: '#fff' }} />
                <Legend
                  formatter={(value) => {
                    const item = dimensionStats.find(d => d.name === value);
                    const total = dimensionStats.reduce((acc, cur) => acc + cur.value, 0);
                    const percent = item ? ((item.value / total) * 100).toFixed(1) : 0;
                    return <span className="text-gray-600 dark:text-gray-300 text-sm font-medium ml-1">{value} ({percent}%)</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Top 20 Students */}
        <div className="glass-panel p-6 rounded-2xl print:bg-white print:border-gray-200 print:text-black bg-white dark:bg-transparent shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 print:text-black">Alunos com Mais Atendimentos (Top 20)</h3>
            <span className="text-xs text-gold-600 dark:text-gold-400 border border-gold-500/20 px-2 py-1 rounded print:text-black print:border-black">Destaques</span>
          </div>
          <div className="overflow-y-auto max-h-80 pr-2 print:max-h-none print:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-white/10 print:border-gray-300">
                  <th className="py-2">Aluno</th>
                  <th className="py-2 text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, idx) => (
                  <tr key={student.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer print:border-gray-200" onClick={() => onNavigateToStudent(student.id)}>
                    <td className="py-3 flex items-center gap-3">
                      <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-gold-500 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} print:border print:border-black print:bg-white print:text-black`}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800 dark:text-gray-200 print:text-black">{student.name}</span>
                        <span className="text-xs text-gray-500 print:text-gray-600">{student.series}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold print:bg-transparent print:text-black">
                        {student.attendanceCount}
                      </span>
                    </td>
                  </tr>
                ))}
                {topStudents.length === 0 && (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-500">Nenhum atendimento registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Birthdays */}
        <div className="glass-panel p-6 rounded-2xl print:bg-white print:border-gray-200 print:text-black bg-white dark:bg-transparent shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 print:text-black">Aniversariantes do Mês</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;

                  const rows = birthdayStudents.map(s => `
                            <tr>
                                <td>${s.name}</td>
                                <td>${new Date(s.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td>${s.series}</td>
                            </tr>
                        `).join('');

                  printWindow.document.write(`
                            <html>
                                <head>
                                    <title>Aniversariantes do Mês</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; padding: 20px; }
                                        h1 { font-size: 18px; margin-bottom: 20px; }
                                        table { width: 100%; border-collapse: collapse; }
                                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                        th { background-color: #f2f2f2; }
                                    </style>
                                </head>
                                <body>
                                    <h1>Aniversariantes do Mês (${new Date().toLocaleString('default', { month: 'long' })})</h1>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Data de Nascimento</th>
                                                <th>Série</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${rows || '<tr><td colspan="3">Nenhum aniversariante encontrado.</td></tr>'}
                                        </tbody>
                                    </table>
                                    <script>window.onload = () => window.print();</script>
                                </body>
                            </html>
                        `);
                  printWindow.document.close();
                }}
                className="text-gray-400 hover:text-gold-400 p-1 rounded hover:bg-gold-500/10 transition-colors no-print"
                title="Imprimir Aniversariantes"
              >
                <Printer size={18} />
              </button>
              <Calendar className="text-copper-400 print:text-black" size={20} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
            {birthdayStudents.map(student => (
              <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-copper-500/30 print:bg-white print:border-gray-300">
                <img src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 print:text-black">{student.name}</p>
                  <p className="text-xs text-copper-500 dark:text-copper-400 print:text-gray-600">
                    {new Date(student.birthDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </p>
                </div>
              </div>
            ))}
            {birthdayStudents.length === 0 && (
              <p className="text-gray-500 text-sm col-span-2 text-center py-4">Nenhum aniversariante este mês.</p>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};