import React from 'react';
import {
  Wrench,
  Building2,
  UserCheck,
  Plus,
  ShieldCheck,
  HardHat,
  ChevronDown,
} from 'lucide-react';
import { CompanyProfile, Technician, UserRole } from '../types';

interface HeaderProps {
  company: CompanyProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  technicians: Technician[];
  selectedTechId: string;
  setSelectedTechId: (id: string) => void;
  onOpenNewQuote: () => void;
  onOpenNewWorkOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  currentRole,
  setCurrentRole,
  technicians,
  selectedTechId,
  setSelectedTechId,
  onOpenNewQuote,
  onOpenNewWorkOrder,
}) => {
  const currentTech = technicians.find((t) => t.id === selectedTechId);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Nome da Empresa */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white leading-none">
                  {company.tradeName || 'TecnoGest'}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">
                  v2.6
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                Gestão de Serviços & Manutenção Técnica
              </p>
            </div>
          </div>

          {/* Área de Ações e Alternância de Usuário */}
          <div className="flex items-center gap-3">
            {/* Alternador de Modo: Gestor / Colaborador Técnico */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setCurrentRole('manager')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  currentRole === 'manager'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gestão</span>
              </button>
              <button
                onClick={() => setCurrentRole('technician')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  currentRole === 'technician'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Técnico</span>
              </button>
            </div>

            {/* Seletor do Técnico ativo quando no modo colaborador */}
            {currentRole === 'technician' && (
              <div className="relative">
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} ({tech.specialty.split(' ')[0]})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* Botões de Ação Rápida no Modo Gestão */}
            {currentRole === 'manager' && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={onOpenNewQuote}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Orçamento
                </button>
                <button
                  onClick={onOpenNewWorkOrder}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova OS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
