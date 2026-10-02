"use client";

import React, { useState } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft } from "lucide-react";

type ScreenState = "HOME" | "LOGIN" | "BATTLE";

interface Item {
  id: string;
  name: string;
  width: number;       // colunas ocupadas (1 a 5)
  height: number;      // linhas ocupadas (1 a 5)
  x: number;           // coluna inicial (0 a 4)
  y: number;           // linha inicial (0 a 4)
  imageUrl: string;    // caminho da imagem
  borderColor: string;
  bgColor: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("BATTLE");

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none">
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
   TELA INICIAL
   ======================================================== */
function HomeScreen({ onPlay, onLogin }: { onPlay: () => void; onLogin: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 bg-gradient-to-b from-[#2a4d69] via-[#1a2f44] to-[#0c1622]">
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <span className="font-extrabold tracking-widest text-lg text-slate-100">
          AERIA <span className="text-cyan-400">NEXUS</span>
        </span>

        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-400/50 bg-[#162738] hover:bg-cyan-500/20 text-cyan-300 font-bold transition-all"
        >
          <LogIn size={18} /> Entrar / Cadastrar
        </button>
      </header>

      <section className="flex flex-col items-center text-center my-auto px-4">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-lg">
          AERIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">NEXUS</span>
        </h1>
        <p className="max-w-md text-slate-300 text-lg mb-8">
          Auto-battler de inventário e sinergia posicional.
        </p>

        <button
          onClick={onPlay}
          className="flex items-center gap-3 px-10 py-4 rounded-xl font-black text-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition-all"
        >
          <Play fill="#020617" size={20} /> JOGAR
        </button>
      </section>

      <footer className="text-center text-xs text-slate-400 py-4">
        Aeria Nexus © 2026
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DE LOGIN
   ======================================================== */
function LoginScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#0c1622] relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="w-full max-w-sm bg-[#131c29] border border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Login</h2>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full bg-[#0a1018] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full bg-[#0a1018] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={onBack}
            className="w-full mt-2 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA COM GRADE PERFEITAMENTE ALINHADA
   ======================================================== */
function BattleScreen({ onBack }: { onBack: () => void }) {
  // Itens na mochila do Jogador (Espada 3x1 e Escudo 2x2)
  const [playerItems] = useState<Item[]>([
    {
      id: "espada-celestial",
      name: "Espada Celestial",
      width: 3,
      height: 1,
      x: 1,
      y: 0,
      imageUrl: "/espada.png",
      borderColor: "border-[#38bdf8]",
      bgColor: "bg-[#14293e]/95",
    },
    {
      id: "escudo-dragao",
      name: "Escudo do Dragão",
      width: 2,
      height: 2,
      x: 1,
      y: 2,
      imageUrl: "/escudo.png",
      borderColor: "border-[#22c55e]",
      bgColor: "bg-[#0f2e1a]/95",
    },
  ]);

  // Itens na mochila do Chefe (Armadura 2x2 e Coração 2x2)
  const [bossItems] = useState<Item[]>([
    {
      id: "armadura-carmesim",
      name: "Armadura Carmesim",
      width: 2,
      height: 2,
      x: 1,
      y: 0,
      imageUrl: "/armadura.png",
      borderColor: "border-[#ef4444]",
      bgColor: "bg-[#331416]/95",
    },
    {
      id: "coracao-amaldicoado",
      name: "Coração Amaldiçoado",
      width: 2,
      height: 2,
      x: 1,
      y: 2,
      imageUrl: "/coracao.png",
      borderColor: "border-[#8b5cf6]",
      bgColor: "bg-[#251036]/95",
    },
  ]);

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between p-4 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/cenario.jpg'), linear-gradient(to bottom, #3a6b8c, #5484a6, #7aa9c8)",
      }}
    >
      {/* 1. HUD SUPERIOR */}
      <header className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 relative z-10">
        {/* Jogador */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>JOGADOR 1 (Você)</span>
            <span className="text-xs">245 / 300</span>
          </div>
          <div className="h-5 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1 z-10" />
            <div className="h-full bg-red-600 w-[81%]" />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1 z-10" />
            <div className="h-full bg-sky-500 w-[80%]" />
          </div>
        </div>

        {/* Round central */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#271f1a] border-2 border-[#544337] flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[9px] font-black text-amber-400 uppercase">ROUND</span>
            <span className="text-xl font-black text-white leading-none">5</span>
          </div>
          <button
            onClick={onBack}
            className="text-[11px] text-slate-900 bg-white/80 hover:bg-white px-2 py-0.5 rounded font-bold mt-1 shadow"
          >
            Menu
          </button>
        </div>

        {/* Chefe */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>CHEFE (Guardião)</span>
            <span className="text-xs">512 / 600</span>
          </div>
          <div className="h-5 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1 z-10" />
            <div className="h-full bg-red-600 w-[85%] ml-auto" />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1 z-10" />
            <div className="h-full bg-sky-500 w-[75%] ml-auto" />
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS (LIVRES NO CENÁRIO) */}
      <section className="max-w-6xl w-full mx-auto flex justify-between items-end my-1 px-4 h-52 md:h-64 pointer-events-none relative z-10">
        <div className="flex flex-col items-center">
          <img
            src="/jogador.png"
            alt="Jogador"
            className="h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div className="flex flex-col items-center pb-8 font-mono font-black text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span className="text-xl text-red-500">-21 Dano</span>
          <span className="text-sm text-sky-300">-50 Escudo</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src="/chefe.png"
            alt="Chefe"
            className="h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* 3. PAINÉIS DE INVENTÁRIO (GRADE E ITENS 100% ALINHADOS) */}
      <section className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center items-center relative z-10">
        
        {/* ================= INVENTÁRIO DO JOGADOR ================= */}
        <div className="w-full max-w-[380px] aspect-square bg-[#0e1624]/90 backdrop-blur-sm border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
          {/* Camada 1: Grade de Fundo (25 slots vazios suaves) */}
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-cyan-400/15 bg-cyan-950/20"
              />
            ))}
          </div>

          {/* Camada 2: Itens Sobrepostos com Alinhamento Perfeito */}
          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {playerItems.map((item) => (
              <div
                key={item.id}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex flex-col justify-between items-center shadow-lg relative overflow-hidden`}
              >
                <span className="text-[10px] font-black text-cyan-200 text-center drop-shadow">
                  {item.name}
                </span>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full flex-1 object-contain max-h-16 my-0.5"
                />
                <span className="text-[9px] font-bold text-slate-300">
                  {item.width}x{item.height}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= INVENTÁRIO DO CHEFE ================= */}
        <div className="w-full max-w-[380px] aspect-square bg-[#160c1a]/90 backdrop-blur-sm border-4 border-[#2c1533] rounded-2xl p-2.5 shadow-2xl relative">
          {/* Camada 1: Grade de Fundo (25 slots vazios suaves) */}
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-purple-400/15 bg-purple-950/20"
              />
            ))}
          </div>

          {/* Camada 2: Itens Sobrepostos com Alinhamento Perfeito */}
          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {bossItems.map((item) => (
              <div
                key={item.id}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex flex-col justify-between items-center shadow-lg relative overflow-hidden`}
              >
                <span className="text-[10px] font-black text-purple-200 text-center drop-shadow">
                  {item.name}
                </span>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full flex-1 object-contain max-h-16 my-0.5"
                />
                <span className="text-[9px] font-bold text-slate-300">
                  {item.width}x{item.height}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 4. BOTÕES DE AÇÃO */}
      <footer className="max-w-md w-full mx-auto flex items-center gap-4 mt-3 pb-2 relative z-10">
        <button className="flex-1 py-3 rounded-xl bg-[#243142]/90 hover:bg-[#2c3d52] border-2 border-[#3d5069] text-white font-bold text-sm tracking-wider uppercase shadow backdrop-blur-sm">
          PREPARAÇÃO
        </button>
        <button className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg">
          LUTAR
        </button>
      </footer>
    </div>
  );
}