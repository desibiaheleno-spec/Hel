import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Edit2,
  Trash2,
  Key,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Check,
  X,
  Search,
} from 'lucide-react';
import { Technician, WorkOrder } from '../types';

interface TechniciansManagementViewProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  onSaveTechnician: (tech: Technician) => void;
  onDeleteTechnician: (id: string) => void;
  onSimulateTechnicianLogin: (techId: string) => void;
}

export const TechniciansManagementView: React.FC<TechniciansManagementViewProps> = ({
  technicians,
  workOrders,
  onSaveTechnician,
  onDeleteTechnician,
  onSimulateTechnicianLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    accessCode: '1004',
    password: '',
    active: true,
    color: '#2563eb',
  });

  const filteredTechs = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingTech(null);
    const code = (1000 + technicians.length + 1).toString();
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: 'Técnico Mecânico',
      accessCode: code,
      password: code,
      active: true,
      color: '#2563eb',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tech: Technician) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialty: tech.specialty,
      accessCode: tech.accessCode,
      password: tech.password || tech.accessCode,
      active: tech.active,
      color: tech.color || '#2563eb',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.accessCode.trim()) return;

    const techToSave: Technician = {
      id: editingTech ? editingTech.id : `tech-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      accessCode: formData.accessCode,
      password: formData.password || formData.accessCode,
      active: formData.active,
      color: formData.color,
    };

    onSaveTechnician(techToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-blue-600" />
            Colaboradores Técnicos & Controle de Acesso
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cadastre os membros da equipe técnica, defina suas especialidades e códigos de acesso para consulta exclusiva aos serviços fechados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Colaborador
        </button>
      </div>

      {/* Grid de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Nenhum colaborador cadastrado no banco de dados. Clique em "+ Novo Colaborador" para cadastrar sua equipe técnica.
          </div>
        ) : (
          filteredTechs.map((tech) => {
            const assignedOrders = workOrders.filter((w) => w.technicianId === tech.id);
            const activeOrders = assignedOrders.filter(
              (w) => w.status === 'em_andamento' || w.status === 'agendada'
            );

            return (
              <div
                key={tech.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: tech.color || '#2563eb' }}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{tech.name}</h3>
                      <p className="text-xs text-slate-500">{tech.specialty}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tech.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tech.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      Código de Acesso PIN:
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tech.accessCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Telefone:
                    </span>
                    <span className="text-slate-700">{tech.phone || 'Não informado'}</span>
                  </div>

                  {tech.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        E-mail:
                      </span>
                      <span className="text-slate-700 truncate max-w-40">{tech.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-600 px-1">
                  <span>Ordens em Aberto:</span>
                  <span className="font-bold text-blue-700">{activeOrders.length} OS</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSimulateTechnicianLogin(tech.id)}
                  className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs py-2 rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  Acessar como Técnico
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(tech)}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover colaborador ${tech.name}?`)) {
                        onDeleteTechnician(tech.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Modal de Criação / Edição de Colaborador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-600" />
                {editingTech ? 'Editar Colaborador' : 'Novo Colaborador Técnico'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Especialidade Técnica *</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Especialista em Compressores & Refrigeração"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Acesso (PIN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.accessCode}
                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                    placeholder="1001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Senha de Login do Colaborador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ex: 1001 ou senha segura"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Usada pelo técnico para entrar na tela de Ordens de Serviço. Pode ser o próprio PIN ou uma senha pessoal.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail do Colaborador</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tecnico@empresa.com.br"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cor na Agenda</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="activeTech"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="activeTech" className="font-semibold text-slate-700">
                    Colaborador Ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-sm"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
