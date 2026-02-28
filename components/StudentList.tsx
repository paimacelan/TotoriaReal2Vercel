import React, { useState } from 'react';
import { Student, User } from '../types';
import { Search, Plus, Filter, FileSpreadsheet, Edit, Trash2, Eye } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onAdd: () => void;
  onEdit: (student: Student) => void;
  onView: (student: Student) => void;
  onDelete?: (id: string) => void; // Optional for safety
  currentUser: User;
}

export const StudentList: React.FC<StudentListProps> = ({ students, onAdd, onEdit, onView, onDelete, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeries, setFilterSeries] = useState('Todas');

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeries = filterSeries === 'Todas' || student.series.includes(filterSeries);

    // If Tutor, only show own students or allow seeing all? Requirement says "Implement list of all students" but implies access levels.
    // Usually admin sees all, Tutor sees own. But specs say "Implement list of all students and their tutors".
    // We will show all but highlight assigned ones.
    return matchesSearch && matchesSeries;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Nome', 'Série', 'Tutor ID', 'Nascimento'];
    const rows = filteredStudents.map(s => [s.id, s.name, s.series, s.tutorId, s.birthDate]);
    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alunos_tutorado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestão de Estudantes</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
            <FileSpreadsheet size={20} />
          </button>
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-semibold rounded-lg transition-colors shadow-lg shadow-gold-500/20">
            <Plus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterSeries}
            onChange={(e) => setFilterSeries(e.target.value)}
            className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 outline-none flex-1 transition-colors"
          >
            <option value="Todas">Todas as Séries</option>
            {['6ºSérie', '7ºSérie', '8ºSérie', '9ºSérie', '1ºSérie', '2ºSérie', '3ºSérie'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                <th className="p-4">Estudante</th>
                <th className="p-4">Matrícula</th>
                <th className="p-4">Série</th>
                <th className="p-4">Tutor</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 flex items-center gap-3">
                    <img src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{student.name}</span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm font-mono">{student.id}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-white/10">{student.series}</span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{student.tutorId}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => onView(student)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors" title="Ver Detalhes">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => onEdit(student)} className="p-2 text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/10 rounded transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir o aluno ${student.name}? Esta ação não pode ser desfeita.`)) {
                            onDelete(student.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum aluno encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};