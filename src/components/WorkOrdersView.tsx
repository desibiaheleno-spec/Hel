import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Cpu,
  MapPin,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Upload,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  WorkOrder,
  WorkOrderStatus,
  MaintenancePhoto,
  Technician,
  Client,
  Machine,
  CompanyProfile,
} from '../types';
import { TechnicalReportModal } from './TechnicalReportModal';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  clients: Client[];
  machines: Machine[];
  company: CompanyProfile;
  onSaveWorkOrder: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (id: string) => void;
  onAddPhoto: (
    workOrderId: string,
    photo: Omit<MaintenancePhoto, 'id' | 'createdAt'>
  ) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  technicians,
  clients,
  machines,
  company,
  onSaveWorkOrder,
  onDeleteWorkOrder,
  onAddPhoto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');

  // Modais
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [reportOrder, setReportOrder] = useState<WorkOrder | null>(null);

  // Estado para adicionar nova foto
  const [photoStage, setPhotoStage] = useState<MaintenancePhoto['stage']>('antes');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredOrders = workOrders.filter((w) => {
    const matchesSearch =
      w.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.machineName && w.machineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.technicianName && w.technicianName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchesTech = techFilter === 'all' || w.technicianId === techFilter;

    return matchesSearch && matchesStatus && matchesTech;
  });

  const handleOpenEdit = (order: WorkOrder) => {
    setEditingOrder({ ...order });
    setPhotoCaption('');
    setPhotoUrlInput('');
  };

  const handleSaveOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    // Se concluiu e não tem horário de conclusão, seta agora
    const updated = { ...editingOrder };
    if (updated.status === 'concluida' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }

    onSaveWorkOrder(updated);
    setEditingOrder(null);
  };

  // Upload de arquivo de foto local via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingOrder) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newPhoto: MaintenancePhoto = {
        id: `pho-${Date.now()}`,
        stage: photoStage,
        url: result,
        caption: photoCaption || `Registro etapa ${photoStage}`,
        createdAt: new Date().toISOString(),
      };

      setEditingOrder({
        ...editingOrder,
        photos: [...editingOrder.photos, newPhoto],
      });
      setPhotoCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoByUrl = () => {
    if (!photoUrlInput.trim() || !editingOrder) return;

    const newPhoto: MaintenancePhoto = {
      id: `pho-${Date.now()}`,
      stage: photoStage,
      url: photoUrlInput,
      caption: photoCaption || `Foto da etapa ${photoStage}`,
      createdAt: new Date().toISOString(),
    };

    setEditingOrder({
      ...editingOrder,
      photos: [...editingOrder.photos, newPhoto],
    });
    setPhotoUrlInput('');
    setPhotoCaption('');
  };

  const handleRemovePhoto = (photoId: string) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      photos: editingOrder.photos.filter((p) => p.id !== photoId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            Serviços Fechados & Ordens de Serviço (OS)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gerencie a execução técnica dos serviços fechados, aponte horas trabalhadas, anexe fotos do antes e depois e emita laudos.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por OS, cliente, máquina ou técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Status de Execução</option>
            <option value="agendada">Agendada</option>
            <option value="em_deslocamento">Em Deslocamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_pecas">Aguardando Peças</option>
            <option value="concluida">Concluída</option>
            <option value="faturada">Faturada</option>
          </select>
        </div>

        <div>
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Técnicos Responsáveis</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Ordens de Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Nenhuma Ordem de Serviço encontrada com os filtros atuais.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCompleted = order.status === 'concluida' || order.status === 'faturada';
            const beforeCount = order.photos.filter((p) => p.stage === 'antes').length;
            const afterCount = order.photos.filter((p) => p.stage === 'depois').length;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {order.number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.status === 'concluida'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'em_andamento'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : order.status === 'agendada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status === 'concluida'
                        ? 'Concluída'
                        : order.status === 'em_andamento'
                        ? 'Em Andamento'
                        : order.status === 'agendada'
                        ? 'Agendada'
                        : order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">
                    {order.clientName}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.machineName || 'Serviço Geral'}</span>
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {order.scheduledDate} {order.scheduledTime ? `às ${order.scheduledTime}` : ''}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <User className="w-3 h-3 text-blue-500" />
                      {order.technicianName}
                    </span>
                  </div>

                  {/* Escopo do Serviço */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {order.scopeDescription}
                  </p>

                  {/* Indicador de Fotos Antes/Depois */}
                  <div className="flex items-center gap-2 mt-3 text-[11px]">
                    <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      <Camera className="w-3 h-3 text-blue-600" />
                      <span>Fotos: {order.photos.length}</span>
                    </div>
                    {beforeCount > 0 && (
                      <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        {beforeCount} Antes
                      </span>
                    )}
                    {afterCount > 0 && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {afterCount} Depois
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] block">Horas Reais</span>
                      <span className="font-bold text-slate-800">{order.actualHoursWorked} horas</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 uppercase text-[10px] block">Valor Fechado</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {formatCurrency(order.totalValue)}
                      </span>
                    </div>
                  </div>

                  {/* Ações da OS */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl shadow-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Executar / Fotos
                      </button>

                      <button
                        onClick={() => setReportOrder(order)}
                        className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors"
                        title="Ver Relatório de Entrega"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Laudo
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Status Pagamento: <strong className="text-slate-700 uppercase">{order.paymentStatus}</strong></span>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir ordem de serviço ${order.number}?`)) {
                            onDeleteWorkOrder(order.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE EXECUÇÃO DA ORDEM DE SERVIÇO & REGISTRO DE FOTOS ANTES/DEPOIS */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {editingOrder.number}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Execução & Registro Técnico da OS
                </h2>
                <p className="text-xs text-slate-500">
                  Cliente: <span className="font-semibold text-slate-700">{editingOrder.clientName}</span> • Equipamento: <span className="font-semibold text-slate-700">{editingOrder.machineName || 'Geral'}</span>
                </p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderSubmit} className="space-y-4 mt-4 text-xs">
              {/* Status, Técnico e Horas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status do Serviço *</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="agendada">Agendada</option>
                    <option value="em_deslocamento">Em Deslocamento</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando_pecas">Aguardando Peças</option>
                    <option value="concluida">Concluída (Finalizada)</option>
                    <option value="faturada">Faturada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Técnico Responsável</label>
                  <select
                    value={editingOrder.technicianId}
                    onChange={(e) => {
                      const t = technicians.find((tech) => tech.id === e.target.value);
                      setEditingOrder({
                        ...editingOrder,
                        technicianId: e.target.value,
                        technicianName: t?.name,
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horas Reais Trabalhadas (H.H.)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={editingOrder.actualHoursWorked}
                    onChange={(e) => setEditingOrder({ ...editingOrder, actualHoursWorked: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold font-mono text-center"
                  />
                </div>
              </div>

              {/* Laudo e Peças */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laudo Técnico da Manutenção Realizada *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingOrder.technicalReport || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, technicalReport: e.target.value })}
                    placeholder="Descreva detalhadamente o diagnóstico encontrado e as correções executadas na máquina..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peças e Materiais Substituídos</label>
                    <input
                      type="text"
                      value={editingOrder.partsReplaced || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, partsReplaced: e.target.value })}
                      placeholder="Ex: Rolamento 6205 SKF, Retentor Sabó, 5L Óleo Sintético"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recomendações para a Próxima Manutenção</label>
                    <input
                      type="text"
                      value={editingOrder.recommendations || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, recommendations: e.target.value })}
                      placeholder="Ex: Verificar tensão das correias em 30 dias"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO PRINCIPAL: FOTOS ANTES E DEPOIS */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Registro de Fotos do Antes e Depois ({editingOrder.photos.length} fotos)
                  </h3>
                </div>

                {/* Formulário para Adicionar Foto */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Etapa / Tag</label>
                      <select
                        value={photoStage}
                        onChange={(e) => setPhotoStage(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-semibold"
                      >
                        <option value="antes">🔴 Antes da Manutenção</option>
                        <option value="durante">🟡 Durante a Execução</option>
                        <option value="depois">🟢 Depois da Manutenção</option>
                        <option value="peca_defeituosa">⚠️ Peça Danificada</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Legenda Explicativa</label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="Ex: Vazamento no retentor antes do reparo"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enviar Imagem</label>
                      <label className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg cursor-pointer font-semibold shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Ou adicionar por URL */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Ou cole a URL de uma foto..."
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoByUrl}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold"
                    >
                      Adicionar URL
                    </button>
                  </div>
                </div>

                {/* Galeria de Fotos Adicionadas */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                  {editingOrder.photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={photo.url} alt={photo.caption} className="w-full h-28 object-cover" />
                      <div className="p-1.5 bg-white text-[10px]">
                        <span
                          className={`font-bold uppercase px-1.5 py-0.2 rounded text-[9px] ${
                            photo.stage === 'antes'
                              ? 'bg-red-100 text-red-800'
                              : photo.stage === 'depois'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {photo.stage}
                        </span>
                        <p className="truncate text-slate-600 mt-0.5">{photo.caption}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assinatura do Cliente */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Responsável do Cliente que Validou</label>
                  <input
                    type="text"
                    value={editingOrder.customerSignature || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerSignature: e.target.value })}
                    placeholder="Ex: Eng. Roberto Santos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status do Pagamento</label>
                  <select
                    value={editingOrder.paymentStatus}
                    onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="pendente">Pendente de Pagamento</option>
                    <option value="parcial">Pagamento Parcial (Sinal Pago)</option>
                    <option value="pago">Quitado / Pago Totalmente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-sm"
                >
                  Salvar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RELATÓRIO TÉCNICO PARA O CLIENTE */}
      {reportOrder && (
        <TechnicalReportModal
          workOrder={reportOrder}
          company={company}
          onClose={() => setReportOrder(null)}
        />
      )}
    </div>
  );
};
