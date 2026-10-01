"use client";

import React, { useState } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft } from "lucide-react";

type ScreenState = "HOME" | "LOGIN" | "BATTLE";

interface Item {
  id: string;
  name: string;
  width: number;       // colunas ocupadas
  height: number;      // linhas ocupadas
  x: number;           // coluna inicial (0 a 4)
  y: number;           // linha inicial (0 a 4)
  imageUrl: string;    // imagem da peça
  borderColor: string; // borda do item
  bgColor: string;     // fundo do item
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
   TELA DA ARENA (INVENTÁRIOS ESTILO TETRIS / PUZZLE)
   ======================================================== */
function BattleScreen({ onBack }: { onBack: () => void }) {
  // 1 Item inicial do Jogador (Lâmina 3x1 posicionada)
  const [playerItems] = useState<Item[]>([
    {
      id: "espada-celestial",
      name: "Espada Celestial",
      width: 3, // 3 colunas
      height: 1, // 1 linha
      x: 1,
      y: 1,
      borderColor: "border-[#38bdf8]",
      bgColor: "bg-[#14293e]",
      imageUrl: "https://placehold.co/240x70/14293e/38bdf8.png?text=Lâmina+Celestial",
    },
  ]);

  // Itens do Chefe: réplica completa da segunda imagem (preenchimento 100% dos 25 blocos)
  const [bossItems] = useState<Item[]>([
    // 1. Glaive Vertical à esquerda (1x5)
    {
      id: "glaive-vert",
      name: "Glaive",
      width: 1,
      height: 5,
      x: 0,
      y: 0,
      borderColor: "border-[#7c3aed]",
      bgColor: "bg-[#251036]",
      imageUrl: "https://placehold.co/70x320/251036/c084fc.png?text=Glaive",
    },
    // 2. Glaive Horizontal no topo (4x1)
    {
      id: "glaive-horiz",
      name: "Glaive da Noite",
      width: 4,
      height: 1,
      x: 1,
      y: 0,
      borderColor: "border-[#7c3aed]",
      bgColor: "bg-[#251036]",
      imageUrl: "https://placehold.co/280x70/251036/c084fc.png?text=Glaive+da+Noite",
    },
    // 3. Armadura de Chifres (2x2)
    {
      id: "armadura-chifres",
      name: "Armadura de Chifres",
      width: 2,
      height: 2,
      x: 1,
      y: 1,
      borderColor: "border-[#852a32]",
      bgColor: "bg-[#331416]",
      imageUrl: "https://placehold.co/140x140/331416/f87171.png?text=Armadura",
    },
    // 4. Armadura Carmesim (2x2)
    {
      id: "armadura-carmesim",
      name: "Armadura Carmesim",
      width: 2,
      height: 2,
      x: 3,
      y: 1,
      borderColor: "border-[#852a32]",
      bgColor: "bg-[#331416]",
      imageUrl: "https://placehold.co/140x140/331416/f87171.png?text=Armadura+2",
    },
    // 5. Coração Amaldiçoado (2x2)
    {
      id: "coracao-1",
      name: "Coração Amaldiçoado",
      width: 2,
      height: 2,
      x: 1,
      y: 3,
      borderColor: "border-[#7c3aed]",
      bgColor: "bg-[#251036]",
      imageUrl: "https://placehold.co/140x140/251036/c084fc.png?text=Coração",
    },
    // 6. Máscara Oni (2x2)
    {
      id: "coracao-2",
      name: "Máscara Oni",
      width: 2,
      height: 2,
      x: 3,
      y: 3,
      borderColor: "border-[#852a32]",
      bgColor: "bg-[#331416]",
      imageUrl: "https://placehold.co/140x140/331416/f87171.png?text=Máscara",
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#3a6b8c] via-[#5484a6] to-[#7aa9c8] p-4">
      {/* 1. HUD SUPERIOR */}
      <header className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        {/* Jogador */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>JOGADOR 1 (Você)</span>
            <span className="text-xs">245 / 300</span>
          </div>
          <div className="h-5 w-full bg-[#171c26] border border-slate-600 rounded-md overflow-hidden flex items-center relative">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1 z-10" />
            <div className="h-full bg-red-600 w-[81%]" />
          </div>
          <div className="h-4 w-full bg-[#171c26] border border-slate-600 rounded-md overflow-hidden flex items-center relative">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1 z-10" />
            <div className="h-full bg-sky-500 w-[80%]" />
          </div>
        </div>

        {/* Round central */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#271f1a] border-2 border-[#544337] flex flex-col items-center justify-center shadow-lg">
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
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>CHEFE (Guardião)</span>
            <span className="text-xs">512 / 600</span>
          </div>
          <div className="h-5 w-full bg-[#171c26] border border-slate-600 rounded-md overflow-hidden flex items-center relative">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1 z-10" />
            <div className="h-full bg-red-600 w-[85%] ml-auto" />
          </div>
          <div className="h-4 w-full bg-[#171c26] border border-slate-600 rounded-md overflow-hidden flex items-center relative">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1 z-10" />
            <div className="h-full bg-sky-500 w-[75%] ml-auto" />
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS (LIVRES NA TELA, SEM QUADRADOS) */}
      <section className="max-w-6xl w-full mx-auto flex justify-between items-end my-2 px-6 h-48 md:h-56 pointer-events-none">
        <div className="flex flex-col items-center">
          <img
            src="https://placehold.co/160x220/transparent/white.png?text=Guerreiro+PNG"
            alt="Jogador"
            className="h-44 md:h-52 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div className="flex flex-col items-center pb-8 font-mono font-black text-center drop-shadow-md">
          <span className="text-xl text-red-500">-21 Dano</span>
          <span className="text-sm text-sky-300">-50 Escudo</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src="https://placehold.co/180x220/transparent/red.png?text=Guardião+PNG"
            alt="Chefe"
            className="h-44 md:h-52 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>
      </section>

      {/* 3. ESPAÇOS DE ITENS (PUZZLE 5x5 LIMPO, SEM TEXTOS E SEM PONTOS) */}
      <section className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center items-center">
        {/* ================= INVENTÁRIO DO JOGADOR (BASE LIMPA) ================= */}
        <div className="w-full max-w-[380px] aspect-square bg-[#101724] border-4 border-[#1f2b3e] rounded-2xl p-2.5 shadow-2xl grid grid-cols-5 grid-rows-5 gap-1.5 relative">
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
                className="w-full flex-1 object-contain max-h-12 my-0.5"
              />
              <span className="text-[9px] font-bold text-slate-300">
                {item.width}x{item.height}
              </span>
            </div>
          ))}
        </div>

        {/* ================= EQUIPAMENTO DO CHEFE (TOTALMENTE PREENCHIDO) ================= */}
        <div className="w-full max-w-[380px] aspect-square bg-[#170e1c] border-4 border-[#2d182e] rounded-2xl p-2.5 shadow-2xl grid grid-cols-5 grid-rows-5 gap-1.5 relative">
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
                className="w-full flex-1 object-contain max-h-12 my-0.5"
              />
              <span className="text-[9px] font-bold text-slate-300">
                {item.width}x{item.height}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BOTÕES DE AÇÃO */}
      <footer className="max-w-md w-full mx-auto flex items-center gap-4 mt-3 pb-2">
        <button className="flex-1 py-3 rounded-xl bg-[#243142] hover:bg-[#2c3d52] border-2 border-[#3d5069] text-white font-bold text-sm tracking-wider uppercase shadow">
          PREPARAÇÃO
        </button>
        <button className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg">
          LUTAR
        </button>
      </footer>
    </div>
  );
}