import React, { useState } from 'react';
import {
  Building2,
  Save,
  Check,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  FileText,
  Upload,
} from 'lucide-react';
import { CompanyProfile } from '../types';

interface CompanyProfileViewProps {
  company: CompanyProfile;
  onSaveCompany: (company: CompanyProfile) => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  company,
  onSaveCompany,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...company });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600" />
            Minha Empresa Prestadora de Serviços
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure os dados cadastrais da sua empresa, logotipo, chave PIX e termos padrão que serão inseridos nos orçamentos e relatórios técnicos.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300 animate-bounce">
            <Check className="w-4 h-4" />
            Dados da empresa salvos com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Identificação Cadastral */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            Dados Cadastrais da Empresa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Razão Social (Nome Oficial) *
              </label>
              <input
                type="text"
                required
                value={formData.corporateName}
                onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nome Fantasia (Como sua empresa é conhecida) *
              </label>
              <input
                type="text"
                required
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={formData.stateRegistration || ''}
                onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Telefone Fixo da Empresa
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Comercial
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-emerald-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Endereço da Sede */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-red-500" />
            Endereço da Empresa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Logradouro (Rua/Avenida)</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número</label>
              <input
                type="text"
                value={formData.address.number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, number: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Complemento / Galpão</label>
              <input
                type="text"
                value={formData.address.complement || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, complement: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={formData.address.neighborhood}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, neighborhood: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cidade / UF / CEP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full px-2 py-2 border border-slate-300 rounded-xl"
                />
                <input
                  type="text"
                  value={formData.address.state}
                  maxLength={2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-14 px-2 py-2 border border-slate-300 rounded-xl text-center font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Dados Bancários & PIX */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Dados Bancários & Chave PIX (Para Pagamento dos Orçamentos)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Chave PIX</label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value="cnpj">CNPJ</option>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone / Celular</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chave PIX *</label>
              <input
                type="text"
                required
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Banco</label>
              <input
                type="text"
                value={formData.bankInfo?.bankName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo!, bankName: e.target.value },
                  })
                }
                placeholder="Ex: Banco Itaú (341)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agência e Conta Corrente</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agência"
                  value={formData.bankInfo?.agency || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo!, agency: e.target.value },
                    })
                  }
                  className="w-28 px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
                <input
                  type="text"
                  placeholder="Conta com dígito"
                  value={formData.bankInfo?.account || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: { ...formData.bankInfo!, account: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 4: Termos Padrão para Orçamentos e Garantia */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-indigo-600" />
            Condições Comerciais Padrão & Garantia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Garantia Padrão dos Serviços (Dias)
              </label>
              <input
                type="number"
                min={0}
                value={formData.defaultWarrantyDays}
                onChange={(e) => setFormData({ ...formData, defaultWarrantyDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Condição Padrão de Pagamento
              </label>
              <input
                type="text"
                value={formData.defaultPaymentTerms}
                onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Texto Padrão de Observações das Propostas Comerciais
              </label>
              <textarea
                rows={3}
                value={formData.quoteNotes}
                onChange={(e) => setFormData({ ...formData, quoteNotes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 text-sm transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            Salvar Dados da Minha Empresa
          </button>
        </div>
      </form>
    </div>
  );
};
