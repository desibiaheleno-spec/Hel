import React from 'react';
import {
  DollarSign,
  ClipboardCheck,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Cpu,
  User,
  Plus,
} from 'lucide-react';
import { Quote, WorkOrder, Machine, Client, Technician } from '../types';

interface DashboardViewProps {
  quotes: Quote[];
  workOrders: WorkOrder[];
  machines: Machine[];
  clients: Client[];
  technicians: Technician[];
  onNavigate: (tab: any) => void;
  onOpenNewQuote: () => void;
  onOpenNewWorkOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotes,
  workOrders,
  machines,
  clients,
  technicians,
  onNavigate,
  onOpenNewQuote,
  onOpenNewWorkOrder,
}) => {
  // Cálculos financeiros
  const approvedQuotes = quotes.filter((q) => q.status === 'approved');
  const pendingQuotes = quotes.filter((q) => q.status === 'sent' || q.status === 'draft');

  const totalClosedBilling = workOrders
    .filter((w) => w.status === 'concluida' || w.status === 'faturada' || w.paymentStatus === 'pago')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  const potentialBilling = pendingQuotes.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalActualHoursWorked = workOrders.reduce(
    (acc, curr) => acc + (curr.actualHoursWorked || 0),
    0
  );

  const activeWorkOrders = workOrders.filter(
    (w) => w.status === 'agendada' || w.status === 'em_andamento' || w.status === 'em_deslocamento'
  );

  // Alertas de preventivas (máquinas com preventiva próxima nos próximos 30 dias ou vencidas)
  const today = new Date().toISOString().split('T')[0];
  const machinesNeedingAttention = machines.filter((m) => {
    if (!m.nextPreventiveDate) return false;
    return m.nextPreventiveDate <= today || m.criticality === 'critica';
  });

  // Agendamentos próximos (ordenados por data)
  const upcomingOrders = [...workOrders]
    .filter((w) => w.status !== 'concluida' && w.status !== 'faturada')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Boas-Vindas e Ações Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            Painel de Controle Operacional
          </span>
          <h1 className="text-2xl font-bold text-white mt-2">
            Visão Geral da Empresa de Serviços
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Acompanhe orçamentos, ordens de serviço fechadas, agenda da equipe técnica e faturamento em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewQuote}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>
          <button
            onClick={onOpenNewWorkOrder}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nova OS Fechada
          </button>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Faturamento Realizado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Faturamento Concluído
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalClosedBilling)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Serviços faturados e executados</span>
          </div>
        </div>

        {/* KPI 2: Em Negociação */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orçamentos em Aberto
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(potentialBilling)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
            <span>{pendingQuotes.length} propostas aguardando aprovação</span>
          </div>
        </div>

        {/* KPI 3: Serviços Fechados / Ativos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ordens de Serviço Ativas
            </span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {activeWorkOrders.length}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{workOrders.filter((w) => w.status === 'em_andamento').length} em andamento hoje</span>
          </div>
        </div>

        {/* KPI 4: Homem-Hora (H.H.) Trabalhadas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Horas H.H.
            </span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {totalActualHoursWorked.toFixed(1)} h
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apontadas pelos técnicos</span>
          </div>
        </div>
      </div>

      {/* Grid com Agenda dos Próximos Serviços & Alertas de Máquinas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Atendimentos Agendados (2 Colunas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Próximos Atendimentos Agendados
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Serviços fechados com data e técnico alocado
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Ver Agenda Completa
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {upcomingOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Nenhum serviço agendado pendente no momento.
              </div>
            ) : (
              upcomingOrders.map((wo) => {
                const isToday = wo.scheduledDate === today;
                return (
                  <div
                    key={wo.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono text-xs shrink-0 ${
                          isToday
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] uppercase">
                          {new Date(wo.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'short',
                          })}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {wo.scheduledDate.split('-')[2]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {wo.clientName}
                          </span>
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {wo.number}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <Cpu className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-xs">{wo.machineName || 'Serviço em campo'}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {wo.scheduledTime || '08:00'}
                          </span>
                          <span className="flex items-center gap-1 text-blue-700 font-medium">
                            <User className="w-3 h-3 text-blue-500" />
                            {wo.technicianName || 'Técnico a definir'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          wo.status === 'em_andamento'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : wo.status === 'agendada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {wo.status === 'em_andamento'
                          ? 'Em Execução'
                          : wo.status === 'agendada'
                          ? 'Agendado'
                          : wo.status}
                      </span>
                      <button
                        onClick={() => onNavigate('work_orders')}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Alertas de Manutenção Preventiva & Máquinas Críticas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Máquinas & Preventivas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Equipamentos que demandam atenção
              </p>
            </div>
            <button
              onClick={() => onNavigate('machines')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Todas
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-96">
            {machinesNeedingAttention.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Todas as máquinas estão com manutenção em dia.
              </div>
            ) : (
              machinesNeedingAttention.map((machine) => (
                <div
                  key={machine.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 text-xs truncate">
                      {machine.name}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        machine.criticality === 'critica'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {machine.criticality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Cliente: {machine.clientName}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">
                      Série: <span className="font-mono text-slate-700">{machine.serialNumber}</span>
                    </span>
                    <button
                      onClick={() => onNavigate('machines')}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Ficha Técnica &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Card de Resumo de Clientes */}
          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900">Base Ativa</span>
              <span className="text-xs font-bold text-blue-700">{clients.length} Clientes</span>
            </div>
            <p className="text-[11px] text-blue-700 mt-1">
              {machines.length} equipamentos cadastrados com histórico técnico.
            </p>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Orçamentos Prontos para Fechar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              Propostas Comerciais Recentes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhe propostas enviadas e feche serviços diretamente
            </p>
          </div>
          <button
            onClick={() => onNavigate('quotes')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            Ver Todos os Orçamentos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Número</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Equipamento</th>
                <th className="py-2.5 px-3">Emissão / Validade</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum orçamento cadastrado no banco de dados.
                  </td>
                </tr>
              ) : (
                quotes.slice(0, 5).map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {quote.number}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {quote.clientName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {quote.machineName || 'Serviço Geral'}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {quote.issueDate} &rarr; {quote.validUntil}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        quote.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : quote.status === 'sent'
                          ? 'bg-amber-100 text-amber-800'
                          : quote.status === 'draft'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {quote.status === 'approved'
                        ? 'Aprovado / Fechado'
                        : quote.status === 'sent'
                        ? 'Enviado ao Cliente'
                        : quote.status === 'draft'
                        ? 'Em Elaboração'
                        : 'Recusado'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('quotes')}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Abrir &rarr;
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
