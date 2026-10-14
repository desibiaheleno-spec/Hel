import {
  CompanyProfile,
  Client,
  Machine,
  ServiceItem,
  HHRate,
  Technician,
  Quote,
  WorkOrder,
  MaintenancePhoto,
} from '../types';
import { getSupabaseClient } from './supabaseClient';
import { SupabaseService, EMPTY_COMPANY } from './supabaseService';

const STORAGE_KEYS = {
  COMPANY: 'tecnogest_company_data_v2',
  CLIENTS: 'tecnogest_clients_data_v2',
  MACHINES: 'tecnogest_machines_data_v2',
  SERVICES: 'tecnogest_services_data_v2',
  HH_RATES: 'tecnogest_hh_rates_data_v2',
  TECHNICIANS: 'tecnogest_technicians_data_v2',
  QUOTES: 'tecnogest_quotes_data_v2',
  WORK_ORDERS: 'tecnogest_work_orders_data_v2',
};

// Dados padrão estritamente limpos (sem mocks fictícios)
const DEFAULT_COMPANY: CompanyProfile = {
  id: 'comp-01',
  corporateName: '',
  tradeName: 'Minha Empresa de Serviços',
  cnpj: '',
  stateRegistration: '',
  phone: '',
  whatsapp: '',
  email: '',
  adminLogin: 'admin@empresa.com',
  adminPassword: 'admin123',
  kmRate: 2.5,
  website: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
  },
  pixKeyType: 'cnpj',
  pixKey: '',
  defaultWarrantyDays: 90,
  defaultPaymentTerms: '50% sinal na aprovação + 50% na conclusão',
  quoteNotes: 'Proposta técnica válida por 15 dias. Valores incluem encargos e ferramental padrão.',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Erro ao carregar dados da chave ${key}`, error);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar dados na chave ${key}`, error);
  }
}

export const StorageService = {
  // Inicialização e sincronização inicial com Supabase
  async loadFromSupabaseIfAvailable() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const [dbCompany, dbClients, dbServices, dbHHRates, dbTechs, dbQuotes, dbWorkOrders] =
        await Promise.all([
          SupabaseService.fetchCompany(),
          SupabaseService.fetchClients(),
          SupabaseService.fetchServices(),
          SupabaseService.fetchHHRates(),
          SupabaseService.fetchTechnicians(),
          SupabaseService.fetchQuotes(),
          SupabaseService.fetchWorkOrders(),
        ]);

      if (dbCompany) setStored(STORAGE_KEYS.COMPANY, dbCompany);
      if (dbClients) setStored(STORAGE_KEYS.CLIENTS, dbClients);

      const clientsMap = new Map((dbClients || []).map((c) => [c.id, c.name]));
      const dbMachines = await SupabaseService.fetchMachines(clientsMap);
      if (dbMachines) setStored(STORAGE_KEYS.MACHINES, dbMachines);

      if (dbServices) setStored(STORAGE_KEYS.SERVICES, dbServices);
      if (dbHHRates) setStored(STORAGE_KEYS.HH_RATES, dbHHRates);
      if (dbTechs) setStored(STORAGE_KEYS.TECHNICIANS, dbTechs);
      if (dbQuotes) setStored(STORAGE_KEYS.QUOTES, dbQuotes);
      if (dbWorkOrders) setStored(STORAGE_KEYS.WORK_ORDERS, dbWorkOrders);

      return true;
    } catch (e) {
      console.warn('Erro ao carregar dados do Supabase:', e);
      return false;
    }
  },

  // --- EMPRESA ---
  getCompany(): CompanyProfile {
    return getStored<CompanyProfile>(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
  },
  saveCompany(company: CompanyProfile): void {
    setStored(STORAGE_KEYS.COMPANY, company);
    SupabaseService.saveCompany(company).catch((err) =>
      console.warn('Erro ao salvar empresa no Supabase:', err)
    );
  },

  // --- CLIENTES ---
  getClients(): Client[] {
    return getStored<Client[]>(STORAGE_KEYS.CLIENTS, []);
  },
  saveClient(client: Client): Client {
    const list = this.getClients();
    const index = list.findIndex((c) => c.id === client.id);
    if (index >= 0) {
      list[index] = client;
    } else {
      list.unshift(client);
    }
    setStored(STORAGE_KEYS.CLIENTS, list);

    SupabaseService.saveClient(client).then((dbClient) => {
      if (dbClient && dbClient.id !== client.id) {
        // Atualiza com o UUID oficial gerado pelo Supabase
        const currentList = this.getClients();
        const idx = currentList.findIndex((c) => c.id === client.id);
        if (idx >= 0) {
          currentList[idx] = dbClient;
          setStored(STORAGE_KEYS.CLIENTS, currentList);
        }
      }
    }).catch(console.warn);

    return client;
  },
  deleteClient(id: string): void {
    const list = this.getClients().filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CLIENTS, list);
    SupabaseService.deleteClient(id).catch(console.warn);
  },

  // --- MÁQUINAS ---
  getMachines(): Machine[] {
    return getStored<Machine[]>(STORAGE_KEYS.MACHINES, []);
  },
  getMachinesByClient(clientId: string): Machine[] {
    return this.getMachines().filter((m) => m.clientId === clientId);
  },
  saveMachine(machine: Machine): Machine {
    const list = this.getMachines();
    const index = list.findIndex((m) => m.id === machine.id);
    if (index >= 0) {
      list[index] = machine;
    } else {
      list.unshift(machine);
    }
    setStored(STORAGE_KEYS.MACHINES, list);

    SupabaseService.saveMachine(machine).then((dbMachine) => {
      if (dbMachine && dbMachine.id !== machine.id) {
        const currentList = this.getMachines();
        const idx = currentList.findIndex((m) => m.id === machine.id);
        if (idx >= 0) {
          currentList[idx] = dbMachine;
          setStored(STORAGE_KEYS.MACHINES, currentList);
        }
      }
    }).catch(console.warn);

    return machine;
  },
  deleteMachine(id: string): void {
    const list = this.getMachines().filter((m) => m.id !== id);
    setStored(STORAGE_KEYS.MACHINES, list);
    SupabaseService.deleteMachine(id).catch(console.warn);
  },

  // --- SERVIÇOS DO CATÁLOGO ---
  getServices(): ServiceItem[] {
    return getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, []);
  },
  saveService(service: ServiceItem): ServiceItem {
    const list = this.getServices();
    const index = list.findIndex((s) => s.id === service.id);
    if (index >= 0) {
      list[index] = service;
    } else {
      list.unshift(service);
    }
    setStored(STORAGE_KEYS.SERVICES, list);
    SupabaseService.saveService(service).catch(console.warn);
    return service;
  },
  deleteService(id: string): void {
    const list = this.getServices().filter((s) => s.id !== id);
    setStored(STORAGE_KEYS.SERVICES, list);
    SupabaseService.deleteService(id).catch(console.warn);
  },

  // --- TABELA H.H. (HOMEM-HORA) ---
  getHHRates(): HHRate[] {
    return getStored<HHRate[]>(STORAGE_KEYS.HH_RATES, []);
  },
  saveHHRate(rate: HHRate): HHRate {
    const list = this.getHHRates();
    const index = list.findIndex((r) => r.id === rate.id);
    if (index >= 0) {
      list[index] = rate;
    } else {
      list.push(rate);
    }
    setStored(STORAGE_KEYS.HH_RATES, list);
    SupabaseService.saveHHRate(rate).catch(console.warn);
    return rate;
  },
  deleteHHRate(id: string): void {
    const list = this.getHHRates().filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.HH_RATES, list);
    SupabaseService.deleteHHRate(id).catch(console.warn);
  },

  // --- TÉCNICOS / COLABORADORES ---
  getTechnicians(): Technician[] {
    return getStored<Technician[]>(STORAGE_KEYS.TECHNICIANS, []);
  },
  saveTechnician(tech: Technician): Technician {
    const list = this.getTechnicians();
    const index = list.findIndex((t) => t.id === tech.id);
    if (index >= 0) {
      list[index] = tech;
    } else {
      list.push(tech);
    }
    setStored(STORAGE_KEYS.TECHNICIANS, list);
    SupabaseService.saveTechnician(tech).catch(console.warn);
    return tech;
  },
  deleteTechnician(id: string): void {
    const list = this.getTechnicians().filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.TECHNICIANS, list);
    SupabaseService.deleteTechnician(id).catch(console.warn);
  },

  // --- ORÇAMENTOS ---
  getQuotes(): Quote[] {
    return getStored<Quote[]>(STORAGE_KEYS.QUOTES, []);
  },
  saveQuote(quote: Quote): Quote {
    const list = this.getQuotes();
    const index = list.findIndex((q) => q.id === quote.id);
    if (index >= 0) {
      list[index] = quote;
    } else {
      list.unshift(quote);
    }
    setStored(STORAGE_KEYS.QUOTES, list);
    SupabaseService.saveQuote(quote).catch(console.warn);
    return quote;
  },
  deleteQuote(id: string): void {
    const list = this.getQuotes().filter((q) => q.id !== id);
    setStored(STORAGE_KEYS.QUOTES, list);
    SupabaseService.deleteQuote(id).catch(console.warn);
  },

  // Aprovar Orçamento e criar Ordem de Serviço Fechada automaticamente
  approveQuoteAndCreateWorkOrder(quoteId: string, technicianId?: string, scheduledDate?: string): { quote: Quote; workOrder: WorkOrder } {
    const quotes = this.getQuotes();
    const quoteIndex = quotes.findIndex((q) => q.id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Orçamento não encontrado');
    }

    const quote = quotes[quoteIndex];
    quote.status = 'approved';
    quote.closedAt = new Date().toISOString();

    const technicians = this.getTechnicians();
    const selectedTech = technicians.find((t) => t.id === technicianId) || technicians[0];

    const workOrders = this.getWorkOrders();
    const nextNum = (workOrders.length + 1).toString().padStart(4, '0');
    const osNumber = `OS-${new Date().getFullYear()}-${nextNum}`;

    const itemsSummary = quote.items.map((it) => `- ${it.description} (Qtd: ${it.quantity})`).join('\n');
    const scopeDesc = `Execução técnica ref. Orçamento ${quote.number}:\n${itemsSummary}`;

    const newWorkOrder: WorkOrder = {
      id: `os-${Date.now()}`,
      number: osNumber,
      quoteId: quote.id,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      machineId: quote.machineId,
      machineName: quote.machineName,
      technicianId: selectedTech?.id,
      technicianName: selectedTech?.name || 'Técnico a definir',
      scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '08:30',
      status: 'agendada',
      scopeDescription: scopeDesc,
      actualHoursWorked: 0,
      photos: [],
      totalValue: quote.totalAmount,
      paymentStatus: 'pendente',
      createdAt: new Date().toISOString(),
    };

    quote.workOrderId = newWorkOrder.id;
    quotes[quoteIndex] = quote;
    setStored(STORAGE_KEYS.QUOTES, quotes);
    SupabaseService.saveQuote(quote).catch(console.warn);

    workOrders.unshift(newWorkOrder);
    setStored(STORAGE_KEYS.WORK_ORDERS, workOrders);
    SupabaseService.saveWorkOrder(newWorkOrder).catch(console.warn);

    return { quote, workOrder: newWorkOrder };
  },

  // --- ORDENS DE SERVIÇO ---
  getWorkOrders(): WorkOrder[] {
    return getStored<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, []);
  },
  saveWorkOrder(workOrder: WorkOrder): WorkOrder {
    const list = this.getWorkOrders();
    const index = list.findIndex((w) => w.id === workOrder.id);
    if (index >= 0) {
      list[index] = workOrder;
    } else {
      list.unshift(workOrder);
    }
    setStored(STORAGE_KEYS.WORK_ORDERS, list);
    SupabaseService.saveWorkOrder(workOrder).catch(console.warn);

    // Se concluída e tem máquina associada, atualiza última manutenção
    if (workOrder.status === 'concluida' && workOrder.machineId) {
      const machines = this.getMachines();
      const mIdx = machines.findIndex((m) => m.id === workOrder.machineId);
      if (mIdx >= 0) {
        machines[mIdx].lastMaintenanceDate = workOrder.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0];
        setStored(STORAGE_KEYS.MACHINES, machines);
        SupabaseService.saveMachine(machines[mIdx]).catch(console.warn);
      }
    }

    return workOrder;
  },
  deleteWorkOrder(id: string): void {
    const list = this.getWorkOrders().filter((w) => w.id !== id);
    setStored(STORAGE_KEYS.WORK_ORDERS, list);
    SupabaseService.deleteWorkOrder(id).catch(console.warn);
  },

  addPhotoToWorkOrder(workOrderId: string, photo: Omit<MaintenancePhoto, 'id' | 'createdAt'>): WorkOrder {
    const workOrders = this.getWorkOrders();
    const order = workOrders.find((w) => w.id === workOrderId);
    if (!order) throw new Error('Ordem de serviço não encontrada');

    const newPhoto: MaintenancePhoto = {
      ...photo,
      id: `pho-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    order.photos.push(newPhoto);
    this.saveWorkOrder(order);
    return order;
  },

  // Limpar todos os dados armazenados
  clearAll(): void {
    setStored(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
    setStored(STORAGE_KEYS.CLIENTS, []);
    setStored(STORAGE_KEYS.MACHINES, []);
    setStored(STORAGE_KEYS.SERVICES, []);
    setStored(STORAGE_KEYS.HH_RATES, []);
    setStored(STORAGE_KEYS.TECHNICIANS, []);
    setStored(STORAGE_KEYS.QUOTES, []);
    setStored(STORAGE_KEYS.WORK_ORDERS, []);
  },
};
