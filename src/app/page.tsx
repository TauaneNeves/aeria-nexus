"use client";

import React, { useState } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft } from "lucide-react";

type ScreenState = "HOME" | "LOGIN" | "BATTLE";

interface Item {
  id: string;
  name: string;
  type: string;        // Categoria (Arma, Escudo, Armadura, Órgão)
  width: number;       // colunas ocupadas (1 a 5)
  height: number;      // linhas ocupadas (1 a 5)
  x: number;           // coluna inicial (0 a 4)
  y: number;           // linha inicial (0 a 4)
  imageUrl: string;    // caminho da imagem em /public
  borderColor: string;
  bgColor: string;
  stats: {
    damage?: number;
    armor?: number;
    health?: number;
    specialEffect?: string;
  };
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
   TELA DA ARENA (ESPADA 2x2 E ESCUDO 1x1)
   ======================================================== */
function BattleScreen({ onBack }: { onBack: () => void }) {
  // ITENS DO JOGADOR: Espada 2x2 e Escudo 1x1
  const [playerItems] = useState<Item[]>([
    {
      id: "espada-celestial",
      name: "Espada Celestial",
      type: "Arma Celestial",
      width: 2, // 2 colunas
      height: 2, // 2 linhas (2x2)
      x: 1,      // Centralizada
      y: 1,
      imageUrl: "/espada.png",
      borderColor: "border-[#38bdf8]",
      bgColor: "bg-[#14293e]/90",
      stats: {
        damage: 15,
        specialEffect: "Chance de congelar a espada do inimigo",
      },
    },
    {
      id: "escudo-dragao",
      name: "Escudo do Dragão",
      type: "Escudo Dracônico",
      width: 1, // 1 slot
      height: 1, // 1 slot
      x: 3,      // Ao lado da espada
      y: 1,
      imageUrl: "/escudo.png",
      borderColor: "border-[#22c55e]",
      bgColor: "bg-[#0f2e1a]/90",
      stats: {
        armor: 15,
      },
    },
  ]);

  // ITENS DO CHEFE: Armadura 2x2 e Coração 1x1
  const [bossItems] = useState<Item[]>([
    {
      id: "armadura-carmesim",
      name: "Armadura Carmesim",
      type: "Armadura Pesada",
      width: 2, // 2x2
      height: 2,
      x: 1,
      y: 1,
      imageUrl: "/armadura.png",
      borderColor: "border-[#ef4444]",
      bgColor: "bg-[#331416]/90",
      stats: {
        armor: 150,
      },
    },
    {
      id: "coracao-amaldicoado",
      name: "Coração Amaldiçoado",
      type: "Órgão Sombrio",
      width: 1, // 1 slot
      height: 1,
      x: 3,
      y: 1,
      imageUrl: "/coracao.png",
      borderColor: "border-[#8b5cf6]",
      bgColor: "bg-[#251036]/90",
      stats: {
        health: 150,
      },
    },
  ]);

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between p-4 md:p-6 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/cenario.jpg'), linear-gradient(to bottom, #3a6b8c, #5484a6, #7aa9c8)",
      }}
    >
      {/* 1. HUD SUPERIOR */}
      <header className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>JOGADOR 1 (Você)</span>
            <span className="text-xs">245 / 300</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div className="h-full bg-red-600 w-[81%]" />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div className="h-full bg-sky-500 w-[80%]" />
          </div>
        </div>

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

        <div className="w-full max-w-[420px] md:ml-auto flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>CHEFE (Guardião)</span>
            <span className="text-xs">512 / 600</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div className="h-full bg-red-600 w-[85%] ml-auto" />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div className="h-full bg-sky-500 w-[75%] ml-auto" />
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-end my-1 h-52 md:h-64 pointer-events-none relative z-10">
        <div className="w-full max-w-[420px] flex justify-center">
          <img
            src="/jogador.png"
            alt="Jogador"
            className="h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div className="flex flex-col items-center justify-center pb-8 font-mono font-black text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span className="text-xl text-red-500">-21 Dano</span>
          <span className="text-sm text-sky-300">-50 Escudo</span>
        </div>

        <div className="w-full max-w-[420px] md:ml-auto flex justify-center">
          <img
            src="/chefe.png"
            alt="Chefe"
            className="h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* 3. PAINÉIS DE INVENTÁRIO 5x5 */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
        
        {/* ================= INVENTÁRIO DO JOGADOR ================= */}
        <div className="w-full max-w-[420px] aspect-square bg-[#0e1624]/90 backdrop-blur-sm border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
          {/* Grade de fundo vazia (25 slots) */}
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-cyan-400/15 bg-cyan-950/20"
              />
            ))}
          </div>

          {/* Camada dos Itens */}
          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {playerItems.map((item) => (
              <div
                key={item.id}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
              >
                {/* Grade interna sutil (mostra os 4 slots na Espada 2x2) */}
                {item.width > 1 || item.height > 1 ? (
                  <div
                    className="absolute inset-1 grid gap-1.5 pointer-events-none opacity-25"
                    style={{
                      gridTemplateColumns: `repeat(${item.width}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${item.height}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: item.width * item.height }).map((_, idx) => (
                      <div key={idx} className="border border-cyan-300 rounded-lg" />
                    ))}
                  </div>
                ) : null}

                {/* Imagem do Item */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none relative z-10"
                />

                {/* CARD DE ESPECIFICAÇÕES NO HOVER */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#0a111c]/95 backdrop-blur-md border border-cyan-500/60 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-start border-b border-slate-700/60 pb-1.5">
                    <div>
                      <h4 className="text-xs font-black text-white tracking-wide">{item.name}</h4>
                      <span className="text-[10px] font-semibold text-cyan-300">{item.type}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.width}x{item.height}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-0.5">
                    {item.stats.damage && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <span className="text-red-500">⚔️</span>
                        <span>+{item.stats.damage} de Dano</span>
                      </div>
                    )}
                    {item.stats.armor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <Shield size={13} className="text-sky-400 fill-sky-400/20" />
                        <span>+{item.stats.armor} de Armadura</span>
                      </div>
                    )}
                    {item.stats.specialEffect && (
                      <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] font-medium text-cyan-200 leading-tight">
                        <span className="text-xs">❄️</span>
                        <span>{item.stats.specialEffect}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= INVENTÁRIO DO CHEFE ================= */}
        <div className="w-full max-w-[420px] md:ml-auto aspect-square bg-[#160c1a]/90 backdrop-blur-sm border-4 border-[#2c1533] rounded-2xl p-2.5 shadow-2xl relative">
          {/* Grade de fundo vazia (25 slots) */}
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-purple-400/15 bg-purple-950/20"
              />
            ))}
          </div>

          {/* Camada dos Itens */}
          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {bossItems.map((item) => (
              <div
                key={item.id}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
              >
                {/* Grade interna sutil (mostra os 4 slots na Armadura 2x2) */}
                {item.width > 1 || item.height > 1 ? (
                  <div
                    className="absolute inset-1 grid gap-1.5 pointer-events-none opacity-25"
                    style={{
                      gridTemplateColumns: `repeat(${item.width}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${item.height}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: item.width * item.height }).map((_, idx) => (
                      <div key={idx} className="border border-purple-300 rounded-lg" />
                    ))}
                  </div>
                ) : null}

                {/* Imagem do Item */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none relative z-10"
                />

                {/* CARD DE ESPECIFICAÇÕES NO HOVER */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#140a17]/95 backdrop-blur-md border border-purple-500/60 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-start border-b border-slate-700/60 pb-1.5">
                    <div>
                      <h4 className="text-xs font-black text-white tracking-wide">{item.name}</h4>
                      <span className="text-[10px] font-semibold text-purple-300">{item.type}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.width}x{item.height}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-0.5">
                    {item.stats.armor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <Shield size={13} className="text-sky-400 fill-sky-400/20" />
                        <span>+{item.stats.armor} de Armadura</span>
                      </div>
                    )}
                    {item.stats.health && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Heart size={13} className="text-emerald-400 fill-emerald-400/20" />
                        <span>+{item.stats.health} de Vida</span>
                      </div>
                    )}
                  </div>
                </div>
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