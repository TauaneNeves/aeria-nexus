import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: "#070B13",        // Fundo espacial profundo
          panel: "#0E1626",       // Placas e painéis de mochila
          slot: "#162238",        // Slots vazios da grade
          slotHover: "#1E2F4D",
          border: "#1F2F4A",      // Bordas sutis dos slots
          cyan: "#00F0FF",        // Armas de plasma e escudos rápidos
          green: "#10B981",       // Biotecnologia, cura e órgãos
          purple: "#8B5CF6",      // Armas de alto dano / Matéria escura
          amber: "#F59E0B",       // Baterias e conectores de sinergia
          crimson: "#EF4444",     // Barras de vida e chefes
          shield: "#38BDF8",      // Barra de escudo de energia
        },
      },
      boxShadow: {
        glowCyan: "0 0 15px rgba(0, 240, 255, 0.35)",
        glowGreen: "0 0 15px rgba(16, 185, 129, 0.35)",
        glowPurple: "0 0 15px rgba(139, 92, 246, 0.35)",
        glowAmber: "0 0 15px rgba(245, 158, 11, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;