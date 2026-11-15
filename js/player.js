(function (root) {
  const Characters =
    root.ShadowReignCharacters || (typeof require !== "undefined" ? require("./characters.js") : {});

  class PlayerController {
    constructor(charId, THREE) {
      const cfg = Characters.getById(charId);
      this.config = cfg;
      this.id = cfg.id;
      this.name = cfg.name;
      this.maxHp = cfg.hp;
      this.hp = cfg.hp;
      this.attack = cfg.attack;
      this.defense = cfg.defense;
      this.speed = cfg.speed;
      this.reach = cfg.reach || 3.4;
      this.energy = 100;
      this.maxEnergy = 100;

      this.x = 0;
      this.y = 0;
      this.z = 8;
      this.rotationY = Math.PI;

      this.attackCooldown = 0;
      this.dodgeTimer = 0;
      this.dodgeCooldown = 0;
      this.isBlocking = false;
      this.comboCount = 0;
      this.comboResetTimer = 0;
      this.swingAnimTimer = 0;

      this.mesh = Characters.build3DMesh(cfg, THREE);
      this.syncMesh();
    }

    syncMesh() {
      if (!this.mesh) return;
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.y = this.rotationY;

      if (this.mesh.userData && this.mesh.userData.weaponPivot) {
        if (this.swingAnimTimer > 0) {
          this.mesh.userData.weaponPivot.rotation.y = Math.sin(this.swingAnimTimer * 24) * 1.35;
        } else {
          this.mesh.userData.weaponPivot.rotation.y = 0;
        }
      }
    }

    isInvulnerable() {
      return this.dodgeTimer > 0;
    }

    update(dt, inputVec, arenaRadius) {
      if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      if (this.dodgeTimer > 0) this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
      if (this.dodgeCooldown > 0) this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
      if (this.swingAnimTimer > 0) this.swingAnimTimer = Math.max(0, this.swingAnimTimer - dt);

      if (this.comboResetTimer > 0) {
        this.comboResetTimer -= dt;
        if (this.comboResetTimer <= 0) this.comboCount = 0;
      }

      this.energy = Math.min(this.maxEnergy, this.energy + dt * 8);

      const moveLen = Math.hypot(inputVec.x, inputVec.z);
      const speedMult = this.dodgeTimer > 0 ? 2.25 : this.isBlocking ? 0.45 : 1.0;

      if (moveLen > 0.05) {
        const nx = inputVec.x / moveLen;
        const nz = inputVec.z / moveLen;
        this.x += nx * this.speed * speedMult * dt;
        this.z += nz * this.speed * speedMult * dt;
        this.rotationY = Math.atan2(nx, nz);
      }

      const distFromCenter = Math.hypot(this.x, this.z);
      const maxR = (arenaRadius || 26) - 1.2;
      if (distFromCenter > maxR) {
        this.x = (this.x / distFromCenter) * maxR;
        this.z = (this.z / distFromCenter) * maxR;
      }

      this.syncMesh();
    }

    triggerDodge() {
      if (this.dodgeCooldown > 0) return false;
      this.dodgeTimer = 0.32;
      this.dodgeCooldown = 0.85;
      return true;
    }
  }

  root.ShadowReignPlayer = PlayerController;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PlayerController;
  }
})(typeof window !== "undefined" ? window : globalThis);
