import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Cpu,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Building,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { Client, Machine, Quote, WorkOrder, CompanyProfile } from '../types';
import { estimateDistanceKm } from '../lib/distanceCalculator';

interface ClientsViewProps {
  clients: Client[];
  machines: Machine[];
  quotes: Quote[];
  workOrders: WorkOrder[];
  company: CompanyProfile;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSelectMachine: (machine: Machine) => void;
  onNewMachineForClient: (clientId: string) => void;
  onNewQuoteForClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  machines,
  quotes,
  workOrders,
  company,
  onSaveClient,
  onDeleteClient,
  onSelectMachine,
  onNewMachineForClient,
  onNewQuoteForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tradeName: '',
    document: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: '',
    distanceKm: 0,
    notes: '',
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      c.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientMachines = machines.filter(
    (m) => m.clientId === selectedClient?.id
  );
  const clientQuotes = quotes.filter((q) => q.clientId === selectedClient?.id);
  const clientWorkOrders = workOrders.filter(
    (w) => w.clientId === selectedClient?.id
  );

  const calculateAutoDistance = (city: string, zip: string) => {
    return estimateDistanceKm(
      company.address?.city || 'São Paulo',
      company.address?.zipCode || '',
      city || 'São Paulo',
      zip || ''
    );
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    const initialCity = company.address?.city || 'São Paulo';
    const initialDistance = calculateAutoDistance(initialCity, '');
    setFormData({
      name: '',
      tradeName: '',
      document: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: initialCity,
      state: company.address?.state || 'SP',
      zipCode: '',
      distanceKm: initialDistance,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    const dist =
      client.distanceKm ??
      calculateAutoDistance(client.address.city, client.address.zipCode);
    setFormData({
      name: client.name,
      tradeName: client.tradeName || '',
      document: client.document,
      contactPerson: client.contactPerson || '',
      phone: client.phone,
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement || '',
      neighborhood: client.address.neighborhood,
      city: client.address.city,
      state: client.address.state,
      zipCode: client.address.zipCode,
      distanceKm: dist,
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.document.trim()) {
      alert('Nome/Razão Social e CPF/CNPJ são obrigatórios.');
      return;
    }

    const calculatedDist =
      formData.distanceKm > 0
        ? formData.distanceKm
        : calculateAutoDistance(formData.city, formData.zipCode);

    const clientToSave: Client = {
      id: editingClient ? editingClient.id : `cli-${Date.now()}`,
      name: formData.name,
      tradeName: formData.tradeName,
      document: formData.document,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      email: formData.email,
      distanceKm: calculatedDist,
      address: {
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      notes: formData.notes,
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
    };

    onSaveClient(clientToSave);
    setSelectedClientId(clientToSave.id);
    setIsModalOpen(false);
  };

  const formatWhatsAppLink = (number: string) => {
    const clean = number.replace(/\D/g, '');
    const fullNumber = clean.length <= 11 ? `55${clean}` : clean;
    return `https://wa.me/${fullNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Gestão de Clientes & Máquinas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cadastre seus clientes, consulte os equipamentos de cada um e acesse histórico técnico.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Grid Principal: Lista à Esquerda e Ficha Detalhada à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Esquerdo: Lista de Clientes com Busca (4 Colunas) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[750px]">
          {/* Busca */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-slate-400 mb-2">
            <span>{filteredClients.length} clientes encontrados</span>
          </div>

          {/* Lista com Scroll */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredClients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhum cliente encontrado com os filtros atuais.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = client.id === selectedClient?.id;
                const machineCount = machines.filter((m) => m.clientId === client.id).length;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {client.name}
                        </p>
                        {client.tradeName && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {client.tradeName}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                        {client.document}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address.city} - {client.address.state}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600 shrink-0">
                        <Cpu className="w-3 h-3" />
                        {machineCount} {machineCount === 1 ? 'máquina' : 'máquinas'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Ficha Detalhada do Cliente Selecionado (7 Colunas) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[750px] flex flex-col">
          {selectedClient ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Topo do Cliente */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Cliente Ativo
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Doc: {selectedClient.document}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedClient.name}
                  </h2>
                  {selectedClient.tradeName && (
                    <p className="text-xs text-slate-500">
                      Nome Fantasia: {selectedClient.tradeName}
                    </p>
                  )}
                  {selectedClient.contactPerson && (
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Responsável: {selectedClient.contactPerson}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedClient)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir o cliente ${selectedClient.name}?`)) {
                        onDeleteClient(selectedClient.id);
                      }
                    }}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNewQuoteForClient(selectedClient)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Gerar Orçamento
                  </button>
                </div>
              </div>

              {/* Informações de Contato e Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Contatos */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    Canais de Contato
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Telefone:</span>
                    <span className="font-medium text-slate-800">{selectedClient.phone}</span>
                  </div>
                  {selectedClient.whatsapp && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">WhatsApp:</span>
                      <a
                        href={formatWhatsAppLink(selectedClient.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {selectedClient.whatsapp}
                      </a>
                    </div>
                  )}
                  {selectedClient.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">E-mail:</span>
                      <a
                        href={`mailto:${selectedClient.email}`}
                        className="font-medium text-blue-600 hover:underline truncate max-w-[180px]"
                      >
                        {selectedClient.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Endereço & Quilometragem */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      Localização & Acesso
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                        `${company.address.street || ''} ${company.address.city || ''} ${company.address.state || ''}`
                      )}&destination=${encodeURIComponent(
                        `${selectedClient.address.street} ${selectedClient.address.number} ${selectedClient.address.city} ${selectedClient.address.state}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      Traçar Rota GPS
                    </a>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {selectedClient.address.street}, {selectedClient.address.number}
                    {selectedClient.address.complement ? ` - ${selectedClient.address.complement}` : ''}
                  </p>
                  <p className="text-slate-500">
                    {selectedClient.address.neighborhood} - {selectedClient.address.city}/{selectedClient.address.state}
                  </p>
                  {selectedClient.address.zipCode && (
                    <p className="text-slate-400 font-mono">CEP: {selectedClient.address.zipCode}</p>
                  )}

                  {/* Informações de Quilometragem */}
                  <div className="mt-2 pt-2 border-t border-slate-200/80 bg-blue-50/60 p-2 rounded-lg">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Distância da Sede:</span>
                      <span className="font-bold text-blue-900 font-mono">
                        {selectedClient.distanceKm ?? 15} km (Ida)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-0.5">
                      <span className="text-slate-600 font-medium">Ida e Volta:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {(selectedClient.distanceKm ?? 15) * 2} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-0.5 pt-1 border-t border-blue-200/60">
                      <span className="text-slate-700 font-semibold">Valor Deslocamento ({company.kmRate ? `R$ ${company.kmRate.toFixed(2)}/km` : 'R$ 2,50/km'}):</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        R$ {(((selectedClient.distanceKm ?? 15) * 2) * (company.kmRate || 2.5)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                  <span className="font-semibold">Notas de Acesso / Segurança: </span>
                  {selectedClient.notes}
                </div>
              )}

              {/* Aba Principal: Máquinas do Cliente */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Máquinas & Equipamentos do Cliente ({clientMachines.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onNewMachineForClient(selectedClient.id)}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Máquina
                  </button>
                </div>

                <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-72">
                  {clientMachines.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      Nenhuma máquina cadastrada para este cliente ainda.
                      <div className="mt-2">
                        <button
                          onClick={() => onNewMachineForClient(selectedClient.id)}
                          className="text-blue-600 font-semibold underline text-xs"
                        >
                          Clique para cadastrar a primeira máquina
                        </button>
                      </div>
                    </div>
                  ) : (
                    clientMachines.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onSelectMachine(m)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {m.photoUrl ? (
                            <img
                              src={m.photoUrl}
                              alt={m.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <Cpu className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                                {m.name}
                              </p>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                  m.criticality === 'critica'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {m.criticality}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {m.brand} • Modelo: {m.model} • Série:{' '}
                              <span className="font-mono text-slate-700">{m.serialNumber}</span>
                            </p>
                            {m.locationInClient && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Setor: {m.locationInClient}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right text-[11px] hidden sm:block">
                            <p className="text-slate-400">Última revisão:</p>
                            <p className="font-medium text-slate-700">
                              {m.lastMaintenanceDate || 'Sem registro'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Histórico Resumido de Serviços Fechados (OS) */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Ordens de Serviço ({clientWorkOrders.length})</span>
                  <span>Orçamentos Gerados ({clientQuotes.length})</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Faturado no Cliente:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {clientWorkOrders
                      .reduce((acc, curr) => acc + curr.totalValue, 0)
                      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm flex-1 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-slate-300 mb-2" />
              Selecione um cliente ao lado ou cadastre um novo para visualizar detalhes.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro / Edição de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Metalúrgica Aliança Ltda"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Ex: Metalúrgica Aliança"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNPJ ou CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="Ex: 12.345.678/0001-90"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável / Contato
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ex: Roberto Santos (Gerente)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone Fixo
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: (11) 4002-8922"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: compras@empresa.com.br"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Endereço */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-2">Endereço de Atendimento</p>
                </div>

                <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Logradouro (Rua/Av)</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Ex: Av. Industrial"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Ex: 500"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Complemento / Galpão</label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    placeholder="Ex: Bloco B / Galpão 3"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Ex: Centro Industrial"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">UF / CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      className="w-14 px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                    />
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="CEP"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Bloco de Quilometragem e Deslocamento */}
                <div className="sm:col-span-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-amber-600" />
                      Quilometragem da Sede até o Cliente
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const calculated = calculateAutoDistance(formData.city, formData.zipCode);
                        setFormData({ ...formData, distanceKm: calculated });
                      }}
                      className="text-[11px] bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded transition-colors"
                    >
                      Recalcular Distância
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Distância em Km (Só Ida)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={formData.distanceKm}
                          onChange={(e) =>
                            setFormData({ ...formData, distanceKm: Math.max(1, Number(e.target.value)) })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">
                          km
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ida e Volta Total
                      </label>
                      <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800">
                        {formData.distanceKm * 2} km
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Custo Estimado ({company.kmRate ? `R$ ${company.kmRate.toFixed(2)}/km` : 'R$ 2,50/km'})
                      </label>
                      <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800">
                        R$ {((formData.distanceKm * 2) * (company.kmRate || 2.5)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Calculado da sede em {company.address.city || 'sua cidade'} até {formData.city || 'o cliente'}. Este valor é sugerido automaticamente na elaboração de orçamentos.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instruções de Acesso / EPIs Obrigatórios
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Portaria de carga na rua lateral. Obrigatório bota com biqueira e protetor auricular."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
