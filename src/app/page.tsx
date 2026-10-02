"use client";

import React, { useState, useEffect } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft, Coins, ShoppingBag, Backpack, Lock, CheckCircle2, FastForward, Flag, Trophy, RotateCcw, DollarSign, X } from "lucide-react";

type ScreenState = "HOME" | "LOGIN" | "INVENTORY_PREP" | "BATTLE";

export interface ItemData {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  imageUrl: string;
  borderColor: string;
  bgColor: string;
  price: number;
  sellPrice: number;   // Valor recebido ao vender
  cooldown?: number;    // Tempo em segundos para carregar o golpe
  stats: {
    damage?: number;
    armor?: number;
    health?: number;
    specialEffect?: string;
  };
}

export interface PlacedItem extends ItemData {
  instanceId: string;
  x: number;
  y: number;
}

const SHOP_CATALOG: ItemData[] = [
  {
    id: "espada-celestial",
    name: "Espada Celestial",
    type: "Arma Celestial",
    width: 2,
    height: 2,
    price: 60,
    sellPrice: 42,
    cooldown: 3.5, // 3.5 segundos de recarga
    imageUrl: "/espada.png",
    borderColor: "border-[#38bdf8]",
    bgColor: "bg-[#14293e]/90",
    stats: {
      damage: 15,
      specialEffect: "Chance de congelar o carregamento do inimigo",
    },
  },
  {
    id: "escudo-dragao",
    name: "Escudo do Dragão",
    type: "Escudo Dracônico",
    width: 1,
    height: 1,
    price: 35,
    sellPrice: 25,
    imageUrl: "/escudo.png",
    borderColor: "border-[#22c55e]",
    bgColor: "bg-[#0f2e1a]/90",
    stats: {
      armor: 15,
    },
  },
  {
    id: "coracao-amaldicoado",
    name: "Coração Biomecânico",
    type: "Órgão Sombrio",
    width: 1,
    height: 1,
    price: 45,
    sellPrice: 32,
    imageUrl: "/coracao.png",
    borderColor: "border-[#8b5cf6]",
    bgColor: "bg-[#251036]/90",
    stats: {
      health: 150,
    },
  },
  {
    id: "armadura-carmesim",
    name: "Armadura Carmesim",
    type: "Armadura Pesada",
    width: 2,
    height: 2,
    price: 80,
    sellPrice: 56,
    imageUrl: "/armadura.png",
    borderColor: "border-[#ef4444]",
    bgColor: "bg-[#331416]/90",
    stats: {
      armor: 150,
    },
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("HOME");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [gold, setGold] = useState<number>(150);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

  // Inventário Normal 10x6 (Estoque)
  const [normalInventory, setNormalInventory] = useState<PlacedItem[]>([]);

  // Mochila de Batalha 5x5 do Jogador
  const [playerBattleItems, setPlayerBattleItems] = useState<PlacedItem[]>([]);

  // Mochila do Chefe 5x5 (Inicia com Armadura 2x2 e Espada 2x2)
  const [bossItems] = useState<PlacedItem[]>([
    {
      ...SHOP_CATALOG[3], // Armadura Carmesim
      instanceId: "boss-armor",
      x: 1,
      y: 1,
    },
    {
      ...SHOP_CATALOG[0], // Espada do Chefe
      instanceId: "boss-sword",
      cooldown: 3.5,
      x: 3,
      y: 1,
      borderColor: "border-[#8b5cf6]",
      bgColor: "bg-[#2b143d]/90",
    },
  ]);

  // COMPRAR ITEM DA LOJA
  const buyItem = (itemData: ItemData) => {
    if (gold < itemData.price) {
      alert("Ouro insuficiente!");
      return;
    }

    let placedX = -1;
    let placedY = -1;

    for (let r = 0; r <= 6 - itemData.height; r++) {
      for (let c = 0; c <= 10 - itemData.width; c++) {
        const hasCollision = normalInventory.some((placed) => {
          return (
            c < placed.x + placed.width &&
            c + itemData.width > placed.x &&
            r < placed.y + placed.height &&
            r + itemData.height > placed.y
          );
        });

        if (!hasCollision) {
          placedX = c;
          placedY = r;
          break;
        }
      }
      if (placedX !== -1) break;
    }

    if (placedX === -1) {
      alert("Seu Inventário Normal (10x6) está cheio!");
      return;
    }

    const newItem: PlacedItem = {
      ...itemData,
      instanceId: `item-${Date.now()}-${Math.random()}`,
      x: placedX,
      y: placedY,
    };

    setGold((prev) => prev - itemData.price);
    setNormalInventory((prev) => [...prev, newItem]);
  };

  // VENDER ITEM (RECUPERA OURO)
  const sellItem = (item: PlacedItem, source: "normal" | "battle") => {
    setGold((prev) => prev + item.sellPrice);
    if (source === "normal") {
      setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    } else {
      setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    }
  };

  // EQUIPAR NO 5x5
  const equipToBattle = (item: PlacedItem) => {
    let placedX = -1;
    let placedY = -1;

    for (let r = 0; r <= 5 - item.height; r++) {
      for (let c = 0; c <= 5 - item.width; c++) {
        const hasCollision = playerBattleItems.some((bItem) => {
          return (
            c < bItem.x + bItem.width &&
            c + item.width > bItem.x &&
            r < bItem.y + bItem.height &&
            r + item.height > bItem.y
          );
        });

        if (!hasCollision) {
          placedX = c;
          placedY = r;
          break;
        }
      }
      if (placedX !== -1) break;
    }

    if (placedX === -1) {
      alert("Mochila de batalha (5x5) sem espaço para esta peça!");
      return;
    }

    setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setPlayerBattleItems((prev) => [...prev, { ...item, x: placedX, y: placedY }]);
  };

  // DESEQUIPAR PARA O 10x6
  const unequipToNormal = (item: PlacedItem) => {
    let placedX = -1;
    let placedY = -1;

    for (let r = 0; r <= 6 - item.height; r++) {
      for (let c = 0; c <= 10 - item.width; c++) {
        const hasCollision = normalInventory.some((nItem) => {
          return (
            c < nItem.x + nItem.width &&
            c + item.width > nItem.x &&
            r < nItem.y + nItem.height &&
            r + item.height > nItem.y
          );
        });

        if (!hasCollision) {
          placedX = c;
          placedY = r;
          break;
        }
      }
      if (placedX !== -1) break;
    }

    setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setNormalInventory((prev) => [...prev, { ...item, x: Math.max(0, placedX), y: Math.max(0, placedY) }]);
  };

  const handleVictory = () => {
    setGold((prev) => prev + 100);
    setUnlockedLevel((prev) => Math.max(prev, 2));
  };

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none">
      <style jsx global>{`
        @keyframes projectileFlyRight {
          0% { left: 20%; opacity: 0; transform: translateY(-50%) scale(0.6); }
          15% { opacity: 1; transform: translateY(-50%) scale(1); }
          85% { opacity: 1; transform: translateY(-50%) scale(1.1); }
          100% { left: 78%; opacity: 0; transform: translateY(-50%) scale(1.2); }
        }

        @keyframes projectileFlyLeft {
          0% { right: 20%; opacity: 0; transform: translateY(-50%) scale(0.6) scaleX(-1); }
          15% { opacity: 1; transform: translateY(-50%) scale(1) scaleX(-1); }
          85% { opacity: 1; transform: translateY(-50%) scale(1.1) scaleX(-1); }
          100% { right: 78%; opacity: 0; transform: translateY(-50%) scale(1.2) scaleX(-1); }
        }

        @keyframes characterShake {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(0.95) translateX(6px); filter: brightness(1.7) drop-shadow(0 0 15px #ef4444); }
        }

        .animate-projectile-right {
          animation: projectileFlyRight var(--fly-time, 0.4s) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-projectile-left {
          animation: projectileFlyLeft var(--fly-time, 0.4s) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-shake {
          animation: characterShake 0.25s ease-in-out;
        }
      `}</style>

      {currentScreen === "HOME" && (
        <HomeScreen
          isLoggedIn={isLoggedIn}
          gold={gold}
          unlockedLevel={unlockedLevel}
          onLoginClick={() => setCurrentScreen("LOGIN")}
          onLogoutClick={() => setIsLoggedIn(false)}
          onGoToPrep={() => setCurrentScreen("INVENTORY_PREP")}
          onStartLevel={(lvl) => {
            if (lvl <= unlockedLevel) setCurrentScreen("BATTLE");
          }}
        />
      )}

      {currentScreen === "LOGIN" && (
        <LoginScreen
          onSuccess={() => {
            setIsLoggedIn(true);
            setCurrentScreen("HOME");
          }}
          onBack={() => setCurrentScreen("HOME")}
        />
      )}

      {currentScreen === "INVENTORY_PREP" && (
        <InventoryPrepScreen
          gold={gold}
          normalInventory={normalInventory}
          playerBattleItems={playerBattleItems}
          onBuyItem={buyItem}
          onSellItem={sellItem}
          onEquipItem={equipToBattle}
          onUnequipItem={unequipToNormal}
          onGoToBattle={() => setCurrentScreen("BATTLE")}
          onBack={() => setCurrentScreen("HOME")}
        />
      )}

      {currentScreen === "BATTLE" && (
        <BattleScreen
          playerItems={playerBattleItems}
          bossItems={bossItems}
          onVictory={handleVictory}
          onGiveUp={() => setCurrentScreen("INVENTORY_PREP")}
          onBackToMenu={() => setCurrentScreen("HOME")}
        />
      )}
    </main>
  );
}

/* ========================================================
   COMPONENTE DO PROJÉTIL DE FOGO E RAIOS CIANO
   ======================================================== */
function PlasmaProjectile({ type }: { type: "player" | "boss" }) {
  if (type === "player") {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-projectile-right flex items-center">
        <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="drop-shadow-[0_0_15px_#f97316]">
          <path d="M5 30C30 25 50 18 90 20C120 22 150 12 165 30C150 48 120 38 90 40C50 42 30 35 5 30Z" fill="url(#fireGradient)" />
          <ellipse cx="145" cy="30" rx="22" ry="14" fill="#fef08a" />
          <ellipse cx="152" cy="30" rx="14" ry="10" fill="#ffffff" />
          <path d="M60 22L80 14L95 28L120 16L140 25L160 12" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_#22d3ee]" />
          <path d="M85 36L105 44L125 32L145 42L165 30" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_#38bdf8]" />
          <defs>
            <linearGradient id="fireGradient" x1="0" y1="30" x2="170" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-projectile-left flex items-center">
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="drop-shadow-[0_0_15px_#9333ea]">
        <path d="M5 30C30 25 50 18 90 20C120 22 150 12 165 30C150 48 120 38 90 40C50 42 30 35 5 30Z" fill="url(#bossDarkGradient)" />
        <ellipse cx="145" cy="30" rx="22" ry="14" fill="#f472b6" />
        <ellipse cx="152" cy="30" rx="14" ry="10" fill="#ffffff" />
        <path d="M60 22L80 14L95 28L120 16L140 25L160 12" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_#c084fc]" />
        <defs>
          <linearGradient id="bossDarkGradient" x1="0" y1="30" x2="170" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#581c87" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#7e22ce" />
            <stop offset="75%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ========================================================
   COMPONENTE DO TOOLTIP DE ESPECIFICAÇÕES
   ======================================================== */
function ItemTooltip({ item }: { item: ItemData }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#090f18]/95 backdrop-blur-md border border-cyan-500/60 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.95)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex flex-col gap-1.5 text-left">
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
            <span>⚔️</span> +{item.stats.damage} de Dano {item.cooldown && `(${item.cooldown}s)`}
          </div>
        )}
        {item.stats.armor && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <Shield size={13} className="text-sky-400 fill-sky-400/20" /> +{item.stats.armor} de Armadura
          </div>
        )}
        {item.stats.health && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Heart size={13} className="text-emerald-400 fill-emerald-400/20" /> +{item.stats.health} de Vida
          </div>
        )}
        {item.stats.specialEffect && (
          <div className="mt-1 pt-1 border-t border-slate-800 flex items-start gap-1.5 text-[11px] font-medium text-cyan-200 leading-tight">
            <span>❄️</span> {item.stats.specialEffect}
          </div>
        )}
      </div>

      <div className="pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-bold text-amber-400">
        <span>Venda: {item.sellPrice} Ouro</span>
        <span className="text-slate-400">Clique para Opções</span>
      </div>
    </div>
  );
}

/* ========================================================
   TELA INICIAL
   ======================================================== */
function HomeScreen({
  isLoggedIn,
  gold,
  unlockedLevel,
  onLoginClick,
  onLogoutClick,
  onGoToPrep,
  onStartLevel,
}: {
  isLoggedIn: boolean;
  gold: number;
  unlockedLevel: number;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onGoToPrep: () => void;
  onStartLevel: (lvl: number) => void;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 bg-gradient-to-b from-[#2a4d69] via-[#1a2f44] to-[#0c1622]">
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <span className="font-extrabold tracking-widest text-lg text-slate-100">
          AERIA <span className="text-cyan-400">NEXUS</span>
        </span>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold text-sm shadow">
              <Coins size={16} /> {gold} Ouro
            </div>
            <button onClick={onLogoutClick} className="text-xs text-slate-400 hover:text-white underline">
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-400/50 bg-[#162738] hover:bg-cyan-500/20 text-cyan-300 font-bold transition-all"
          >
            <LogIn size={18} /> Entrar / Cadastrar
          </button>
        )}
      </header>

      <section className="flex flex-col items-center text-center my-auto px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
          AERIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">NEXUS</span>
        </h1>
        <p className="max-w-md text-slate-300 text-sm md:text-base mb-6">
          Selecione uma fase para entrar direto na batalha automática em tempo real.
        </p>

        {isLoggedIn ? (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full bg-[#121c2b]/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase mb-4 text-left">
                SELEÇÃO DE FASES (CLIQUE PARA LUTAR)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => onStartLevel(1)}
                  className="cursor-pointer group relative bg-gradient-to-b from-[#2d121c] to-[#180a11] border-2 border-red-500 hover:border-red-400 rounded-xl p-4 flex flex-col items-center justify-between shadow-lg transition-all hover:scale-105"
                >
                  <span className="text-[10px] font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40">
                    NÍVEL 1
                  </span>
                  <img
                    src="/chefe.png"
                    alt="Guardião Oni"
                    className="h-28 object-contain my-2 drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)]"
                  />
                  <span className="text-xs font-black text-white tracking-wide">
                    Guardião Oni (Ignis-Vex)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <Play size={12} fill="#34d399" /> Iniciar Combate
                  </span>
                </div>

                <div
                  onClick={() => unlockedLevel >= 2 && onStartLevel(2)}
                  className={`relative rounded-xl p-4 flex flex-col items-center justify-between shadow transition-all ${
                    unlockedLevel >= 2
                      ? "cursor-pointer bg-gradient-to-b from-[#221035] to-[#12081d] border-2 border-purple-500 hover:scale-105"
                      : "opacity-60 bg-[#131b26] border border-slate-700 cursor-not-allowed"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    NÍVEL 2
                  </span>
                  <div className="h-28 flex items-center justify-center text-slate-500">
                    {unlockedLevel >= 2 ? (
                      <CheckCircle2 size={40} className="text-purple-400" />
                    ) : (
                      <Lock size={36} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-300">Rainha da Colmeia</span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {unlockedLevel >= 2 ? "Desbloqueado!" : "Vença o Nível 1"}
                  </span>
                </div>

                <div className="opacity-60 relative bg-[#131b26] border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between shadow">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    NÍVEL 3
                  </span>
                  <div className="h-28 flex items-center justify-center text-slate-500">
                    <Lock size={36} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Arquilorde de Éter</span>
                  <span className="text-[10px] text-slate-500 mt-1">Vença o Nível 2</span>
                </div>
              </div>
            </div>

            <button
              onClick={onGoToPrep}
              className="py-3.5 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 text-white shadow-lg transition-all flex items-center gap-2"
            >
              <Backpack size={18} />
              ORGANIZAR MOCHILA & LOJA
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-3 px-10 py-4 rounded-xl font-black text-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg transition-all"
          >
            ENTRAR PARA JOGAR
          </button>
        )}
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
function LoginScreen({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#0c1622] relative">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="w-full max-w-sm bg-[#131c29] border border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Login</h2>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            defaultValue="piloto@nexus.bio"
            className="w-full bg-[#0a1018] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <input
            type="password"
            defaultValue="123456"
            className="w-full bg-[#0a1018] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={onSuccess}
            className="w-full mt-2 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold"
          >
            Acessar o Nexus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   TELA DE PREPARAÇÃO COM DRAG & DROP E MODAL DE VENDA
   ======================================================== */
function InventoryPrepScreen({
  gold,
  normalInventory,
  playerBattleItems,
  onBuyItem,
  onSellItem,
  onEquipItem,
  onUnequipItem,
  onGoToBattle,
  onBack,
}: {
  gold: number;
  normalInventory: PlacedItem[];
  playerBattleItems: PlacedItem[];
  onBuyItem: (item: ItemData) => void;
  onSellItem: (item: PlacedItem, source: "normal" | "battle") => void;
  onEquipItem: (item: PlacedItem) => void;
  onUnequipItem: (item: PlacedItem) => void;
  onGoToBattle: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "SHOP">("INVENTORY");

  // Item selecionado para o menu de ações (Vender / Equipar / Desequipar)
  const [selectedActionItem, setSelectedActionItem] = useState<{
    item: PlacedItem;
    source: "normal" | "battle";
  } | null>(null);

  // MANIPULADORES DE DRAG & DROP
  const handleDragStart = (e: React.DragEvent, item: PlacedItem, source: "normal" | "battle") => {
    e.dataTransfer.setData("application/json", JSON.stringify({ item, source }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnBattle = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const { item, source } = JSON.parse(dataStr);
      if (source === "normal") {
        onEquipItem(item);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDropOnNormal = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const { item, source } = JSON.parse(dataStr);
      if (source === "battle") {
        onUnequipItem(item);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-6 bg-[#0a0f18] text-slate-100">
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center pb-4 border-b border-slate-800">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold">
          <ArrowLeft size={18} /> Voltar ao Menu
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/60 text-amber-300 font-bold text-sm">
            <Coins size={16} /> {gold} Ouro
          </div>

          <button
            onClick={onGoToBattle}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all"
          >
            <Play fill="#020617" size={16} /> IR PARA BATALHA
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto flex gap-4 mt-4">
        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "INVENTORY"
              ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Backpack size={18} /> MOCHILA & ESTOQUE
        </button>

        <button
          onClick={() => setActiveTab("SHOP")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "SHOP"
              ? "bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag size={18} /> LOJA DO NEXUS
        </button>
      </div>

      <div className="max-w-7xl w-full mx-auto my-auto py-4">
        {activeTab === "SHOP" ? (
          <div className="bg-[#101724] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-black text-amber-400 tracking-wider uppercase mb-1">
              LOJA DE PEÇAS & ARMAS
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Passe o mouse para ver os detalhes da peça antes de comprar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SHOP_CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#0b1019] border border-slate-800 hover:border-cyan-500/60 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-lg relative transition-all"
                >
                  {/* Tooltip Universal na Loja */}
                  <ItemTooltip item={item} />

                  <span className="text-xs font-black text-white">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.type} ({item.width}x{item.height})</span>

                  <img src={item.imageUrl} alt={item.name} className="h-28 object-contain my-3 drop-shadow" />

                  <div className="text-[11px] font-bold text-slate-300 mb-3">
                    {item.stats.damage && <div className="text-red-400">+{item.stats.damage} Dano ({item.cooldown}s)</div>}
                    {item.stats.armor && <div className="text-sky-400">+{item.stats.armor} Armadura</div>}
                    {item.stats.health && <div className="text-emerald-400">+{item.stats.health} Vida</div>}
                  </div>

                  <button
                    onClick={() => onBuyItem(item)}
                    disabled={gold < item.price}
                    className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                      gold >= item.price
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <Coins size={14} /> COMPRAR ({item.price} OURO)
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 1. INVENTÁRIO NORMAL (ESTOQUE 10x6) - ACEITA DROP */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    INVENTÁRIO NORMAL (ESTOQUE 10x6)
                  </h3>
                  <span className="text-xs text-slate-400">Arraste ou clique para opções / venda</span>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
                  {normalInventory.length} Peças
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnNormal}
                className="w-full aspect-[10/6] bg-[#0c121d] border-4 border-[#1b2636] rounded-2xl p-2.5 shadow-2xl relative"
              >
                <div className="absolute inset-2.5 grid grid-cols-10 grid-rows-6 gap-1 pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-700/20 bg-slate-800/10" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-10 grid-rows-6 gap-1">
                  {normalInventory.map((item) => (
                    <div
                      key={item.instanceId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, "normal")}
                      onClick={() => setSelectedActionItem({ item, source: "normal" })}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-lg border-2 ${item.borderColor} ${item.bgColor} p-1 flex items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all`}
                    >
                      {/* Tooltip ao passar o mouse */}
                      <ItemTooltip item={item} />

                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. MOCHILA DE BATALHA (5x5) - ACEITA DROP */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    MOCHILA DE BATALHA (5x5)
                  </h3>
                  <span className="text-xs text-slate-400">Solte os itens aqui para o combate</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  {playerBattleItems.length} Equipados
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnBattle}
                className="w-full aspect-square bg-[#0e1624] border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative"
              >
                <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-cyan-400/15 bg-cyan-950/20" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
                  {playerBattleItems.map((item) => (
                    <div
                      key={item.instanceId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, "battle")}
                      onClick={() => setSelectedActionItem({ item, source: "battle" })}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing hover:brightness-110 transition-all`}
                    >
                      {/* Tooltip ao passar o mouse */}
                      <ItemTooltip item={item} />

                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE AÇÕES DO ITEM: VENDER / EQUIPAR / GUARDAR */}
      {selectedActionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-[#111927] border-2 border-slate-700 rounded-2xl p-5 shadow-2xl relative flex flex-col items-center">
            <button
              onClick={() => setSelectedActionItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <img
              src={selectedActionItem.item.imageUrl}
              alt={selectedActionItem.item.name}
              className="h-28 object-contain my-2 drop-shadow"
            />

            <h3 className="text-base font-black text-white">{selectedActionItem.item.name}</h3>
            <span className="text-xs text-slate-400 mb-4">{selectedActionItem.item.type} ({selectedActionItem.item.width}x{selectedActionItem.item.height})</span>

            <div className="w-full flex flex-col gap-2.5">
              {selectedActionItem.source === "normal" ? (
                <button
                  onClick={() => {
                    onEquipItem(selectedActionItem.item);
                    setSelectedActionItem(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow transition-all"
                >
                  Equipar na Mochila (5x5)
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUnequipItem(selectedActionItem.item);
                    setSelectedActionItem(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs uppercase shadow transition-all"
                >
                  Guardar no Estoque (10x6)
                </button>
              )}

              <button
                onClick={() => {
                  onSellItem(selectedActionItem.item, selectedActionItem.source);
                  setSelectedActionItem(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow flex items-center justify-center gap-1.5 transition-all"
              >
                <DollarSign size={16} /> Vender por +{selectedActionItem.item.sellPrice} Ouro
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-slate-500 py-2 border-t border-slate-800">
        Aeria Nexus — Arraste para equipar/desequipar ou clique para vender itens.
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA (BATALHA)
   ======================================================== */
function BattleScreen({
  playerItems,
  bossItems,
  onVictory,
  onGiveUp,
  onBackToMenu,
}: {
  playerItems: PlacedItem[];
  bossItems: PlacedItem[];
  onVictory: () => void;
  onGiveUp: () => void;
  onBackToMenu: () => void;
}) {
  const extraHealth = playerItems.reduce((acc, item) => acc + (item.stats.health || 0), 0);
  const extraArmor = playerItems.reduce((acc, item) => acc + (item.stats.armor || 0), 0);
  const playerSword = playerItems.find((i) => i.id === "espada-celestial");
  const playerDamage = playerSword?.stats.damage || (playerItems.length > 0 ? 5 : 2);
  const playerCooldown = playerSword?.cooldown || 3.5; // Recarga de 3.5s

  const bossSword = bossItems.find((i) => i.id === "espada-celestial");
  const bossDamage = 25;
  const bossCooldown = bossSword?.cooldown || 3.5;

  const maxPlayerHp = 300 + extraHealth;
  const maxPlayerShield = 80 + extraArmor;
  const maxBossHp = 600;
  const maxBossShield = 350;

  const [playerHp, setPlayerHp] = useState<number>(maxPlayerHp);
  const [playerShield, setPlayerShield] = useState<number>(maxPlayerShield);
  const [bossHp, setBossHp] = useState<number>(maxBossHp);
  const [bossShield, setBossShield] = useState<number>(maxBossShield);

  const [playerCharge, setPlayerCharge] = useState<number>(0);
  const [bossCharge, setBossCharge] = useState<number>(0);

  const [playerShooting, setPlayerShooting] = useState<boolean>(false);
  const [bossShooting, setBossShooting] = useState<boolean>(false);

  const [bossShaking, setBossShaking] = useState<boolean>(false);
  const [playerShaking, setPlayerShaking] = useState<boolean>(false);

  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [combatStatus, setCombatStatus] = useState<"FIGHTING" | "VICTORY" | "DEFEAT">("FIGHTING");
  const [floatingDamage, setFloatingDamage] = useState<{ text: string; color: string } | null>(null);
  const [bossFrozenTimer, setBossFrozenTimer] = useState<number>(0);

  const projectileFlightTime = speedMultiplier === 1 ? 400 : 200;

  useEffect(() => {
    if (combatStatus !== "FIGHTING") return;

    const tickMs = 50;
    const deltaSeconds = (tickMs / 1000) * speedMultiplier;

    const interval = setInterval(() => {
      // 1. CARREGAMENTO DO JOGADOR
      setPlayerCharge((prev) => {
        const next = prev + (deltaSeconds / playerCooldown) * 100;
        if (next >= 100) {
          setPlayerShooting(true);

          setTimeout(() => {
            const willFreeze = Math.random() < 0.35;
            if (willFreeze) setBossFrozenTimer(2.0);

            setBossShaking(true);
            setTimeout(() => setBossShaking(false), 250);

            setBossShield((prevShield) => {
              let remDmg = playerDamage;
              let newShield = prevShield;

              if (prevShield > 0) {
                if (prevShield >= remDmg) {
                  newShield = prevShield - remDmg;
                  remDmg = 0;
                } else {
                  remDmg -= prevShield;
                  newShield = 0;
                }
              }

              if (remDmg > 0) {
                setBossHp((prevHp) => {
                  const finalHp = Math.max(0, prevHp - remDmg);
                  if (finalHp === 0) {
                    setCombatStatus("VICTORY");
                    onVictory();
                  }
                  return finalHp;
                });
              }
              return newShield;
            });

            setFloatingDamage({
              text: willFreeze ? `-${playerDamage} (❄️ CONGELADO!)` : `-${playerDamage} Dano`,
              color: willFreeze ? "text-cyan-300" : "text-red-500",
            });

            setPlayerShooting(false);
          }, projectileFlightTime);

          return 0;
        }
        return next;
      });

      // 2. CARREGAMENTO DO CHEFE
      setBossFrozenTimer((prevFreeze) => {
        if (prevFreeze > 0) {
          return Math.max(0, prevFreeze - deltaSeconds);
        }

        setBossCharge((prev) => {
          const next = prev + (deltaSeconds / bossCooldown) * 100;
          if (next >= 100) {
            setBossShooting(true);

            setTimeout(() => {
              setPlayerShaking(true);
              setTimeout(() => setPlayerShaking(false), 250);

              setPlayerShield((prevShield) => {
                let remDmg = bossDamage;
                let newShield = prevShield;

                if (prevShield > 0) {
                  if (prevShield >= remDmg) {
                    newShield = prevShield - remDmg;
                    remDmg = 0;
                  } else {
                    remDmg -= prevShield;
                    newShield = 0;
                  }
                }

                if (remDmg > 0) {
                  setPlayerHp((prevHp) => {
                    const finalHp = Math.max(0, prevHp - remDmg);
                    if (finalHp === 0) {
                      setCombatStatus("DEFEAT");
                    }
                    return finalHp;
                  });
                }
                return newShield;
              });

              setBossShooting(false);
            }, projectileFlightTime);

            return 0;
          }
          return next;
        });

        return 0;
      });

    }, tickMs);

    return () => clearInterval(interval);
  }, [combatStatus, speedMultiplier, playerCooldown, bossCooldown, playerDamage, projectileFlightTime]);

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
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>JOGADOR 1 (Você)</span>
            <span className="text-xs">{playerHp} / {maxPlayerHp}</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div className="h-full bg-red-600 transition-all duration-150" style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }} />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div className="h-full bg-sky-500 transition-all duration-150" style={{ width: `${(playerShield / maxPlayerShield) * 100}%` }} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#271f1a] border-2 border-[#544337] flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[9px] font-black text-amber-400 uppercase">ROUND</span>
            <span className="text-xl font-black text-white leading-none">1</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold mt-1 bg-black/60 px-2 py-0.5 rounded animate-pulse">
            CARREGANDO GOLPES
          </span>
        </div>

        <div className="w-full max-w-[420px] md:ml-auto flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>CHEFE (Guardião Oni)</span>
            <span className="text-xs">{bossHp} / {maxBossHp}</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div className="h-full bg-red-600 transition-all duration-150 ml-auto" style={{ width: `${(bossHp / maxBossHp) * 100}%` }} />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div className="h-full bg-sky-500 transition-all duration-150 ml-auto" style={{ width: `${(bossShield / maxBossShield) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS COM DISPARO DE PROJÉTIL */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-end my-1 h-52 md:h-64 pointer-events-none relative z-10">
        <div className="w-full max-w-[420px] flex justify-center">
          <img
            src="/jogador.png"
            alt="Jogador"
            className={`h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all ${
              playerShaking ? "animate-shake" : ""
            }`}
          />
        </div>

        <div className="relative flex flex-col items-center justify-center pb-8 font-mono font-black text-center drop-shadow min-h-[80px] w-full">
          {playerShooting && (
            <div style={{ "--fly-time": `${projectileFlightTime}ms` } as React.CSSProperties}>
              <PlasmaProjectile type="player" />
            </div>
          )}

          {bossShooting && (
            <div style={{ "--fly-time": `${projectileFlightTime}ms` } as React.CSSProperties}>
              <PlasmaProjectile type="boss" />
            </div>
          )}

          {floatingDamage && (
            <span className={`text-xl md:text-2xl font-black ${floatingDamage.color} animate-bounce z-40`}>
              {floatingDamage.text}
            </span>
          )}
        </div>

        <div className="w-full max-w-[420px] md:ml-auto flex justify-center">
          <img
            src="/chefe.png"
            alt="Chefe"
            className={`h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all ${
              bossFrozenTimer > 0 ? "brightness-125 hue-rotate-180 drop-shadow-[0_0_20px_#22d3ee]" : ""
            } ${bossShaking ? "animate-shake" : ""}`}
          />
        </div>
      </section>

      {/* 3. PAINÉIS DE INVENTÁRIO (COM TOOLTIPS AO PASSAR O MOUSE NA BATALHA) */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
        
        {/* INVENTÁRIO DO JOGADOR */}
        <div className="w-full max-w-[420px] aspect-square bg-[#0e1624]/90 backdrop-blur-sm border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-cyan-400/15 bg-cyan-950/20" />
            ))}
          </div>

          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {playerItems.map((item) => (
              <div
                key={item.instanceId}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative overflow-hidden`}
              >
                {/* Tooltip também na arena */}
                <ItemTooltip item={item} />

                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10" />

                {item.id === "espada-celestial" && (
                  <div className="absolute bottom-1.5 left-2 right-2 h-2 bg-black/80 rounded-full overflow-hidden border border-cyan-400/50 z-20 shadow">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-white transition-all duration-75 shadow-[0_0_10px_#22d3ee]"
                      style={{ width: `${playerCharge}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INVENTÁRIO DO CHEFE */}
        <div className="w-full max-w-[420px] md:ml-auto aspect-square bg-[#160c1a]/90 backdrop-blur-sm border-4 border-[#2c1533] rounded-2xl p-2.5 shadow-2xl relative">
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-purple-400/15 bg-purple-950/20" />
            ))}
          </div>

          <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
            {bossItems.map((item) => (
              <div
                key={item.instanceId}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }}
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative overflow-hidden`}
              >
                <ItemTooltip item={item} />

                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10" />

                {item.id === "espada-celestial" && (
                  <div className="absolute bottom-1.5 left-2 right-2 h-2 bg-black/80 rounded-full overflow-hidden border border-purple-400/50 z-20 shadow">
                    <div
                      className={`h-full transition-all duration-75 ${
                        bossFrozenTimer > 0
                          ? "bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                          : "bg-gradient-to-r from-purple-500 via-pink-400 to-white shadow-[0_0_10px_#c084fc]"
                      }`}
                      style={{ width: `${bossCharge}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BOTÕES: 2X E DESISTIR */}
      <footer className="max-w-md w-full mx-auto flex items-center gap-4 mt-3 pb-2 relative z-10">
        <button
          onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : 1))}
          className={`flex-1 py-3 rounded-xl border-2 font-black text-sm tracking-wider uppercase shadow flex items-center justify-center gap-2 transition-all ${
            speedMultiplier === 2
              ? "bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              : "bg-[#243142]/90 hover:bg-[#2c3d52] border-[#3d5069] text-white"
          }`}
        >
          <FastForward size={18} />
          {speedMultiplier === 2 ? "VELOCIDADE: 2X" : "VELOCIDADE: 1X"}
        </button>

        <button
          onClick={onGiveUp}
          className="flex-1 py-3 rounded-xl bg-red-950/80 hover:bg-red-900 border-2 border-red-600/80 text-red-200 font-black text-sm tracking-wider uppercase shadow flex items-center justify-center gap-2 transition-all"
        >
          <Flag size={18} />
          DESISTIR
        </button>
      </footer>

      {/* MODAL DE RESULTADO */}
      {combatStatus !== "FIGHTING" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-[#131c2b] border-2 border-slate-700 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
            {combatStatus === "VICTORY" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <Trophy size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">VITÓRIA NO NEXUS!</h2>
                <p className="text-sm text-slate-300 mb-4">Você derrotou o Guardião Oni e avançou de nível!</p>
                <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl px-4 py-2 text-amber-300 font-black text-sm mb-6 flex items-center gap-2">
                  <Coins size={18} /> +100 Ouro Obtido!
                </div>
                <button
                  onClick={onBackToMenu}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase shadow-lg transition-all"
                >
                  CONTINUAR NO MENU
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <RotateCcw size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">DERROTA</h2>
                <p className="text-sm text-slate-300 mb-6">Sua mochila precisa de mais equipamentos para resistir.</p>
                <button
                  onClick={onGiveUp}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase shadow-lg transition-all"
                >
                  VOLTAR PARA A LOJA & MOCHILA
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
