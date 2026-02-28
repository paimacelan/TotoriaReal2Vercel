import React, { useState } from 'react';
import { Attendance, Student, User, DIMENSIONS } from '../types';
import { Plus, Trash2, Calendar, Download, Search, Printer, UserSearch, Pencil } from 'lucide-react';
import { StudentAttendancePrint } from './StudentAttendancePrint';

interface AttendanceManagerProps {
  students: Student[];
  tutors: User[];
  currentUser: User;
  attendances: Attendance[];
  onSave: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, tutors, currentUser, attendances, onSave, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterStudentName, setFilterStudentName] = useState('');

  const [formData, setFormData] = useState<Partial<Attendance>>({
    date: new Date().toISOString().split('T')[0],
    dimension: 'Acadêmica',
    subject: '',
    notes: ''
  });

  // Verificar se o usuário tem permissão para editar/excluir um atendimento
  const canEdit = (att: Attendance) =>
    currentUser.role === 'ADMIN' || att.tutorId === currentUser.id;

  const handleEdit = (att: Attendance) => {
    setEditingId(att.id);
    setFormData({
      id: att.id,
      studentId: att.studentId,
      date: att.date,
      dimension: att.dimension,
      subject: att.subject,
      notes: att.notes,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ date: new Date().toISOString().split('T')[0], dimension: 'Acadêmica', subject: '', notes: '' });
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.date || !formData.subject) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const student = students.find(s => s.id === formData.studentId);

    if (editingId) {
      // Modo edição: preserva tutorId/tutorName originais
      const original = attendances.find(a => a.id === editingId)!;
      const updated: Attendance = {
        ...original,
        studentId: formData.studentId!,
        studentName: student?.name || original.studentName,
        date: formData.date!,
        dimension: formData.dimension as any,
        subject: formData.subject!,
        notes: formData.notes || '',
      };
      onSave(updated);
    } else {
      // Modo criação
      const newRecord: Attendance = {
        id: `ATD${Date.now()}`,
        studentId: formData.studentId!,
        studentName: student?.name || 'Desconhecido',
        tutorId: currentUser.id,
        tutorName: currentUser.name,
        date: formData.date!,
        dimension: formData.dimension as any,
        subject: formData.subject!,
        notes: formData.notes || ''
      };
      onSave(newRecord);
    }

    handleCancelForm();
  };

  const filteredAttendances = attendances.filter(a => {
    // Filter Dates: Ensure we compare YYYY-MM-DD strings safely
    const rowDate = a.date ? String(a.date).substring(0, 10) : '';
    if (filterDateStart && rowDate < filterDateStart) return false;
    if (filterDateEnd && rowDate > filterDateEnd) return false;

    // Filter Name: Accent-insensitive check on resolved name
    if (filterStudentName) {
      const student = students.find(s => s.id === a.studentId);
      const resolvedName = student ? student.name : (a.studentName || '');

      const term = filterStudentName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const name = resolvedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (!name.includes(term)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generateTXT = () => {
    const content = filteredAttendances.map(a =>
      `DATA: ${a.date}\nALUNO: ${a.studentName} (${a.studentId})\nTUTOR: ${a.tutorName}\nDIMENSÃO: ${a.dimension}\nASSUNTO: ${a.subject}\nOBS: ${a.notes}\n-----------------------------------\n`
    ).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_atendimentos_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Registro de Atendimentos</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-all"
        >
          <Plus size={18} /> Novo Atendimento
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="glass-panel p-6 rounded-xl border border-gold-500/30 no-print bg-white dark:bg-transparent shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-gold-600 dark:text-gold-400 mb-4">
            {editingId ? '✏️ Editando Atendimento' : 'Novo Registro'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold">Aluno</label>
              <select
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 transition-colors"
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                value={formData.studentId || ''}
              >
                <option value="">Selecione...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.series})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold">Data</label>
              <input
                type="date"
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 transition-colors"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold">Dimensão</label>
              <div className="flex gap-4 mt-2">
                {DIMENSIONS.map(d => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dimension"
                      value={d}
                      checked={formData.dimension === d}
                      onChange={() => setFormData({ ...formData, dimension: d as any })}
                      className="accent-gold-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold">Assunto</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 transition-colors"
                placeholder="Ex: Notas baixas, Comportamento..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 uppercase font-bold">Encaminhamentos / Observações</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 h-24 transition-colors"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={handleCancelForm} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4">Cancelar</button>
            <button onClick={handleSubmit} className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-lg transition-colors">
              {editingId ? 'Salvar Edição' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* List & Filters */}
      <div className="glass-panel p-4 rounded-xl print:border-none print:shadow-none bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4 no-print">

          {/* Search Input */}
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome do aluno..."
              value={filterStudentName}
              onChange={(e) => setFilterStudentName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none transition-colors"
            />
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Calendar size={18} className="text-gray-500" />
            <input type="date" className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-800 dark:text-gray-300 text-sm outline-none focus:border-gold-500 transition-colors" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
            <span className="text-gray-500">até</span>
            <input type="date" className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-800 dark:text-gray-300 text-sm outline-none focus:border-gold-500 transition-colors" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gold-500 hover:bg-gold-400 text-black font-semibold rounded-lg text-sm transition-all shadow shadow-gold-500/20"
              title="Imprimir atendimentos de um aluno"
            >
              <UserSearch size={16} />
              <span className="hidden sm:inline">Imprimir por Aluno</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-white/20 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-sm transition-colors" title="Imprimir tudo">
              <Printer size={18} /> <span className="hidden sm:inline">Imprimir Tudo</span>
            </button>
            <button onClick={generateTXT} className="flex items-center gap-2 text-gold-600 dark:text-gold-400 border border-gold-500/20 px-3 py-2 rounded hover:bg-gold-50 dark:hover:bg-gold-500/10 text-sm transition-colors" title="Exportar TXT">
              <Download size={18} /> <span className="hidden sm:inline">TXT</span>
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print-only mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Relatório de Atendimentos</h1>
          <p className="text-sm text-gray-600">
            Período: {filterDateStart ? new Date(filterDateStart).toLocaleDateString() : 'Início'} até {filterDateEnd ? new Date(filterDateEnd).toLocaleDateString() : 'Hoje'}
          </p>
        </div>

        <div className="space-y-3">
          {filteredAttendances.map(att => (
            <div key={att.id} className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gold-500/30 transition-all break-inside-avoid print:bg-white print:border-gray-200 print:text-black">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-copper-600 dark:text-copper-400 px-2 py-0.5 rounded bg-copper-500/10 border border-copper-500/20 print:bg-gray-100 print:text-black print:border-gray-300">{att.dimension}</span>
                    <span className="text-xs text-gray-500 print:text-gray-600">{new Date(att.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 print:text-black">{att.subject}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 print:text-gray-700">Aluno: <span className="text-gray-900 dark:text-white print:text-black font-semibold">
                    {students.find(s => s.id === att.studentId)?.name || att.studentName || 'Nome não encontrado'}
                  </span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-500 mt-2 italic print:text-gray-600">"{att.notes}"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-2 print:block hidden">Tutor: {att.tutorName}</p>
                </div>
                <div className="flex items-center gap-1 no-print">
                  {canEdit(att) && (
                    <button
                      onClick={() => handleEdit(att)}
                      title="Editar atendimento"
                      className="p-1.5 rounded text-gray-400 hover:text-gold-500 dark:text-gray-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-all"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {canEdit(att) && (
                    <button
                      onClick={() => onDelete(att.id)}
                      title="Excluir atendimento"
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredAttendances.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum atendimento encontrado.</p>}
        </div>
      </div>

      {/* Modal de impressão por aluno */}
      {isPrintModalOpen && (
        <StudentAttendancePrint
          students={students}
          attendances={attendances}
          tutors={tutors}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};