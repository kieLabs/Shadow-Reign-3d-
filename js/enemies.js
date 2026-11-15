(function (root) {
  const ENEMY_TYPES = [
    {
      type: "shadow_grunt",
      name: "Shadow Footman",
      hp: 55,
      attack: 10,
      defense: 4,
      speed: 4.1,
      reach: 2.2,
      color: 0x64748b,
      accent: 0xf43f5e,
      scale: 0.95
    },
    {
      type: "cyber_assassin",
      name: "Neon Stalker",
      hp: 45,
      attack: 14,
      defense: 3,
      speed: 5.6,
      reach: 2.4,
      color: 0x0f172a,
      accent: 0x06b6d4,
      scale: 0.9
    },
    {
      type: "crimson_brute",
      name: "Oni Enforcer",
      hp: 95,
      attack: 17,
      defense: 8,
      speed: 3.3,
      reach: 2.8,
      color: 0x450a0a,
      accent: 0xf97316,
      scale: 1.25
    }
  ];

  class EnemyEntity {
    constructor(template, spawnPos, THREE) {
      this.id = "enemy_" + Math.random().toString(36).slice(2, 9);
      this.name = template.name;
      this.maxHp = template.hp;
      this.hp = template.hp;
      this.attack = template.attack;
      this.defense = template.defense;
      this.speed = template.speed;
      this.reach = template.reach;
      this.isBoss = false;
      this.dead = false;
      this.x = spawnPos.x;
      this.y = 0;
      this.z = spawnPos.z;
      this.rotationY = 0;
      this.attackCooldown = 0.8 + Math.random() * 0.8;
      this.hitFlash = 0;
      this.freezeTimer = 0;
      this.mesh = this.createMesh(template, THREE);
      this.syncMesh();
    }

    createMesh(tpl, THREE) {
      if (!THREE) return null;
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: tpl.color, roughness: 0.45 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: tpl.accent });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.3, 10), bodyMat);
      body.position.y = 1.2;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 1), bodyMat);
      head.position.y = 2.15;
      g.add(head);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.3), eyeMat);
      visor.position.set(0, 2.15, 0.22);
      g.add(visor);

      const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.4), eyeMat);
      weapon.position.set(0.5, 1.35, 0.65);
      g.add(weapon);

      g.scale.setScalar(tpl.scale || 1);
      g.userData = { bodyMat, weapon };
      return g;
    }

    syncMesh() {
      if (!this.mesh) return;
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.y = this.rotationY;
    }

    update(dt, player, arenaRadius) {
      if (this.dead) return null;
      if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
      if (this.freezeTimer > 0) {
        this.freezeTimer = Math.max(0, this.freezeTimer - dt);
        return null;
      }

      const dx = player.x - this.x;
      const dz = player.z - this.z;
      const dist = Math.hypot(dx, dz);
      this.rotationY = Math.atan2(dx, dz);

      if (dist > this.reach * 0.85) {
        const moveStep = this.speed * dt;
        this.x += (dx / Math.max(0.001, dist)) * moveStep;
        this.z += (dz / Math.max(0.001, dist)) * moveStep;
      }

      const r = Math.hypot(this.x, this.z);
      if (r > arenaRadius - 1) {
        this.x *= (arenaRadius - 1) / r;
        this.z *= (arenaRadius - 1) / r;
      }

      this.attackCooldown -= dt;
      this.syncMesh();

      if (dist <= this.reach && this.attackCooldown <= 0) {
        this.attackCooldown = 1.45;
        return { type: "melee", attacker: this, damage: this.attack };
      }
      return null;
    }
  }

  const EnemyManager = {
    types: ENEMY_TYPES,
    spawnWave(chapter, waveNum, count, arenaRadius, THREE) {
      const list = [];
      for (let i = 0; i < count; i++) {
        const tpl = ENEMY_TYPES[(i + chapter) % ENEMY_TYPES.length];
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const dist = arenaRadius * (0.55 + Math.random() * 0.25);
        const scaledTpl = Object.assign({}, tpl, {
          hp: Math.round(tpl.hp * (1 + (chapter - 1) * 0.25 + (waveNum - 1) * 0.12)),
          attack: Math.round(tpl.attack * (1 + (chapter - 1) * 0.18))
        });
        list.push(
          new EnemyEntity(
            scaledTpl,
            { x: Math.cos(angle) * dist, z: Math.sin(angle) * dist },
            THREE
          )
        );
      }
      return list;
    }
  };

  root.ShadowReignEnemies = EnemyManager;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = EnemyManager;
  }
})(typeof window !== "undefined" ? window : globalThis);
