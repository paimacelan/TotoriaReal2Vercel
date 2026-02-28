import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Users, GraduationCap, FileText, Menu, X, ClipboardList, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
          ? 'bg-gradient-to-r from-gold-500/20 to-transparent border-l-4 border-gold-500 text-gold-400 font-semibold'
          : 'text-gray-400 hover:text-gold-200 hover:bg-white/5'
          }`}
      >
        <Icon size={20} className={isActive ? 'text-gold-500 drop-shadow-[0_0_5px_rgba(212,163,43,0.5)]' : ''} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col md:flex-row font-sans text-gray-900 dark:text-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white dark:from-dark-800 dark:via-dark-950 dark:to-dark-950">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-50 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-600 to-copper-500 flex items-center justify-center font-bold text-white">T</div>
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-copper-400">Tutorado</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gold-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 glass-panel border-r border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col no-print
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-copper-600 shadow-lg shadow-gold-900/20 flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500">
              Tutorado
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Premium</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Principal</div>
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="students" icon={GraduationCap} label="Estudantes" />
          <NavItem page="attendances" icon={ClipboardList} label="Atendimentos" />

          {user.role === 'ADMIN' && (
            <>
              <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Administração</div>
              <NavItem page="tutors" icon={Users} label="Equipe" />
              <NavItem page="reports" icon={FileText} label="Relatórios" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-black/5 dark:bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`}
              className="w-10 h-10 rounded-full border-2 border-gold-500/30"
              alt="User"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-xs text-gold-600 dark:text-gold-500 truncate">{user.role === 'ADMIN' ? 'Administrador' : 'Tutor'}</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-200 transition-colors text-sm border border-gray-200 dark:border-white/5"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors text-sm border border-transparent dark:border-white/5"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen relative print:h-auto print:overflow-visible">
        {/* Background glow effects - Hidden on print */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen no-print"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-copper-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2 mix-blend-screen no-print"></div>

        <div className="container mx-auto px-4 py-8 md:p-8 relative z-10 print:p-0 print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
};