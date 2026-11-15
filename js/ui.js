(function (root) {
  const UIManager = {
    renderMenuSelections(characters, levels, selectedChar, selectedChapter, onSelectChar, onSelectLevel) {
      const charGrid = document.getElementById("character-grid");
      const levelGrid = document.getElementById("level-grid");
      if (charGrid) {
        charGrid.innerHTML = "";
        characters.forEach(c => {
          const card = document.createElement("div");
          card.className = "select-card" + (c.id === selectedChar ? " selected" : "");
          card.innerHTML = `
            <h4>${c.name}</h4>
            <p>HP: ${c.hp} • ATK: ${c.attack} • SPD: ${c.speed}</p>
            <p style="margin-top:4px;color:#c4b5fd">Ult: ${c.special}</p>
          `;
          card.addEventListener("click", () => onSelectChar(c.id));
          charGrid.appendChild(card);
        });
      }

      if (levelGrid) {
        levelGrid.innerHTML = "";
        levels.forEach(l => {
          const card = document.createElement("div");
          card.className = "select-card" + (l.chapter === selectedChapter ? " selected" : "");
          card.innerHTML = `
            <h4>${l.name}</h4>
            <p>${l.desc}</p>
          `;
          card.addEventListener("click", () => onSelectLevel(l.chapter));
          levelGrid.appendChild(card);
        });
      }
    },

    updateHUD(player, levelCfg, waveNum, activeBoss, missionTickerText) {
      const setEl = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      setEl("hud-hero-name", player.name);
      setEl("hud-combo", `${player.comboCount} HIT`);
      setEl("hud-hp-text", `${player.hp} / ${player.maxHp}`);
      setEl(
        "hud-energy-text",
        player.energy >= 100 ? "ULTIMATE READY (U)" : `ENERGY ${Math.floor(player.energy)}%`
      );
      setEl("hud-arena-title", levelCfg.name);
      setEl(
        "hud-wave-status",
        activeBoss ? "3D BOSS ENCOUNTER" : `Wave ${waveNum} / ${levelCfg.waves}`
      );
      setEl("hud-mission-ticker", missionTickerText);

      const hpFill = document.getElementById("hud-hp-fill");
      if (hpFill) hpFill.style.width = `${(player.hp / player.maxHp) * 100}%`;

      const enFill = document.getElementById("hud-energy-fill");
      if (enFill) enFill.style.width = `${(player.energy / player.maxEnergy) * 100}%`;

      const bossHud = document.getElementById("boss-hud");
      if (bossHud) {
        if (activeBoss && !activeBoss.dead) {
          bossHud.classList.remove("hidden");
          setEl("boss-name-label", activeBoss.name);
          setEl("boss-phase-badge", `PHASE ${activeBoss.phase}`);
          const bFill = document.getElementById("boss-hp-fill");
          if (bFill) bFill.style.width = `${(activeBoss.hp / activeBoss.maxHp) * 100}%`;
        } else {
          bossHud.classList.add("hidden");
        }
      }
    },

    spawnFloatingDamage(screenPos, text, color = "#fef08a") {
      const container = document.getElementById("fx-overlay");
      if (!container || !screenPos) return;
      const el = document.createElement("div");
      el.className = "floating-dmg";
      el.style.left = `${screenPos.x}px`;
      el.style.top = `${screenPos.y}px`;
      el.style.color = color;
      el.textContent = text;
      container.appendChild(el);
      setTimeout(() => el.remove(), 750);
    }
  };

  root.ShadowReignUI = UIManager;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = UIManager;
  }
})(typeof window !== "undefined" ? window : globalThis);
