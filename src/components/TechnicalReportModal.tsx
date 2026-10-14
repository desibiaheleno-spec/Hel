import React from 'react';
import {
  X,
  Printer,
  MessageCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  Cpu,
  MapPin,
  Camera,
  FileText,
} from 'lucide-react';
import { WorkOrder, CompanyProfile } from '../types';

interface TechnicalReportModalProps {
  workOrder: WorkOrder;
  company: CompanyProfile;
  onClose: () => void;
}

export const TechnicalReportModal: React.FC<TechnicalReportModalProps> = ({
  workOrder,
  company,
  onClose,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const beforePhotos = workOrder.photos.filter((p) => p.stage === 'antes');
  const afterPhotos = workOrder.photos.filter((p) => p.stage === 'depois');
  const otherPhotos = workOrder.photos.filter(
    (p) => p.stage !== 'antes' && p.stage !== 'depois'
  );

  const generateWhatsAppReport = () => {
    const text = `*RELATÓRIO TÉCNICO DE MANUTENÇÃO - ${workOrder.number}*
*${company.tradeName}*

Prezado cliente *${workOrder.clientName}*,
A manutenção técnica no equipamento *${workOrder.machineName || 'Equipamento'}* foi concluída com sucesso.

*Resumo do Atendimento:*
• Data da Execução: ${workOrder.scheduledDate}
• Técnico Responsável: ${workOrder.technicianName}
• Horas Trabalhadas: ${workOrder.actualHoursWorked}h
• Peças Substituídas: ${workOrder.partsReplaced || 'Nenhuma'}

*Laudo Técnico:*
${workOrder.technicalReport || workOrder.scopeDescription}

*Recomendações Técnicas:*
${workOrder.recommendations || 'Manter o plano de preventiva conforme manual do fabricante.'}

Para visualizar o relatório fotográfico completo (Antes e Depois) e detalhes, entre em contato com nossa equipe.`;

    const cleanPhone = (workOrder.clientPhone || '').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 my-8 printable-report">
        {/* Cabeçalho da Empresa Prestadora */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                Laudo Técnico de Entrega de Serviço
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 uppercase">
              {company.corporateName}
            </h1>
            <p className="text-xs text-slate-600">
              CNPJ: {company.cnpj} {company.stateRegistration ? `• IE: ${company.stateRegistration}` : ''}
            </p>
            <p className="text-xs text-slate-600">
              {company.address.street}, {company.address.number} - {company.address.city}/{company.address.state}
            </p>
            <p className="text-xs text-slate-600">
              Central: {company.phone} • WhatsApp: {company.whatsapp}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-blue-600 text-white px-3 py-1 rounded">
              {workOrder.number}
            </span>
            <p className="text-xs text-slate-500 mt-2">Data: {workOrder.scheduledDate}</p>
            <p className="text-xs font-bold text-emerald-600 uppercase">
              {workOrder.status === 'concluida' ? '✓ Serviço Concluído' : workOrder.status}
            </p>
          </div>
        </div>

        {/* Dados do Cliente e da Máquina */}
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-semibold">Cliente</span>
            <p className="font-bold text-slate-900 text-sm">{workOrder.clientName}</p>
            <p className="text-slate-600">Telefone: {workOrder.clientPhone}</p>
            <p className="text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {workOrder.clientAddress}
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-semibold">Equipamento Intervencionado</span>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              {workOrder.machineName || 'Equipamento em Campo'}
            </p>
            {workOrder.machineSerial && (
              <p className="text-slate-600 font-mono mt-0.5">
                Número de Série: <span className="font-bold text-slate-800">{workOrder.machineSerial}</span>
              </p>
            )}
            <p className="text-slate-600 mt-0.5">
              Técnico Executante: <span className="font-semibold text-slate-800">{workOrder.technicianName}</span>
            </p>
          </div>
        </div>

        {/* Diagnóstico e Laudo Técnico */}
        <div className="space-y-4 my-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Laudo Técnico & Ações Executadas
            </h3>
            <p className="text-slate-700 leading-relaxed text-xs whitespace-pre-line">
              {workOrder.technicalReport || workOrder.scopeDescription}
            </p>
          </div>

          {workOrder.partsReplaced && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <p className="font-bold text-amber-900 text-xs">Peças & Componentes Substituídos:</p>
              <p className="text-amber-800 mt-1">{workOrder.partsReplaced}</p>
            </div>
          )}

          {workOrder.recommendations && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
              <p className="font-bold text-blue-900 text-xs">Recomendações Preventivas para o Cliente:</p>
              <p className="text-blue-800 mt-1">{workOrder.recommendations}</p>
            </div>
          )}
        </div>

        {/* SEÇÃO FOTOGRÁFICA: ANTES E DEPOIS */}
        <div className="my-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
            <Camera className="w-4 h-4 text-blue-600" />
            Evidências Fotográficas da Manutenção (Antes & Depois)
          </h3>

          {workOrder.photos.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Nenhuma foto registrada para este atendimento.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comparativo Antes vs Depois Lado a Lado */}
              {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloco Antes */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                      Estado Anterior (Antes da Manutenção)
                    </span>
                    {beforePhotos.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">Sem foto do estado inicial.</p>
                    ) : (
                      beforePhotos.map((photo) => (
                        <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <img
                            src={photo.url}
                            alt="Antes da Manutenção"
                            className="w-full h-48 object-cover"
                          />
                          {photo.caption && (
                            <p className="p-2 text-xs text-slate-600 bg-white border-t border-slate-100">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bloco Depois */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                      Estado Final (Depois da Manutenção / Concluído)
                    </span>
                    {afterPhotos.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">Sem foto do estado final.</p>
                    ) : (
                      afterPhotos.map((photo) => (
                        <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <img
                            src={photo.url}
                            alt="Depois da Manutenção"
                            className="w-full h-48 object-cover"
                          />
                          {photo.caption && (
                            <p className="p-2 text-xs text-slate-600 bg-white border-t border-slate-100">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Outras fotos (Durante / Peça Danificada) */}
              {otherPhotos.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-2">Fotos Adicionais / Peças Danificadas:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {otherPhotos.map((photo) => (
                      <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover" />
                        <p className="p-1.5 text-[10px] text-slate-600 truncate">{photo.caption || photo.stage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assinaturas Digitais */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t-2 border-slate-200 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 pb-8 font-medium text-slate-800">
              {workOrder.technicianName}
            </div>
            <p className="text-slate-500 mt-1 font-semibold">Responsável Técnico / {company.tradeName}</p>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8 font-medium text-slate-800">
              {workOrder.customerSignature || workOrder.clientName}
            </div>
            <p className="text-slate-500 mt-1 font-semibold">Aceite do Cliente / Fiscal de Manutenção</p>
          </div>
        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
          >
            Fechar
          </button>
          <button
            onClick={generateWhatsAppReport}
            className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Enviar Relatório no WhatsApp
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-5 py-2 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Laudo / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
