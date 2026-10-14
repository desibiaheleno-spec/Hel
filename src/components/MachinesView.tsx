import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Plus,
  Filter,
  Calendar,
  Wrench,
  AlertTriangle,
  MapPin,
  FileText,
  Clock,
  Camera,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { Machine, Client, WorkOrder } from '../types';

interface MachinesViewProps {
  machines: Machine[];
  clients: Client[];
  workOrders: WorkOrder[];
  onSaveMachine: (machine: Machine) => void;
  onDeleteMachine: (id: string) => void;
  onOpenNewWorkOrderForMachine: (machine: Machine) => void;
  onViewTechnicalReport: (workOrder: WorkOrder) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  machines,
  clients,
  workOrders,
  onSaveMachine,
  onDeleteMachine,
  onOpenNewWorkOrderForMachine,
  onViewTechnicalReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  const [activeMachineDetail, setActiveMachineDetail] = useState<Machine | null>(
    machines[0] || null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    manufactureYear: '2023',
    voltagePower: '',
    locationInClient: '',
    criticality: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    specifications: '',
    photoUrl: '',
    lastMaintenanceDate: '',
    nextPreventiveDate: '',
  });

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.clientName && m.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClient =
      selectedClientId === 'all' || m.clientId === selectedClientId;

    const matchesCriticality =
      selectedCriticality === 'all' || m.criticality === selectedCriticality;

    return matchesSearch && matchesClient && matchesCriticality;
  });

  // Histórico de manutenções da máquina ativa
  const machineMaintenanceHistory = workOrders.filter(
    (w) => w.machineId === activeMachineDetail?.id
  );

  const handleOpenCreateModal = (preselectedClientId?: string) => {
    if (clients.length === 0) {
      alert('Cadastre primeiro um cliente no menu "Clientes" antes de cadastrar máquinas.');
      return;
    }
    setEditingMachine(null);
    setFormData({
      clientId: preselectedClientId || clients[0]?.id || '',
      name: '',
      brand: '',
      model: '',
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      manufactureYear: new Date().getFullYear().toString(),
      voltagePower: '380V Trifásico',
      locationInClient: '',
      criticality: 'media',
      specifications: '',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      lastMaintenanceDate: '',
      nextPreventiveDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      clientId: machine.clientId,
      name: machine.name,
      brand: machine.brand,
      model: machine.model,
      serialNumber: machine.serialNumber,
      manufactureYear: machine.manufactureYear || '',
      voltagePower: machine.voltagePower || '',
      locationInClient: machine.locationInClient || '',
      criticality: machine.criticality,
      specifications: machine.specifications || '',
      photoUrl: machine.photoUrl || '',
      lastMaintenanceDate: machine.lastMaintenanceDate || '',
      nextPreventiveDate: machine.nextPreventiveDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    if (!client) {
      alert('Selecione um cliente válido.');
      return;
    }

    const machineToSave: Machine = {
      id: editingMachine ? editingMachine.id : `mac-${Date.now()}`,
      clientId: formData.clientId,
      clientName: client.name,
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      manufactureYear: formData.manufactureYear,
      voltagePower: formData.voltagePower,
      locationInClient: formData.locationInClient,
      criticality: formData.criticality,
      specifications: formData.specifications,
      photoUrl: formData.photoUrl,
      lastMaintenanceDate: formData.lastMaintenanceDate,
      nextPreventiveDate: formData.nextPreventiveDate,
      createdAt: editingMachine ? editingMachine.createdAt : new Date().toISOString(),
    };

    onSaveMachine(machineToSave);
    setActiveMachineDetail(machineToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-blue-600" />
            Parque de Máquinas & Equipamentos
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cadastre os equipamentos dos clientes, registre dados técnicos, histórico de manutenção e fotos do antes/depois.
          </p>
        </div>
        <button
          onClick={() => handleOpenCreateModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Máquina
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, marca, modelo ou série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCriticality}
            onChange={(e) => setSelectedCriticality(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todas as Criticidades</option>
            <option value="critica">Crítica (Parada de Fábrica)</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Conteúdo Principal: Lista à Esquerda e Ficha Técnica Detalhada com Histórico à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista de Máquinas (5 Colunas) */}
        <div className="lg:col-span-5 space-y-3 h-[750px] overflow-y-auto pr-1">
          {filteredMachines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Nenhuma máquina encontrada.
            </div>
          ) : (
            filteredMachines.map((machine) => {
              const isSelected = activeMachineDetail?.id === machine.id;
              const historyCount = workOrders.filter((w) => w.machineId === machine.id).length;

              return (
                <div
                  key={machine.id}
                  onClick={() => setActiveMachineDetail(machine)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {machine.photoUrl ? (
                      <img
                        src={machine.photoUrl}
                        alt={machine.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <Cpu className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-xs truncate">
                          {machine.name}
                        </h3>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                            machine.criticality === 'critica'
                              ? 'bg-red-100 text-red-800'
                              : machine.criticality === 'alta'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {machine.criticality}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                        {machine.clientName}
                      </p>

                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {machine.brand} • Mod: {machine.model} • SN:{' '}
                        <span className="font-mono text-slate-700">{machine.serialNumber}</span>
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <span>
                          Próx. Preventiva:{' '}
                          <span className="font-semibold text-slate-700">
                            {machine.nextPreventiveDate || 'Não definida'}
                          </span>
                        </span>
                        <span className="font-semibold text-blue-600">
                          {historyCount} {historyCount === 1 ? 'manutenção' : 'manutenções'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ficha Técnica Detalhada & Histórico de Manutenções (7 Colunas) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[750px] flex flex-col">
          {activeMachineDetail ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Header do Equipamento */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  {activeMachineDetail.photoUrl && (
                    <img
                      src={activeMachineDetail.photoUrl}
                      alt={activeMachineDetail.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {activeMachineDetail.brand}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        Série: {activeMachineDetail.serialNumber}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {activeMachineDetail.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Proprietário: <span className="font-medium text-slate-800">{activeMachineDetail.clientName}</span>
                    </p>
                    {activeMachineDetail.locationInClient && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {activeMachineDetail.locationInClient}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(activeMachineDetail)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                    title="Editar Máquina"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir a máquina ${activeMachineDetail.name}?`)) {
                        onDeleteMachine(activeMachineDetail.id);
                        setActiveMachineDetail(machines.find((m) => m.id !== activeMachineDetail.id) || null);
                      }
                    }}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                    title="Excluir Máquina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenNewWorkOrderForMachine(activeMachineDetail)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Abrir Manutenção
                  </button>
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Modelo</span>
                  <span className="font-bold text-slate-800">{activeMachineDetail.model}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Ano de Fabricação</span>
                  <span className="font-bold text-slate-800">{activeMachineDetail.manufactureYear || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Tensão / Potência</span>
                  <span className="font-bold text-slate-800">{activeMachineDetail.voltagePower || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Próx. Preventiva</span>
                  <span className="font-bold text-slate-800">{activeMachineDetail.nextPreventiveDate || 'Indefinida'}</span>
                </div>
              </div>

              {activeMachineDetail.specifications && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-700 mb-1">Ficha Técnica & Parâmetros de Trabalho:</p>
                  <p className="text-slate-600 leading-relaxed">{activeMachineDetail.specifications}</p>
                </div>
              )}

              {/* Histórico de Manutenções Realizadas na Máquina */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Histórico de Manutenções & Laudos Técnicos ({machineMaintenanceHistory.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Última intervenção: {activeMachineDetail.lastMaintenanceDate || 'Sem registro'}
                  </span>
                </div>

                <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  {machineMaintenanceHistory.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      Nenhuma manutenção registrada para esta máquina ainda.
                      <div className="mt-2">
                        <button
                          onClick={() => onOpenNewWorkOrderForMachine(activeMachineDetail)}
                          className="text-emerald-600 font-semibold underline text-xs"
                        >
                          Registrar primeira intervenção de manutenção
                        </button>
                      </div>
                    </div>
                  ) : (
                    machineMaintenanceHistory.map((order) => {
                      const beforePhotos = order.photos.filter((p) => p.stage === 'antes');
                      const afterPhotos = order.photos.filter((p) => p.stage === 'depois');

                      return (
                        <div
                          key={order.id}
                          className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  {order.number}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                    order.status === 'concluida'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {order.status === 'concluida' ? 'Concluída' : order.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Realizada em: <span className="font-medium text-slate-700">{order.scheduledDate}</span> • Técnico: <span className="font-medium text-slate-700">{order.technicianName}</span>
                              </p>
                            </div>

                            <button
                              onClick={() => onViewTechnicalReport(order)}
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Ver Laudo do Cliente
                            </button>
                          </div>

                          <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                            <p className="font-semibold text-slate-800">Escopo & Diagnóstico Realizado:</p>
                            <p className="text-slate-600 mt-1">{order.technicalReport || order.scopeDescription}</p>
                            {order.partsReplaced && (
                              <p className="mt-1 text-slate-500 text-[11px]">
                                <span className="font-semibold text-slate-700">Peças substituídas: </span>
                                {order.partsReplaced}
                              </p>
                            )}
                          </div>

                          {/* Miniatura das Fotos Antes e Depois */}
                          {order.photos.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60">
                              <p className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-blue-600" />
                                Registro Fotográfico ({order.photos.length} fotos salvas):
                              </p>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {order.photos.map((photo) => (
                                  <div key={photo.id} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                                    <span
                                      className={`absolute bottom-0 inset-x-0 text-[8px] font-bold uppercase text-white text-center py-0.5 ${
                                        photo.stage === 'antes' ? 'bg-red-600/90' : photo.stage === 'depois' ? 'bg-emerald-600/90' : 'bg-slate-800/90'
                                      }`}
                                    >
                                      {photo.stage}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm flex-1 flex flex-col items-center justify-center">
              <Cpu className="w-12 h-12 text-slate-300 mb-2" />
              Selecione uma máquina para ver a ficha técnica e histórico de manutenção.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Máquina */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                {editingMachine ? 'Editar Ficha da Máquina' : 'Cadastrar Máquina do Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Proprietário *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Identificação / Nome da Máquina *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Compressor Parafuso 50HP - Linha de Ar Principal"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marca / Fabricante *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: Schulz, WEG, Romi, Atlas Copco"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: SRP 4050 Flex"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Série (SN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Ex: SCH-2023-88419"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ano de Fabricação</label>
                  <input
                    type="text"
                    value={formData.manufactureYear}
                    onChange={(e) => setFormData({ ...formData, manufactureYear: e.target.value })}
                    placeholder="Ex: 2022"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tensão & Potência</label>
                  <input
                    type="text"
                    value={formData.voltagePower}
                    onChange={(e) => setFormData({ ...formData, voltagePower: e.target.value })}
                    placeholder="Ex: 380V Trifásico / 37 kW / 10 bar"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Localização Física no Cliente</label>
                  <input
                    type="text"
                    value={formData.locationInClient}
                    onChange={(e) => setFormData({ ...formData, locationInClient: e.target.value })}
                    placeholder="Ex: Sala de Compressores - Galpão 2"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Criticidade Operacional</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="baixa">Baixa (Máquina reserva)</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta (Gera atrasos na produção)</option>
                    <option value="critica">Crítica (Para a linha de produção inteira)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Próxima Preventiva Programada</label>
                  <input
                    type="date"
                    value={formData.nextPreventiveDate}
                    onChange={(e) => setFormData({ ...formData, nextPreventiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL da Foto do Equipamento</label>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="Cole a URL da foto ou deixe o padrão demonstrativo"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Especificações Técnicas e Cuidados Especiais</label>
                  <textarea
                    rows={3}
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="Ex: Utilizar somente óleo sintético ISO VG 46. Ponto de orvalho requerido 3°C. Verificar correias a cada 500h."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
                >
                  {editingMachine ? 'Salvar Alterações' : 'Cadastrar Máquina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
