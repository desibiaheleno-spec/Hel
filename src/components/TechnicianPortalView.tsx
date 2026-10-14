import React, { useState } from 'react';
import {
  HardHat,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  Navigation,
  Wrench,
  Cpu,
  Upload,
  MessageCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  WorkOrder,
  Technician,
  MaintenancePhoto,
  CompanyProfile,
  Machine,
} from '../types';
import { TechnicalReportModal } from './TechnicalReportModal';

interface TechnicianPortalViewProps {
  technician: Technician;
  workOrders: WorkOrder[];
  machines: Machine[];
  company: CompanyProfile;
  onSaveWorkOrder: (workOrder: WorkOrder) => void;
  onSwitchToManager: () => void;
}

export const TechnicianPortalView: React.FC<TechnicianPortalViewProps> = ({
  technician,
  workOrders,
  machines,
  company,
  onSaveWorkOrder,
  onSwitchToManager,
}) => {
  // Ordens de serviço deste técnico
  const myOrders = workOrders.filter((w) => w.technicianId === technician.id);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(
    myOrders.find((w) => w.status === 'em_andamento') || myOrders[0] || null
  );

  // Modais
  const [reportModalOrder, setReportModalOrder] = useState<WorkOrder | null>(null);

  // Estados de edição do técnico
  const [photoStage, setPhotoStage] = useState<MaintenancePhoto['stage']>('antes');
  const [photoCaption, setPhotoCaption] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleStatusChange = (newStatus: WorkOrder['status']) => {
    if (!selectedOrder) return;
    const updated = { ...selectedOrder, status: newStatus };
    if (newStatus === 'em_andamento' && !updated.startedAt) {
      updated.startedAt = new Date().toISOString();
    }
    if (newStatus === 'concluida' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }
    onSaveWorkOrder(updated);
    setSelectedOrder(updated);
  };

  const handleUpdateField = (field: keyof WorkOrder, value: any) => {
    if (!selectedOrder) return;
    const updated = { ...selectedOrder, [field]: value };
    onSaveWorkOrder(updated);
    setSelectedOrder(updated);
  };

  // Upload de foto do técnico em campo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newPhoto: MaintenancePhoto = {
        id: `pho-tech-${Date.now()}`,
        stage: photoStage,
        url: result,
        caption: photoCaption || `Foto ${photoStage} tirada em campo por ${technician.name}`,
        createdAt: new Date().toISOString(),
      };

      const updated = {
        ...selectedOrder,
        photos: [...selectedOrder.photos, newPhoto],
      };
      onSaveWorkOrder(updated);
      setSelectedOrder(updated);
      setPhotoCaption('');
    };
    reader.readAsDataURL(file);
  };

  // Link para Google Maps
  const openGoogleMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const formatWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return `https://wa.me/${clean.length <= 11 ? `55${clean}` : clean}`;
  };

  const machineDetails = machines.find((m) => m.id === selectedOrder?.machineId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner de Identificação do Colaborador */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-black/20 text-white font-mono px-2 py-0.5 rounded">
                Técnico em Campo
              </span>
              <span className="text-xs font-semibold text-amber-200">
                Código: {technician.accessCode}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">{technician.name}</h1>
            <p className="text-xs text-amber-100">{technician.specialty}</p>
          </div>
        </div>

        <button
          onClick={onSwitchToManager}
          className="text-xs bg-slate-900/80 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-xl border border-white/10 transition-colors"
        >
          Voltar para Visão Gestor &rarr;
        </button>
      </div>

      {/* Grid Principal: Lista das minhas OS e Área de Execução */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Minhas OS atribuídas (5 Colunas) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Minhas Ordens de Serviço ({myOrders.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Hoje: {today}</span>
          </div>

          <div className="space-y-2.5">
            {myOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Nenhuma ordem de serviço atribuída a você no momento.
              </div>
            ) : (
              myOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const isToday = order.scheduledDate === today;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 shadow-md ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.number}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'concluida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'em_andamento'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status === 'em_andamento'
                          ? 'Em Execução'
                          : order.status === 'concluida'
                          ? 'Concluída'
                          : 'Agendada'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs mt-1.5 truncate">
                      {order.clientName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Cpu className="w-3 h-3 text-slate-400 shrink-0" />
                      {order.machineName || 'Serviço Geral'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {order.scheduledDate} {order.scheduledTime ? `• ${order.scheduledTime}` : ''}
                      </span>
                      <span className="text-amber-700 font-bold">
                        {order.photos.length} fotos
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ficha de Execução da OS Ativa (7 Colunas) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          {selectedOrder ? (
            <>
              {/* Cabeçalho da OS */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedOrder.number}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Agendado para: {selectedOrder.scheduledDate}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-2">
                  {selectedOrder.clientName}
                </h2>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  {selectedOrder.machineName || 'Equipamento em campo'}
                </p>
              </div>

              {/* Botões Rápidos de Acesso e Contato */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => openGoogleMaps(selectedOrder.clientAddress)}
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Abrir no GPS (Maps)
                </button>
                <a
                  href={formatWhatsApp(selectedOrder.clientPhone)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Ligar / WhatsApp
                </a>
              </div>

              {/* Endereço detalhado */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block">Endereço da Execução:</span>
                <p className="mt-0.5">{selectedOrder.clientAddress}</p>
              </div>

              {/* Especificações da Máquina se houver */}
              {machineDetails && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                  <p className="font-bold text-blue-900">Ficha da Máquina:</p>
                  <p className="text-blue-800 mt-0.5">
                    Marca: {machineDetails.brand} • Modelo: {machineDetails.model} • Série: {machineDetails.serialNumber}
                  </p>
                  {machineDetails.locationInClient && (
                    <p className="text-blue-700 text-[11px] mt-0.5">Local: {machineDetails.locationInClient}</p>
                  )}
                </div>
              )}

              {/* Controle de Status em Campo */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">Status de Atendimento em Campo:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange('em_deslocamento')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      selectedOrder.status === 'em_deslocamento'
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1. Em Rota
                  </button>
                  <button
                    onClick={() => handleStatusChange('em_andamento')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      selectedOrder.status === 'em_andamento'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    2. Iniciar Serviço
                  </button>
                  <button
                    onClick={() => handleStatusChange('concluida')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      selectedOrder.status === 'concluida'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    3. Concluir
                  </button>
                </div>
              </div>

              {/* Registro de Fotos do Antes e Depois pelo Celular */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Registrar Fotos do Antes e Depois
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {selectedOrder.photos.length} fotos salvas
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Estágio da Foto
                      </label>
                      <select
                        value={photoStage}
                        onChange={(e) => setPhotoStage(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="antes">🔴 Antes da Manutenção</option>
                        <option value="durante">🟡 Durante o Reparo</option>
                        <option value="depois">🟢 Depois da Manutenção</option>
                        <option value="peca_defeituosa">⚠️ Peça Danificada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Legenda
                      </label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Ex: Foto do rolamento desgastado"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Botão de Câmera */}
                  <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-blue-500/20 transition-all">
                    <Camera className="w-4 h-4" />
                    Tirar Foto com a Câmera / Galeria
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Miniaturas das fotos */}
                <div className="grid grid-cols-3 gap-2">
                  {selectedOrder.photos.map((p) => (
                    <div key={p.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={p.url} alt={p.caption} className="w-full h-24 object-cover" />
                      <span
                        className={`absolute bottom-0 inset-x-0 text-[8px] font-bold uppercase text-white text-center py-0.5 ${
                          p.stage === 'antes' ? 'bg-red-600/90' : p.stage === 'depois' ? 'bg-emerald-600/90' : 'bg-slate-800/90'
                        }`}
                      >
                        {p.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apontamento Técnico: Horas e Laudo */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Trabalhadas no Local (H.H.)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={selectedOrder.actualHoursWorked}
                    onChange={(e) => handleUpdateField('actualHoursWorked', Number(e.target.value))}
                    className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diagnóstico & O que foi feito:</label>
                  <textarea
                    rows={3}
                    value={selectedOrder.technicalReport || ''}
                    onChange={(e) => handleUpdateField('technicalReport', e.target.value)}
                    placeholder="Descreva o serviço executado para constar no laudo do cliente..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peças Substituídas:</label>
                  <input
                    type="text"
                    value={selectedOrder.partsReplaced || ''}
                    onChange={(e) => handleUpdateField('partsReplaced', e.target.value)}
                    placeholder="Ex: Correia dentada A-42, Filtro coalescente"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Botão de Ver Laudo */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setReportModalOrder(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs"
                >
                  <FileText className="w-4 h-4" />
                  Visualizar Laudo Técnico Completo do Cliente
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Selecione uma ordem de serviço ao lado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Laudo */}
      {reportModalOrder && (
        <TechnicalReportModal
          workOrder={reportModalOrder}
          company={company}
          onClose={() => setReportModalOrder(null)}
        />
      )}
    </div>
  );
};
