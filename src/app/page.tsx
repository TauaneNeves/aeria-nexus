"use client";

import React, { useState } from "react";
import { Shield, Heart, Play, LogIn, ArrowLeft, Coins, ShoppingBag, Backpack, Lock, CheckCircle2 } from "lucide-react";

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
  x: number; // coluna no grid (0-indexed)
  y: number; // linha no grid (0-indexed)
}

// CATÁLOGO DE ITENS DA LOJA
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
  const [gold, setGold] = useState<number>(150); // Ouro inicial para comprar os primeiros itens

  // 1. INVENTÁRIO NORMAL (ESTOQUE) 10x6: Começa vazio
  const [normalInventory, setNormalInventory] = useState<PlacedItem[]>([]);

  // 2. INVENTÁRIO DO PERSONAGEM (BATALHA) 5x5: Começa vazio
  const [playerBattleItems, setPlayerBattleItems] = useState<PlacedItem[]>([]);

  // 3. INVENTÁRIO DO CHEFE 5x5: Começa com Armadura e Espada por padrão
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

  // Função para comprar da Loja -> vai direto para o Inventário Normal (10x6)
  const buyItem = (itemData: ItemData) => {
    if (gold < itemData.price) {
      alert("Ouro insuficiente para comprar este item!");
      return;
    }

    // Acha a primeira posição livre no grid 10x6
    let placedX = -1;
    let placedY = -1;

    for (let r = 0; r <= 6 - itemData.height; r++) {
      for (let c = 0; c <= 10 - itemData.width; c++) {
        // Verifica se colide com outro item no estoque
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

  // Mover do Inventário Normal (10x6) para o Inventário de Batalha (5x5)
  const equipToBattle = (item: PlacedItem) => {
    // Procura vaga no 5x5
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
      alert("Não há espaço livre na mochila de batalha (5x5) para equipar este item!");
      return;
    }

    // Remove do estoque e coloca na mochila de batalha
    setNormalInventory((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setPlayerBattleItems((prev) => [
      ...prev,
      { ...item, x: placedX, y: placedY },
    ]);
  };

  // Mover da Mochila de Batalha (5x5) de volta para o Inventário Normal (10x6)
  const unequipToNormal = (item: PlacedItem) => {
    setPlayerBattleItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    setNormalInventory((prev) => [
      ...prev,
      { ...item, x: 0, y: 0 },
    ]);
  };

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none">
      {currentScreen === "HOME" && (
        <HomeScreen
          isLoggedIn={isLoggedIn}
          gold={gold}
          onLoginClick={() => setCurrentScreen("LOGIN")}
          onLogoutClick={() => setIsLoggedIn(false)}
          onGoToPrep={() => setCurrentScreen("INVENTORY_PREP")}
          onGoToBattle={() => setCurrentScreen("BATTLE")}
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
          onPrepClick={() => setCurrentScreen("INVENTORY_PREP")}
          onBack={() => setCurrentScreen("HOME")}
        />
      )}
    </main>
  );
}

/* ========================================================
   TELA INICIAL COM SISTEMA DE PROGRESSÃO DE NÍVEIS
   ======================================================== */
function HomeScreen({
  isLoggedIn,
  gold,
  onLoginClick,
  onLogoutClick,
  onGoToPrep,
  onGoToBattle,
}: {
  isLoggedIn: boolean;
  gold: number;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onGoToPrep: () => void;
  onGoToBattle: () => void;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 bg-gradient-to-b from-[#2a4d69] via-[#1a2f44] to-[#0c1622]">
      {/* Topo: Logo e Auth / Status */}
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <span className="font-extrabold tracking-widest text-lg text-slate-100">
          AERIA <span className="text-cyan-400">NEXUS</span>
        </span>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold text-sm shadow">
              <Coins size={16} /> {gold} Ouro
            </div>
            <button
              onClick={onLogoutClick}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Desconectar
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

      {/* Conteúdo Central */}
      <section className="flex flex-col items-center text-center my-auto px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
          AERIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">NEXUS</span>
        </h1>
        <p className="max-w-md text-slate-300 text-sm md:text-base mb-6">
          Monte sua mochila tática a partir do seu estoque e enfrente os Guardiões do Nexus.
        </p>

        {isLoggedIn ? (
          <div className="w-full flex flex-col items-center gap-6">
            {/* PAINEL DE NÍVEIS / PROGRESSÃO */}
            <div className="w-full bg-[#121c2b]/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
              <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase mb-4 text-left">
                SELEÇÃO DE NÍVEIS (FASE ATUAL)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NÍVEL 1: Guardião Oni (Desbloqueado) */}
                <div
                  onClick={onGoToBattle}
                  className="cursor-pointer group relative bg-gradient-to-b from-[#2d121c] to-[#180a11] border-2 border-red-500/80 hover:border-red-400 rounded-xl p-4 flex flex-col items-center justify-between shadow-lg transition-all hover:scale-105"
                >
                  <span className="text-[10px] font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40">
                    NÍVEL 1 (DISPONÍVEL)
                  </span>
                  <img
                    src="/chefe.png"
                    alt="Guardião Oni"
                    className="h-28 object-contain my-2 drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)]"
                  />
                  <span className="text-xs font-black text-white tracking-wide">
                    Guardião Oni (Ignis-Vex)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Desbloqueado
                  </span>
                </div>

                {/* NÍVEL 2: Rainha da Colmeia (Bloqueado) */}
                <div className="opacity-60 relative bg-[#131b26] border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between shadow">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    NÍVEL 2
                  </span>
                  <div className="h-28 flex items-center justify-center text-slate-500">
                    <Lock size={36} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Rainha da Colmeia</span>
                  <span className="text-[10px] text-slate-500 mt-1">Vença o Nível 1 para liberar</span>
                </div>

                {/* NÍVEL 3: Arquilorde de Éter (Bloqueado) */}
                <div className="opacity-60 relative bg-[#131b26] border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between shadow">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    NÍVEL 3
                  </span>
                  <div className="h-28 flex items-center justify-center text-slate-500">
                    <Lock size={36} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Arquilorde de Éter</span>
                  <span className="text-[10px] text-slate-500 mt-1">Vença o Nível 2 para liberar</span>
                </div>
              </div>
            </div>

            {/* BOTÕES PRINCIPAIS DE NAVEGAÇÃO */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
              <button
                onClick={onGoToPrep}
                className="flex-1 w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Backpack size={18} />
                INVENTÁRIO & LOJA
              </button>

              <button
                onClick={onGoToBattle}
                className="flex-1 w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-[#16a34a] hover:brightness-110 text-slate-950 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play fill="#020617" size={18} />
                BATALHA (NÍVEL 1)
              </button>
            </div>
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
   TELA DE INVENTÁRIO (ESTOQUE 10x6 + MOCHILA 5x5 + LOJA)
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
      {/* Topo com Ouro e Botão Voltar */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold"
        >
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

      {/* Abas: Alternar entre Organização e Loja */}
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

      {/* CONTEÚDO DA ABA SELECIONADA */}
      <div className="max-w-7xl w-full mx-auto my-auto py-4">
        {activeTab === "SHOP" ? (
          /* ================= SEÇÃO DA LOJA ================= */
          <div className="bg-[#101724] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-black text-amber-400 tracking-wider uppercase mb-1">
              LOJA DE PEÇAS & ARMAS
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Compre peças para enviar ao seu inventário normal (10x6).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SHOP_CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0b1019] border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-lg relative"
                >
                  <span className="text-xs font-black text-white">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.type} ({item.width}x{item.height})</span>

                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-28 object-contain my-3 drop-shadow"
                  />

                  {/* Benefícios */}
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
          /* ================= SEÇÃO DE MONTAGEM (10x6 E 5x5) ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. INVENTÁRIO NORMAL (ESTOQUE 10x6) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    INVENTÁRIO NORMAL (ESTOQUE)
                  </h3>
                  <span className="text-xs text-slate-400">Grade 10x6 — Clique no item para equipar no 5x5</span>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
                  {normalInventory.length} Peças Armazenadas
                </span>
              </div>

              {/* Grid 10x6 */}
              <div className="w-full aspect-[10/6] bg-[#0c121d] border-4 border-[#1b2636] rounded-2xl p-2.5 shadow-2xl relative">
                {/* 60 slots de fundo */}
                <div className="absolute inset-2.5 grid grid-cols-10 grid-rows-6 gap-1 pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-700/20 bg-slate-800/10"
                    />
                  ))}
                </div>

                {/* Itens do Estoque 10x6 */}
                <div className="relative z-10 w-full h-full grid grid-cols-10 grid-rows-6 gap-1">
                  {normalInventory.map((item) => (
                    <div
                      key={item.instanceId}
                      onClick={() => onEquipItem(item)}
                      title="Clique para equipar na mochila de batalha"
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-lg border-2 ${item.borderColor} ${item.bgColor} p-1 flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-[1.02] transition-all`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain pointer-events-none drop-shadow"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. MOCHILA DE BATALHA DO PERSONAGEM (5x5) */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    MOCHILA DE BATALHA (5x5)
                  </h3>
                  <span className="text-xs text-slate-400">Itens que vão para o combate (Clique para desequipar)</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  {playerBattleItems.length} Equipados
                </span>
              </div>

              {/* Grid 5x5 */}
              <div className="w-full aspect-square bg-[#0e1624] border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
                {/* 25 slots de fundo */}
                <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-cyan-400/15 bg-cyan-950/20"
                    />
                  ))}
                </div>

                {/* Itens Equipados */}
                <div className="relative z-10 w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
                  {playerBattleItems.map((item) => (
                    <div
                      key={item.instanceId}
                      onClick={() => onUnequipItem(item)}
                      title="Clique para guardar no estoque normal"
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.width}`,
                        gridRow: `${item.y + 1} / span ${item.height}`,
                      }}
                      className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-1.5 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
                    >
                      {/* Grade interna do item */}
                      {item.width > 1 || item.height > 1 ? (
                        <div
                          className="absolute inset-1 grid gap-1 pointer-events-none opacity-25"
                          style={{
                            gridTemplateColumns: `repeat(${item.width}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${item.height}, minmax(0, 1fr))`,
                          }}
                        >
                          {Array.from({ length: item.width * item.height }).map((_, idx) => (
                            <div key={idx} className="border border-cyan-300 rounded" />
                          ))}
                        </div>
                      ) : null}

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain pointer-events-none drop-shadow relative z-10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <footer className="text-center text-xs text-slate-500 py-2 border-t border-slate-800">
        Gerencie suas peças com cuidado. Itens adjacentes ativarão sinergias no combate.
      </footer>
    </div>
  );
}

/* ========================================================
   TELA DA ARENA (COM CARREGAMENTO DINÂMICO DOS ITENS)
   ======================================================== */
function BattleScreen({
  playerItems,
  bossItems,
  onPrepClick,
  onBack,
}: {
  playerItems: PlacedItem[];
  bossItems: PlacedItem[];
  onPrepClick: () => void;
  onBack: () => void;
}) {
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

      {/* 3. INVENTÁRIOS 5x5 */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
        
        {/* ================= INVENTÁRIO DO JOGADOR (MONTAGEM DO DECK) ================= */}
        <div className="w-full max-w-[420px] aspect-square bg-[#0e1624]/90 backdrop-blur-sm border-4 border-[#1e2a3c] rounded-2xl p-2.5 shadow-2xl relative">
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-cyan-400/15 bg-cyan-950/20"
              />
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
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
              >
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

                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none relative z-10"
                />

                {/* Tooltip */}
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
                        <span>⚔️</span> +{item.stats.damage} de Dano
                      </div>
                    )}
                    {item.stats.armor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <Shield size={13} className="text-sky-400 fill-sky-400/20" /> +{item.stats.armor} de Armadura
                      </div>
                    )}
                    {item.stats.specialEffect && (
                      <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] font-medium text-cyan-200 leading-tight">
                        <span>❄️</span> {item.stats.specialEffect}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= INVENTÁRIO DO CHEFE (PADRÃO COM ARMADURA E ESPADA) ================= */}
        <div className="w-full max-w-[420px] md:ml-auto aspect-square bg-[#160c1a]/90 backdrop-blur-sm border-4 border-[#2c1533] rounded-2xl p-2.5 shadow-2xl relative">
          <div className="absolute inset-2.5 grid grid-cols-5 grid-rows-5 gap-1.5 pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-purple-400/15 bg-purple-950/20"
              />
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
                className={`group rounded-xl border-2 ${item.borderColor} ${item.bgColor} p-2 flex items-center justify-center shadow-lg relative cursor-pointer hover:brightness-110 transition-all`}
              >
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

                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none relative z-10"
                />

                {/* Tooltip do Chefe */}
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
                    {item.stats.damage && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <span>⚔️</span> +{item.stats.damage} de Dano
                      </div>
                    )}
                    {item.stats.armor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <Shield size={13} className="text-sky-400 fill-sky-400/20" /> +{item.stats.armor} de Armadura
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
        <button
          onClick={onPrepClick}
          className="flex-1 py-3 rounded-xl bg-[#243142]/90 hover:bg-[#2c3d52] border-2 border-[#3d5069] text-white font-bold text-sm tracking-wider uppercase shadow backdrop-blur-sm"
        >
          PREPARAÇÃO / LOJA
        </button>
        <button className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg">
          LUTAR
        </button>
      </footer>
    </div>
  );
}