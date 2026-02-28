import React, { useState } from 'react';
import { Student, User, Attendance } from '../types';
import { Printer, FileText, Users, Filter, Download } from 'lucide-react';

interface ReportsManagerProps {
  students: Student[];
  tutors: User[];
  attendances: Attendance[];
  currentUser: User;
}

type ReportType = 'GENERAL_LIST' | 'BY_TUTOR' | 'STATS_SUMMARY' | null;

export const ReportsManager: React.FC<ReportsManagerProps> = ({ students, tutors, attendances, currentUser }) => {
  const [currentReport, setCurrentReport] = useState<ReportType>(null);

  const getTutorName = (id: string) => {
    const tutor = tutors.find(t => t.id === id);
    return tutor ? tutor.name : 'Não atribuído';
  };

  const handlePrint = () => {
    window.print();
  };

  const renderHeader = (title: string) => (
    <div className="mb-8 border-b-2 border-black pb-4 text-black hidden print-only">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Escola Tutorado</h1>
          <p className="text-sm text-gray-600">Sistema de Gestão Pedagógica</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <p className="text-xs text-gray-500">Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
          <p className="text-xs text-gray-500">Emissor: {currentUser.name}</p>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (currentReport) {
      case 'GENERAL_LIST':
        return (
          <div className="animate-fade-in text-black">
            {renderHeader('Relatório Geral de Alunos e Tutores')}

            {/* Screen Header - Hidden on Print */}
            <div className="mb-6 no-print">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Relatório Geral</h2>
              <p className="text-gray-600 dark:text-gray-400">Lista completa de estudantes matriculados e seus respectivos tutores.</p>
            </div>

            <div className="bg-white text-black p-8 rounded-none shadow-none print:p-0 print:shadow-none min-h-[29.7cm] w-full max-w-[21cm] mx-auto print:w-full print:max-w-none">
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase">Matrícula</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase">Nome do Aluno</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase">Série/Turma</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase">Tutor Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {students.sort((a, b) => a.name.localeCompare(b.name)).map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">{student.id}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{student.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-center">{student.series}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{getTutorName(student.tutorId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-xs text-gray-500 text-right border-t pt-2">
                Total de Registros: {students.length}
              </div>
            </div>
          </div>
        );

      case 'BY_TUTOR':
        // Group students by tutor
        const studentsByTutor: Record<string, Student[]> = {};
        tutors.forEach(t => {
          if (t.role === 'TUTOR') {
            studentsByTutor[t.id] = students.filter(s => s.tutorId === t.id);
          }
        });
        // Add unassigned or admin assigned
        const otherStudents = students.filter(s => !studentsByTutor[s.tutorId] && getTutorName(s.tutorId) !== 'Não atribuído');
        if (otherStudents.length > 0) studentsByTutor['OUTROS'] = otherStudents;

        return (
          <div className="animate-fade-in text-black">
            {renderHeader('Relatório de Alunos por Tutor')}

            <div className="mb-6 no-print">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Alunos por Tutor</h2>
              <p className="text-gray-600 dark:text-gray-400">Distribuição dos estudantes organizada por seus tutores responsáveis.</p>
            </div>

            <div className="bg-white text-black p-8 rounded-none shadow-none print:p-0 print:shadow-none min-h-[29.7cm] w-full max-w-[21cm] mx-auto print:w-full print:max-w-none">
              {Object.keys(studentsByTutor).map(tutorId => {
                const tutorName = tutorId === 'OUTROS' ? 'Outros / Administradores' : getTutorName(tutorId);
                const tutorStudents = studentsByTutor[tutorId];

                if (tutorStudents.length === 0) return null;

                return (
                  <div key={tutorId} className="mb-8 break-inside-avoid">
                    <h3 className="text-lg font-bold border-b-2 border-gold-500 mb-3 pb-1 text-black flex justify-between">
                      <span>{tutorName}</span>
                      <span className="text-sm font-normal text-gray-600">{tutorStudents.length} alunos</span>
                    </h3>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-1 text-xs font-bold uppercase w-24">ID</th>
                          <th className="border border-gray-300 px-3 py-1 text-xs font-bold uppercase">Nome</th>
                          <th className="border border-gray-300 px-3 py-1 text-xs font-bold uppercase w-32">Série</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorStudents.map(s => (
                          <tr key={s.id}>
                            <td className="border border-gray-300 px-3 py-1 text-xs font-mono">{s.id}</td>
                            <td className="border border-gray-300 px-3 py-1 text-xs">{s.name}</td>
                            <td className="border border-gray-300 px-3 py-1 text-xs">{s.series}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5">
            <FileText size={64} className="mb-4 opacity-50" />
            <p className="text-lg">Selecione um modelo de relatório ao lado para visualizar e imprimir.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Sidebar Controls - Hidden on Print */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-4 no-print">
        <div className="glass-panel p-4 rounded-xl bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Filter size={18} className="text-gold-500 dark:text-gold-400" /> Modelos
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentReport('GENERAL_LIST')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${currentReport === 'GENERAL_LIST' ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' : 'bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
            >
              <Users size={18} /> Lista Geral de Alunos
            </button>
            <button
              onClick={() => setCurrentReport('BY_TUTOR')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${currentReport === 'BY_TUTOR' ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' : 'bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
            >
              <Users size={18} /> Lista por Tutor
            </button>
          </div>
        </div>

        {currentReport && (
          <div className="glass-panel p-4 rounded-xl animate-fade-in bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
            <button
              onClick={handlePrint}
              className="w-full py-3 rounded-lg bg-gray-800 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={20} /> Imprimir Relatório
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Recomendado: A4, Retrato, Margens Padrão
            </p>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-4">
        {renderReportContent()}
      </div>
    </div>
  );
};