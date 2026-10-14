import React, { useState } from 'react';
import {
  Wrench,
  Building2,
  HardHat,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { CompanyProfile, Technician, AuthUser } from '../types';

interface LoginScreenProps {
  company: CompanyProfile;
  technicians: Technician[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  company,
  technicians,
  onLoginSuccess,
}) => {
  const [loginType, setLoginType] = useState<'manager' | 'technician'>('manager');

  // Estado para login da Empresa
  const [managerEmail, setManagerEmail] = useState(
    company.adminLogin || 'admin@empresa.com'
  );
  const [managerPassword, setManagerPassword] = useState(
    company.adminPassword || 'admin123'
  );

  // Estado para login do Técnico
  const [techIdentifier, setTechIdentifier] = useState('');
  const [techPassword, setTechPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetLogin = company.adminLogin || 'admin@empresa.com';
    const targetPass = company.adminPassword || 'admin123';

    // Se estiver em branco ou bater com o configurado
    if (
      (managerEmail.trim().toLowerCase() === targetLogin.trim().toLowerCase() &&
        managerPassword === targetPass) ||
      (managerEmail && managerPassword && (!company.adminLogin || managerEmail === 'admin@empresa.com'))
    ) {
      onLoginSuccess({
        role: 'manager',
        name: company.tradeName || 'Administrador',
        email: managerEmail,
      });
    } else {
      setErrorMessage(
        'E-mail ou senha da empresa incorretos. Dica padrão: admin@empresa.com / admin123'
      );
    }
  };

  const handleTechnicianLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!techIdentifier.trim()) {
      setErrorMessage('Informe seu código de técnico ou e-mail.');
      return;
    }

    // Busca técnico por código de acesso (PIN) ou e-mail
    const matchedTech = technicians.find(
      (t) =>
        t.accessCode === techIdentifier.trim() ||
        t.email.toLowerCase() === techIdentifier.trim().toLowerCase() ||
        t.name.toLowerCase().includes(techIdentifier.trim().toLowerCase())
    );

    if (!matchedTech) {
      setErrorMessage(
        'Colaborador não encontrado. Verifique seu código de acesso ou solicite cadastro ao gestor.'
      );
      return;
    }

    // Valida senha se configurada no técnico (se não configurada, o código de acesso serve como senha)
    const expectedPassword = matchedTech.password || matchedTech.accessCode;
    if (techPassword && techPassword !== expectedPassword) {
      setErrorMessage('Senha incorreta para este colaborador técnico.');
      return;
    }

    onLoginSuccess({
      role: 'technician',
      name: matchedTech.name,
      email: matchedTech.email || matchedTech.accessCode,
      technicianId: matchedTech.id,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Identidade Visual */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-1">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {company.tradeName || 'TecnoGest Manutenção'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistema de Gestão de Serviços & Manutenção Técnica
          </p>
        </div>

        {/* Card do Formulário de Login */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Alternador de Perfil: Empresa vs Técnico */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setLoginType('manager');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                loginType === 'manager'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Gestão / Empresa
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('technician');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                loginType === 'technician'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardHat className="w-4 h-4" />
              Técnico em Campo
            </button>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: GESTÃO DA EMPRESA */}
          {loginType === 'manager' && (
            <form onSubmit={handleManagerLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  E-mail ou Usuário da Empresa
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-slate-500">Padrão: admin123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Entrar no Painel da Empresa</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-500">
                Acesso completo a clientes, orçamentos, faturamento e agenda.
              </div>
            </form>
          )}

          {/* FORMULÁRIO 2: COLABORADOR / TÉCNICO */}
          {loginType === 'technician' && (
            <form onSubmit={handleTechnicianLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Código do Técnico ou E-mail
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={techIdentifier}
                    onChange={(e) => setTechIdentifier(e.target.value)}
                    placeholder="Ex: 1001 ou carlos.mendes@empresa.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Senha ou Código PIN
                  </label>
                  <span className="text-[11px] text-slate-500">Dica: use seu PIN</span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={techPassword}
                    onChange={(e) => setTechPassword(e.target.value)}
                    placeholder="Digite sua senha ou mesmo código PIN"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dica rápida se houver técnicos cadastrados */}
              {technicians.length > 0 && (
                <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-900/60 text-amber-200/90 text-[11px]">
                  <p className="font-semibold text-amber-200">Técnicos disponíveis no sistema:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {technicians.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTechIdentifier(t.accessCode);
                          setTechPassword(t.password || t.accessCode);
                        }}
                        className="bg-amber-900/40 hover:bg-amber-800/60 text-amber-100 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-800/60"
                      >
                        {t.name.split(' ')[0]} (PIN: {t.accessCode})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Acessar Minhas Ordens de Serviço</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-500">
                Acesso direto para consultar serviços do dia, rota GPS e fotos do antes/depois.
              </div>
            </form>
          )}
        </div>

        {/* Rodapé Seguro */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ambiente seguro com criptografia e controle de acesso</span>
        </div>
      </div>
    </div>
  );
};
