import React, { useState, useRef } from 'react';
import { getUserById } from '../services/dataService';
import { User, Student, Role } from '../types';
import { Plus, Edit, Trash2, Shield, User as UserIcon, X, Camera, Save, Users, Printer } from 'lucide-react';

interface TutorManagerProps {
  users: User[];
  students: Student[];
  currentUser: User;
  onSave: (user: User) => void;
  onDelete: (id: string) => void;
}

export const TutorManager: React.FC<TutorManagerProps> = ({ users, students, currentUser, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTutor, setViewingTutor] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    id: '',
    name: '',
    role: 'TUTOR',
    photo: '',
    password: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEdit = async (user: User) => {
    document.body.style.cursor = 'wait';
    try {
      const fullUser = await getUserById(user.id);
      setFormData(fullUser || user);
      setIsModalOpen(true);
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const handleAddNew = () => {
    setFormData({ id: '', name: '', role: 'TUTOR', photo: '', password: '' });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData as User);
    setIsModalOpen(false);
  };

  const getTutoradosByTutor = (tutorId: string): Student[] =>
    students.filter(s => s.tutorId === tutorId);

  const handlePrint = (tutor: User) => {
    const tutorados = getTutoradosByTutor(tutor.id);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = tutorados.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.series}</td>
        <td>${s.birthDate || '—'}</td>
        <td>${s.phoneStudent || '—'}</td>
        <td>${s.phoneGuardian || '—'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Tutorados de ${tutor.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { color: #555; margin-bottom: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1a1a2e; color: #fff; padding: 8px 12px; text-align: left; }
          td { padding: 8px 12px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) td { background: #f9f9f9; }
          .footer { margin-top: 24px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <h1>Tutorados — ${tutor.name}</h1>
        <p>Total: ${tutorados.length} aluno(s) &nbsp;|&nbsp; Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome</th>
              <th>Série</th>
              <th>Nascimento</th>
              <th>Tel. Aluno</th>
              <th>Tel. Responsável</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999">Nenhum tutorado cadastrado</td></tr>'}</tbody>
        </table>
        <div class="footer">Sistema Tutorado — Impresso em ${new Date().toLocaleString('pt-BR')}</div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const tutoradosDoTutor = viewingTutor ? getTutoradosByTutor(viewingTutor.id) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ... (Header) ... */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Equipe Escolar</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie administradores e tutores</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-semibold rounded-lg transition-colors shadow-lg shadow-gold-500/20"
        >
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const tutoradosCount = u.role === 'TUTOR' ? getTutoradosByTutor(u.id).length : null;
          const isPasswordVisible = visiblePasswords[u.id];

          return (
            <div key={u.id} className="glass-panel p-6 rounded-xl relative group hover:border-gold-500/30 transition-all bg-white dark:bg-transparent shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
              <div className="flex items-start gap-4">
                {/* ... (Photo logic) ... */}
                <div className="relative">
                  <img
                    src={u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                    alt={u.name}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white border border-black ${u.role === 'ADMIN' ? 'bg-gold-500' : 'bg-copper-500'}`}>
                    {u.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{u.name}</h3>
                  <p className="text-xs text-gold-600 dark:text-gold-400 font-semibold">{u.role === 'ADMIN' ? 'Administrador' : 'Tutor'}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {u.id}</p>

                  {/* Password Display */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-black/20 px-1.5 py-0.5 rounded">
                      {isPasswordVisible ? (u.password || 'Sem senha') : '••••••••'}
                    </span>
                    <button onClick={() => togglePasswordVisibility(u.id)} className="text-gray-400 hover:text-gold-500 transition-colors">
                      {isPasswordVisible ? <span className="text-[10px] uppercase">Ocultar</span> : <span className="text-[10px] uppercase">Ver Senha</span>}
                    </button>
                  </div>

                  {tutoradosCount !== null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Users size={11} className="text-copper-600 dark:text-copper-400" />
                      <span>{tutoradosCount} tutorado{tutoradosCount !== 1 ? 's' : ''}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ... (Actions) ... */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {/* Botões de tutorados — apenas para tutores */}
                <div className="flex gap-1">
                  {u.role === 'TUTOR' && (
                    <>
                      <button
                        onClick={() => setViewingTutor(u)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 dark:text-gray-300 hover:text-copper-600 dark:hover:text-copper-300 hover:bg-copper-50 dark:hover:bg-copper-500/10 rounded transition-colors border border-gray-200 dark:border-white/5 hover:border-copper-500/30"
                        title="Ver tutorados"
                      >
                        <Users size={13} /> Ver
                      </button>
                      <button
                        onClick={() => handlePrint(u)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors border border-gray-200 dark:border-white/5 hover:border-blue-500/30"
                        title="Imprimir lista de tutorados"
                      >
                        <Printer size={13} /> Imprimir
                      </button>
                    </>
                  )}
                </div>

                {/* Botões de editar/excluir */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/10 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>

                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja remover ${u.name}?`)) {
                          onDelete(u.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ... (Modal View Tutorados) ... */}
      {viewingTutor && (
        // ... existing modal content ...
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-gradient-to-r dark:from-dark-900 dark:to-dark-800">
              <div className="flex items-center gap-3">
                <img
                  src={viewingTutor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingTutor.name)}&background=random`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
                  alt={viewingTutor.name}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tutorados de {viewingTutor.name}</h3>
                  <p className="text-xs text-gray-500">{tutoradosDoTutor.length} aluno(s) cadastrado(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(viewingTutor)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/20 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 rounded-lg transition-colors"
                >
                  <Printer size={14} /> Imprimir
                </button>
                <button onClick={() => setViewingTutor(null)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lista de tutorados */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {tutoradosDoTutor.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhum tutorado cadastrado para este tutor.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tutoradosDoTutor.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors border border-gray-100 dark:border-white/5">
                      <span className="text-xs text-gray-500 dark:text-gray-600 w-5 text-right">{idx + 1}</span>
                      <img
                        src={s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10 flex-shrink-0"
                        alt={s.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.series}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-gray-500">{s.id}</p>
                        {s.birthDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-600">{new Date(s.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar/Criar Usuário ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-gradient-to-r dark:from-dark-900 dark:to-dark-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {formData.id ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                {/* ... (Photo Input) ... */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/20 relative group bg-gray-100 dark:bg-black cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"><Camera /></div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                <span className="text-xs text-gold-600 dark:text-gold-400 mt-2 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>Alterar foto</span>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none mt-1 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Senha de Acesso</label>
                <input
                  type="text"
                  placeholder="Deixe em branco para sem senha"
                  className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none mt-1 transition-colors font-mono"
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Senha usada para login. Se vazio, o acesso será liberado sem senha.
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Cargo</label>
                <select
                  className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none mt-1 transition-colors"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                  disabled={formData.id === currentUser.id}
                >
                  <option value="TUTOR">Tutor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                  {formData.role === 'ADMIN'
                    ? 'Acesso total ao sistema.'
                    : 'Acesso restrito a estudantes e atendimentos.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-gold-900/20">
                  <Save size={18} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};