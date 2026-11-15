(function (root) {
  const STORAGE_KEY = "shadow_reign_3d_gamerkie_save_v1";

  const defaultSave = () => ({
    selectedCharacter: "kuro",
    unlockedChapter: 1,
    totalKills: 0,
    bossesDefeated: [],
    highScore: 0
  });

  const SaveManager = {
    load() {
      try {
        if (typeof localStorage === "undefined") return defaultSave();
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? Object.assign(defaultSave(), JSON.parse(raw)) : defaultSave();
      } catch (e) {
        return defaultSave();
      }
    },
    save(data) {
      try {
        const merged = Object.assign(this.load(), data);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      } catch (e) {
        return data;
      }
    },
    recordVictory(chapter, bossId, kills, score) {
      const current = this.load();
      current.unlockedChapter = Math.max(current.unlockedChapter, Math.min(3, chapter + 1));
      current.totalKills += kills;
      current.highScore = Math.max(current.highScore, score);
      if (bossId && !current.bossesDefeated.includes(bossId)) {
        current.bossesDefeated.push(bossId);
      }
      return this.save(current);
    },
    reset() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {}
      return defaultSave();
    }
  };

  root.ShadowReignSave = SaveManager;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SaveManager;
  }
})(typeof window !== "undefined" ? window : globalThis);
