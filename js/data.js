(function (root) {
  const GAME_DATA = {
    version: "3.0.0-3D",
    arenaRadius: 26,
    gravity: -28,
    cameraModes: [
      { id: "chase", label: "CAM: CHASE", offset: { x: 0, y: 11, z: 16 }, lookY: 1.4 },
      { id: "iso", label: "CAM: ISO 3D", offset: { x: 14, y: 18, z: 14 }, lookY: 0.8 },
      { id: "action", label: "CAM: CLOSE", offset: { x: 0, y: 7.5, z: 11.5 }, lookY: 1.6 }
    ],
    characters: [
      {
        id: "kuro",
        name: "Kuro — Shadow Blade",
        hp: 120,
        speed: 6.5,
        attack: 18,
        defense: 10,
        special: "Shadow Slash",
        color: "#8b5cf6",
        accent: "#c4b5fd",
        weapon: "katana",
        reach: 3.4,
        desc: "Balanced 3D shadow shinobi with high-speed void katana arcs."
      },
      {
        id: "akira",
        name: "Akira — Crimson Ronin",
        hp: 140,
        speed: 5.8,
        attack: 22,
        defense: 14,
        special: "Flame Vortex",
        color: "#ef4444",
        accent: "#fca5a5",
        weapon: "odachi",
        reach: 4.1,
        desc: "Heavy-armored samurai wielding a long 3D crimson odachi greatsword."
      },
      {
        id: "ren",
        name: "Ren — Cyber Phantom",
        hp: 105,
        speed: 7.4,
        attack: 16,
        defense: 8,
        special: "Phantom Dash",
        color: "#06b6d4",
        accent: "#67e8f9",
        weapon: "twin_blades",
        reach: 3.0,
        desc: "Hyper-agile cyber assassin with rapid dual-blade 3D strikes."
      },
      {
        id: "yuki",
        name: "Yuki — Frost Valkyrie",
        hp: 115,
        speed: 6.8,
        attack: 19,
        defense: 11,
        special: "Glacial Nova",
        color: "#3b82f6",
        accent: "#93c5fd",
        weapon: "spear",
        reach: 4.3,
        desc: "Long-reach polearm master who freezes enemies in a 3D radius."
      }
    ],
    bosses: [
      {
        id: "oni_warlord",
        name: "Kurogane the Oni Warlord",
        hp: 450,
        attack: 24,
        defense: 12,
        speed: 4.2,
        scale: 1.6,
        color: "#dc2626",
        arena: "bamboo_shrine"
      },
      {
        id: "phantom_empress",
        name: "Lady Yurei — Phantom Empress",
        hp: 600,
        attack: 28,
        defense: 14,
        speed: 5.0,
        scale: 1.5,
        color: "#9333ea",
        arena: "neon_rooftops"
      },
      {
        id: "shogun_abyss",
        name: "Lord Malakor — Abyssal Shogun",
        hp: 850,
        attack: 34,
        defense: 18,
        speed: 5.5,
        scale: 1.85,
        color: "#f59e0b",
        arena: "obsidian_citadel"
      }
    ],
    levels: [
      {
        id: "bamboo_shrine",
        chapter: 1,
        name: "Chapter 1: Cursed Bamboo Shrine (3D)",
        bossId: "oni_warlord",
        waves: 3,
        fogColor: 0x0b131e,
        groundColor: 0x16241c,
        accentLight: 0x34d399,
        pillarColor: 0x2d4a3e,
        desc: "Moonlit 3D bamboo forest guarded by Oni Warlord Kurogane."
      },
      {
        id: "neon_rooftops",
        chapter: 2,
        name: "Chapter 2: Cyber-Neon Rooftops (3D)",
        bossId: "phantom_empress",
        waves: 3,
        fogColor: 0x0d091a,
        groundColor: 0x131124,
        accentLight: 0x06b6d4,
        pillarColor: 0x3b0764,
        desc: "High-altitude 3D cyber pagoda controlled by Lady Yurei."
      },
      {
        id: "obsidian_citadel",
        chapter: 3,
        name: "Chapter 3: Obsidian Abyss Citadel (3D)",
        bossId: "shogun_abyss",
        waves: 4,
        fogColor: 0x180808,
        groundColor: 0x1f1212,
        accentLight: 0xf59e0b,
        pillarColor: 0x450a0a,
        desc: "Volcanic 3D monolith throne of Abyssal Shogun Malakor."
      }
    ]
  };

  root.ShadowReignData = GAME_DATA;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = GAME_DATA;
  }
})(typeof window !== "undefined" ? window : globalThis);
