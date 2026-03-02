import React, { useState, useRef } from 'react';
import { Student, SERIES_OPTIONS, CLASS_LETTERS, LIVING_OPTIONS, User } from '../types';
import { Upload, X, Save, FileText } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';

// ─── InputField fora do componente pai para evitar remontagem a cada keystroke ───
interface InputFieldProps {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}
const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', required = false, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider transition-colors">{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none focus:ring-1 focus:ring-gold-500 transition-all${type === 'date' ? ' dark:[color-scheme:dark]' : ''}`}
    />
  </div>
);

// ─── TagInput: múltiplas entradas como chips ───────────────────────────────
interface TagInputProps {
  label: string;
  value: string; // armazenado como itens separados por '|'
  onChange: (value: string) => void;
}
const TagInput: React.FC<TagInputProps> = ({ label, value, onChange }) => {
  const [draft, setDraft] = React.useState('');
  const tags = value ? value.split('|').filter(Boolean) : [];

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed].join('|'));
    setDraft('');
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx).join('|'));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider transition-colors">{label}</label>
      {/* chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-medium">
              {tag}
              <button type="button" onClick={() => removeTag(i)} className="ml-0.5 hover:text-red-400 transition-colors leading-none">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* input + botão add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          placeholder="Digite e pressione Enter ou +"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          className="flex-1 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:border-gold-500 outline-none focus:ring-1 focus:ring-gold-500 transition-all text-sm"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-600 dark:text-gold-400 font-bold transition-colors text-sm border border-gold-500/30"
        >
          +
        </button>
      </div>
    </div>
  );
};

interface StudentFormProps {
  initialData?: Student | null;
  tutors: User[];
  onSave: (data: Student) => void;
  onCancel: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ initialData, tutors, onSave, onCancel }) => {
  // Initialize state with default values if creating new, or existing data
  const [formData, setFormData] = useState<Student>(initialData || {
    id: '', // Will be generated if empty
    tutorId: '',
    name: '',
    series: '1ºSérie A',
    birthDate: '',
    phoneStudent: '',
    phoneGuardian: '',
    schoolsAttended: '',
    fatherName: '',
    fatherAge: '',
    fatherJob: '',
    motherName: '',
    motherAge: '',
    motherJob: '',
    siblings: '',
    livingArrangement: 'Pais',
    hasDevice: [],
    hasInternet: false,
    hasPet: false,
    petDetails: '',
    coursesExternal: false,
    courseDetails: '',
    studyAtHome: false,
    studyTime: '',
    likesReading: false,
    bookType: '',
    sports: false,
    sportDetails: '',
    leisureActivity: '',
    dislikesActivity: '',
    sleepTime: '',
    wakeTime: '',
    lifeProject: '',
    roles: [],
    photo: 'https://picsum.photos/200/300' // Placeholder
  });

  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const tabs = ['Identificação', 'Filiação', 'Recursos & Rotina', 'Protagonismo', 'Rendimento'];

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeriesChange = (year: string, letter: string) => {
    handleChange('series', `${year} ${letter}`);
  };


  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.includes('image') ? 'image' : 'pdf';
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          performanceDoc: ev.target?.result as string,
          performanceDocType: type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setFormData(prev => ({
              ...prev,
              performanceDoc: ev.target?.result as string,
              performanceDocType: 'image'
            }));
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const toggleCheckbox = (field: keyof Student, item: string) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(item)) {
      handleChange(field, current.filter(i => i !== item));
    } else {
      handleChange(field, [...current, item]);
    }
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Identification
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <PhotoCapture
                  shape="rect"
                  photo={formData.photo}
                  onChange={(v) => handleChange('photo', v)}
                />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tutor Responsável</label>
                  <select
                    value={formData.tutorId}
                    onChange={(e) => handleChange('tutorId', e.target.value)}
                    className="bg-dark-900 border border-white/10 rounded-lg p-2 text-gray-200 focus:border-gold-500 outline-none"
                  >
                    <option value="">Selecione um Tutor</option>
                    {tutors.filter(t => t.role === 'TUTOR').map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Nome Completo" value={formData.name} onChange={(v) => handleChange('name', v)} required />

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ano/Série</label>
                  <div className="flex gap-2">
                    <select
                      className="bg-dark-900 border border-white/10 rounded-lg p-2 flex-1 text-gray-200"
                      onChange={(e) => handleSeriesChange(e.target.value, formData.series.split(' ')[1] || 'A')}
                      value={formData.series.split(' ')[0]}
                    >
                      {SERIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      className="bg-dark-900 border border-white/10 rounded-lg p-2 w-20 text-gray-200"
                      onChange={(e) => handleSeriesChange(formData.series.split(' ')[0], e.target.value)}
                      value={formData.series.split(' ')[1]}
                    >
                      {CLASS_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <InputField label="Data de Nascimento" type="date" value={formData.birthDate} onChange={(v) => handleChange('birthDate', v)} required />
                <InputField label="Telefone Aluno" value={formData.phoneStudent} onChange={(v) => handleChange('phoneStudent', v)} />
                <InputField label="Telefone Responsável" value={formData.phoneGuardian} onChange={(v) => handleChange('phoneGuardian', v)} />
                <div className="md:col-span-2">
                  <TagInput label="Escolas Frequentadas" value={formData.schoolsAttended} onChange={(v) => handleChange('schoolsAttended', v)} />
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Family
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <h4 className="md:col-span-3 text-gold-400 font-semibold border-b border-white/10 pb-2 mb-2">Dados do Pai</h4>
            <InputField label="Nome" value={formData.fatherName} onChange={(v) => handleChange('fatherName', v)} />
            <InputField label="Idade" type="number" value={formData.fatherAge} onChange={(v) => handleChange('fatherAge', v)} />
            <InputField label="Profissão" value={formData.fatherJob} onChange={(v) => handleChange('fatherJob', v)} />

            <h4 className="md:col-span-3 text-gold-400 font-semibold border-b border-white/10 pb-2 mb-2 mt-4">Dados da Mãe</h4>
            <InputField label="Nome" value={formData.motherName} onChange={(v) => handleChange('motherName', v)} />
            <InputField label="Idade" type="number" value={formData.motherAge} onChange={(v) => handleChange('motherAge', v)} />
            <InputField label="Profissão" value={formData.motherJob} onChange={(v) => handleChange('motherJob', v)} />

            <h4 className="md:col-span-3 text-gold-400 font-semibold border-b border-white/10 pb-2 mb-2 mt-4">Outros</h4>
            <div className="md:col-span-2">
              <InputField label="Irmãos (Nome e Idade)" value={formData.siblings} onChange={(v) => handleChange('siblings', v)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Mora com quem?</label>
              <select
                value={formData.livingArrangement}
                onChange={(e) => handleChange('livingArrangement', e.target.value)}
                className="bg-dark-900 border border-white/10 rounded-lg p-2 text-gray-200"
              >
                {LIVING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        );
      case 2: // Routine
        return (
          <div className="space-y-6">
            {/* Technology */}
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-2">Possui (Tecnologia)</label>
              <div className="flex flex-wrap gap-4">
                {['Celular', 'Tablet', 'Computador', 'Videogame'].map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(formData.hasDevice as string[]).includes(item)} onChange={() => toggleCheckbox('hasDevice', item)} className="accent-gold-500" />
                    <span className="text-gray-300">{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.hasInternet} onChange={(e) => handleChange('hasInternet', e.target.checked)} className="accent-gold-500" />
                  <span className="text-gray-300">Tem internet em casa?</span>
                </label>
              </div>
            </div>

            {/* Conditional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
              {/* Pet */}
              <div className="p-3 bg-white/5 rounded-lg">
                <label className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-300">Tem Pet?</span>
                  <input type="radio" name="hasPet" checked={formData.hasPet} onChange={() => handleChange('hasPet', true)} className="accent-gold-500" /> Sim
                  <input type="radio" name="hasPet" checked={!formData.hasPet} onChange={() => handleChange('hasPet', false)} className="accent-gold-500" /> Não
                </label>
                {formData.hasPet && <InputField label="Qual Pet?" value={formData.petDetails || ''} onChange={(v) => handleChange('petDetails', v)} />}
              </div>

              {/* Course */}
              <div className="p-3 bg-white/5 rounded-lg">
                <label className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-300">Faz curso fora?</span>
                  <input type="radio" name="extCourse" checked={formData.coursesExternal} onChange={() => handleChange('coursesExternal', true)} className="accent-gold-500" /> Sim
                  <input type="radio" name="extCourse" checked={!formData.coursesExternal} onChange={() => handleChange('coursesExternal', false)} className="accent-gold-500" /> Não
                </label>
                {formData.coursesExternal && <InputField label="Qual Curso?" value={formData.courseDetails || ''} onChange={(v) => handleChange('courseDetails', v)} />}
              </div>

              {/* Reading */}
              <div className="p-3 bg-white/5 rounded-lg">
                <label className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-300">Gosta de ler?</span>
                  <input type="radio" name="reads" checked={formData.likesReading} onChange={() => handleChange('likesReading', true)} className="accent-gold-500" /> Sim
                  <input type="radio" name="reads" checked={!formData.likesReading} onChange={() => handleChange('likesReading', false)} className="accent-gold-500" /> Não
                </label>
                {formData.likesReading && <InputField label="Tipo de livro?" value={formData.bookType || ''} onChange={(v) => handleChange('bookType', v)} />}
              </div>

              {/* Sports */}
              <div className="p-3 bg-white/5 rounded-lg">
                <label className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-300">Pratica esporte?</span>
                  <input type="radio" name="sports" checked={formData.sports} onChange={() => handleChange('sports', true)} className="accent-gold-500" /> Sim
                  <input type="radio" name="sports" checked={!formData.sports} onChange={() => handleChange('sports', false)} className="accent-gold-500" /> Não
                </label>
                {formData.sports && <InputField label="Qual esporte?" value={formData.sportDetails || ''} onChange={(v) => handleChange('sportDetails', v)} />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="O que faz no lazer" value={formData.leisureActivity} onChange={(v) => handleChange('leisureActivity', v)} />
              <InputField label="O que menos gosta de fazer" value={formData.dislikesActivity} onChange={(v) => handleChange('dislikesActivity', v)} />
              <InputField label="Horário que dorme" value={formData.sleepTime} onChange={(v) => handleChange('sleepTime', v)} />
              <InputField label="Horário que acorda" value={formData.wakeTime} onChange={(v) => handleChange('wakeTime', v)} />
              <div className="md:col-span-2">
                <InputField label="Projeto de Vida" value={formData.lifeProject} onChange={(v) => handleChange('lifeProject', v)} />
              </div>
            </div>
          </div>
        );
      case 3: // Protagonism
        return (
          <div className="p-4">
            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-4">Atividades de Protagonismo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Líder de Turma', 'Vice-Líder de Turma', 'Conselho de Escola',
                'Jovem Acolhedor', 'Presidente de Clube', 'Vice-Presidente de Clube', 'Grêmio Estudantil'
              ].map(role => (
                <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${(formData.roles || []).includes(role)
                  ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                  : 'bg-dark-900 border-white/10 hover:bg-white/5'
                  }`}>
                  <input
                    type="checkbox"
                    className="accent-gold-500 w-4 h-4"
                    checked={(formData.roles || []).includes(role)}
                    onChange={() => toggleCheckbox('roles', role)}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 4: // Performance (Files)
        return (
          <div className="space-y-6 text-center">
            <div
              tabIndex={0}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-gold-500/50 transition-colors cursor-pointer bg-white/5 outline-none focus:border-gold-500"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setFormData(prev => ({ ...prev, performanceDoc: ev.target?.result as string, performanceDocType: file.type.includes('image') ? 'image' : 'pdf' }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onPaste={handlePaste}
              onClick={() => docInputRef.current?.click()}
            >
              <input type="file" ref={docInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleDocUpload} />
              <Upload className="mx-auto text-gold-400 mb-4" size={48} />
              <p className="text-lg font-medium text-gray-200">Clique, arraste ou cole (Ctrl+V) arquivo aqui</p>
              <p className="text-sm text-gray-500 mt-2">PDF, PNG ou JPG (Rendimento Bimestral)</p>
            </div>

            {formData.performanceDoc && (
              <div className="mt-6 p-4 border border-white/10 rounded-xl bg-black/20">
                <h4 className="text-left text-sm font-bold text-gray-400 mb-2 uppercase">Pré-visualização</h4>
                {formData.performanceDocType === 'image' ? (
                  <img src={formData.performanceDoc} alt="Documento" className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg" />
                ) : (
                  <div className="flex flex-col items-center py-8 text-gray-300">
                    <FileText size={48} className="mb-2" />
                    <p>Arquivo PDF Anexado</p>
                    <iframe src={formData.performanceDoc} className="w-full h-96 mt-4 rounded-lg" title="PDF Preview"></iframe>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleChange('performanceDoc', undefined); }}
                  className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                >
                  Remover Arquivo
                </button>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-2 sm:my-4" style={{ maxHeight: 'calc(100dvh - 1rem)' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-gradient-to-r dark:from-dark-900 dark:to-dark-800">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-500 dark:from-gold-300 dark:to-gold-500">
            {initialData ? 'Editar Estudante' : 'Novo Estudante'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-800 dark:hover:text-white"><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950/50 scrollbar-hide">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === idx ? 'text-gold-600 dark:text-gold-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
            >
              {tab}
              {activeTab === idx && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 shadow-[0_0_10px_rgba(212,163,43,0.5)]"></div>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-dark-950 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold shadow-lg shadow-gold-900/20 hover:shadow-gold-500/20 hover:from-gold-500 hover:to-gold-400 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Salvar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};