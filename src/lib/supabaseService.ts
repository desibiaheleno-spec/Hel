import { getSupabaseClient } from './supabaseClient';
import {
  CompanyProfile,
  Client,
  Machine,
  ServiceItem,
  HHRate,
  Technician,
  Quote,
  WorkOrder,
} from '../types';

export const EMPTY_COMPANY: CompanyProfile = {
  id: '',
  corporateName: '',
  tradeName: '',
  cnpj: '',
  stateRegistration: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  pixKeyType: 'cnpj',
  pixKey: '',
  defaultWarrantyDays: 90,
  defaultPaymentTerms: '50% entrada + 50% na conclusão',
  quoteNotes: '',
};

// Conversões Snake_Case <-> CamelCase
const mapCompanyFromDb = (row: any): CompanyProfile => ({
  id: row.id,
  corporateName: row.corporate_name || '',
  tradeName: row.trade_name || '',
  cnpj: row.cnpj || '',
  stateRegistration: row.state_registration || '',
  phone: row.phone || '',
  whatsapp: row.whatsapp || '',
  email: row.email || '',
  website: row.website || '',
  address: row.address || EMPTY_COMPANY.address,
  pixKeyType: row.pix_key_type || 'cnpj',
  pixKey: row.pix_key || '',
  bankInfo: row.bank_info || undefined,
  logoUrl: row.logo_url || '',
  defaultWarrantyDays: row.default_warranty_days || 90,
  defaultPaymentTerms: row.default_payment_terms || '',
  quoteNotes: row.quote_notes || '',
});

const mapClientFromDb = (row: any): Client => ({
  id: row.id,
  name: row.name || '',
  tradeName: row.trade_name || '',
  document: row.document || '',
  contactPerson: row.contact_person || '',
  phone: row.phone || '',
  whatsapp: row.whatsapp || '',
  email: row.email || '',
  address: row.address || {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  notes: row.notes || '',
  createdAt: row.created_at || new Date().toISOString(),
});

const mapMachineFromDb = (row: any, clientsMap?: Map<string, string>): Machine => ({
  id: row.id,
  clientId: row.client_id || '',
  clientName: row.client_name || (clientsMap && row.client_id ? clientsMap.get(row.client_id) : ''),
  name: row.name || '',
  brand: row.brand || '',
  model: row.model || '',
  serialNumber: row.serial_number || '',
  manufactureYear: row.manufacture_year || '',
  voltagePower: row.voltage_power || '',
  locationInClient: row.location_in_client || '',
  criticality: row.criticality || 'media',
  specifications: row.specifications || '',
  photoUrl: row.photo_url || '',
  lastMaintenanceDate: row.last_maintenance_date || '',
  nextPreventiveDate: row.next_preventive_date || '',
  createdAt: row.created_at || new Date().toISOString(),
});

const mapServiceFromDb = (row: any): ServiceItem => ({
  id: row.id,
  code: row.code || '',
  name: row.name || '',
  category: row.category || 'mecanica',
  priceType: row.price_type || 'fixed',
  basePrice: Number(row.base_price || 0),
  estimatedHours: Number(row.estimated_hours || 1),
  description: row.description || '',
});

const mapHHRateFromDb = (row: any): HHRate => ({
  id: row.id,
  specialty: row.specialty || '',
  hourlyRate: Number(row.hourly_rate || 0),
  overtimeRate: Number(row.overtime_rate || 0),
  weekendRate: Number(row.weekend_rate || 0),
  description: row.description || '',
});

const mapTechnicianFromDb = (row: any): Technician => ({
  id: row.id,
  name: row.name || '',
  email: row.email || '',
  phone: row.phone || '',
  specialty: row.specialty || '',
  accessCode: row.access_code || '',
  active: row.active ?? true,
  color: row.color || '#2563eb',
});

const mapQuoteFromDb = (row: any): Quote => ({
  id: row.id,
  number: row.number || '',
  clientId: row.client_id || '',
  clientName: row.client_name || '',
  clientDocument: row.client_document || '',
  clientPhone: row.client_phone || '',
  clientAddress: row.client_address || '',
  machineId: row.machine_id || '',
  machineName: row.machine_name || '',
  issueDate: row.issue_date || new Date().toISOString().split('T')[0],
  validUntil: row.valid_until || '',
  status: row.status || 'draft',
  items: row.items || [],
  subtotalServices: Number(row.subtotal_services || 0),
  subtotalHH: Number(row.subtotal_hh || 0),
  subtotalParts: Number(row.subtotal_parts || 0),
  discountAmount: Number(row.discount_amount || 0),
  totalAmount: Number(row.total_amount || 0),
  paymentTerms: row.payment_terms || '',
  estimatedExecutionDays: Number(row.estimated_execution_days || 1),
  notes: row.notes || '',
  closedAt: row.closed_at || undefined,
  workOrderId: row.work_order_id || undefined,
});

const mapWorkOrderFromDb = (row: any): WorkOrder => ({
  id: row.id,
  number: row.number || '',
  quoteId: row.quote_id || undefined,
  clientId: row.client_id || '',
  clientName: row.client_name || '',
  clientPhone: row.client_phone || '',
  clientAddress: row.client_address || '',
  machineId: row.machine_id || undefined,
  machineName: row.machine_name || '',
  machineSerial: row.machine_serial || '',
  technicianId: row.technician_id || undefined,
  technicianName: row.technician_name || '',
  scheduledDate: row.scheduled_date || '',
  scheduledTime: row.scheduled_time || '08:00',
  status: row.status || 'agendada',
  scopeDescription: row.scope_description || '',
  technicalReport: row.technical_report || '',
  actualHoursWorked: Number(row.actual_hours_worked || 0),
  partsReplaced: row.parts_replaced || '',
  photos: row.photos || [],
  totalValue: Number(row.total_value || 0),
  paymentStatus: row.payment_status || 'pendente',
  startedAt: row.started_at || undefined,
  completedAt: row.completed_at || undefined,
  customerSignature: row.customer_signature || undefined,
  recommendations: row.recommendations || undefined,
  createdAt: row.created_at || new Date().toISOString(),
});

export const SupabaseService = {
  async fetchCompany(): Promise<CompanyProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from('company_profile').select('*').limit(1).maybeSingle();
    if (error || !data) return null;
    return mapCompanyFromDb(data);
  },

  async saveCompany(company: CompanyProfile): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const payload = {
      corporate_name: company.corporateName,
      trade_name: company.tradeName,
      cnpj: company.cnpj,
      state_registration: company.stateRegistration,
      phone: company.phone,
      whatsapp: company.whatsapp,
      email: company.email,
      website: company.website,
      address: company.address,
      pix_key_type: company.pixKeyType,
      pix_key: company.pixKey,
      bank_info: company.bankInfo,
      logo_url: company.logoUrl,
      default_warranty_days: company.defaultWarrantyDays,
      default_payment_terms: company.defaultPaymentTerms,
      quote_notes: company.quoteNotes,
      updated_at: new Date().toISOString(),
    };

    if (company.id && !company.id.startsWith('comp-')) {
      await supabase.from('company_profile').update(payload).eq('id', company.id);
    } else {
      await supabase.from('company_profile').insert([payload]);
    }
    return true;
  },

  async fetchClients(): Promise<Client[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapClientFromDb);
  },

  async saveClient(client: Client): Promise<Client | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      name: client.name,
      trade_name: client.tradeName,
      document: client.document,
      contact_person: client.contactPerson,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      address: client.address,
      notes: client.notes,
    };

    // Se já é um UUID válido do Supabase
    if (client.id && client.id.includes('-') && client.id.length > 20 && !client.id.startsWith('cli-')) {
      const { data, error } = await supabase.from('clients').update(payload).eq('id', client.id).select().single();
      if (error || !data) return null;
      return mapClientFromDb(data);
    } else {
      const { data, error } = await supabase.from('clients').insert([payload]).select().single();
      if (error || !data) return null;
      return mapClientFromDb(data);
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    return !error;
  },

  async fetchMachines(clientsMap?: Map<string, string>): Promise<Machine[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('machines').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((m) => mapMachineFromDb(m, clientsMap));
  },

  async saveMachine(machine: Machine): Promise<Machine | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      client_id: machine.clientId,
      name: machine.name,
      brand: machine.brand,
      model: machine.model,
      serial_number: machine.serialNumber,
      manufacture_year: machine.manufactureYear,
      voltage_power: machine.voltagePower,
      location_in_client: machine.locationInClient,
      criticality: machine.criticality,
      specifications: machine.specifications,
      photo_url: machine.photoUrl,
      last_maintenance_date: machine.lastMaintenanceDate || null,
      next_preventive_date: machine.nextPreventiveDate || null,
    };

    if (machine.id && machine.id.includes('-') && machine.id.length > 20 && !machine.id.startsWith('mac-')) {
      const { data, error } = await supabase.from('machines').update(payload).eq('id', machine.id).select().single();
      if (error || !data) return null;
      return mapMachineFromDb(data);
    } else {
      const { data, error } = await supabase.from('machines').insert([payload]).select().single();
      if (error || !data) return null;
      return mapMachineFromDb(data);
    }
  },

  async deleteMachine(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('machines').delete().eq('id', id);
    return !error;
  },

  async fetchServices(): Promise<ServiceItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('services').select('*').order('code', { ascending: true });
    if (error || !data) return [];
    return data.map(mapServiceFromDb);
  },

  async saveService(service: ServiceItem): Promise<ServiceItem | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      code: service.code,
      name: service.name,
      category: service.category,
      price_type: service.priceType,
      base_price: service.basePrice,
      estimated_hours: service.estimatedHours,
      description: service.description,
    };

    if (service.id && service.id.includes('-') && service.id.length > 20 && !service.id.startsWith('srv-')) {
      const { data, error } = await supabase.from('services').update(payload).eq('id', service.id).select().single();
      if (error || !data) return null;
      return mapServiceFromDb(data);
    } else {
      const { data, error } = await supabase.from('services').insert([payload]).select().single();
      if (error || !data) return null;
      return mapServiceFromDb(data);
    }
  },

  async deleteService(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  },

  async fetchHHRates(): Promise<HHRate[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('hh_rates').select('*').order('hourly_rate', { ascending: true });
    if (error || !data) return [];
    return data.map(mapHHRateFromDb);
  },

  async saveHHRate(rate: HHRate): Promise<HHRate | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      specialty: rate.specialty,
      hourly_rate: rate.hourlyRate,
      overtime_rate: rate.overtimeRate,
      weekend_rate: rate.weekendRate,
      description: rate.description,
    };

    if (rate.id && rate.id.includes('-') && rate.id.length > 20 && !rate.id.startsWith('hh-')) {
      const { data, error } = await supabase.from('hh_rates').update(payload).eq('id', rate.id).select().single();
      if (error || !data) return null;
      return mapHHRateFromDb(data);
    } else {
      const { data, error } = await supabase.from('hh_rates').insert([payload]).select().single();
      if (error || !data) return null;
      return mapHHRateFromDb(data);
    }
  },

  async deleteHHRate(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('hh_rates').delete().eq('id', id);
    return !error;
  },

  async fetchTechnicians(): Promise<Technician[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('technicians').select('*').order('name', { ascending: true });
    if (error || !data) return [];
    return data.map(mapTechnicianFromDb);
  },

  async saveTechnician(tech: Technician): Promise<Technician | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialty: tech.specialty,
      access_code: tech.accessCode,
      active: tech.active,
      color: tech.color,
    };

    if (tech.id && tech.id.includes('-') && tech.id.length > 20 && !tech.id.startsWith('tech-')) {
      const { data, error } = await supabase.from('technicians').update(payload).eq('id', tech.id).select().single();
      if (error || !data) return null;
      return mapTechnicianFromDb(data);
    } else {
      const { data, error } = await supabase.from('technicians').insert([payload]).select().single();
      if (error || !data) return null;
      return mapTechnicianFromDb(data);
    }
  },

  async deleteTechnician(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('technicians').delete().eq('id', id);
    return !error;
  },

  async fetchQuotes(): Promise<Quote[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapQuoteFromDb);
  },

  async saveQuote(quote: Quote): Promise<Quote | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      number: quote.number,
      client_id: quote.clientId && quote.clientId.length > 20 ? quote.clientId : null,
      client_name: quote.clientName,
      client_document: quote.clientDocument,
      client_phone: quote.clientPhone,
      client_address: quote.clientAddress,
      machine_id: quote.machineId && quote.machineId.length > 20 ? quote.machineId : null,
      machine_name: quote.machineName,
      issue_date: quote.issueDate,
      valid_until: quote.validUntil,
      status: quote.status,
      items: quote.items,
      subtotal_services: quote.subtotalServices,
      subtotal_hh: quote.subtotalHH,
      subtotal_parts: quote.subtotalParts,
      discount_amount: quote.discountAmount,
      total_amount: quote.totalAmount,
      payment_terms: quote.paymentTerms,
      estimated_execution_days: quote.estimatedExecutionDays,
      notes: quote.notes,
      closed_at: quote.closedAt || null,
      work_order_id: quote.workOrderId && quote.workOrderId.length > 20 ? quote.workOrderId : null,
    };

    if (quote.id && quote.id.includes('-') && quote.id.length > 20 && !quote.id.startsWith('orc-')) {
      const { data, error } = await supabase.from('quotes').update(payload).eq('id', quote.id).select().single();
      if (error || !data) return null;
      return mapQuoteFromDb(data);
    } else {
      const { data, error } = await supabase.from('quotes').insert([payload]).select().single();
      if (error || !data) return null;
      return mapQuoteFromDb(data);
    }
  },

  async deleteQuote(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    return !error;
  },

  async fetchWorkOrders(): Promise<WorkOrder[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapWorkOrderFromDb);
  },

  async saveWorkOrder(order: WorkOrder): Promise<WorkOrder | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const payload = {
      number: order.number,
      quote_id: order.quoteId && order.quoteId.length > 20 ? order.quoteId : null,
      client_id: order.clientId && order.clientId.length > 20 ? order.clientId : null,
      client_name: order.clientName,
      client_phone: order.clientPhone,
      client_address: order.clientAddress,
      machine_id: order.machineId && order.machineId.length > 20 ? order.machineId : null,
      machine_name: order.machineName,
      machine_serial: order.machineSerial,
      technician_id: order.technicianId && order.technicianId.length > 20 ? order.technicianId : null,
      technician_name: order.technicianName,
      scheduled_date: order.scheduledDate,
      scheduled_time: order.scheduledTime || '08:00',
      status: order.status,
      scope_description: order.scopeDescription,
      technical_report: order.technicalReport,
      actual_hours_worked: order.actualHoursWorked,
      parts_replaced: order.partsReplaced,
      photos: order.photos,
      total_value: order.totalValue,
      payment_status: order.paymentStatus,
      started_at: order.startedAt || null,
      completed_at: order.completedAt || null,
      customer_signature: order.customerSignature,
      recommendations: order.recommendations,
    };

    if (order.id && order.id.includes('-') && order.id.length > 20 && !order.id.startsWith('os-')) {
      const { data, error } = await supabase.from('work_orders').update(payload).eq('id', order.id).select().single();
      if (error || !data) return null;
      return mapWorkOrderFromDb(data);
    } else {
      const { data, error } = await supabase.from('work_orders').insert([payload]).select().single();
      if (error || !data) return null;
      return mapWorkOrderFromDb(data);
    }
  },

  async deleteWorkOrder(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from('work_orders').delete().eq('id', id);
    return !error;
  },
};
