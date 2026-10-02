import React from "react";

interface PlasmaProjectileProps {
  type: "boss" | "player";
  className?: string;
}

export function PlasmaProjectile({ type, className = "" }: PlasmaProjectileProps) {
  const isBoss = type === "boss";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Rastro brilhante */}
      <div
        className={`absolute w-14 h-4 rounded-full blur-md opacity-80 ${
          isBoss ? "bg-purple-600 -translate-x-3" : "bg-cyan-400 -translate-x-3"
        }`}
      />
      {/* Núcleo do projétil */}
      <div
        className={`w-6 h-6 rounded-full shadow-lg border-2 ${
          isBoss
            ? "bg-gradient-to-r from-red-500 via-purple-600 to-white border-purple-300 shadow-[0_0_20px_#a855f7]"
            : "bg-gradient-to-r from-cyan-400 via-sky-300 to-white border-cyan-200 shadow-[0_0_20px_#22d3ee]"
        }`}
      />
    </div>
  );
}

export default PlasmaProjectile;