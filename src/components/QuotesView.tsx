import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Share2,
  Trash2,
  Edit2,
  User,
  Cpu,
  Calendar,
  DollarSign,
  ArrowRight,
  MessageCircle,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Quote,
  QuoteItem,
  Client,
  Machine,
  ServiceItem,
  HHRate,
  Technician,
  CompanyProfile,
  WorkOrder,
} from '../types';

interface QuotesViewProps {
  quotes: Quote[];
  clients: Client[];
  machines: Machine[];
  services: ServiceItem[];
  hhRates: HHRate[];
  technicians: Technician[];
  company: CompanyProfile;
  onSaveQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onApproveQuote: (quoteId: string, technicianId: string, scheduledDate: string) => void;
  onNavigateToWorkOrder: (workOrderId: string) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  clients,
  machines,
  services,
  hhRates,
  technicians,
  company,
  onSaveQuote,
  onDeleteQuote,
  onApproveQuote,
  onNavigateToWorkOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // Modal de Aprovação / Fechamento de Serviço
  const [approvingQuote, setApprovingQuote] = useState<Quote | null>(null);
  const [assignTechId, setAssignTechId] = useState(technicians[0]?.id || '');
  const [assignDate, setAssignDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  // Modal de Visualização da Proposta para Impressão / WhatsApp
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);

  // Estado do formulário de Orçamento
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    machineId: '',
    validityDays: 15,
    estimatedDays: 2,
    paymentTerms: company.defaultPaymentTerms || '50% entrada + 50% na conclusão',
    notes: company.quoteNotes || '',
    discount: 0,
    items: [] as QuoteItem[],
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.machineName && q.machineName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNewQuote = (preselectedClient?: Client) => {
    if (clients.length === 0) {
      alert('Cadastre primeiro um cliente no menu "Clientes" antes de emitir orçamentos.');
      return;
    }
    const targetClient = preselectedClient || clients[0];
    const clientMachines = targetClient ? machines.filter((m) => m.clientId === targetClient.id) : [];

    setEditingQuote(null);
    setFormData({
      clientId: targetClient?.id || '',
      machineId: clientMachines[0]?.id || '',
      validityDays: 15,
      estimatedDays: 2,
      paymentTerms: company.defaultPaymentTerms,
      notes: company.quoteNotes,
      discount: 0,
      items: [
        {
          id: `item-${Date.now()}-1`,
          type: 'service_fixed',
          description: services[0]?.name || 'Revisão técnica preventiva',
          quantity: 1,
          unitPrice: services[0]?.basePrice || 1200,
          totalPrice: services[0]?.basePrice || 1200,
        },
      ],
    });
    setIsEditorOpen(true);
  };

  const handleOpenEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      clientId: quote.clientId,
      machineId: quote.machineId || '',
      validityDays: 15,
      estimatedDays: quote.estimatedExecutionDays || 2,
      paymentTerms: quote.paymentTerms,
      notes: quote.notes || '',
      discount: quote.discountAmount,
      items: [...quote.items],
    });
    setIsEditorOpen(true);
  };

  // Funções de manipulação de itens do orçamento
  const handleAddItem = (type: QuoteItem['type']) => {
    let newItem: QuoteItem;
    if (type === 'service_hh') {
      const defaultHh = hhRates[0];
      newItem = {
        id: `it-${Date.now()}`,
        type: 'service_hh',
        description: `Mão de obra técnica especializada: ${defaultHh?.specialty || 'Técnico Mecânico'}`,
        hhRateId: defaultHh?.id,
        quantity: 4, // 4 horas
        unitPrice: defaultHh?.hourlyRate || 120,
        totalPrice: (defaultHh?.hourlyRate || 120) * 4,
      };
    } else if (type === 'part_material') {
      newItem = {
        id: `it-${Date.now()}`,
        type: 'part_material',
        description: 'Kit de reposição / Peça original',
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500,
      };
    } else {
      const defaultSrv = services[0];
      newItem = {
        id: `it-${Date.now()}`,
        type: 'service_fixed',
        description: defaultSrv?.name || 'Serviço tabelado',
        quantity: 1,
        unitPrice: defaultSrv?.basePrice || 1000,
        totalPrice: defaultSrv?.basePrice || 1000,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (index: number, updates: Partial<QuoteItem>) => {
    const updated = [...formData.items];
    const current = updated[index];
    const next = { ...current, ...updates };
    next.totalPrice = next.quantity * next.unitPrice;
    updated[index] = next;
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Totais em tempo real
  const subtotalServices = formData.items
    .filter((i) => i.type === 'service_fixed')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const subtotalHH = formData.items
    .filter((i) => i.type === 'service_hh')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const subtotalParts = formData.items
    .filter((i) => i.type === 'part_material' || i.type === 'travel')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const totalCalculated = Math.max(
    0,
    subtotalServices + subtotalHH + subtotalParts - formData.discount
  );

  const handleSaveQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    if (!client) {
      alert('Selecione um cliente.');
      return;
    }

    const machine = machines.find((m) => m.id === formData.machineId);
    const today = new Date();
    const validDate = new Date();
    validDate.setDate(today.getDate() + formData.validityDays);

    const quoteNumber =
      editingQuote?.number || `ORC-2026-${(quotes.length + 44).toString().padStart(4, '0')}`;

    const quoteToSave: Quote = {
      id: editingQuote ? editingQuote.id : `orc-${Date.now()}`,
      number: quoteNumber,
      clientId: client.id,
      clientName: client.name,
      clientDocument: client.document,
      clientPhone: client.phone,
      clientAddress: `${client.address.street}, ${client.address.number} - ${client.address.city}/${client.address.state}`,
      machineId: machine?.id,
      machineName: machine?.name,
      issueDate: today.toISOString().split('T')[0],
      validUntil: validDate.toISOString().split('T')[0],
      status: editingQuote ? editingQuote.status : 'sent',
      items: formData.items,
      subtotalServices,
      subtotalHH,
      subtotalParts,
      discountAmount: Number(formData.discount),
      totalAmount: totalCalculated,
      paymentTerms: formData.paymentTerms,
      estimatedExecutionDays: Number(formData.estimatedDays),
      notes: formData.notes,
      workOrderId: editingQuote?.workOrderId,
    };

    onSaveQuote(quoteToSave);
    setIsEditorOpen(false);
  };

  const handleConfirmApproval = () => {
    if (!approvingQuote) return;

    // Disparar celebração visual
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onApproveQuote(approvingQuote.id, assignTechId, assignDate);
    setApprovingQuote(null);
  };

  // Gerar texto para WhatsApp
  const generateWhatsAppProposal = (q: Quote) => {
    const text = `*PROPOSTA COMERCIAL ${q.number}*
*${company.tradeName}*

Olá, segue o orçamento para *${q.clientName}*:
Equipamento: ${q.machineName || 'Serviços Técnicos Gerais'}

*Itens da Proposta:*
${q.items.map((it) => `• ${it.description}: ${formatCurrency(it.totalPrice)}`).join('\n')}

*Total do Orçamento: ${formatCurrency(q.totalAmount)}*
Condição: ${q.paymentTerms}
Prazo estimado: ${q.estimatedExecutionDays} dias úteis
Validade: até ${q.validUntil}

Para aprovar e agendarmos a execução técnica, basta responder a esta mensagem.`;

    const cleanPhone = (q.clientPhone || '').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Orçamentos & Propostas Comerciais
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gere orçamentos com cálculo por Homem-Hora (H.H.) ou preço fixo, indique serviços fechados e converta em Ordem de Serviço (OS).
          </p>
        </div>

        <button
          onClick={() => handleOpenNewQuote()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Gerar Novo Orçamento
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por número, cliente ou máquina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'sent', label: 'Enviados' },
            { id: 'approved', label: 'Fechados / Aprovados' },
            { id: 'draft', label: 'Rascunhos' },
            { id: 'rejected', label: 'Recusados' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Nenhum orçamento encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const isApproved = quote.status === 'approved';
            const isSent = quote.status === 'sent';

            return (
              <div
                key={quote.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {quote.number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSent
                          ? 'bg-amber-100 text-amber-800'
                          : quote.status === 'draft'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isApproved
                        ? 'Serviço Fechado'
                        : isSent
                        ? 'Enviado ao Cliente'
                        : quote.status === 'draft'
                        ? 'Rascunho'
                        : 'Recusado'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">
                    {quote.clientName}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{quote.machineName || 'Manutenção Técnica Geral'}</span>
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Emissão: {quote.issueDate}
                    </span>
                    <span>Validade: {quote.validUntil}</span>
                  </div>

                  {/* Resumo de itens */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700">Composição do Valor:</p>
                    {quote.subtotalServices > 0 && (
                      <div className="flex justify-between">
                        <span>Serviços Fixos:</span>
                        <span className="font-mono">{formatCurrency(quote.subtotalServices)}</span>
                      </div>
                    )}
                    {quote.subtotalHH > 0 && (
                      <div className="flex justify-between text-indigo-700 font-medium">
                        <span>Horas Técnicas (H.H.):</span>
                        <span className="font-mono">{formatCurrency(quote.subtotalHH)}</span>
                      </div>
                    )}
                    {quote.subtotalParts > 0 && (
                      <div className="flex justify-between">
                        <span>Peças & Materiais:</span>
                        <span className="font-mono">{formatCurrency(quote.subtotalParts)}</span>
                      </div>
                    )}
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Desconto:</span>
                        <span className="font-mono">-{formatCurrency(quote.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Valor Total</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(quote.totalAmount)}
                    </span>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="space-y-2">
                    {/* Botão de Fechar / Aprovar se não aprovado */}
                    {!isApproved ? (
                      <button
                        onClick={() => {
                          setApprovingQuote(quote);
                          setAssignTechId(technicians[0]?.id || '');
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Fechar Serviço (Gerar OS)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (quote.workOrderId) onNavigateToWorkOrder(quote.workOrderId);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-xl transition-all border border-blue-200"
                      >
                        <Clock className="w-4 h-4" />
                        Ver Ordem de Serviço Aberta &rarr;
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        onClick={() => setViewingQuote(quote)}
                        className="flex-1 flex items-center justify-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs py-1.5 rounded-lg font-semibold"
                        title="Ver Proposta Formatada"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Proposta
                      </button>

                      <button
                        onClick={() => generateWhatsAppProposal(quote)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                        title="Enviar no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditQuote(quote)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir orçamento ${quote.number}?`)) {
                            onDeleteQuote(quote.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: CRIAR / EDITAR ORÇAMENTO COM CÁLCULO DE H.H. */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                {editingQuote ? `Editar Orçamento ${editingQuote.number}` : 'Elaborar Nova Proposta Comercial'}
              </h2>
              <button onClick={() => setIsEditorOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuoteSubmit} className="space-y-5 mt-4 text-xs">
              {/* Seleção de Cliente e Máquina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => {
                      const newClientId = e.target.value;
                      const cMachines = machines.filter((m) => m.clientId === newClientId);
                      setFormData({
                        ...formData,
                        clientId: newClientId,
                        machineId: cMachines[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Máquina / Equipamento Envolvido</label>
                  <select
                    value={formData.machineId}
                    onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="">Manutenção Geral / Não vinculada a máquina específica</option>
                    {machines
                      .filter((m) => m.clientId === formData.clientId)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - SN: {m.serialNumber}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Tabela Dinâmica de Itens do Orçamento */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Itens da Proposta (Serviços Tabelados, Horas H.H. e Peças)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItem('service_fixed')}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border border-blue-200"
                    >
                      + Serviço Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('service_hh')}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 border border-indigo-200"
                    >
                      + Horas H.H.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('part_material')}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 border border-amber-200"
                    >
                      + Peça / Material
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center"
                    >
                      {/* Tipo */}
                      <div className="col-span-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.type === 'service_hh'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.type === 'part_material'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type === 'service_hh' ? 'H.H.' : item.type === 'part_material' ? 'Peça' : 'Fixo'}
                        </span>
                      </div>

                      {/* Descrição */}
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                          placeholder="Descrição do item..."
                        />
                      </div>

                      {/* Qtd / Horas */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-center font-bold"
                          />
                          <span className="text-[10px] text-slate-400">
                            {item.type === 'service_hh' ? 'h' : 'un'}
                          </span>
                        </div>
                      </div>

                      {/* Preço Unitário */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, { unitPrice: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-right font-mono"
                        />
                      </div>

                      {/* Excluir */}
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais e Desconto */}
              <div className="p-4 bg-slate-900 text-white rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Serviços Fixos</span>
                  <p className="font-bold font-mono">{formatCurrency(subtotalServices)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 uppercase">Homem-Hora (H.H.)</span>
                  <p className="font-bold font-mono text-indigo-300">{formatCurrency(subtotalHH)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Peças / Materiais</span>
                  <p className="font-bold font-mono">{formatCurrency(subtotalParts)}</p>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">VALOR TOTAL LÍQUIDO</span>
                  <p className="text-lg font-bold font-mono text-emerald-400">{formatCurrency(totalCalculated)}</p>
                </div>
              </div>

              {/* Condições Comerciais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Desconto Comercial (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validade da Proposta (Dias)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prazo de Execução (Dias Úteis)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Condição de Pagamento</label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Observações Técnicas / Garantia</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-sm"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APROVAÇÃO & FECHAMENTO DO SERVIÇO (GERAR ORDEM DE SERVIÇO) */}
      {approvingQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Fechar Serviço & Agendar</h2>
              <p className="text-xs text-slate-500 mt-1">
                Aprovar a proposta comercial <span className="font-mono font-bold text-slate-800">{approvingQuote.number}</span> e gerar a Ordem de Serviço na agenda técnica.
              </p>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Técnico Responsável pela Execução *</label>
                <select
                  value={assignTechId}
                  onChange={(e) => setAssignTechId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data Agendada para Início *</label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <p className="font-semibold">Resumo do Fechamento:</p>
                <p className="mt-1">
                  Cliente: <span className="font-bold">{approvingQuote.clientName}</span>
                </p>
                <p>
                  Valor Fechado: <span className="font-bold">{formatCurrency(approvingQuote.totalAmount)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApprovingQuote(null)}
                className="px-4 py-2 font-medium text-slate-600 rounded-xl hover:bg-slate-100 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20 text-xs"
              >
                Confirmar Fechamento & Gerar OS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUALIZAR PROPOSTA COMERCIAL FORMATADA (PARA IMPRESSÃO / PDF) */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8 printable-area">
            {/* Topo da Proposta: Identidade da Empresa */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
              <div>
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                  {company.corporateName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">Nome Fantasia: {company.tradeName}</p>
                <p className="text-xs text-slate-600">CNPJ: {company.cnpj} {company.stateRegistration ? `• IE: ${company.stateRegistration}` : ''}</p>
                <p className="text-xs text-slate-600">
                  {company.address.street}, {company.address.number} - {company.address.city}/{company.address.state}
                </p>
                <p className="text-xs text-slate-600">Tel: {company.phone} • WhatsApp: {company.whatsapp}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded">
                  {viewingQuote.number}
                </span>
                <p className="text-xs text-slate-500 mt-2">Emissão: {viewingQuote.issueDate}</p>
                <p className="text-xs font-semibold text-slate-800">Validade: {viewingQuote.validUntil}</p>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-semibold">Cliente Destinatário</span>
                <p className="font-bold text-slate-900 text-sm">{viewingQuote.clientName}</p>
                <p className="text-slate-600">CNPJ/CPF: {viewingQuote.clientDocument}</p>
                <p className="text-slate-600">{viewingQuote.clientAddress}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-semibold">Equipamento Objeto</span>
                <p className="font-bold text-slate-900 text-sm">{viewingQuote.machineName || 'Manutenção Técnica Geral'}</p>
                <p className="text-slate-600 mt-1">Prazo de Execução: {viewingQuote.estimatedExecutionDays} dias úteis</p>
              </div>
            </div>

            {/* Discriminativo de Serviços */}
            <table className="w-full text-xs text-left my-4">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2">Item / Descrição Técnica</th>
                  <th className="py-2 text-center">Tipo</th>
                  <th className="py-2 text-center">Qtd / Horas</th>
                  <th className="py-2 text-right">Valor Unit.</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingQuote.items.map((it, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 font-medium text-slate-900">{it.description}</td>
                    <td className="py-2.5 text-center text-slate-500 uppercase text-[10px]">{it.type.replace('_', ' ')}</td>
                    <td className="py-2.5 text-center font-bold text-slate-700">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{formatCurrency(it.unitPrice)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resumo Financeiro */}
            <div className="pt-4 border-t-2 border-slate-300 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Serviços & H.H.:</span>
                  <span className="font-mono">{formatCurrency(viewingQuote.subtotalServices + viewingQuote.subtotalHH)}</span>
                </div>
                {viewingQuote.subtotalParts > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Peças:</span>
                    <span className="font-mono">{formatCurrency(viewingQuote.subtotalParts)}</span>
                  </div>
                )}
                {viewingQuote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto Concedido:</span>
                    <span className="font-mono">-{formatCurrency(viewingQuote.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>VALOR TOTAL:</span>
                  <span className="font-mono text-base">{formatCurrency(viewingQuote.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Condições & Dados de Pagamento */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
              <p className="font-bold text-slate-900">Condições Comerciais:</p>
              <p className="text-slate-700">Forma de Pagamento: {viewingQuote.paymentTerms}</p>
              {company.pixKey && (
                <p className="text-slate-700 font-mono">
                  Chave PIX para pagamento: <span className="font-bold text-slate-900">{company.pixKey}</span> ({company.pixKeyType.toUpperCase()})
                </p>
              )}
              {viewingQuote.notes && <p className="text-slate-500 italic mt-2">{viewingQuote.notes}</p>}
            </div>

            {/* Botões do Modal */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setViewingQuote(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Fechar
              </button>
              <button
                onClick={() => generateWhatsAppProposal(viewingQuote)}
                className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Enviar WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
