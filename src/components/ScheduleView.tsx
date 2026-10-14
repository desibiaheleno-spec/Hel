import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Cpu,
  MapPin,
  Plus,
  Filter,
  CheckCircle2,
  Calendar as CalendarIcon,
  HardHat,
} from 'lucide-react';
import { WorkOrder, Technician, Client, Machine } from '../types';

interface ScheduleViewProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  clients: Client[];
  machines: Machine[];
  onSaveWorkOrder: (workOrder: WorkOrder) => void;
  onOpenNewWorkOrder: () => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  workOrders,
  technicians,
  clients,
  machines,
  onSaveWorkOrder,
  onOpenNewWorkOrder,
  onSelectWorkOrder,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filtra por técnico selecionado
  const filteredOrders = workOrders.filter((w) => {
    return selectedTechId === 'all' || w.technicianId === selectedTechId;
  });

  // Geração dos dias do mês atual para o grid do calendário
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Domingo) a 6 (Sábado)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const formatDayDateString = (day: number) => {
    const mm = (month + 1).toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getOrdersForDay = (day: number) => {
    const dateStr = formatDayDateString(day);
    return filteredOrders.filter((w) => w.scheduledDate === dateStr);
  };

  // Ordenados para a linha do tempo
  const sortedUpcoming = [...filteredOrders].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Agenda Técnica & Alocação de Serviços
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe o cronograma de atendimentos, os serviços agendados e os técnicos designados para cada cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Calendário Mensal
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Linha do Tempo
            </button>
          </div>

          <button
            onClick={onOpenNewWorkOrder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Barra de Filtros & Navegação do Mês */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navegador de Mês */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-slate-900 min-w-44 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filtro por Técnico com Legenda */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <HardHat className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="all">Todos os Técnicos da Equipe</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.specialty.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISÃO 1: CALENDÁRIO MENSAL */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
            <div>Domingo</div>
            <div>Segunda</div>
            <div>Terça</div>
            <div>Quarta</div>
            <div>Quinta</div>
            <div>Sexta</div>
            <div>Sábado</div>
          </div>

          {/* Grade dos dias */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[550px]">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-slate-50/40 p-2" />;
              }

              const dayOrders = getOrdersForDay(day);
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = formatDayDateString(day) === todayStr;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-2 transition-colors flex flex-col justify-between min-h-[110px] ${
                    isToday ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayOrders.length > 0 && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded-full">
                        {dayOrders.length} {dayOrders.length === 1 ? 'OS' : 'OSs'}
                      </span>
                    )}
                  </div>

                  {/* Lista de Atendimentos no Dia */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-24">
                    {dayOrders.map((order) => {
                      const tech = technicians.find((t) => t.id === order.technicianId);
                      const techColor = tech?.color || '#2563eb';

                      return (
                        <div
                          key={order.id}
                          onClick={() => onSelectWorkOrder(order)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer text-left"
                          style={{ borderLeftWidth: '3px', borderLeftColor: techColor }}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-800 truncate">
                              {order.scheduledTime || '08:00'} • {order.clientName.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">
                            {order.machineName || 'Serviço em campo'}
                          </p>
                          <p className="text-[9px] font-semibold text-blue-700 truncate mt-0.5">
                            {order.technicianName}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISÃO 2: LINHA DO TEMPO DOS AGENDAMENTOS */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">
            Linha Cronológica de Atendimentos Agendados
          </h2>

          <div className="space-y-3">
            {sortedUpcoming.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhum serviço agendado no período.
              </div>
            ) : (
              sortedUpcoming.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectWorkOrder(order)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {new Date(order.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                          month: 'short',
                        })}
                      </span>
                      <span className="text-base font-bold leading-none">
                        {order.scheduledDate.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {order.clientName}
                        </span>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {order.number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        {order.machineName || 'Manutenção Técnica Geral'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {order.clientAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[10px]">Técnico Alocado:</span>
                      <span className="font-bold text-blue-700">{order.technicianName}</span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                        order.status === 'concluida'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'em_andamento'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status === 'concluida' ? 'Concluída' : order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
