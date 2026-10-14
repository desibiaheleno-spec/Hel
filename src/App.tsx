import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import {
  CompanyProfile,
  Client,
  Machine,
  ServiceItem,
  HHRate,
  Technician,
  Quote,
  WorkOrder,
  UserRole,
} from './types';

// Componentes do Sistema
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { MachinesView } from './components/MachinesView';
import { ServicesHhView } from './components/ServicesHhView';
import { QuotesView } from './components/QuotesView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { ScheduleView } from './components/ScheduleView';
import { BillingView } from './components/BillingView';
import { CompanyProfileView } from './components/CompanyProfileView';
import { TechniciansManagementView } from './components/TechniciansManagementView';
import { TechnicianPortalView } from './components/TechnicianPortalView';
import { TechnicalReportModal } from './components/TechnicalReportModal';

export default function App() {
  // Estado Global do Sistema
  const [company, setCompany] = useState<CompanyProfile>(() => StorageService.getCompany());
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [machines, setMachines] = useState<Machine[]>(() => StorageService.getMachines());
  const [services, setServices] = useState<ServiceItem[]>(() => StorageService.getServices());
  const [hhRates, setHhRates] = useState<HHRate[]>(() => StorageService.getHHRates());
  const [technicians, setTechnicians] = useState<Technician[]>(() => StorageService.getTechnicians());
  const [quotes, setQuotes] = useState<Quote[]>(() => StorageService.getQuotes());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => StorageService.getWorkOrders());

  // Navegação e Perfil
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const [selectedTechId, setSelectedTechId] = useState<string>(() => technicians[0]?.id || 'tech-01');

  // Modal de Relatório Técnico Geral
  const [viewingReportOrder, setViewingReportOrder] = useState<WorkOrder | null>(null);

  // Recarregar dados após atualização do banco
  const reloadAllData = () => {
    setCompany(StorageService.getCompany());
    setClients(StorageService.getClients());
    setMachines(StorageService.getMachines());
    setServices(StorageService.getServices());
    setHhRates(StorageService.getHHRates());
    setTechnicians(StorageService.getTechnicians());
    setQuotes(StorageService.getQuotes());
    setWorkOrders(StorageService.getWorkOrders());
  };

  // Carregar dados reais diretamente do Supabase ao inicializar
  useEffect(() => {
    StorageService.loadFromSupabaseIfAvailable().then((loaded) => {
      if (loaded) {
        reloadAllData();
      }
    });
  }, []);

  // Handlers de Empresa
  const handleSaveCompany = (updated: CompanyProfile) => {
    StorageService.saveCompany(updated);
    setCompany(updated);
  };

  // Handlers de Clientes
  const handleSaveClient = (client: Client) => {
    const saved = StorageService.saveClient(client);
    setClients(StorageService.getClients());
  };

  const handleDeleteClient = (id: string) => {
    StorageService.deleteClient(id);
    setClients(StorageService.getClients());
  };

  // Handlers de Máquinas
  const handleSaveMachine = (machine: Machine) => {
    const saved = StorageService.saveMachine(machine);
    setMachines(StorageService.getMachines());
  };

  const handleDeleteMachine = (id: string) => {
    StorageService.deleteMachine(id);
    setMachines(StorageService.getMachines());
  };

  // Handlers de Serviços
  const handleSaveService = (service: ServiceItem) => {
    StorageService.saveService(service);
    setServices(StorageService.getServices());
  };

  const handleDeleteService = (id: string) => {
    StorageService.deleteService(id);
    setServices(StorageService.getServices());
  };

  // Handlers de Homem-Hora (H.H.)
  const handleSaveHHRate = (rate: HHRate) => {
    StorageService.saveHHRate(rate);
    setHhRates(StorageService.getHHRates());
  };

  const handleDeleteHHRate = (id: string) => {
    StorageService.deleteHHRate(id);
    setHhRates(StorageService.getHHRates());
  };

  // Handlers de Técnicos
  const handleSaveTechnician = (tech: Technician) => {
    StorageService.saveTechnician(tech);
    setTechnicians(StorageService.getTechnicians());
  };

  const handleDeleteTechnician = (id: string) => {
    StorageService.deleteTechnician(id);
    setTechnicians(StorageService.getTechnicians());
  };

  // Handlers de Orçamentos
  const handleSaveQuote = (quote: Quote) => {
    StorageService.saveQuote(quote);
    setQuotes(StorageService.getQuotes());
  };

  const handleDeleteQuote = (id: string) => {
    StorageService.deleteQuote(id);
    setQuotes(StorageService.getQuotes());
  };

  // Aprovar Orçamento -> Cria Ordem de Serviço Fechada e Agendada
  const handleApproveQuote = (quoteId: string, technicianId: string, scheduledDate: string) => {
    const result = StorageService.approveQuoteAndCreateWorkOrder(
      quoteId,
      technicianId,
      scheduledDate
    );
    setQuotes(StorageService.getQuotes());
    setWorkOrders(StorageService.getWorkOrders());
  };

  // Handlers de Ordens de Serviço
  const handleSaveWorkOrder = (order: WorkOrder) => {
    StorageService.saveWorkOrder(order);
    setWorkOrders(StorageService.getWorkOrders());
    setMachines(StorageService.getMachines()); // Pode ter atualizado data da preventiva
  };

  const handleDeleteWorkOrder = (id: string) => {
    StorageService.deleteWorkOrder(id);
    setWorkOrders(StorageService.getWorkOrders());
  };

  const handleAddPhoto = (workOrderId: string, photo: any) => {
    StorageService.addPhotoToWorkOrder(workOrderId, photo);
    setWorkOrders(StorageService.getWorkOrders());
  };

  // Navegações e atalhos rápidos
  const pendingQuotesCount = quotes.filter((q) => q.status === 'sent' || q.status === 'draft').length;
  const openWorkOrdersCount = workOrders.filter(
    (w) => w.status === 'agendada' || w.status === 'em_andamento' || w.status === 'em_deslocamento'
  ).length;

  const activeTechnician =
    technicians.find((t) => t.id === selectedTechId) || technicians[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        company={company}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        technicians={technicians}
        selectedTechId={selectedTechId}
        setSelectedTechId={setSelectedTechId}
        onOpenNewQuote={() => setActiveTab('quotes')}
        onOpenNewWorkOrder={() => setActiveTab('work_orders')}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex">
        {/* Se estiver no Modo Colaborador Técnico, renderiza o portal direto */}
        {currentRole === 'technician' ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeTechnician ? (
              <TechnicianPortalView
                technician={activeTechnician}
                workOrders={workOrders}
                machines={machines}
                company={company}
                onSaveWorkOrder={handleSaveWorkOrder}
                onSwitchToManager={() => setCurrentRole('manager')}
              />
            ) : (
              <div className="p-8 text-center text-slate-500">
                Nenhum técnico cadastrado. Volte ao modo Gestão e cadastre colaboradores.
              </div>
            )}
          </main>
        ) : (
          /* Modo Gestão com Navegação Lateral */
          <>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pendingQuotesCount={pendingQuotesCount}
              openWorkOrdersCount={openWorkOrdersCount}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {activeTab === 'dashboard' && (
                <DashboardView
                  quotes={quotes}
                  workOrders={workOrders}
                  machines={machines}
                  clients={clients}
                  technicians={technicians}
                  onNavigate={setActiveTab}
                  onOpenNewQuote={() => setActiveTab('quotes')}
                  onOpenNewWorkOrder={() => setActiveTab('work_orders')}
                />
              )}

              {activeTab === 'quotes' && (
                <QuotesView
                  quotes={quotes}
                  clients={clients}
                  machines={machines}
                  services={services}
                  hhRates={hhRates}
                  technicians={technicians}
                  company={company}
                  onSaveQuote={handleSaveQuote}
                  onDeleteQuote={handleDeleteQuote}
                  onApproveQuote={handleApproveQuote}
                  onNavigateToWorkOrder={(woId) => {
                    setActiveTab('work_orders');
                  }}
                />
              )}

              {activeTab === 'work_orders' && (
                <WorkOrdersView
                  workOrders={workOrders}
                  technicians={technicians}
                  clients={clients}
                  machines={machines}
                  company={company}
                  onSaveWorkOrder={handleSaveWorkOrder}
                  onDeleteWorkOrder={handleDeleteWorkOrder}
                  onAddPhoto={handleAddPhoto}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  workOrders={workOrders}
                  technicians={technicians}
                  clients={clients}
                  machines={machines}
                  onSaveWorkOrder={handleSaveWorkOrder}
                  onOpenNewWorkOrder={() => setActiveTab('work_orders')}
                  onSelectWorkOrder={(order) => {
                    setActiveTab('work_orders');
                  }}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsView
                  clients={clients}
                  machines={machines}
                  quotes={quotes}
                  workOrders={workOrders}
                  onSaveClient={handleSaveClient}
                  onDeleteClient={handleDeleteClient}
                  onSelectMachine={(m) => {
                    setActiveTab('machines');
                  }}
                  onNewMachineForClient={(clientId) => {
                    setActiveTab('machines');
                  }}
                  onNewQuoteForClient={(client) => {
                    setActiveTab('quotes');
                  }}
                />
              )}

              {activeTab === 'machines' && (
                <MachinesView
                  machines={machines}
                  clients={clients}
                  workOrders={workOrders}
                  onSaveMachine={handleSaveMachine}
                  onDeleteMachine={handleDeleteMachine}
                  onOpenNewWorkOrderForMachine={(m) => {
                    setActiveTab('work_orders');
                  }}
                  onViewTechnicalReport={(wo) => {
                    setViewingReportOrder(wo);
                  }}
                />
              )}

              {activeTab === 'services' && (
                <ServicesHhView
                  services={services}
                  hhRates={hhRates}
                  onSaveService={handleSaveService}
                  onDeleteService={handleDeleteService}
                  onSaveHHRate={handleSaveHHRate}
                  onDeleteHHRate={handleDeleteHHRate}
                />
              )}

              {activeTab === 'technicians' && (
                <TechniciansManagementView
                  technicians={technicians}
                  workOrders={workOrders}
                  onSaveTechnician={handleSaveTechnician}
                  onDeleteTechnician={handleDeleteTechnician}
                  onSimulateTechnicianLogin={(techId) => {
                    setSelectedTechId(techId);
                    setCurrentRole('technician');
                  }}
                />
              )}

              {activeTab === 'billing' && (
                <BillingView
                  workOrders={workOrders}
                  quotes={quotes}
                  clients={clients}
                  technicians={technicians}
                />
              )}

              {activeTab === 'company' && (
                <CompanyProfileView
                  company={company}
                  onSaveCompany={handleSaveCompany}
                />
              )}
            </main>
          </>
        )}
      </div>

      {/* Modal Global de Relatório Técnico */}
      {viewingReportOrder && (
        <TechnicalReportModal
          workOrder={viewingReportOrder}
          company={company}
          onClose={() => setViewingReportOrder(null)}
        />
      )}
    </div>
  );
}
