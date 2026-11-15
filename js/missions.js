(function (root) {
  class MissionManager {
    constructor() {
      this.missions = [
        { id: "m_combo", title: "Reach a 10-Hit 3D Combo", target: 10, progress: 0, completed: false },
        { id: "m_slayer", title: "Defeat 12 Shadow Enemies", target: 12, progress: 0, completed: false },
        { id: "m_special", title: "Unleash 2 Ultimate 3D Techniques", target: 2, progress: 0, completed: false }
      ];
    }

    resetForRun() {
      this.missions.forEach(m => {
        m.progress = 0;
        m.completed = false;
      });
    }

    updateMetric(id, value, isAbsolute = false) {
      const m = this.missions.find(item => item.id === id);
      if (!m || m.completed) return false;
      m.progress = isAbsolute ? Math.max(m.progress, value) : m.progress + value;
      if (m.progress >= m.target) {
        m.progress = m.target;
        m.completed = true;
        return true;
      }
      return false;
    }

    getActiveTicker() {
      const active = this.missions.find(m => !m.completed);
      if (!active) return "All Arena Missions Completed!";
      return `${active.title} (${active.progress}/${active.target})`;
    }
  }

  root.ShadowReignMissions = new MissionManager();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.ShadowReignMissions;
  }
})(typeof window !== "undefined" ? window : globalThis);
