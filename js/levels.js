(function (root) {
  const Data = root.ShadowReignData || (typeof require !== "undefined" ? require("./data.js") : {});

  const LevelBuilder = {
    getAll() {
      return Data.levels || [];
    },
    getByChapter(chapterNum) {
      return (Data.levels || []).find(l => l.chapter === chapterNum) || Data.levels[0];
    },
    build3DArena(levelConfig, scene, THREE) {
      if (!THREE || !scene) return null;
      const arenaGroup = new THREE.Group();
      const radius = Data.arenaRadius || 26;

      const groundGeo = new THREE.CylinderGeometry(radius, radius * 1.06, 1.2, 48);
      const groundMat = new THREE.MeshStandardMaterial({
        color: levelConfig.groundColor || 0x16241c,
        roughness: 0.75,
        metalness: 0.15
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -0.6;
      ground.receiveShadow = true;
      arenaGroup.add(ground);

      const grid = new THREE.PolarGridHelper(radius - 0.5, 16, 8, 64, levelConfig.accentLight, 0x334155);
      grid.position.y = 0.02;
      arenaGroup.add(grid);

      const pillarCount = 12;
      const pillarMat = new THREE.MeshStandardMaterial({
        color: levelConfig.pillarColor || 0x2d4a3e,
        roughness: 0.5,
        metalness: 0.3
      });
      const lanternMat = new THREE.MeshBasicMaterial({
        color: levelConfig.accentLight || 0x34d399
      });

      for (let i = 0; i < pillarCount; i++) {
        const angle = (Math.PI * 2 * i) / pillarCount;
        const px = Math.cos(angle) * (radius - 1.2);
        const pz = Math.sin(angle) * (radius - 1.2);

        const h = 4.5 + (i % 3) * 1.4;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, h, 8), pillarMat);
        pillar.position.set(px, h / 2, pz);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        arenaGroup.add(pillar);

        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), lanternMat);
        lantern.position.set(px, h + 0.35, pz);
        arenaGroup.add(lantern);
      }

      scene.add(arenaGroup);
      return arenaGroup;
    }
  };

  root.ShadowReignLevels = LevelBuilder;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = LevelBuilder;
  }
})(typeof window !== "undefined" ? window : globalThis);
