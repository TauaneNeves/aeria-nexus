export interface ItemData {
  id: string;
  name: string;
  type: "weapon" | "shield" | "battery" | "bio" | "armor";
  width: number;       // colunas ocupadas (1 a 5)
  height: number;      // linhas ocupadas (1 a 5)
  imageUrl: string;    // caminho da imagem em /public ou placeholder
  baseDamage?: number; // dano
  baseShield?: number; // escudo
  description: string;
  borderColor: string;
  bgColor: string;
}

// TABELA CENTRAL DE ITENS DO AERIA NEXUS
export const ITEMS_DATABASE: Record<string, ItemData> = {
  "espada-celestial": {
    id: "espada-celestial",
    name: "Espada Celestial",
    type: "weapon",
    width: 3,
    height: 1,
    imageUrl: "/espada.png", // Usa o seu arquivo da pasta public/
    baseDamage: 12,
    description: "Emite feixes de energia ciano. Ganha +2 de dano se adjacente a Baterias.",
    borderColor: "border-[#38bdf8]",
    bgColor: "bg-[#14293e]",
  },
  "escudo-dragao": {
    id: "escudo-dragao",
    name: "Escudo do Dragão",
    type: "shield",
    width: 2,
    height: 2,
    imageUrl: "https://placehold.co/140x140/0f2e1a/4ade80.png?text=Escudo+2x2",
    baseShield: 50,
    description: "Bloqueia ataques pesados a cada rodada.",
    borderColor: "border-[#22c55e]",
    bgColor: "bg-[#0f2e1a]",
  },
  "glaive-da-noite": {
    id: "glaive-da-noite",
    name: "Glaive da Noite",
    type: "weapon",
    width: 4,
    height: 1,
    imageUrl: "https://placehold.co/280x70/251036/c084fc.png?text=Glaive+4x1",
    baseDamage: 24,
    description: "Arma lendária do Guardião Celestial.",
    borderColor: "border-[#7c3aed]",
    bgColor: "bg-[#251036]",
  },
  "armadura-chifres": {
    id: "armadura-chifres",
    name: "Armadura de Chifres",
    type: "armor",
    width: 2,
    height: 2,
    imageUrl: "https://placehold.co/140x140/331416/f87171.png?text=Armadura+2x2",
    baseShield: 40,
    description: "Forjada em placas de ossos titânicos.",
    borderColor: "border-[#852a32]",
    bgColor: "bg-[#331416]",
  },
  "coracao-amaldicoado": {
    id: "coracao-amaldicoado",
    name: "Coração Amaldiçoado",
    type: "bio",
    width: 2,
    height: 2,
    imageUrl: "https://placehold.co/140x140/251036/c084fc.png?text=Coração+2x2",
    baseDamage: 8,
    description: "Pulsa com energia de matéria escura.",
    borderColor: "border-[#7c3aed]",
    bgColor: "bg-[#251036]",
  },
};