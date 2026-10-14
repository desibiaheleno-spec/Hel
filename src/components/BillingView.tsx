import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Users,
  HardHat,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { WorkOrder, Quote, Client, Technician } from '../types';

interface BillingViewProps {
  workOrders: WorkOrder[];
  quotes: Quote[];
  clients: Client[];
  technicians: Technician[];
}

export const BillingView: React.FC<BillingViewProps> = ({
  workOrders,
  quotes,
  clients,
  technicians,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculos financeiros
  const totalInvoiced = workOrders.reduce((acc, curr) => acc + curr.totalValue, 0);

  const totalPaid = workOrders
    .filter((w) => w.paymentStatus === 'pago')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  const totalPendingPayment = workOrders
    .filter((w) => w.paymentStatus === 'pendente')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  const totalPartialPayment = workOrders
    .filter((w) => w.paymentStatus === 'parcial')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  const totalHHHours = workOrders.reduce(
    (acc, curr) => acc + (curr.actualHoursWorked || 0),
    0
  );

  // Faturamento por cliente
  const billingByClient = clients
    .map((client) => {
      const orders = workOrders.filter((w) => w.clientId === client.id);
      const total = orders.reduce((acc, curr) => acc + curr.totalValue, 0);
      const ordersCount = orders.length;
      return {
        client,
        total,
        ordersCount,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Faturamento / Produtividade por técnico
  const billingByTech = technicians
    .map((tech) => {
      const orders = workOrders.filter((w) => w.technicianId === tech.id);
      const total = orders.reduce((acc, curr) => acc + curr.totalValue, 0);
      const totalHours = orders.reduce(
        (acc, curr) => acc + (curr.actualHoursWorked || 0),
        0
      );
      return {
        tech,
        total,
        totalHours,
        ordersCount: orders.length,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Faturamento & Relatórios Financeiros
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Controle de receita realizada, valores a receber de serviços fechados, produtividade da equipe e ranking por cliente.
          </p>
        </div>
      </div>

      {/* Grid de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Receita Total em OS
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalInvoiced)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {workOrders.length} ordens de serviço emitidas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-600">
              Valores Quitados (Pagos)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(totalPaid)}
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            Dinheiro em caixa confirmado
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-amber-600">
              A Receber / Pendente
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {formatCurrency(totalPendingPayment + totalPartialPayment)}
          </p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">
            Contas em aberto ou sinal parcial
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-indigo-600">
              Horas H.H. Trabalhadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2">
            {totalHHHours.toFixed(1)} horas
          </p>
          <span className="text-xs text-indigo-600 font-medium mt-1 block">
            Mão de obra técnica de campo
          </span>
        </div>
      </div>

      {/* Grid de Análise: Ranking por Cliente e por Técnico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking por Cliente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users className="w-4 h-4 text-blue-600" />
            Faturamento Consolidado por Cliente
          </h2>

          <div className="divide-y divide-slate-100 mt-3">
            {billingByClient.map((item, idx) => (
              <div key={item.client.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 truncate">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{item.client.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {item.ordersCount} {item.ordersCount === 1 ? 'ordem de serviço' : 'ordens de serviço'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {totalInvoiced > 0 ? `${((item.total / totalInvoiced) * 100).toFixed(1)}% do total` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produtividade & Faturamento por Colaborador Técnico */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <HardHat className="w-4 h-4 text-amber-600" />
            Produtividade & Faturamento por Técnico
          </h2>

          <div className="divide-y divide-slate-100 mt-3">
            {billingByTech.map((item) => (
              <div key={item.tech.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.tech.name}</p>
                  <p className="text-slate-500 text-[11px]">{item.tech.specialty}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                      {item.ordersCount} atendimentos
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-semibold">
                      {item.totalHours.toFixed(1)}h apontadas
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Volume executado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extrato Detalhado de Ordens de Serviço & Status de Cobrança */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Extrato Detalhado de Serviços Faturados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-2.5 px-3">Número OS</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Técnico</th>
                <th className="py-2.5 px-3">Data Conclusão</th>
                <th className="py-2.5 px-3">Horas (H.H.)</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {order.number}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {order.clientName}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {order.technicianName}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {order.scheduledDate}
                  </td>
                  <td className="py-3 px-3 font-bold text-indigo-700">
                    {order.actualHoursWorked}h
                  </td>
                  <td className="py-3 px-3 font-bold font-mono text-slate-900">
                    {formatCurrency(order.totalValue)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.paymentStatus === 'pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.paymentStatus === 'parcial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
