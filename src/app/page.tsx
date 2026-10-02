"use client";

import React, { useState, useEffect } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft, Coins, ShoppingBag, Backpack, Lock, CheckCircle2, FastForward, Flag, Trophy, RotateCcw } from "lucide-react";

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
    width: 1,
    height: 1,
    price: 35,
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

  // Inventário Normal 10x6
  const [normalInventory, setNormalInventory] = useState<PlacedItem[]>([]);

  // Mochila de Batalha 5x5 do Jogador
  const [playerBattleItems, setPlayerBattleItems] = useState<PlacedItem[]>([]);

  // Mochila do Chefe 5x5 (Inicia com Armadura e Espada por padrão)
  const [bossItems] = useState<PlacedItem[]>([
    {
      ...SHOP_CATALOG[3], // Armadura Carmesim 2x2
      instanceId: "boss-armor",
      x: 1,
      y: 1,
    },
    {
      ...SHOP_CATALOG[0], // Espada 2x2
      instanceId: "boss-sword",
      x: 3,
      y: 1,
      borderColor: "border-[#8b5cf6]",
      bgColor: "bg-[#2b143d]/90",
    },
  ]);

  // Compra na Loja -> vai para o 10x6
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

  // Mover do 10x6 para o 5x5
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

  // Desequipar do 5x5 de volta para o 10x6
  const unequipToNormal = (item: PlacedItem) => {
    setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setNormalInventory((prev) => [...prev, { ...item, x: 0, y: 0 }]);
  };

  // Vitória no combate
  const handleVictory = () => {
    setGold((prev) => prev + 100);
    setUnlockedLevel((prev) => Math.max(prev, 2)); // Libera Nível 2
  };

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none">
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
          Selecione uma fase para entrar direto na batalha automática.
        </p>

        {isLoggedIn ? (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full bg-[#121c2b]/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase mb-4 text-left">
                SELEÇÃO DE FASES (CLIQUE PARA LUTAR)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NÍVEL 1: Desbloqueado */}
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

                {/* NÍVEL 2 */}
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

                {/* NÍVEL 3 */}
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
   TELA DE PREPARAÇÃO (10x6 + 5x5 + LOJA)
   ======================================================== */
function InventoryPrepScreen({
  gold,
  normalInventory,
  playerBattleItems,
  onBuyItem,
  onEquipItem,
  onUnequipItem,
  onGoToBattle,
  onBack,
}: {
  gold: number;
  normalInventory: PlacedItem[];
  playerBattleItems: PlacedItem[];
  onBuyItem: (item: ItemData) => void;
  onEquipItem: (item: PlacedItem) => void;
  onUnequipItem: (item: PlacedItem) => void;
  onGoToBattle: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "SHOP">("INVENTORY");

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
              Compre peças para enviar ao seu estoque normal (10x6).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SHOP_CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0b1019] border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-lg relative"
                >
                  <span className="text-xs font-black text-white">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.type} ({item.width}x{item.height})</span>

                  <img src={item.imageUrl} alt={item.name} className="h-28 object-contain my-3 drop-shadow" />

                  <div className="text-[11px] font-bold text-slate-300 mb-4">
                    {item.stats.damage && <div className="text-red-400">+{item.stats.damage} Dano</div>}
                    {item.stats.armor && <div className="text-sky-400">+{item.stats.armor} Armadura</div>}
                    {item.stats.health && <div className="text-emerald-400">+{item.stats.health} Vida</div>}
                    {item.stats.specialEffect && (
                      <div className="text-[10px] text-cyan-300 mt-1">{item.stats.specialEffect}</div>
                    )}
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
            {/* 10x6 Normal */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    INVENTÁRIO NORMAL (ESTOQUE 10x6)
                  </h3>
                  <span className="text-xs text-slate-400">Clique para equipar na mochila 5x5</span>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
                  {normalInventory.length} Peças
                </span>
              </div>

              <div className="w-full aspect-[10/6] bg-[#0c121d] border-4 border-[#1b2636] rounded-2xl p-2.5 shadow-2xl relative">
                <div className="absolute inset-2.5 grid grid-cols-10 grid-rows-6 gap-1 pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-700/20 bg-slate-800/10" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-10 grid-rows-6 gap-1">
                  {normalInventory.map((item) => (
                    <div
                      key={item.instanceId}
                      onClick={() => onEquipItem(item)}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-lg border-2 ${item.borderColor} ${item.bgColor} p-1 flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-[1.02] transition-all`}
                    >
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5x5 Batalha */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    MOCHILA DE BATALHA (5x5)
                  </h3>
                  <span className="text-xs text-slate-400">Clique no item para guardar</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  {playerBattleItems.length} Equipados
                </span>
              </div>

              <div className="w-full aspect-square bg-[#0e1624] border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
                <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-cyan-400/15 bg-cyan-950/20" />
                  ))}
                </div>

                <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
                  {playerBattleItems.map((item) => (
                    <div
                      key={item.instanceId}
                      onClick={() => onUnequipItem(item)}
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
                    >
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-slate-500 py-2 border-t border-slate-800">
        Aeria Nexus — Fase de Preparação
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA COM COMBATE AUTOMÁTICO, 2X E DESISTIR
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
  // Atributos derivados dos itens equipados
  const extraHealth = playerItems.reduce((acc, item) => acc + (item.stats.health || 0), 0);
  const extraArmor = playerItems.reduce((acc, item) => acc + (item.stats.armor || 0), 0);
  const playerDamage = playerItems.reduce((acc, item) => acc + (item.stats.damage || 0), 0) || 5; // Dano mínimo 5 caso não tenha arma

  const maxPlayerHp = 300 + extraHealth;
  const maxPlayerShield = 80 + extraArmor;
  const maxBossHp = 600;
  const maxBossShield = 350; // 200 base + 150 armadura

  const [playerHp, setPlayerHp] = useState<number>(maxPlayerHp);
  const [playerShield, setPlayerShield] = useState<number>(maxPlayerShield);
  const [bossHp, setBossHp] = useState<number>(maxBossHp);
  const [bossShield, setBossShield] = useState<number>(maxBossShield);

  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [combatStatus, setCombatStatus] = useState<"FIGHTING" | "VICTORY" | "DEFEAT">("FIGHTING");
  const [floatingDamage, setFloatingDamage] = useState<{ text: string; color: string } | null>(null);
  const [bossFrozen, setBossFrozen] = useState<boolean>(false);

  // LOOP DE COMBATE AUTOMÁTICO
  useEffect(() => {
    if (combatStatus !== "FIGHTING") return;

    const intervalTime = speedMultiplier === 1 ? 1200 : 600;

    const timer = setInterval(() => {
      // 1. TURNO DO JOGADOR: Ataca o Chefe
      const willFreeze = Math.random() < 0.25; // 25% de chance de congelar
      if (willFreeze) setBossFrozen(true);

      setBossShield((prevShield) => {
        let remainingDmg = playerDamage;
        let newShield = prevShield;

        if (prevShield > 0) {
          if (prevShield >= remainingDmg) {
            newShield = prevShield - remainingDmg;
            remainingDmg = 0;
          } else {
            remainingDmg -= prevShield;
            newShield = 0;
          }
        }

        if (remainingDmg > 0) {
          setBossHp((prevHp) => {
            const finalHp = Math.max(0, prevHp - remainingDmg);
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

      // 2. TURNO DO CHEFE: Ataca o Jogador (se não estiver congelado)
      setTimeout(() => {
        if (bossFrozen) {
          setBossFrozen(false);
          setFloatingDamage({ text: "Chefe Descongelou!", color: "text-slate-300" });
          return;
        }

        const bossAtk = 25;
        setPlayerShield((prevShield) => {
          let remDmg = bossAtk;
          let newS = prevShield;

          if (prevShield > 0) {
            if (prevShield >= remDmg) {
              newS = prevShield - remDmg;
              remDmg = 0;
            } else {
              remDmg -= prevShield;
              newS = 0;
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

          return newS;
        });
      }, intervalTime / 2);

    }, intervalTime);

    return () => clearInterval(timer);
  }, [combatStatus, speedMultiplier, playerDamage, bossFrozen]);

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between p-4 md:p-6 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/cenario.jpg'), linear-gradient(to bottom, #3a6b8c, #5484a6, #7aa9c8)",
      }}
    >
      {/* 1. HUD SUPERIOR */}
      <header className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 relative z-10">
        {/* Jogador */}
        <div className="w-full max-w-[420px] flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>JOGADOR 1 (Você)</span>
            <span className="text-xs">{playerHp} / {maxPlayerHp}</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
            />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${(playerShield / maxPlayerShield) * 100}%` }}
            />
          </div>
        </div>

        {/* Round central */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#271f1a] border-2 border-[#544337] flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[9px] font-black text-amber-400 uppercase">ROUND</span>
            <span className="text-xl font-black text-white leading-none">1</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold mt-1 bg-black/60 px-2 py-0.5 rounded animate-pulse">
            EM COMBATE AUTOMÁTICO
          </span>
        </div>

        {/* Chefe */}
        <div className="w-full max-w-[420px] md:ml-auto flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-bold text-white drop-shadow">
            <span>CHEFE (Guardião Oni)</span>
            <span className="text-xs">{bossHp} / {maxBossHp}</span>
          </div>
          <div className="h-6 w-full bg-[#171c26]/90 border-2 border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Heart size={14} className="text-red-500 fill-red-500 absolute left-1.5 z-10" />
            <div
              className="h-full bg-red-600 transition-all duration-300 ml-auto"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
          <div className="h-4 w-full bg-[#171c26]/90 border border-slate-600 rounded-md overflow-hidden flex items-center relative shadow">
            <Shield size={12} className="text-sky-400 fill-sky-400 absolute left-1.5 z-10" />
            <div
              className="h-full bg-sky-500 transition-all duration-300 ml-auto"
              style={{ width: `${(bossShield / maxBossShield) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. PERSONAGENS & NÚMEROS DE DANO FLUTUANTES */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-end my-1 h-52 md:h-64 pointer-events-none relative z-10">
        <div className="w-full max-w-[420px] flex justify-center">
          <img
            src="/jogador.png"
            alt="Jogador"
            className="h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div className="flex flex-col items-center justify-center pb-8 font-mono font-black text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] min-h-[60px]">
          {floatingDamage && (
            <span className={`text-xl md:text-2xl font-black ${floatingDamage.color} animate-bounce`}>
              {floatingDamage.text}
            </span>
          )}
        </div>

        <div className="w-full max-w-[420px] md:ml-auto flex justify-center">
          <img
            src="/chefe.png"
            alt="Chefe"
            className={`h-48 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-all ${
              bossFrozen ? "brightness-125 hue-rotate-180 drop-shadow-[0_0_20px_#22d3ee]" : ""
            }`}
          />
        </div>
      </section>

      {/* 3. PAINÉIS DE INVENTÁRIO 5x5 */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
        {/* Jogador */}
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
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow" />
              </div>
            ))}
          </div>
        </div>

        {/* Chefe */}
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
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain pointer-events-none drop-shadow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BOTÕES: AUMENTAR TEMPO (2X) E DESISTIR */}
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

      {/* MODAL DE RESULTADO: VITÓRIA OU DERROTA */}
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