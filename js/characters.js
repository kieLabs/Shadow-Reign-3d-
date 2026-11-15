(function (root) {
  const Data = root.ShadowReignData || (typeof require !== "undefined" ? require("./data.js") : {});

  const CharacterFactory = {
    getAll() {
      return Data.characters || [];
    },
    getById(id) {
      return (Data.characters || []).find(c => c.id === id) || Data.characters[0];
    },
    build3DMesh(charConfig, THREE) {
      if (!THREE) return null;
      const group = new THREE.Group();
      const mainColor = new THREE.Color(charConfig.color || "#8b5cf6");
      const accentColor = new THREE.Color(charConfig.accent || "#c4b5fd");

      const armorMat = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: 0.35,
        metalness: 0.45
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.6,
        metalness: 0.2
      });
      const glowMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: mainColor,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.8
      });

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.36, 1.25, 12), armorMat);
      torso.position.y = 1.35;
      torso.castShadow = true;
      group.add(torso);

      [-0.56, 0.56].forEach(xOff => {
        const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.45), darkMat);
        shoulder.position.set(xOff, 1.82, 0);
        shoulder.castShadow = true;
        group.add(shoulder);
      });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), darkMat);
      head.position.y = 2.28;
      head.castShadow = true;
      group.add(head);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.25), glowMat);
      visor.position.set(0, 2.3, 0.24);
      group.add(visor);

      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.48, 4), glowMat);
      crest.position.set(0, 2.65, 0.1);
      crest.rotation.x = -0.25;
      group.add(crest);

      const weaponPivot = new THREE.Group();
      weaponPivot.position.set(0.62, 1.55, 0.2);

      let bladeLength = 1.9;
      let bladeWidth = 0.08;
      if (charConfig.weapon === "odachi") {
        bladeLength = 2.55;
        bladeWidth = 0.14;
      } else if (charConfig.weapon === "spear") {
        bladeLength = 2.8;
        bladeWidth = 0.07;
      }

      const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), darkMat);
      hilt.rotation.x = Math.PI / 2;
      weaponPivot.add(hilt);

      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(bladeWidth, 0.06, bladeLength),
        glowMat
      );
      blade.position.set(0, 0, bladeLength / 2 + 0.15);
      blade.castShadow = true;
      weaponPivot.add(blade);

      if (charConfig.weapon === "twin_blades") {
        const offPivot = new THREE.Group();
        offPivot.position.set(-0.62, 1.55, 0.2);
        const offBlade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 1.75), glowMat);
        offBlade.position.set(0, 0, 1.0);
        offPivot.add(offBlade);
        group.add(offPivot);
      }

      group.add(weaponPivot);

      const ringGeo = new THREE.RingGeometry(0.68, 0.85, 28);
      const ringMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      group.add(ring);

      group.userData = { torso, head, weaponPivot, ring, glowMat };
      return group;
    }
  };

  root.ShadowReignCharacters = CharacterFactory;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CharacterFactory;
  }
})(typeof window !== "undefined" ? window : globalThis);
