"use client";

import React, { useState } from "react";
import { Shield, Heart, Zap, Play, LogIn, ArrowLeft, Swords } from "lucide-react";

type ScreenState = "HOME" | "LOGIN" | "BATTLE";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("HOME");

  return (
    <main className="min-h-screen bg-nexus-dark text-slate-100 flex flex-col">
      {currentScreen === "HOME" && (
        <HomeScreen
          onPlay={() => setCurrentScreen("BATTLE")}
          onLogin={() => setCurrentScreen("LOGIN")}
        />
      )}

      {currentScreen === "LOGIN" && (
        <LoginScreen onBack={() => setCurrentScreen("HOME")} />
      )}

      {currentScreen === "BATTLE" && (
        <BattleScreen onBack={() => setCurrentScreen("HOME")} />
      )}
    </main>
  );
}

/* ========================================================
   TELA INICIAL (HOME)
   ======================================================== */
function HomeScreen({ onPlay, onLogin }: { onPlay: () => void; onLogin: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111C35] via-nexus-dark to-black">
      {/* Barra de Navegação Superior */}
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nexus-cyan shadow-glowCyan flex items-center justify-center font-bold text-nexus-dark">
            AN
          </div>
          <span className="font-extrabold tracking-widest text-lg text-slate-200">
            AERIA <span className="text-nexus-cyan">NEXUS</span>
          </span>
        </div>

        {/* Botão de Login no Canto Superior Direito */}
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-nexus-cyan/40 bg-nexus-cyan/10 hover:bg-nexus-cyan/20 text-nexus-cyan font-medium transition-all shadow-glowCyan"
        >
          <LogIn size={18} />
          Entrar / Cadastrar
        </button>
      </header>

      {/* Conteúdo Central */}
      <section className="flex flex-col items-center text-center my-auto px-4">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-nexus-green bg-nexus-green/10 border border-nexus-green/30 rounded-full">
          AUTO-BATTLER ESTRATÉGICO DE GRID
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-md">
          AERIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-cyan via-nexus-purple to-nexus-green">NEXUS</span>
        </h1>
        <p className="max-w-xl text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
          Forje bio-armas alienígenas, alinhe conexões neurais no seu inventário e deixe a sinergia posicional aniquilar os chefes do vazio.
        </p>

        <button
          onClick={onPlay}
          className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-nexus-green to-emerald-600 hover:brightness-110 text-nexus-dark shadow-glowGreen transition-all transform hover:scale-105"
        >
          <Play fill="#070B13" size={20} />
          Iniciar Combate (Protótipo)
        </button>
      </section>

      {/* Rodapé Informativo */}
      <footer className="text-center text-xs text-slate-500 py-4">
        Aeria Nexus © 2026 — Protótipo de Escopo e Interface
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DE LOGIN
   ======================================================== */
function LoginScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Login simulado para: ${email}`);
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-nexus-dark relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar à Tela Inicial
      </button>

      <div className="w-full max-w-md bg-nexus-panel border border-nexus-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nexus-cyan via-nexus-purple to-nexus-green" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Conectar ao Nexus</h2>
          <p className="text-sm text-slate-400">Insira suas credenciais para sincronizar o inventário</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Identificador / E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="piloto@nexus.bio"
              className="w-full bg-nexus-slot border border-nexus-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-nexus-cyan"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Código de Acesso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-nexus-slot border border-nexus-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-nexus-cyan"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-nexus-cyan hover:brightness-110 text-nexus-dark font-bold transition-all shadow-glowCyan"
          >
            Autenticar
          </button>
        </form>
      </div>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA E INVENTÁRIOS (FASE 1)
   ======================================================== */
function BattleScreen({ onBack }: { onBack: () => void }) {
  // Dimensões do Grid do jogador: 7 colunas x 5 linhas
  const GRID_COLS = 7;
  const GRID_ROWS = 5;

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 max-w-7xl mx-auto w-full">
      {/* 1. TOPO: Barras de Status e Contador de Round */}
      <header className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2 border-b border-nexus-border/60">
        {/* Jogador 1 (Você) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-nexus-cyan">JOGADOR 1 (Você)</span>
            <span className="text-xs text-slate-400">245 / 300</span>
          </div>
          {/* Barra de Vida */}
          <div className="w-full h-4 bg-nexus-slot rounded-full overflow-hidden border border-nexus-border">
            <div className="h-full bg-nexus-crimson w-[81%] transition-all duration-300" />
          </div>
          {/* Barra de Escudo */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-nexus-shield">
              <Shield size={12} /> 80 / 100
            </span>
          </div>
          <div className="w-full h-2 bg-nexus-slot rounded-full overflow-hidden border border-nexus-border">
            <div className="h-full bg-nexus-shield w-[80%] transition-all duration-300" />
          </div>
        </div>

        {/* Central: Round Badge & Voltar */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-nexus-panel border-2 border-nexus-border flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Round</span>
            <span className="text-lg font-black text-white leading-none">5</span>
          </div>
          <button
            onClick={onBack}
            className="text-[11px] text-slate-400 hover:text-slate-200 mt-2 underline"
          >
            Sair da Batalha
          </button>
        </div>

        {/* Chefe / Guardião Celestial */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-nexus-purple">CHEFE (Guardião Celestial)</span>
            <span className="text-xs text-slate-400">512 / 600</span>
          </div>
          {/* Barra de Vida */}
          <div className="w-full h-4 bg-nexus-slot rounded-full overflow-hidden border border-nexus-border">
            <div className="h-full bg-nexus-crimson w-[85%] transition-all duration-300 ml-auto" />
          </div>
          {/* Barra de Escudo */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-nexus-shield ml-auto">
              <Shield size={12} /> 150 / 200
            </span>
          </div>
          <div className="w-full h-2 bg-nexus-slot rounded-full overflow-hidden border border-nexus-border">
            <div className="h-full bg-nexus-shield w-[75%] transition-all duration-300 ml-auto" />
          </div>
        </div>
      </header>

      {/* 2. CENTRO: Arena de Personagens (Blocos Temporários) */}
      <section className="relative my-4 h-48 md:h-64 flex justify-between items-center px-8 border border-nexus-border/40 rounded-2xl bg-gradient-to-b from-nexus-panel/40 to-nexus-dark/60 overflow-hidden">
        {/* Placeholder: Jogador (Futura imagem PNG do Guerreiro) */}
        <div className="w-32 md:w-44 h-40 md:h-52 rounded-xl border-2 border-dashed border-nexus-cyan/60 bg-nexus-cyan/10 flex flex-col items-center justify-center text-center p-2">
          <span className="text-xs font-semibold text-nexus-cyan uppercase">Slot do Personagem</span>
          <span className="text-[10px] text-slate-400">(Guerreiro Alien / Futuro PNG)</span>
        </div>

        {/* Efeito Visual Central de Troca de Golpes */}
        <div className="flex flex-col items-center text-slate-500">
          <Swords size={32} className="text-nexus-cyan animate-pulse" />
          <span className="text-[11px] text-nexus-crimson font-mono mt-1">-21 Dano</span>
          <span className="text-[11px] text-nexus-shield font-mono">-50 Escudo</span>
        </div>

        {/* Placeholder: Chefe (Futura imagem PNG do Chefe) */}
        <div className="w-32 md:w-44 h-40 md:h-52 rounded-xl border-2 border-dashed border-nexus-purple/60 bg-nexus-purple/10 flex flex-col items-center justify-center text-center p-2">
          <span className="text-xs font-semibold text-nexus-purple uppercase">Slot do Chefe</span>
          <span className="text-[10px] text-slate-400">(Guardião Celestial / Futuro PNG)</span>
        </div>
      </section>

      {/* 3. BASE: Matrizes de Inventário (Grid 7x5) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Inventário do Jogador */}
        <div className="bg-nexus-panel border border-nexus-border rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nexus-cyan" />
              Mochila Neural (Jogador)
            </h3>
            <span className="text-xs text-slate-400">7 x 5 Espaços</span>
          </div>

          {/* Grid de 35 slots */}
          <div className="grid grid-cols-7 grid-rows-5 gap-1.5 bg-nexus-dark/80 p-2 rounded-lg border border-nexus-border/50">
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
              // Exemplos de blocos de teste com cores do escopo
              if (index === 2 || index === 3) {
                return (
                  <div
                    key={index}
                    className="h-12 md:h-14 rounded bg-nexus-cyan/80 border border-nexus-cyan shadow-glowCyan flex items-center justify-center text-[10px] font-bold text-nexus-dark text-center"
                  >
                    Plasma (Atq)
                  </div>
                );
              }
              if (index === 9 || index === 10) {
                return (
                  <div
                    key={index}
                    className="h-12 md:h-14 rounded bg-nexus-green/80 border border-nexus-green shadow-glowGreen flex items-center justify-center text-[10px] font-bold text-nexus-dark text-center"
                  >
                    Bio-Órgão (+2)
                  </div>
                );
              }
              if (index === 17) {
                return (
                  <div
                    key={index}
                    className="h-12 md:h-14 rounded bg-nexus-amber/80 border border-nexus-amber shadow-glowAmber flex items-center justify-center text-[10px] font-bold text-nexus-dark text-center"
                  >
                    Bateria
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="h-12 md:h-14 rounded bg-nexus-slot/60 border border-nexus-border/60 hover:border-nexus-cyan/40 hover:bg-nexus-slot transition-colors flex items-center justify-center text-[10px] text-slate-600"
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventário / Painel do Chefe */}
        <div className="bg-nexus-panel border border-nexus-border rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nexus-purple" />
              Equipamento do Guardião
            </h3>
            <span className="text-xs text-slate-400">Matriz Inimiga</span>
          </div>

          {/* Grid de 35 slots */}
          <div className="grid grid-cols-7 grid-rows-5 gap-1.5 bg-nexus-dark/80 p-2 rounded-lg border border-nexus-border/50">
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
              if (index >= 8 && index <= 10) {
                return (
                  <div
                    key={index}
                    className="h-12 md:h-14 rounded bg-nexus-purple/80 border border-nexus-purple shadow-glowPurple flex items-center justify-center text-[10px] font-bold text-white text-center"
                  >
                    Glaive
                  </div>
                );
              }
              if (index === 22 || index === 23) {
                return (
                  <div
                    key={index}
                    className="h-12 md:h-14 rounded bg-nexus-crimson/80 border border-nexus-crimson flex items-center justify-center text-[10px] font-bold text-white text-center"
                  >
                    Coração
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="h-12 md:h-14 rounded bg-nexus-slot/40 border border-nexus-border/40 flex items-center justify-center text-[10px] text-slate-700"
                >
                  •
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CONTROLES DE COMBATE */}
      <footer className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 pb-2">
        <button className="w-full sm:w-44 py-3 rounded-xl border border-nexus-border bg-nexus-slot hover:bg-nexus-slotHover text-slate-200 font-semibold transition-all">
          PREPARAÇÃO
        </button>
        <button className="w-full sm:w-56 py-3 rounded-xl font-bold bg-gradient-to-r from-nexus-green to-emerald-600 hover:brightness-110 text-nexus-dark shadow-glowGreen transition-all transform hover:scale-105">
          LUTAR
        </button>
      </footer>
    </div>
  );
}