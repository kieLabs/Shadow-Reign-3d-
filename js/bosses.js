(function (root) {
  const Data = root.ShadowReignData || (typeof require !== "undefined" ? require("./data.js") : {});

  class BossEntity {
    constructor(config, THREE) {
      this.id = config.id;
      this.name = config.name;
      this.maxHp = config.hp;
      this.hp = config.hp;
      this.attack = config.attack;
      this.defense = config.defense || 14;
      this.speed = config.speed;
      this.scale = config.scale || 1.6;
      this.reach = 4.2;
      this.isBoss = true;
      this.dead = false;
      this.phase = 1;
      this.x = 0;
      this.y = 0;
      this.z = -12;
      this.rotationY = 0;
      this.attackCooldown = 1.6;
      this.specialCooldown = 5.0;
      this.freezeTimer = 0;
      this.mesh = this.createBossMesh(config, THREE);
      this.syncMesh();
    }

    createBossMesh(cfg, THREE) {
      if (!THREE) return null;
      const g = new THREE.Group();
      const mainCol = new THREE.Color(cfg.color || "#dc2626");
      const armorMat = new THREE.MeshStandardMaterial({
        color: mainCol,
        roughness: 0.3,
        metalness: 0.6
      });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.5 });
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: mainCol,
        emissiveIntensity: 0.6
      });

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.48, 1.65, 12), armorMat);
      torso.position.y = 1.5;
      torso.castShadow = true;
      g.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), darkMat);
      head.position.y = 2.65;
      g.add(head);

      [-0.28, 0.28].forEach(xOff => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 8), hornMat);
        horn.position.set(xOff, 3.05, 0.12);
        horn.rotation.z = xOff < 0 ? 0.35 : -0.35;
        g.add(horn);
      });

      const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 2.8), hornMat);
      weapon.position.set(0.85, 1.7, 1.1);
      weapon.castShadow = true;
      g.add(weapon);

      g.scale.setScalar(this.scale);
      g.userData = { armorMat, weapon };
      return g;
    }

    syncMesh() {
      if (!this.mesh) return;
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.y = this.rotationY;
    }

    update(dt, player, arenaRadius) {
      if (this.dead) return null;

      if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
        this.phase = 2;
        this.speed *= 1.22;
        this.attack = Math.round(this.attack * 1.2);
      }

      if (this.freezeTimer > 0) {
        this.freezeTimer = Math.max(0, this.freezeTimer - dt);
        return null;
      }

      const dx = player.x - this.x;
      const dz = player.z - this.z;
      const dist = Math.hypot(dx, dz);
      this.rotationY = Math.atan2(dx, dz);

      if (dist > this.reach * 0.8) {
        const step = this.speed * dt;
        this.x += (dx / Math.max(0.001, dist)) * step;
        this.z += (dz / Math.max(0.001, dist)) * step;
      }

      const r = Math.hypot(this.x, this.z);
      if (r > arenaRadius - 1.5) {
        this.x *= (arenaRadius - 1.5) / r;
        this.z *= (arenaRadius - 1.5) / r;
      }

      this.attackCooldown -= dt;
      this.specialCooldown -= dt;
      this.syncMesh();

      if (this.specialCooldown <= 0 && dist <= this.reach * 1.45) {
        this.specialCooldown = this.phase === 2 ? 4.2 : 6.0;
        return {
          type: "boss_aoe",
          attacker: this,
          damage: Math.round(this.attack * 1.35)
        };
      }

      if (dist <= this.reach && this.attackCooldown <= 0) {
        this.attackCooldown = this.phase === 2 ? 1.05 : 1.45;
        return { type: "boss_cleave", attacker: this, damage: this.attack };
      }

      return null;
    }
  }

  const BossFactory = {
    getById(id) {
      return (Data.bosses || []).find(b => b.id === id) || Data.bosses[0];
    },
    spawnBoss(bossId, THREE) {
      const cfg = this.getById(bossId);
      return new BossEntity(cfg, THREE);
    }
  };

  root.ShadowReignBosses = BossFactory;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = BossFactory;
  }
})(typeof window !== "undefined" ? window : globalThis);
