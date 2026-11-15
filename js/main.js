(function (root) {
  const Data = root.ShadowReignData;
  const Save = root.ShadowReignSave;
  const AudioSys = root.ShadowReignAudio;
  const Story = root.ShadowReignStory;
  const Missions = root.ShadowReignMissions;
  const Characters = root.ShadowReignCharacters;
  const Enemies = root.ShadowReignEnemies;
  const Bosses = root.ShadowReignBosses;
  const Levels = root.ShadowReignLevels;
  const PlayerController = root.ShadowReignPlayer;
  const Combat = root.ShadowReignCombat;
  const Controls = root.ShadowReignControls;
  const UI = root.ShadowReignUI;
  const Engine = root.ShadowReignEngine;

  class ShadowReign3DGame {
    constructor() {
      this.saveData = Save.load();
      this.selectedCharacter = this.saveData.selectedCharacter || "kuro";
      this.selectedChapter = 1;
      this.state = "menu";
      this.player = null;
      this.enemies = [];
      this.activeBoss = null;
      this.arenaGroup = null;
      this.currentLevel = Levels.getByChapter(1);
      this.waveNum = 1;
      this.killsThisRun = 0;
      this.lastTime = 0;
    }

    boot() {
      if (typeof document === "undefined") return;
      const container = document.getElementById("webgl-container");
      Engine.init(container);
      Controls.init();
      this.bindMenuButtons();
      this.refreshMenu();
      this.load3DBackdrop();
      requestAnimationFrame(ts => this.loop(ts));
    }

    load3DBackdrop() {
      if (!Engine.scene || typeof THREE === "undefined") return;
      this.clearSceneEntities();
      this.currentLevel = Levels.getByChapter(this.selectedChapter);
      Engine.scene.fog.color.setHex(this.currentLevel.fogColor);
      this.arenaGroup = Levels.build3DArena(this.currentLevel, Engine.scene, THREE);
      this.player = new PlayerController(this.selectedCharacter, THREE);
      if (this.player.mesh) Engine.scene.add(this.player.mesh);
    }

    clearSceneEntities() {
      if (!Engine.scene) return;
      if (this.arenaGroup) Engine.scene.remove(this.arenaGroup);
      if (this.player && this.player.mesh) Engine.scene.remove(this.player.mesh);
      this.enemies.forEach(e => e.mesh && Engine.scene.remove(e.mesh));
      if (this.activeBoss && this.activeBoss.mesh) Engine.scene.remove(this.activeBoss.mesh);
      this.enemies = [];
      this.activeBoss = null;
    }

    refreshMenu() {
      UI.renderMenuSelections(
        Characters.getAll(),
        Levels.getAll(),
        this.selectedCharacter,
        this.selectedChapter,
        charId => {
          this.selectedCharacter = charId;
          Save.save({ selectedCharacter: charId });
          this.refreshMenu();
          this.load3DBackdrop();
        },
        chapNum => {
          this.selectedChapter = chapNum;
          this.refreshMenu();
          this.load3DBackdrop();
        }
      );

      const summary = document.getElementById("save-summary");
      if (summary) {
        const s = Save.load();
        summary.textContent = `Unlocked Chapters: ${s.unlockedChapter}/3 • Total 3D Kills: ${s.totalKills} • Bosses Cleared: ${s.bossesDefeated.length}`;
      }
    }

    bindMenuButtons() {
      const on = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
      };

      on("btn-start-game", () => this.startArenaRun());
      on("btn-story-modal", () => {
        const modal = document.getElementById("story-modal");
        const lore = Story.getChapterLore(this.selectedChapter);
        document.getElementById("story-text-container").innerHTML = `<p><b>${lore.title}</b>: ${lore.synopsis}</p>`;
        document.getElementById("mission-list-container").innerHTML = Missions.missions
          .map(m => `<div>• ${m.title} (${m.progress}/${m.target})</div>`)
          .join("");
        modal.classList.remove("hidden");
      });
      on("btn-close-story", () => document.getElementById("story-modal").classList.add("hidden"));
      on("btn-reset-save", () => {
        this.saveData = Save.reset();
        this.refreshMenu();
      });

      on("btn-camera-mode", () => {
        const mode = Engine.cycleCameraMode();
        document.getElementById("btn-camera-mode").textContent = `CAM: ${mode.label.replace("CAM: ", "")}`;
      });
      on("btn-audio-toggle", () => {
        const onState = AudioSys.toggle();
        document.getElementById("btn-audio-toggle").textContent = onState ? "SFX: ON" : "SFX: OFF";
      });
      on("btn-pause-game", () => {
        if (this.state === "playing") {
          this.state = "paused";
          this.showResultModal("PAUSED", "3D Arena Simulation Paused", false);
        }
      });

      on("btn-next-level", () => {
        this.selectedChapter = Math.min(3, this.selectedChapter + 1);
        document.getElementById("result-modal").classList.add("hidden");
        this.startArenaRun();
      });
      on("btn-retry-level", () => {
        document.getElementById("result-modal").classList.add("hidden");
        this.startArenaRun();
      });
      on("btn-back-menu", () => {
        document.getElementById("result-modal").classList.add("hidden");
        document.getElementById("hud-screen").classList.remove("active");
        document.getElementById("menu-screen").classList.add("active");
        this.state = "menu";
        this.refreshMenu();
        this.load3DBackdrop();
      });
    }

    startArenaRun() {
      AudioSys.init();
      document.getElementById("menu-screen").classList.remove("active");
      document.getElementById("hud-screen").classList.add("active");
      Missions.resetForRun();
      this.waveNum = 1;
      this.killsThisRun = 0;
      this.load3DBackdrop();
      this.spawnCurrentWave();
      this.state = "playing";
    }

    spawnCurrentWave() {
      if (this.waveNum <= this.currentLevel.waves) {
        const count = 3 + this.waveNum + this.selectedChapter;
        this.enemies = Enemies.spawnWave(
          this.selectedChapter,
          this.waveNum,
          count,
          Data.arenaRadius,
          typeof THREE !== "undefined" ? THREE : null
        );
        this.enemies.forEach(e => e.mesh && Engine.scene && Engine.scene.add(e.mesh));
      } else if (!this.activeBoss) {
        AudioSys.bossRoar();
        this.activeBoss = Bosses.spawnBoss(
          this.currentLevel.bossId,
          typeof THREE !== "undefined" ? THREE : null
        );
        if (this.activeBoss.mesh && Engine.scene) {
          Engine.scene.add(this.activeBoss.mesh);
        }
      }
    }

    handlePlayerActions() {
      const actions = Controls.consumeActions();
      this.player.isBlocking = Controls.isBlockingActive();

      actions.forEach(act => {
        if (act === "dodge") {
          if (this.player.triggerDodge()) AudioSys.slash();
          return;
        }
        const targets = this.activeBoss ? [this.activeBoss] : this.enemies;
        const hits = Combat.executePlayerAttack(this.player, targets, act);
        if (act === "special") {
          AudioSys.special();
          Engine.spawn3DSlashEffect(this.player, true);
          Engine.triggerShake(0.3, 0.65);
          Missions.updateMetric("m_special", 1);
        } else if (act === "heavy") {
          AudioSys.heavySlash();
          Engine.spawn3DSlashEffect(this.player, false);
        } else {
          AudioSys.slash();
          Engine.spawn3DSlashEffect(this.player, false);
        }

        hits.forEach(h => {
          AudioSys.hit();
          Missions.updateMetric("m_combo", this.player.comboCount, true);
          const pos = Engine.projectToScreen(h.target);
          UI.spawnFloatingDamage(pos, `-${h.damage}`, h.attackType === "special" ? "#67e8f9" : "#fef08a");
          if (h.killed) {
            this.killsThisRun += 1;
            Missions.updateMetric("m_slayer", 1);
            if (h.target.mesh && Engine.scene) Engine.scene.remove(h.target.mesh);
          }
        });
      });
    }

    updateSimulation(dt) {
      const moveVec = Controls.getMovementVector();
      this.player.update(dt, moveVec, Data.arenaRadius);
      this.handlePlayerActions();

      this.enemies.forEach(enemy => {
        if (enemy.dead) return;
        const atk = enemy.update(dt, this.player, Data.arenaRadius);
        if (atk) {
          const res = Combat.applyEnemyAttackToPlayer(atk, this.player);
          if (res.hit) {
            if (res.blocked) AudioSys.block();
            else AudioSys.hit();
            const pos = Engine.projectToScreen(this.player);
            UI.spawnFloatingDamage(pos, res.blocked ? `BLOCKED -${res.damage}` : `-${res.damage}`, "#f87171");
          }
        }
      });

      this.enemies = this.enemies.filter(e => !e.dead);

      if (this.enemies.length === 0 && !this.activeBoss) {
        this.waveNum += 1;
        this.spawnCurrentWave();
      }

      if (this.activeBoss && !this.activeBoss.dead) {
        const bAtk = this.activeBoss.update(dt, this.player, Data.arenaRadius);
        if (bAtk) {
          const res = Combat.applyEnemyAttackToPlayer(bAtk, this.player);
          if (res.hit) {
            Engine.triggerShake(0.25, 0.55);
            const pos = Engine.projectToScreen(this.player);
            UI.spawnFloatingDamage(pos, `-${res.damage}`, "#ef4444");
          }
        }
      } else if (this.activeBoss && this.activeBoss.dead) {
        this.state = "victory";
        const score = this.killsThisRun * 150 + this.player.hp * 10;
        Save.recordVictory(this.selectedChapter, this.activeBoss.id, this.killsThisRun, score);
        this.showResultModal("3D ARENA CONQUERED!", `You defeated ${this.activeBoss.name}!`, true);
      }

      if (this.player.hp <= 0 && this.state === "playing") {
        this.state = "defeat";
        this.showResultModal("FALLEN IN SHADOW", "Your warrior was overwhelmed in the 3D Arena.", false);
      }

      UI.updateHUD(
        this.player,
        this.currentLevel,
        Math.min(this.waveNum, this.currentLevel.waves),
        this.activeBoss,
        Missions.getActiveTicker()
      );
      Engine.updateCameraAndEffects(dt, this.player);
    }

    showResultModal(title, subtitle, isVictory) {
      const modal = document.getElementById("result-modal");
      document.getElementById("result-title").textContent = title;
      document.getElementById("result-subtitle").textContent = subtitle;
      document.getElementById("result-stats").innerHTML = `
        <p style="margin:10px 0;color:#a7f3d0">Kills: ${this.killsThisRun} • Max Combo: ${this.player.comboCount}</p>
      `;
      const nextBtn = document.getElementById("btn-next-level");
      if (nextBtn) nextBtn.style.display = isVictory && this.selectedChapter < 3 ? "inline-block" : "none";
      modal.classList.remove("hidden");
    }

    loop(timestamp) {
      const dt = Math.min(0.05, (timestamp - (this.lastTime || timestamp)) / 1000);
      this.lastTime = timestamp;

      if (this.state === "playing") {
        this.updateSimulation(dt);
      } else if (this.state === "menu" && this.player) {
        this.player.rotationY += dt * 0.6;
        this.player.syncMesh();
        Engine.updateCameraAndEffects(dt, this.player);
      }

      Engine.render();
      requestAnimationFrame(ts => this.loop(ts));
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      const app = new ShadowReign3DGame();
      app.boot();
      window.ShadowReignApp = app;
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
