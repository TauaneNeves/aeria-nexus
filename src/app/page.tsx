"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  Heart,
  Play,
  LogIn,
  ArrowLeft,
  Coins,
  ShoppingBag,
  Backpack,
  Lock,
  CheckCircle2,
  FastForward,
  Flag,
  Trophy,
  RotateCcw,
  DollarSign,
  X,
  Compass,
  Sparkles,
  MapPin,
  Swords,
} from "lucide-react";
import { PlasmaProjectile } from "./components/PlasmaProjectile";

type ScreenState = "HOME" | "LOGIN" | "MAP" | "INVENTORY_PREP" | "BATTLE";

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
  sellPrice: number;
  cooldown?: number;
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

interface BossConfig {
  phase: number;
  name: string;
  title: string;
  islandImg: string;
  avatarImg: string;
  maxHp: number;
  maxShield: number;
  damage: number;
  cooldown: number;
  goldReward: number;
  relicReward: string;
  relicIcon: string;
}

const BOSS_PHASES: Record<number, BossConfig> = {
  1: {
    phase: 1,
    name: "Guardião Oni",
    title: "Templo das Brasas",
    islandImg: "/ilha1.png",
    avatarImg: "/chefe.png",
    maxHp: 220,
    maxShield: 60,
    damage: 12,
    cooldown: 3.8,
    goldReward: 100,
    relicReward: "Lágrima de Fogo do Oni",
    relicIcon: "🔥",
  },
  2: {
    phase: 2,
    name: "Rainha Colmeia",
    title: "Cânion do Vazio",
    islandImg: "/ilha2.png",
    avatarImg: "/chefe.png",
    maxHp: 340,
    maxShield: 120,
    damage: 17,
    cooldown: 3.4,
    goldReward: 150,
    relicReward: "Orbe de Éter",
    relicIcon: "🔮",
  },
  3: {
    phase: 3,
    name: "Arquilorde Celestial",
    title: "Cidadela Cósmica",
    islandImg: "/ilha3.png",
    avatarImg: "/chefe.png",
    maxHp: 480,
    maxShield: 180,
    damage: 22,
    cooldown: 3.0,
    goldReward: 250,
    relicReward: "Fragmento Celestial",
    relicIcon: "💎",
  },
};

const SHOP_CATALOG: ItemData[] = [
  {
    id: "espada-celestial",
    name: "Espada Celestial",
    type: "Arma Celestial",
    width: 2,
    height: 2,
    price: 60,
    sellPrice: 42,
    cooldown: 3.0,
    imageUrl: "/espada.png",
    borderColor: "border-[#38bdf8]",
    bgColor: "bg-[#14293e]/90",
    stats: {
      damage: 25,
      specialEffect: "40% de chance de congelar o chefe por 2s",
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
      armor: 50,
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
      armor: 120,
    },
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("HOME");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [gold, setGold] = useState<number>(150);
  const [unlockedProgress, setUnlockedProgress] = useState<number>(1);
  const [currentBossPhase, setCurrentBossPhase] = useState<number>(1);

  const [collectedRelics, setCollectedRelics] = useState<string[]>([]);
  const [normalInventory, setNormalInventory] = useState<PlacedItem[]>([]);
  const [playerBattleItems, setPlayerBattleItems] = useState<PlacedItem[]>([]);

  const [bossItems] = useState<PlacedItem[]>([
    {
      ...SHOP_CATALOG[3],
      instanceId: "boss-armor",
      x: 1,
      y: 1,
    },
    {
      ...SHOP_CATALOG[0],
      instanceId: "boss-sword",
      cooldown: 3.8,
      x: 3,
      y: 1,
      borderColor: "border-[#8b5cf6]",
      bgColor: "bg-[#2b143d]/90",
    },
  ]);

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

  const sellItem = (item: PlacedItem, source: "normal" | "battle") => {
    setGold((prev) => prev + item.sellPrice);
    if (source === "normal") {
      setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    } else {
      setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    }
  };

  const moveOrPlaceItem = (
    item: PlacedItem,
    source: "normal" | "battle",
    target: "normal" | "battle",
    targetX: number,
    targetY: number
  ): boolean => {
    const targetWidth = target === "normal" ? 10 : 5;
    const targetHeight = target === "normal" ? 6 : 5;

    const clampedX = Math.max(0, Math.min(targetWidth - item.width, targetX));
    const clampedY = Math.max(0, Math.min(targetHeight - item.height, targetY));

    const targetList = target === "normal" ? normalInventory : playerBattleItems;

    const hasCollision = targetList.some((other) => {
      if (source === target && other.instanceId === item.instanceId) return false;
      return (
        clampedX < other.x + other.width &&
        clampedX + item.width > other.x &&
        clampedY < other.y + other.height &&
        clampedY + item.height > other.y
      );
    });

    if (hasCollision) {
      return false;
    }

    if (source === "normal") {
      setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    } else {
      setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    }

    const updatedItem: PlacedItem = {
      ...item,
      x: clampedX,
      y: clampedY,
    };

    if (target === "normal") {
      setNormalInventory((prev) => [...prev, updatedItem]);
    } else {
      setPlayerBattleItems((prev) => [...prev, updatedItem]);
    }

    return true;
  };

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
      alert("Mochila de batalha (5x5) sem espaço!");
      return;
    }

    setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setPlayerBattleItems((prev) => [...prev, { ...item, x: placedX, y: placedY }]);
  };

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

    if (placedX === -1) {
      alert("Estoque normal (10x6) sem espaço!");
      return;
    }

    setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setNormalInventory((prev) => [...prev, { ...item, x: placedX, y: placedY }]);
  };

  const handleStartBattle = (phase: number) => {
    setCurrentBossPhase(phase);
    setCurrentScreen("BATTLE");
  };

  const handleVictory = useCallback(() => {
    const boss = BOSS_PHASES[currentBossPhase] || BOSS_PHASES[1];
    setGold((prev) => prev + boss.goldReward);
    setUnlockedProgress((prev) => Math.max(prev, currentBossPhase + 1));
    setCollectedRelics((prev) => {
      if (!prev.includes(boss.relicReward)) {
        return [...prev, boss.relicReward];
      }
      return prev;
    });
  }, [currentBossPhase]);

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none">
      <style jsx global>{`
        @keyframes projectileFlyRight {
          0% {
            left: 20%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          15% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(-50%) scale(1.1);
          }
          100% {
            left: 78%;
            opacity: 0;
            transform: translateY(-50%) scale(1.2);
          }
        }

        @keyframes projectileFlyLeft {
          0% {
            right: 20%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6) scaleX(-1);
          }
          15% {
            opacity: 1;
            transform: translateY(-50%) scale(1) scaleX(-1);
          }
          85% {
            opacity: 1;
            transform: translateY(-50%) scale(1.1) scaleX(-1);
          }
          100% {
            right: 78%;
            opacity: 0;
            transform: translateY(-50%) scale(1.2) scaleX(-1);
          }
        }

        @keyframes characterShake {
          0%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(0.95) translateX(6px);
            filter: brightness(1.7) drop-shadow(0 0 15px #ef4444);
          }
        }

        @keyframes floatIsland1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes floatIsland2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        @keyframes floatIsland3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* Animação do fluxo contínuo de energia da estrada */
        @keyframes energyTrailFlow {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes portalPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 8px #22d3ee); }
        }

        .animate-float-1 {
          animation: floatIsland1 5s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: floatIsland2 6.5s ease-in-out infinite 0.8s;
        }

        .animate-float-3 {
          animation: floatIsland3 5.8s ease-in-out infinite 1.6s;
        }

        .animate-energy-flow {
          animation: energyTrailFlow 1.6s linear infinite;
        }

        .animate-portal {
          animation: portalPulse 3s ease-in-out infinite;
        }

        .animate-projectile-right {
          animation: projectileFlyRight var(--fly-time, 0.7s) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-projectile-left {
          animation: projectileFlyLeft var(--fly-time, 0.7s) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-shake {
          animation: characterShake 0.25s ease-in-out;
        }
      `}</style>

      {currentScreen === "HOME" && (
        <HomeScreen
          isLoggedIn={isLoggedIn}
          gold={gold}
          onLoginClick={() => setCurrentScreen("LOGIN")}
          onLogoutClick={() => setIsLoggedIn(false)}
          onOpenMap={() => setCurrentScreen("MAP")}
          onGoToPrep={() => setCurrentScreen("INVENTORY_PREP")}
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

      {currentScreen === "MAP" && (
        <WorldMapScreen
          gold={gold}
          unlockedProgress={unlockedProgress}
          collectedRelics={collectedRelics}
          onStartBoss={handleStartBattle}
          onOpenPrep={() => setCurrentScreen("INVENTORY_PREP")}
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
          onMoveOrPlaceItem={moveOrPlaceItem}
          onEquipItem={equipToBattle}
          onUnequipItem={unequipToNormal}
          onGoToBattle={() => handleStartBattle(Math.min(unlockedProgress, 3))}
          onBack={() => setCurrentScreen("MAP")}
        />
      )}

      {currentScreen === "BATTLE" && (
        <BattleScreen
          bossConfig={BOSS_PHASES[currentBossPhase] || BOSS_PHASES[1]}
          playerItems={playerBattleItems}
          bossItems={bossItems}
          onVictory={handleVictory}
          onGiveUp={() => setCurrentScreen("MAP")}
          onBackToMenu={() => setCurrentScreen("MAP")}
        />
      )}
    </main>
  );
}

/* ========================================================
   TELA INICIAL
   ======================================================== */
function HomeScreen({
  isLoggedIn,
  gold,
  onLoginClick,
  onLogoutClick,
  onOpenMap,
  onGoToPrep,
}: {
  isLoggedIn: boolean;
  gold: number;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenMap: () => void;
  onGoToPrep: () => void;
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

      <section className="flex flex-col items-center text-center my-auto px-4 max-w-xl mx-auto w-full">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-full">
          JORNADA PELO MAPA CELESTIAL
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-lg">
          AERIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">NEXUS</span>
        </h1>
        <p className="text-slate-300 text-base mb-8">
          Explore as ilhas flutuantes, colecione relíquias ancestrais e enfrente os Guardiões do Vazio.
        </p>

        {isLoggedIn ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <button
              onClick={onOpenMap}
              className="flex-1 w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2.5 hover:scale-105"
            >
              <Compass size={22} />
              EXPLORAR MAPA DE JORNADA
            </button>

            <button
              onClick={onGoToPrep}
              className="w-full sm:w-auto py-4 px-6 rounded-xl font-bold text-sm bg-[#162234] hover:bg-[#1f3048] border border-cyan-500/40 text-cyan-300 shadow transition-all flex items-center justify-center gap-2"
            >
              <Backpack size={18} />
              Mochila & Loja
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

      <footer className="text-center text-xs text-slate-400 py-4">Aeria Nexus © 2026</footer>
    </div>
  );
}

/* ========================================================
   TELA DE WORLD MAP (BRILHO ORGÂNICO VAZANDO PELA SILHUETA)
   ======================================================== */
function WorldMapScreen({
  gold,
  unlockedProgress,
  collectedRelics,
  onStartBoss,
  onOpenPrep,
  onBack,
}: {
  gold: number;
  unlockedProgress: number;
  collectedRelics: string[];
  onStartBoss: (phase: number) => void;
  onOpenPrep: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-6 bg-[#080d16] relative overflow-hidden">
      <header className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-800/80 relative z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft size={16} /> Menu Principal
          </button>
          <div className="flex items-center gap-2 font-black text-sm text-cyan-300 tracking-wider">
            <Compass size={18} className="text-cyan-400" />
            MAPA DE JORNADA CELESTIAL
          </div>
        </div>

        {/* RELÍQUIAS */}
        <div className="flex items-center gap-3 bg-[#0f1726]/90 border border-cyan-500/30 rounded-xl px-4 py-2 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            Relíquias Coletadas:
          </span>
          <div className="flex items-center gap-2">
            <div
              title={collectedRelics.includes("Lágrima de Fogo do Oni") ? "Lágrima de Fogo do Oni (Fase 1)" : "Fase 1 (Pendente)"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all ${
                collectedRelics.includes("Lágrima de Fogo do Oni")
                  ? "bg-red-950/80 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                  : "bg-slate-900/80 border-slate-800 opacity-40 grayscale"
              }`}
            >
              🔥
            </div>

            <div
              title={collectedRelics.includes("Orbe de Éter") ? "Orbe de Éter (Fase 2)" : "Fase 2 (Pendente)"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all ${
                collectedRelics.includes("Orbe de Éter")
                  ? "bg-purple-950/80 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                  : "bg-slate-900/80 border-slate-800 opacity-40 grayscale"
              }`}
            >
              🔮
            </div>

            <div
              title={collectedRelics.includes("Fragmento Celestial") ? "Fragmento Celestial (Fase 3)" : "Fase 3 (Pendente)"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all ${
                collectedRelics.includes("Fragmento Celestial")
                  ? "bg-amber-950/80 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  : "bg-slate-900/80 border-slate-800 opacity-40 grayscale"
              }`}
            >
              💎
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold text-sm shadow">
            <Coins size={16} /> {gold} Ouro
          </div>

          <button
            onClick={onOpenPrep}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Backpack size={16} /> Mochila & Loja
          </button>
        </div>
      </header>

      {/* CONTAINER DO MAPA */}
      <section
        className="relative w-full max-w-6xl mx-auto flex-1 my-4 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/backgound.png'), url('/background.png'), linear-gradient(to bottom, #09121d, #040810)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* ROTA CELESTIAL DE NAVEGAÇÃO COM PONTOS ESPAÇADOS */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="celestialGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          <path
            d="M 160 490 C 280 470, 360 360, 500 350 C 640 340, 720 220, 830 180"
            fill="none"
            stroke="url(#celestialGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.3"
          />

          <circle cx="244" cy="461" r="3.5" fill={unlockedProgress >= 2 ? "#38bdf8" : "rgba(255,255,255,0.7)"} opacity="0.8" />
          <circle cx="322" cy="416" r="3.5" fill={unlockedProgress >= 2 ? "#38bdf8" : "rgba(255,255,255,0.5)"} opacity="0.7" />
          <circle cx="405" cy="373" r="3.5" fill={unlockedProgress >= 2 ? "#38bdf8" : "rgba(148,163,184,0.4)"} opacity="0.5" />

          <circle cx="595" cy="325" r="3.5" fill={unlockedProgress >= 3 ? "#38bdf8" : "rgba(148,163,184,0.3)"} opacity="0.5" />
          <circle cx="676" cy="276" r="3.5" fill={unlockedProgress >= 3 ? "#38bdf8" : "rgba(148,163,184,0.3)"} opacity="0.5" />
          <circle cx="752" cy="222" r="3.5" fill={unlockedProgress >= 3 ? "#38bdf8" : "rgba(148,163,184,0.3)"} opacity="0.5" />
        </svg>

        <div className="relative z-20 w-full h-full min-h-[520px]">
          {/* ILHA 1: TEMPLO DO ONI (FASE 1) */}
          <div className="absolute left-[5%] bottom-[4%] flex flex-col items-center">
            <button
              onClick={() => onStartBoss(1)}
              className="group relative flex flex-col items-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {/* Luz difusa suave no fundo (sem anéis ou bordas circulares) */}
              {unlockedProgress === 1 && (
                <div className="absolute -inset-10 bg-cyan-400/20 blur-[70px] pointer-events-none" />
              )}

              <div className="w-48 h-48 md:w-56 md:h-56 relative animate-float-1 transition-all">
                <img
                  src="/ilha1.png"
                  alt="Ilha 1 - Templo Oni"
                  className="w-full h-full object-contain group-hover:brightness-110 transition-all"
                  style={{
                    filter:
                      unlockedProgress === 1
                        ? "drop-shadow(0 0 15px rgba(34, 211, 238, 0.95)) drop-shadow(0 0 35px rgba(34, 211, 238, 0.7)) drop-shadow(0 0 65px rgba(6, 182, 212, 0.45))"
                        : "drop-shadow(0 15px 30px rgba(0,0,0,0.9))",
                  }}
                />
              </div>

              <div
                className={`bg-[#13070a]/90 backdrop-blur-md border-2 rounded-xl px-3 py-1.5 flex flex-col items-center -mt-6 transition-all ${
                  unlockedProgress === 1
                    ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    : "border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                }`}
              >
                <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">
                  FASE 1
                </span>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <Swords size={12} className="text-red-400" /> Guardião Oni
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={11} /> Desbloqueado
                </span>
              </div>
            </button>
          </div>

          {/* ILHA 2: CÂNION DA COLMEIA (FASE 2) */}
          <div className="absolute left-[40%] top-[25%] flex flex-col items-center">
            <button
              onClick={() => unlockedProgress >= 2 && onStartBoss(2)}
              disabled={unlockedProgress < 2}
              className={`group relative flex flex-col items-center transition-all ${
                unlockedProgress >= 2
                  ? "cursor-pointer hover:scale-105 active:scale-95"
                  : "cursor-not-allowed opacity-75"
              }`}
            >
              {unlockedProgress === 2 && (
                <div className="absolute -inset-10 bg-cyan-400/20 blur-[70px] pointer-events-none" />
              )}

              <div className="w-48 h-48 md:w-56 md:h-56 relative animate-float-2 transition-all">
                <img
                  src="/ilha2.png"
                  alt="Ilha 2 - Cânion da Colmeia"
                  className={`w-full h-full object-contain transition-all ${
                    unlockedProgress >= 2
                      ? "group-hover:brightness-110"
                      : "grayscale-[40%] brightness-75"
                  }`}
                  style={{
                    filter:
                      unlockedProgress === 2
                        ? "drop-shadow(0 0 15px rgba(34, 211, 238, 0.95)) drop-shadow(0 0 35px rgba(34, 211, 238, 0.7)) drop-shadow(0 0 65px rgba(6, 182, 212, 0.45))"
                        : unlockedProgress >= 2
                        ? "drop-shadow(0 0 20px rgba(168,85,247,0.4))"
                        : "drop-shadow(0 15px 30px rgba(0,0,0,0.9))",
                  }}
                />
              </div>

              <div
                className={`backdrop-blur-md border-2 rounded-xl px-3 py-1.5 flex flex-col items-center -mt-6 shadow-xl transition-all ${
                  unlockedProgress === 2
                    ? "bg-[#180a24]/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    : unlockedProgress >= 2
                    ? "bg-[#180a24]/90 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    : "bg-[#0f141f]/90 border-slate-700 text-slate-500"
                }`}
              >
                <span className="text-[9px] font-black tracking-widest text-purple-300 uppercase">
                  FASE 2
                </span>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <Swords size={12} className="text-purple-400" /> Rainha Colmeia
                </span>
                <span className="text-[10px] font-bold mt-0.5">
                  {unlockedProgress >= 2 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Desbloqueado
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock size={11} /> Bloqueado
                    </span>
                  )}
                </span>
              </div>
            </button>
          </div>

          {/* ILHA 3: CIDADELA CÓSMICA (FASE 3) */}
          <div className="absolute right-[5%] top-[5%] flex flex-col items-center">
            <button
              onClick={() => unlockedProgress >= 3 && onStartBoss(3)}
              disabled={unlockedProgress < 3}
              className={`group relative flex flex-col items-center transition-all ${
                unlockedProgress >= 3
                  ? "cursor-pointer hover:scale-105 active:scale-95"
                  : "cursor-not-allowed opacity-75"
              }`}
            >
              {unlockedProgress === 3 && (
                <div className="absolute -inset-10 bg-cyan-400/20 blur-[70px] pointer-events-none" />
              )}

              <div className="w-56 h-56 md:w-64 md:h-64 relative animate-float-3 transition-all">
                <img
                  src="/ilha3.png"
                  alt="Ilha 3 - Cidadela Cósmica"
                  className={`w-full h-full object-contain transition-all ${
                    unlockedProgress >= 3
                      ? "group-hover:brightness-110"
                      : "grayscale-[50%] brightness-75"
                  }`}
                  style={{
                    filter:
                      unlockedProgress === 3
                        ? "drop-shadow(0 0 15px rgba(34, 211, 238, 0.95)) drop-shadow(0 0 35px rgba(34, 211, 238, 0.7)) drop-shadow(0 0 65px rgba(6, 182, 212, 0.45))"
                        : unlockedProgress >= 3
                        ? "drop-shadow(0 0 25px rgba(245,158,11,0.5))"
                        : "drop-shadow(0 20px 40px rgba(0,0,0,0.9))",
                  }}
                />
              </div>

              <div
                className={`backdrop-blur-md border-2 rounded-xl px-3 py-1.5 flex flex-col items-center -mt-6 shadow-xl transition-all ${
                  unlockedProgress === 3
                    ? "bg-[#241708]/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    : unlockedProgress >= 3
                    ? "bg-[#241708]/90 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                    : "bg-[#0f141f]/90 border-slate-700 text-slate-500"
                }`}
              >
                <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase">
                  CHEFE FINAL
                </span>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <Trophy size={12} className="text-amber-400" /> Arquilorde
                </span>
                <span className="text-[10px] font-bold mt-0.5">
                  {unlockedProgress >= 3 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Desbloqueado
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock size={11} /> Bloqueado
                    </span>
                  )}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* RODAPÉ DO MAPA */}
        <div className="relative z-20 flex justify-between items-center text-xs text-slate-300 pt-3 border-t border-cyan-500/20 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-cyan-400" />
            Vença o Guardião de cada ilha para coletar sua relíquia e abrir o caminho para a próxima fase.
          </span>
          <span className="font-bold text-cyan-400">Aeria Nexus World Map</span>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500 py-2">
        Aeria Nexus © 2026 — Trilha de Batalhas e Ilhas Flutuantes
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
   OVERLAY DE BENEFÍCIOS DO ITEM DENTRO DO PRÓPRIO SLOT
   ======================================================== */
function ItemSlotOverlay({ item }: { item: ItemData }) {
  const is1x1 = item.width === 1 && item.height === 1;

  return (
    <div className="absolute inset-0 bg-[#070e1b]/95 backdrop-blur-[2px] p-1 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 overflow-hidden rounded-lg border border-cyan-400/40">
      <h4
        className={`font-black text-white leading-tight ${
          is1x1 ? "text-[9px] line-clamp-1 mb-0.5" : "text-xs mb-1"
        }`}
      >
        {item.name}
      </h4>

      {!is1x1 && (
        <span className="text-[9px] font-semibold text-cyan-300 mb-1 leading-none">
          {item.type}
        </span>
      )}

      <div className={`flex flex-col items-center justify-center ${is1x1 ? "gap-0.5" : "gap-1"}`}>
        {item.stats.damage && (
          <div className="flex items-center gap-1 font-bold text-red-400 text-[10px] leading-tight">
            <span>⚔️</span> +{item.stats.damage} {!is1x1 && "Dano"}
          </div>
        )}
        {item.stats.armor && (
          <div className="flex items-center gap-1 font-bold text-sky-400 text-[10px] leading-tight">
            <Shield size={is1x1 ? 10 : 12} className="text-sky-400 fill-sky-400/20" /> +{item.stats.armor} {!is1x1 && "Armadura"}
          </div>
        )}
        {item.stats.health && (
          <div className="flex items-center gap-1 font-bold text-emerald-400 text-[10px] leading-tight">
            <Heart size={is1x1 ? 10 : 12} className="text-emerald-400 fill-emerald-400/20" /> +{item.stats.health} {!is1x1 && "Vida"}
          </div>
        )}
        {item.stats.specialEffect && !is1x1 && (
          <div className="text-[8px] font-medium text-cyan-200 leading-tight line-clamp-2 px-1 text-center mt-0.5">
            ❄️ {item.stats.specialEffect}
          </div>
        )}
      </div>

      {!is1x1 && (
        <span className="text-[8px] text-amber-400 font-bold mt-1">
          {item.sellPrice} Ouro
        </span>
      )}
    </div>
  );
}

/* ========================================================
   TELA DE PREPARAÇÃO
   ======================================================== */
function InventoryPrepScreen({
  gold,
  normalInventory,
  playerBattleItems,
  onBuyItem,
  onSellItem,
  onMoveOrPlaceItem,
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
  onMoveOrPlaceItem: (
    item: PlacedItem,
    source: "normal" | "battle",
    target: "normal" | "battle",
    targetX: number,
    targetY: number
  ) => boolean;
  onEquipItem: (item: PlacedItem) => void;
  onUnequipItem: (item: PlacedItem) => void;
  onGoToBattle: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "SHOP">("INVENTORY");
  const [selectedActionItem, setSelectedActionItem] = useState<{
    item: PlacedItem;
    source: "normal" | "battle";
  } | null>(null);

  const handleDragStart = (e: React.DragEvent, item: PlacedItem, source: "normal" | "battle") => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ item, source, offsetX, offsetY })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGridDrop = (e: React.DragEvent, targetGrid: "normal" | "battle") => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;

    try {
      const { item, source, offsetX = 0, offsetY = 0 } = JSON.parse(dataStr);
      const rect = e.currentTarget.getBoundingClientRect();

      const cols = targetGrid === "normal" ? 10 : 5;
      const rows = targetGrid === "normal" ? 6 : 5;
      const cellWidth = rect.width / cols;
      const cellHeight = rect.height / rows;

      const dropX = e.clientX - rect.left - (offsetX % cellWidth);
      const dropY = e.clientY - rect.top - (offsetY % cellHeight);

      let targetX = Math.round(dropX / cellWidth);
      let targetY = Math.round(dropY / cellHeight);

      targetX = Math.max(0, Math.min(cols - item.width, targetX));
      targetY = Math.max(0, Math.min(rows - item.height, targetY));

      const success = onMoveOrPlaceItem(item, source, targetGrid, targetX, targetY);
      if (!success) {
        alert("Espaço ocupado ou insuficiente para colocar o item aqui!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-6 bg-[#0a0f18] text-slate-100">
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center pb-4 border-b border-slate-800">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold">
          <ArrowLeft size={18} /> Voltar ao Mapa
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
                  <span className="text-xs font-black text-white">{item.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {item.type} ({item.width}x{item.height})
                  </span>

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
            {/* INVENTÁRIO NORMAL (10x6) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    INVENTÁRIO NORMAL (ESTOQUE 10x6)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Arraste livremente para o slot desejado ou dê 2 cliques para equipar
                  </span>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
                  {normalInventory.length} Peças
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleGridDrop(e, "normal")}
                className="w-full aspect-[10/6] bg-[#0c121d] border-4 border-[#1b2636] rounded-2xl p-2.5 shadow-2xl relative"
              >
                <div className="absolute inset-2.5 grid grid-cols-10 grid-rows-6 gap-1 pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-700/20 bg-slate-800/10" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-10 grid-rows-6 gap-1 pointer-events-none">
                  {normalInventory.map((item) => (
                    <div
                      key={item.instanceId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, "normal")}
                      onClick={() => setSelectedActionItem({ item, source: "normal" })}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onEquipItem(item);
                        setSelectedActionItem(null);
                      }}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-lg border-2 ${item.borderColor} ${item.bgColor} p-1 flex items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all pointer-events-auto overflow-hidden`}
                    >
                      <ItemSlotOverlay item={item} />
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10 transition-opacity duration-200 group-hover:opacity-10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MOCHILA DE BATALHA (5x5) */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    MOCHILA DE BATALHA (5x5)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Arraste livremente para o slot desejado ou dê 2 cliques para desequipar
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  {playerBattleItems.length} Equipados
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleGridDrop(e, "battle")}
                className="w-full aspect-square bg-[#0e1624] border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative"
              >
                <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-cyan-400/15 bg-cyan-950/20" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
                  {playerBattleItems.map((item) => (
                    <div
                      key={item.instanceId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, "battle")}
                      onClick={() => setSelectedActionItem({ item, source: "battle" })}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onUnequipItem(item);
                        setSelectedActionItem(null);
                      }}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing hover:brightness-110 transition-all pointer-events-auto overflow-hidden`}
                    >
                      <ItemSlotOverlay item={item} />
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10 transition-opacity duration-200 group-hover:opacity-10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
            <span className="text-xs text-slate-400 mb-4">
              {selectedActionItem.item.type} ({selectedActionItem.item.width}x{selectedActionItem.item.height})
            </span>

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
        Aeria Nexus — Arraste para a posição desejada ou dê 2 cliques para equipar/desequipar.
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA (VALORES AO LADO DAS BARRAS & SEM TEXTO DE DANO)
   ======================================================== */
function BattleScreen({
  bossConfig,
  playerItems,
  bossItems,
  onVictory,
  onGiveUp,
  onBackToMenu,
}: {
  bossConfig: BossConfig;
  playerItems: PlacedItem[];
  bossItems: PlacedItem[];
  onVictory: () => void;
  onGiveUp: () => void;
  onBackToMenu: () => void;
}) {
  const extraHealth = playerItems.reduce((acc, item) => acc + (item.stats.health || 0), 0);
  const extraArmor = playerItems.reduce((acc, item) => acc + (item.stats.armor || 0), 0);
  const weaponsDamage = playerItems.reduce((acc, item) => acc + (item.stats.damage || 0), 0);

  const basePlayerHp = 100;
  const maxPlayerHp = basePlayerHp + extraHealth;
  const maxPlayerShield = extraArmor;

  const playerSword = playerItems.find((i) => i.id === "espada-celestial");
  const playerDamage = weaponsDamage > 0 ? weaponsDamage : (playerItems.length > 0 ? 8 : 4);
  const playerCooldown = playerSword?.cooldown || 3.0;

  const maxBossHp = bossConfig.maxHp;
  const maxBossShield = bossConfig.maxShield;
  const bossDamage = bossConfig.damage;
  const bossCooldown = bossConfig.cooldown;

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
  const [bossFrozenTimer, setBossFrozenTimer] = useState<number>(0);

  const projectileFlightTime = speedMultiplier === 1 ? 700 : 350;
  const victoryReportedRef = useRef(false);

  useEffect(() => {
    if (combatStatus === "VICTORY" && !victoryReportedRef.current) {
      victoryReportedRef.current = true;
      onVictory();
    }
  }, [combatStatus, onVictory]);

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
            const willFreeze = Math.random() < 0.4;
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
                  if (finalHp === 0 && prevHp > 0) {
                    setCombatStatus("VICTORY");
                  }
                  return finalHp;
                });
              }
              return newShield;
            });

            setPlayerShooting(false);
          }, projectileFlightTime);

          return 0;
        }
        return next;
      });

      // 2. CONGELAMENTO DO CHEFE
      setBossFrozenTimer((prevFreeze) => {
        if (prevFreeze > 0) {
          return Math.max(0, prevFreeze - deltaSeconds);
        }
        return 0;
      });

      // 3. CARREGAMENTO DO CHEFE
      setBossCharge((prev) => {
        if (bossFrozenTimer > 0) return prev;

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
                  if (finalHp === 0 && prevHp > 0) {
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
    }, tickMs);

    return () => clearInterval(interval);
  }, [
    combatStatus,
    speedMultiplier,
    playerCooldown,
    bossCooldown,
    playerDamage,
    projectileFlightTime,
    bossFrozenTimer,
  ]);

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between p-4 md:p-6 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/cenario.jpg'), linear-gradient(to bottom, #3a6b8c, #5484a6, #7aa9c8)",
      }}
    >
      {/* 1. HUD SUPERIOR COM VALORES AO LADO DE CADA BARRA */}
      <header className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 relative z-10">
        {/* JOGADOR (ESQUERDA) */}
        <div className="w-full max-w-[420px] flex flex-col gap-1.5">
          <div className="text-sm font-bold text-white drop-shadow">
            JOGADOR 1 (Você)
          </div>
          {/* Linha de Vida */}
          <div className="flex items-center gap-2.5">
            <div className="h-6 flex-1 bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
              <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
              <div className="h-full bg-red-600 transition-all duration-150" style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-red-400 font-mono min-w-[70px] text-right">
              {playerHp}/{maxPlayerHp} HP
            </span>
          </div>
          {/* Linha de Armadura/Escudo */}
          <div className="flex items-center gap-2.5">
            <div className="h-4 flex-1 bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
              <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
              <div
                className="h-full bg-sky-500 transition-all duration-150"
                style={{ width: `${maxPlayerShield > 0 ? (playerShield / maxPlayerShield) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-sky-400 font-mono min-w-[70px] text-right">
              {playerShield}/{maxPlayerShield} Esc
            </span>
          </div>
        </div>

        {/* FASE CENTRAL */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#271f1a] border-2 border-[#544337] flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[9px] font-black text-amber-400 uppercase">FASE</span>
            <span className="text-xl font-black text-white leading-none">{bossConfig.phase}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold mt-1 bg-black/60 px-2 py-0.5 rounded animate-pulse">
            CARREGANDO GOLPES
          </span>
        </div>

        {/* CHEFE (DIREITA) */}
        <div className="w-full max-w-[420px] md:ml-auto flex flex-col gap-1.5">
          <div className="text-sm font-bold text-white drop-shadow text-right">
            CHEFE ({bossConfig.name})
          </div>
          {/* Linha de Vida */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-red-400 font-mono min-w-[70px] text-left">
              {bossHp}/{maxBossHp} HP
            </span>
            <div className="h-6 flex-1 bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
              <Heart size={14} className="text-red-500 fill-red-500 absolute right-1.5 z-10" />
              <div className="h-full bg-red-600 transition-all duration-150 ml-auto" style={{ width: `${(bossHp / maxBossHp) * 100}%` }} />
            </div>
          </div>
          {/* Linha de Armadura/Escudo */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-sky-400 font-mono min-w-[70px] text-left">
              {bossShield}/{maxBossShield} Esc
            </span>
            <div className="h-4 flex-1 bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
              <Shield size={12} className="text-sky-400 fill-sky-400 absolute right-1.5 z-10" />
              <div
                className="h-full bg-sky-500 transition-all duration-150 ml-auto"
                style={{ width: `${maxBossShield > 0 ? (bossShield / maxBossShield) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS E ARENA (SEM TEXTO FLUTUANTE DE DANO) */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-end my-1 h-52 md:h-64 pointer-events-none relative z-10">
        {playerShooting && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-30 animate-projectile-right pointer-events-none"
            style={{ "--fly-time": `${projectileFlightTime}ms` } as React.CSSProperties}
          >
            <PlasmaProjectile type="player" />
          </div>
        )}

        {bossShooting && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-30 animate-projectile-left pointer-events-none"
            style={{ "--fly-time": `${projectileFlightTime}ms` } as React.CSSProperties}
          >
            <PlasmaProjectile type="boss" />
          </div>
        )}

        <div className="w-full max-w-[420px] flex justify-center">
          <img
            src="/jogador.png"
            alt="Jogador"
            className={`h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all ${
              playerShaking ? "animate-shake" : ""
            }`}
          />
        </div>

        {/* Espaçador central sem texto numérico de dano */}
        <div className="relative flex flex-col items-center justify-center min-h-[80px] w-full pointer-events-none" />

        <div className="w-full max-w-[420px] md:ml-auto flex justify-center">
          <img
            src={bossConfig.avatarImg}
            alt={bossConfig.name}
            className={`h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all ${
              bossFrozenTimer > 0 ? "brightness-125 hue-rotate-180 drop-shadow-[0_0_20px_#22d3ee]" : ""
            } ${bossShaking ? "animate-shake" : ""}`}
          />
        </div>
      </section>

      {/* 3. PAINÉIS DE INVENTÁRIO 5x5 */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
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
                <ItemSlotOverlay item={item} />
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10 transition-opacity duration-200 group-hover:opacity-10"
                />

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
                <ItemSlotOverlay item={item} />
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10 transition-opacity duration-200 group-hover:opacity-10"
                />

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
                <p className="text-sm text-slate-300 mb-2">
                  Você derrotou o {bossConfig.name} ({bossConfig.title})!
                </p>
                <div className="bg-red-950/80 border border-red-500/60 rounded-xl px-4 py-1.5 text-red-200 font-bold text-xs mb-3 flex items-center gap-2">
                  <span>{bossConfig.relicIcon}</span> Relíquia Coletada: [{bossConfig.relicReward}]
                </div>
                <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl px-4 py-2 text-amber-300 font-black text-sm mb-6 flex items-center gap-2">
                  <Coins size={18} /> +{bossConfig.goldReward} Ouro Obtido!
                </div>
                <button
                  onClick={onBackToMenu}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase shadow-lg transition-all"
                >
                  VOLTAR AO MAPA DE JORNADA
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