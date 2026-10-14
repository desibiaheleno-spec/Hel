import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ClipboardCheck,
  CalendarDays,
  Users,
  Cpu,
  BadgePercent,
  HardHat,
  TrendingUp,
  Building,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'quotes'
  | 'work_orders'
  | 'schedule'
  | 'clients'
  | 'machines'
  | 'services'
  | 'technicians'
  | 'billing'
  | 'company';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  pendingQuotesCount: number;
  openWorkOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingQuotesCount,
  openWorkOrdersCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabId,
      label: 'Painel Geral',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'quotes' as TabId,
      label: 'Orçamentos & Propostas',
      icon: FileSpreadsheet,
      badge: pendingQuotesCount > 0 ? `${pendingQuotesCount} pendentes` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'work_orders' as TabId,
      label: 'Serviços Fechados (OS)',
      icon: ClipboardCheck,
      badge: openWorkOrdersCount > 0 ? `${openWorkOrdersCount} abertas` : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'schedule' as TabId,
      label: 'Agenda de Técnicos',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'clients' as TabId,
      label: 'Clientes',
      icon: Users,
      badge: null,
    },
    {
      id: 'machines' as TabId,
      label: 'Máquinas & Equipamentos',
      icon: Cpu,
      badge: null,
    },
    {
      id: 'services' as TabId,
      label: 'Serviços & Homem-Hora (H.H.)',
      icon: BadgePercent,
      badge: null,
    },
    {
      id: 'technicians' as TabId,
      label: 'Colaboradores / Equipe',
      icon: HardHat,
      badge: null,
    },
    {
      id: 'billing' as TabId,
      label: 'Faturamento & Relatórios',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'company' as TabId,
      label: 'Minha Empresa',
      icon: Building,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Módulos do Sistema
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé informativo da Sidebar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-800/80 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Suporte Técnico</p>
          <p className="mt-1 text-[11px]">Controle operacional e financeiro de campo.</p>
        </div>
      </div>
    </aside>
  );
};
