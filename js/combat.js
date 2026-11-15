(function (root) {
  const CombatSystem = {
    calculateDamage(baseAttack, skillMultiplier, targetDefense, isBlocked = false) {
      const raw = baseAttack * (skillMultiplier || 1.0) * (100 / (100 + Math.max(0, targetDefense)));
      const mitigated = isBlocked ? raw * 0.25 : raw;
      return Math.max(1, Math.round(mitigated));
    },

    distance3D(a, b) {
      const dx = (a.x || 0) - (b.x || 0);
      const dy = (a.y || 0) - (b.y || 0);
      const dz = (a.z || 0) - (b.z || 0);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    isTargetInArc(attacker, target, maxReach, cosHalfAngle = -0.15) {
      const dist = this.distance3D(attacker, target);
      if (dist > maxReach) return false;
      const forwardX = Math.sin(attacker.rotationY || 0);
      const forwardZ = Math.cos(attacker.rotationY || 0);
      const toX = (target.x - attacker.x) / Math.max(0.001, dist);
      const toZ = (target.z - attacker.z) / Math.max(0.001, dist);
      const dot = forwardX * toX + forwardZ * toZ;
      return dot >= cosHalfAngle;
    },

    executePlayerAttack(player, targets, attackType = "light") {
      if (player.attackCooldown > 0) return [];
      let mult = 1.0;
      let reach = player.reach || 3.4;
      let arc = -0.15;

      if (attackType === "heavy") {
        mult = 1.65;
        reach *= 1.15;
        player.attackCooldown = 0.55;
      } else if (attackType === "special") {
        if (player.energy < 100) return [];
        player.energy = 0;
        mult = 2.6;
        reach *= 2.1;
        arc = -1.0;
        player.attackCooldown = 0.65;
      } else {
        player.attackCooldown = 0.28;
      }

      player.swingAnimTimer = 0.26;
      const hits = [];

      targets.forEach(t => {
        if (t.dead) return;
        const inRange =
          attackType === "special"
            ? this.distance3D(player, t) <= reach
            : this.isTargetInArc(player, t, reach, arc);

        if (inRange) {
          const dmg = this.calculateDamage(player.attack, mult, t.defense || 5, false);
          t.hp = Math.max(0, t.hp - dmg);
          if (player.id === "yuki" && attackType === "special") {
            t.freezeTimer = 3.0;
          }
          if (t.hp <= 0) t.dead = true;
          player.comboCount += 1;
          player.comboResetTimer = 3.2;
          player.energy = Math.min(player.maxEnergy, player.energy + 12);
          hits.push({ target: t, damage: dmg, killed: t.dead, attackType });
        }
      });

      return hits;
    },

    applyEnemyAttackToPlayer(enemyAction, player) {
      if (!enemyAction || !player || player.isInvulnerable()) {
        return { hit: false, damage: 0, blocked: false };
      }
      const dist = this.distance3D(enemyAction.attacker, player);
      const maxReach = (enemyAction.attacker.reach || 2.5) * (enemyAction.type === "boss_aoe" ? 1.5 : 1.15);
      if (dist > maxReach) {
        return { hit: false, damage: 0, blocked: false };
      }
      const dmg = this.calculateDamage(
        enemyAction.damage,
        1.0,
        player.defense,
        player.isBlocking
      );
      player.hp = Math.max(0, player.hp - dmg);
      return { hit: true, damage: dmg, blocked: player.isBlocking };
    }
  };

  root.ShadowReignCombat = CombatSystem;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CombatSystem;
  }
})(typeof window !== "undefined" ? window : globalThis);
