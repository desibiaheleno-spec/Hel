export type UserRole = 'manager' | 'technician';

export interface CompanyProfile {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  stateRegistration?: string; // Inscrição Estadual
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pixKeyType: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';
  pixKey: string;
  bankInfo?: {
    bankName: string;
    agency: string;
    account: string;
  };
  logoUrl?: string;
  defaultWarrantyDays: number;
  defaultPaymentTerms: string;
  quoteNotes: string;
}

export interface Client {
  id: string;
  name: string; // Nome / Razão Social
  tradeName?: string;
  document: string; // CPF ou CNPJ
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  clientId: string;
  clientName?: string;
  name: string; // Ex: Compressor Parafuso 50HP
  brand: string; // Fabricante (ex: Schulz, WEG, Romi)
  model: string;
  serialNumber: string;
  manufactureYear?: string;
  voltagePower?: string; // Ex: 380V Trifásico / 37kW
  locationInClient?: string; // Ex: Sala de Compressores - Galpão 2
  criticality: 'baixa' | 'media' | 'alta' | 'critica';
  specifications?: string; // Notas técnicas, capacidade, pressão máx
  photoUrl?: string;
  lastMaintenanceDate?: string;
  nextPreventiveDate?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: 'mecanica' | 'eletrica' | 'preventiva' | 'corretiva' | 'instalacao' | 'automacao' | 'outro';
  priceType: 'fixed' | 'hh'; // Preço Fixo ou Homem-Hora
  basePrice: number; // Preço fixo ou valor base de referência
  estimatedHours: number; // Horas estimadas
  description: string;
}

export interface HHRate {
  id: string;
  specialty: string; // Ex: Técnico Mecânico, Técnico Eletricista, Especialista Sênior
  hourlyRate: number; // Valor R$/hora normal
  overtimeRate: number; // Valor R$/hora extra (+50%)
  weekendRate: number; // Valor R$/hora fim de semana/feriado (+100%)
  description?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  accessCode: string; // Código simples para o colaborador acessar
  active: boolean;
  color?: string; // Cor na agenda
}

export interface QuoteItem {
  id: string;
  type: 'service_fixed' | 'service_hh' | 'part_material' | 'travel';
  description: string;
  serviceId?: string;
  hhRateId?: string;
  quantity: number; // Qtd de serviços, horas H.H., ou peças
  unitPrice: number; // Preço unitário ou taxa H.H.
  totalPrice: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'canceled';

export interface Quote {
  id: string;
  number: string; // Ex: ORC-2026-001
  clientId: string;
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientAddress: string;
  machineId?: string;
  machineName?: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotalServices: number;
  subtotalHH: number;
  subtotalParts: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: string;
  estimatedExecutionDays: number;
  notes?: string;
  closedAt?: string;
  workOrderId?: string;
}

export type WorkOrderStatus = 'agendada' | 'em_deslocamento' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'faturada';

export interface MaintenancePhoto {
  id: string;
  stage: 'antes' | 'durante' | 'depois' | 'peca_defeituosa';
  url: string; // Data URL ou URL remota
  caption: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  number: string; // Ex: OS-2026-0042
  quoteId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  machineId?: string;
  machineName?: string;
  machineSerial?: string;
  technicianId?: string;
  technicianName?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  status: WorkOrderStatus;
  scopeDescription: string;
  technicalReport?: string; // Laudo / Diagnóstico técnico
  actualHoursWorked: number;
  partsReplaced?: string;
  photos: MaintenancePhoto[];
  totalValue: number;
  paymentStatus: 'pendente' | 'pago' | 'parcial';
  startedAt?: string;
  completedAt?: string;
  customerSignature?: string; // Nome ou confirmação do cliente
  recommendations?: string; // Recomendações para a próxima manutenção
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  machineId: string;
  workOrderId?: string;
  date: string;
  technicianName: string;
  serviceType: 'Preventiva' | 'Corretiva' | 'Preditiva' | 'Instalação';
  description: string;
  partsUsed?: string;
  hoursWorked: number;
  photosCount: number;
}

export interface SupabaseSettings {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}
