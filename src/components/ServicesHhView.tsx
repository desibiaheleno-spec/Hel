import React, { useState } from 'react';
import {
  BadgePercent,
  Clock,
  Plus,
  Wrench,
  Search,
  Edit2,
  Trash2,
  Calculator,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ServiceItem, HHRate } from '../types';

interface ServicesHhViewProps {
  services: ServiceItem[];
  hhRates: HHRate[];
  onSaveService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
  onSaveHHRate: (rate: HHRate) => void;
  onDeleteHHRate: (id: string) => void;
}

export const ServicesHhView: React.FC<ServicesHhViewProps> = ({
  services,
  hhRates,
  onSaveService,
  onDeleteService,
  onSaveHHRate,
  onDeleteHHRate,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'hh'>('services');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [isHhModalOpen, setIsHhModalOpen] = useState(false);
  const [editingHh, setEditingHh] = useState<HHRate | null>(null);

  // Formulário de Serviço
  const [serviceForm, setServiceForm] = useState({
    code: '',
    name: '',
    category: 'mecanica' as ServiceItem['category'],
    priceType: 'fixed' as 'fixed' | 'hh',
    basePrice: 1500,
    estimatedHours: 4,
    description: '',
  });

  // Formulário de H.H.
  const [hhForm, setHhForm] = useState({
    specialty: '',
    hourlyRate: 120,
    overtimeRate: 180,
    weekendRate: 240,
    description: '',
  });

  // Simulador interativo de H.H.
  const [simTechId, setSimTechId] = useState(hhRates[0]?.id || '');
  const [simHours, setSimHours] = useState(8);
  const [simOvertime, setSimOvertime] = useState(2);
  const [simWeekend, setSimWeekend] = useState(0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceForm({
      code: `SRV-${(services.length + 1).toString().padStart(2, '0')}`,
      name: '',
      category: 'mecanica',
      priceType: 'fixed',
      basePrice: 1200,
      estimatedHours: 3,
      description: '',
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      code: service.code,
      name: service.name,
      category: service.category,
      priceType: service.priceType,
      basePrice: service.basePrice,
      estimatedHours: service.estimatedHours,
      description: service.description,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    const item: ServiceItem = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      code: serviceForm.code,
      name: serviceForm.name,
      category: serviceForm.category,
      priceType: serviceForm.priceType,
      basePrice: Number(serviceForm.basePrice),
      estimatedHours: Number(serviceForm.estimatedHours),
      description: serviceForm.description,
    };
    onSaveService(item);
    setIsServiceModalOpen(false);
  };

  const handleOpenCreateHh = () => {
    setEditingHh(null);
    setHhForm({
      specialty: '',
      hourlyRate: 120,
      overtimeRate: 180,
      weekendRate: 240,
      description: '',
    });
    setIsHhModalOpen(true);
  };

  const handleOpenEditHh = (rate: HHRate) => {
    setEditingHh(rate);
    setHhForm({
      specialty: rate.specialty,
      hourlyRate: rate.hourlyRate,
      overtimeRate: rate.overtimeRate,
      weekendRate: rate.weekendRate,
      description: rate.description || '',
    });
    setIsHhModalOpen(true);
  };

  const handleSaveHhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hhForm.specialty.trim()) return;

    const rate: HHRate = {
      id: editingHh ? editingHh.id : `hh-${Date.now()}`,
      specialty: hhForm.specialty,
      hourlyRate: Number(hhForm.hourlyRate),
      overtimeRate: Number(hhForm.overtimeRate),
      weekendRate: Number(hhForm.weekendRate),
      description: hhForm.description,
    };
    onSaveHHRate(rate);
    setIsHhModalOpen(false);
  };

  // Cálculo da simulação
  const selectedHh = hhRates.find((h) => h.id === simTechId) || hhRates[0];
  const simTotalNormal = (selectedHh?.hourlyRate || 0) * simHours;
  const simTotalOvertime = (selectedHh?.overtimeRate || 0) * simOvertime;
  const simTotalWeekend = (selectedHh?.weekendRate || 0) * simWeekend;
  const simGrandTotal = simTotalNormal + simTotalOvertime + simTotalWeekend;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BadgePercent className="w-6 h-6 text-blue-600" />
            Catálogo de Serviços & Homem-Hora (H.H.)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cadastre os serviços tabelados e configure a taxa horária de Homem-Hora (H.H.) por especialidade para os orçamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' ? (
            <button
              onClick={handleOpenCreateService}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Novo Serviço Tabelado
            </button>
          ) : (
            <button
              onClick={handleOpenCreateHh}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Nova Taxa Homem-Hora
            </button>
          )}
        </div>
      </div>

      {/* Alternador de Abas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Serviços Tabelados ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('hh')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'hh'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Tabela Homem-Hora (H.H.) ({hhRates.length})
        </button>
      </div>

      {/* ABA 1: SERVIÇOS TABELADOS */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Nenhum serviço tabelado cadastrado no banco de dados. Clique em "+ Novo Serviço Tabelado" para cadastrar.
              </div>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
                      {service.code}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        service.priceType === 'hh'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {service.priceType === 'hh' ? 'Por H.H.' : 'Preço Fixo'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-400">Tempo estimado:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {service.estimatedHours} horas
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Valor Base</span>
                      <p className="text-base font-bold text-slate-900">
                        {formatCurrency(service.basePrice)}
                        {service.priceType === 'hh' && <span className="text-xs font-normal text-slate-500">/h</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditService(service)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o serviço ${service.name}?`)) {
                            onDeleteService(service.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ABA 2: TABELA HOMEM-HORA (H.H.) & SIMULADOR */}
      {activeTab === 'hh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tabela de Taxas (7 Colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tabela Homem-Hora por Especialidade Técnica
                  </h3>
                  <p className="text-xs text-slate-500">
                    Valores aplicados nos orçamentos conforme a hora dos técnicos
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {hhRates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma taxa Homem-Hora cadastrada no banco de dados. Clique em "+ Nova Taxa Homem-Hora" para cadastrar.
                  </div>
                ) : (
                  hhRates.map((rate) => (
                    <div key={rate.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rate.specialty}</h4>
                        {rate.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{rate.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditHh(rate)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir taxa de ${rate.specialty}?`)) {
                              onDeleteHHRate(rate.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                        <span className="text-[10px] text-blue-600 font-semibold block uppercase">Hora Normal</span>
                        <span className="font-bold text-blue-950 text-sm">{formatCurrency(rate.hourlyRate)}</span>
                      </div>
                      <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        <span className="text-[10px] text-amber-700 font-semibold block uppercase">Hora Extra (+50%)</span>
                        <span className="font-bold text-amber-950 text-sm">{formatCurrency(rate.overtimeRate)}</span>
                      </div>
                      <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                        <span className="text-[10px] text-purple-700 font-semibold block uppercase">Fim de Semana (+100%)</span>
                        <span className="font-bold text-purple-950 text-sm">{formatCurrency(rate.weekendRate)}</span>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </div>

          {/* Simulador Interativo de Homem-Hora para Orçamentos (5 Colunas) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Simulador Rápido de H.H.</h3>
            </div>
            <p className="text-xs text-indigo-200 mb-4">
              Calcule estimativas de custo e faturamento de homem-hora para incluir na proposta comercial.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-indigo-200 font-semibold mb-1">Especialidade / Tabela H.H.</label>
                <select
                  value={simTechId}
                  onChange={(e) => setSimTechId(e.target.value)}
                  className="w-full bg-slate-800 border border-indigo-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {hhRates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.specialty} ({formatCurrency(r.hourlyRate)}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-indigo-200 font-semibold mb-1">Horas Normais</label>
                  <input
                    type="number"
                    min={0}
                    value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-indigo-700/60 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-indigo-200 font-semibold mb-1">Horas Extras</label>
                  <input
                    type="number"
                    min={0}
                    value={simOvertime}
                    onChange={(e) => setSimOvertime(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-indigo-700/60 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-indigo-200 font-semibold mb-1">Fim de Semana</label>
                  <input
                    type="number"
                    min={0}
                    value={simWeekend}
                    onChange={(e) => setSimWeekend(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-indigo-700/60 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>
              </div>

              {/* Resultado da Simulação */}
              <div className="mt-4 pt-4 border-t border-indigo-800/60 space-y-2">
                <div className="flex justify-between text-indigo-200">
                  <span>Horas Normais ({simHours}h):</span>
                  <span className="font-mono">{formatCurrency(simTotalNormal)}</span>
                </div>
                <div className="flex justify-between text-indigo-200">
                  <span>Horas Extras ({simOvertime}h):</span>
                  <span className="font-mono">{formatCurrency(simTotalOvertime)}</span>
                </div>
                {simWeekend > 0 && (
                  <div className="flex justify-between text-indigo-200">
                    <span>Fim de Semana ({simWeekend}h):</span>
                    <span className="font-mono">{formatCurrency(simTotalWeekend)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-white pt-2 border-t border-indigo-800/80 font-bold text-sm">
                  <span>Total Homem-Hora (H.H.):</span>
                  <span className="text-emerald-400 text-lg">{formatCurrency(simGrandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Serviço */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingService ? 'Editar Serviço Tabelado' : 'Novo Serviço Tabelado'}
              </h2>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceSubmit} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.code}
                    onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Serviço *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="Ex: Alinhamento a Laser"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cobrança</label>
                  <select
                    value={serviceForm.priceType}
                    onChange={(e) => setServiceForm({ ...serviceForm, priceType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="fixed">Preço Fixo Fechado</option>
                    <option value="hh">Cobrança por Homem-Hora (H.H.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço Base (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={serviceForm.basePrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimativa de Execução (Horas)</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={serviceForm.estimatedHours}
                  onChange={(e) => setServiceForm({ ...serviceForm, estimatedHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Escopo Técnico</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Descreva o que está incluso nesta rotina técnica..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de H.H. */}
      {isHhModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingHh ? 'Editar Taxa Homem-Hora' : 'Cadastrar Especialidade Homem-Hora'}
              </h2>
              <button onClick={() => setIsHhModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHhSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Especialidade / Cargo Técnico *</label>
                <input
                  type="text"
                  required
                  value={hhForm.specialty}
                  onChange={(e) => setHhForm({ ...hhForm, specialty: e.target.value })}
                  placeholder="Ex: Engenheiro Mecânico Sênior"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora Normal (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    required
                    value={hhForm.hourlyRate}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      setHhForm({
                        ...hhForm,
                        hourlyRate: rate,
                        overtimeRate: rate * 1.5,
                        weekendRate: rate * 2,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Extra +50% (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={hhForm.overtimeRate}
                    onChange={(e) => setHhForm({ ...hhForm, overtimeRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fim de Sem. (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={hhForm.weekendRate}
                    onChange={(e) => setHhForm({ ...hhForm, weekendRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição / Qualificação Técnica</label>
                <textarea
                  rows={2}
                  value={hhForm.description}
                  onChange={(e) => setHhForm({ ...hhForm, description: e.target.value })}
                  placeholder="Ex: Profissional habilitado com CREA para laudos e análise de vibração."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHhModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                >
                  Salvar Taxa H.H.
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
