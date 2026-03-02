import React, { useState } from 'react';
import { Student, User, Attendance } from '../types';
import { Printer, FileText, Users, Filter, Download } from 'lucide-react';

interface ReportsManagerProps {
  students: Student[];
  tutors: User[];
  attendances: Attendance[];
  currentUser: User;
}

type ReportType = 'GENERAL_LIST' | 'BY_TUTOR' | 'STATS_SUMMARY' | 'PHOTO_ROSTER' | null;

export const ReportsManager: React.FC<ReportsManagerProps> = ({ students, tutors, attendances, currentUser }) => {
  const [currentReport, setCurrentReport] = useState<ReportType>(null);
  const [rosterSeries, setRosterSeries] = useState('Todas');
  const [rosterPerPage, setRosterPerPage] = useState<5 | 10 | 20>(10);

  const allSeries = ['6ºSérie', '7ºSérie', '8ºSérie', '9ºSérie', '1ºSérie', '2ºSérie', '3ºSérie'];

  const getTutorName = (id: string) => {
    const tutor = tutors.find(t => t.id === id);
    return tutor ? tutor.name : 'Não atribuído';
  };

  const handlePrint = () => { window.print(); };

  const handlePrintPhotoRoster = () => {
    const filtered = rosterSeries === 'Todas'
      ? [...students]
      : students.filter(s => s.series.startsWith(rosterSeries.split(' ')[0]) && s.series.includes(rosterSeries));

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    const cols = rosterPerPage === 5 ? 3 : rosterPerPage === 10 ? 4 : 5;
    const photoSize = rosterPerPage === 5 ? '110px' : rosterPerPage === 10 ? '90px' : '70px';
    const fontSize = rosterPerPage === 5 ? '11px' : rosterPerPage === 10 ? '10px' : '9px';

    const cards = filtered.map(s => {
      const imgSrc = s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=cccccc&color=333333&size=120`;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;padding:6px;border:1px solid #ccc;border-radius:6px;break-inside:avoid;">
          <img src="${imgSrc}" alt="${s.name}" style="width:${photoSize};height:${photoSize};object-fit:cover;border-radius:4px;border:1px solid #ddd;" />
          <p style="margin:4px 0 1px;font-weight:bold;text-align:center;font-size:${fontSize};line-height:1.2;">${s.name}</p>
          <p style="margin:0;color:#666;font-size:${fontSize};">${s.id}</p>
          <p style="margin:0;color:#888;font-size:${fontSize};">${s.series}</p>
        </div>`;
    }).join('');

    const title = rosterSeries === 'Todas' ? 'Todos os Alunos' : rosterSeries;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
      <meta charset="UTF-8">
      <title>Rel. de Fotos — ${title}</title>
      <style>
        @page { size: A4 portrait; margin: 1.5cm; }
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { margin: 0; padding: 0; color: #111; }
        h1 { font-size: 15px; margin-bottom: 2px; }
        p.sub { font-size: 11px; color: #666; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 8px; }
        .footer { margin-top: 16px; font-size: 10px; color: #aaa; border-top: 1px solid #ddd; padding-top: 6px; }
      </style>
    </head><body>
      <h1>Relação de Fotos — ${title}</h1>
      <p class="sub">${filtered.length} aluno(s) &nbsp;|&nbsp; ${rosterPerPage} por folha &nbsp;|&nbsp; Gerado em: ${new Date().toLocaleDateString('pt-BR')} &nbsp;|&nbsp; Emissor: ${currentUser.name}</p>
      <div class="grid">${cards}</div>
      <div class="footer">Sistema Tutorado — Impresso em ${new Date().toLocaleString('pt-BR')}</div>
      <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    win.document.close();
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

      case 'PHOTO_ROSTER':
        const rosterFiltered = rosterSeries === 'Todas'
          ? [...students]
          : students.filter(s => s.series.includes(rosterSeries));
        rosterFiltered.sort((a, b) => a.name.localeCompare(b.name));
        return (
          <div className="animate-fade-in">
            <div className="mb-6 no-print">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Relação de Fotos</h2>
              <p className="text-gray-600 dark:text-gray-400">Pré-visualização das fotos de {rosterFiltered.length} aluno(s) de <strong>{rosterSeries === 'Todas' ? 'todas as séries' : rosterSeries}</strong>.</p>
            </div>
            {/* Filter controls */}
            <div className="no-print flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase font-bold">Série / Turma</label>
                <select value={rosterSeries} onChange={e => setRosterSeries(e.target.value)} className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 outline-none">
                  <option value="Todas">Todas as Séries</option>
                  {allSeries.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase font-bold">Fotos por folha</label>
                <div className="flex gap-2">
                  {([5, 10, 20] as const).map(n => (
                    <button key={n} type="button" onClick={() => setRosterPerPage(n)}
                      className={`px-4 py-2 rounded-lg font-bold border transition-colors ${rosterPerPage === n ? 'bg-gold-500 text-black border-gold-500' : 'bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gold-500'
                        }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Photo grid preview */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${rosterPerPage === 5 ? 3 : rosterPerPage === 10 ? 4 : 5}, 1fr)` }}>
              {rosterFiltered.map(s => (
                <div key={s.id} className="flex flex-col items-center p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                  <img
                    src={s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`}
                    alt={s.name}
                    className="w-16 h-16 rounded object-cover border border-gray-200 dark:border-white/10"
                  />
                  <p className="mt-1.5 text-center text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">{s.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{s.id}</p>
                  <p className="text-[10px] text-gray-400">{s.series}</p>
                </div>
              ))}
              {rosterFiltered.length === 0 && (
                <div className="col-span-5 text-center py-16 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  Nenhum aluno encontrado para esta série.
                </div>
              )}
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
            <button
              onClick={() => setCurrentReport('PHOTO_ROSTER')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${currentReport === 'PHOTO_ROSTER' ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' : 'bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
            >
              <Download size={18} /> Relação de Fotos
            </button>
          </div>
        </div>

        {currentReport && (
          <div className="glass-panel p-4 rounded-xl animate-fade-in bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
            <button
              onClick={currentReport === 'PHOTO_ROSTER' ? handlePrintPhotoRoster : handlePrint}
              className="w-full py-3 rounded-lg bg-gray-800 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={20} /> Imprimir Relatório
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              {currentReport === 'PHOTO_ROSTER' ? 'Abre janela de impressão A4' : 'Recomendado: A4, Retrato, Margens Padrão'}
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