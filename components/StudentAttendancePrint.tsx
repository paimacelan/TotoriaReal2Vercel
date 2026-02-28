import React, { useState, useRef } from 'react';
import { Student, Attendance, User } from '../types';
import { Search, Printer, X, FileText, Calendar, User as UserIcon, BookOpen } from 'lucide-react';

interface StudentAttendancePrintProps {
    students: Student[];
    attendances: Attendance[];
    tutors: User[];
    onClose: () => void;
}

export const StudentAttendancePrint: React.FC<StudentAttendancePrintProps> = ({
    students,
    attendances,
    tutors,
    onClose,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Normaliza texto para busca sem acento
    const normalize = (str: string) =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredStudents = students.filter(s =>
        normalize(s.name).includes(normalize(searchTerm)) ||
        normalize(s.series ?? '').includes(normalize(searchTerm)) ||
        normalize(s.id).includes(normalize(searchTerm))
    );

    const selectedStudent = students.find(s => s.id === selectedStudentId);
    const studentTutor = selectedStudent
        ? tutors.find(t => t.id === selectedStudent.tutorId)
        : null;

    // Atendimentos do aluno selecionado, ordenados por data
    const studentAttendances = attendances
        .filter(a => a.studentId === selectedStudentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML || '';
        const win = window.open('', '_blank', 'width=900,height=700');
        if (!win) return;
        win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Atendimentos – ${selectedStudent?.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #111; background: #fff; padding: 32px; }
          .print-header { border-bottom: 3px solid #b8860b; padding-bottom: 16px; margin-bottom: 24px; }
          .print-header h1 { font-size: 22px; color: #333; margin-bottom: 4px; }
          .print-header .subtitle { font-size: 13px; color: #555; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8f8f4; border: 1px solid #ddd; border-radius: 8px; padding: 14px; margin-bottom: 8px; }
          .info-item label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; display: block; margin-bottom: 2px; }
          .info-item span { font-size: 14px; font-weight: 600; color: #222; }
          .stats-bar { display: flex; gap: 16px; margin-bottom: 24px; margin-top: 10px; }
          .stat { background: #fdf6e3; border: 1px solid #e5c97e; border-radius: 6px; padding: 8px 16px; font-size: 13px; color: #7a5c00; font-weight: bold; }
          .att-list { display: flex; flex-direction: column; gap: 14px; }
          .att-card { border: 1px solid #ddd; border-radius: 8px; padding: 14px; page-break-inside: avoid; }
          .att-card-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .dimension-tag { display: inline-block; font-size: 11px; font-weight: bold; background: #f0e8cc; color: #7a5c00; border: 1px solid #d4aa50; border-radius: 4px; padding: 2px 8px; }
          .att-date { font-size: 12px; color: #666; }
          .att-subject { font-size: 15px; font-weight: bold; color: #222; margin-bottom: 6px; }
          .att-notes { font-size: 13px; color: #444; font-style: italic; border-left: 3px solid #d4aa50; padding-left: 10px; margin-bottom: 6px; }
          .att-tutor { font-size: 11px; color: #888; }
          .footer { margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #999; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 400);
    };

    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

                {/* Header do Modal */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center">
                            <Printer size={18} className="text-gold-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Imprimir Atendimentos</h2>
                            <p className="text-xs text-gray-500">Selecione um aluno para visualizar e imprimir</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* Painel de Busca (esquerda) */}
                    <div className="md:w-72 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col">
                        <div className="p-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar aluno..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-2 pb-2">
                            {filteredStudents.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-6">Nenhum aluno encontrado</p>
                            )}
                            {filteredStudents.map(s => {
                                const count = attendances.filter(a => a.studentId === s.id).length;
                                const isSelected = s.id === selectedStudentId;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudentId(s.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${isSelected
                                                ? 'bg-gold-500/20 border border-gold-500/40 text-gold-700 dark:text-gold-300'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent'
                                            }`}
                                    >
                                        <p className="font-semibold text-sm leading-tight">{s.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{s.series} &nbsp;·&nbsp; {count} atendimento{count !== 1 ? 's' : ''}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Painel de Preview (direita) */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selectedStudent ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-8">
                                <FileText size={40} className="opacity-30" />
                                <p className="text-sm text-center">Selecione um aluno na lista ao lado<br />para visualizar os atendimentos</p>
                            </div>
                        ) : (
                            <>
                                {/* Botão Imprimir */}
                                <div className="flex justify-end p-4 border-b border-gray-100 dark:border-white/10">
                                    <button
                                        onClick={handlePrint}
                                        disabled={studentAttendances.length === 0}
                                        className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-lg text-sm transition-all shadow-lg shadow-gold-500/20"
                                    >
                                        <Printer size={16} />
                                        Imprimir Relatório
                                    </button>
                                </div>

                                {/* Conteúdo que será impresso */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    <div ref={printRef}>
                                        {/* Cabeçalho do Relatório */}
                                        <div className="print-header border-b-2 border-gold-500/40 pb-4 mb-5">
                                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de Atendimentos</h1>
                                            <p className="text-xs text-gray-400 mb-3">Gerado em {today}</p>
                                            <div className="grid grid-cols-3 gap-3 bg-gold-500/5 border border-gold-500/20 rounded-xl p-4">
                                                <div className="info-item">
                                                    <label className="flex items-center gap-1 text-xs text-gray-400 uppercase font-bold mb-1">
                                                        <UserIcon size={11} /> Aluno
                                                    </label>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedStudent.name}</span>
                                                </div>
                                                <div className="info-item">
                                                    <label className="flex items-center gap-1 text-xs text-gray-400 uppercase font-bold mb-1">
                                                        <BookOpen size={11} /> Série
                                                    </label>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedStudent.series || '—'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <label className="flex items-center gap-1 text-xs text-gray-400 uppercase font-bold mb-1">
                                                        <UserIcon size={11} /> Tutor(a)
                                                    </label>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{studentTutor?.name || '—'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 mt-3">
                                                <span className="text-xs bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/20 rounded-full px-3 py-1 font-semibold">
                                                    {studentAttendances.length} atendimento{studentAttendances.length !== 1 ? 's' : ''} registrado{studentAttendances.length !== 1 ? 's' : ''}
                                                </span>
                                                {selectedStudent.birthDate && (
                                                    <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-full px-3 py-1">
                                                        Nasc.: {new Date(selectedStudent.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lista de Atendimentos */}
                                        {studentAttendances.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400">
                                                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Nenhum atendimento registrado para este aluno.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 att-list">
                                                {studentAttendances.map((att, idx) => (
                                                    <div key={att.id} className="att-card border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-copper-600 dark:text-copper-400 bg-copper-500/10 border border-copper-500/20 px-2 py-0.5 rounded dimension-tag">
                                                                    {att.dimension}
                                                                </span>
                                                                <span className="text-xs text-gray-400 att-date flex items-center gap-1">
                                                                    <Calendar size={11} />
                                                                    {new Date(att.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-300 dark:text-gray-600">#{idx + 1}</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 att-subject">{att.subject}</h4>
                                                        {att.notes && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gold-500/40 pl-3 mb-2 att-notes">"{att.notes}"</p>
                                                        )}
                                                        <p className="text-xs text-gray-400 att-tutor">Registrado por: <span className="font-medium">{att.tutorName}</span></p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Rodapé do relatório */}
                                        <div className="footer mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between text-xs text-gray-400">
                                            <span>Sistema Tutorado</span>
                                            <span>{today}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
