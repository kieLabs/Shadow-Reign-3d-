(function (root) {
  const StoryArchive = {
    prologue:
      "In the shattered realm of Neo-Kyoto, the Abyssal Shogunate has merged ancient Oni sorcery with cybernetic shadow matrices. Four legendary warriors step into the 3D battlegrounds to sever the Shadow Reign.",
    chapters: {
      1: {
        title: "Act I: Whispers in the Bamboo",
        synopsis:
          "Kurogane the Oni Warlord has corrupted the sacred shrine lanterns. Enter the 3D grove, purge his shadow vanguard, and shatter his iron kanabo."
      },
      2: {
        title: "Act II: Neon Phantom Protocol",
        synopsis:
          "Above the acid rain clouds, Lady Yurei broadcasts a neural curse across the rooftops. Navigate the 3D cyber-pagoda and silence her phantom blades."
      },
      3: {
        title: "Act III: Throne of the Abyssal Shogun",
        synopsis:
          "At the core of the Obsidian Citadel, Lord Malakor awaits. Only mastery of 3D positioning, parrying, and Ultimate techniques will end his reign."
      }
    },
    getChapterLore(chapterNum) {
      return this.chapters[chapterNum] || this.chapters[1];
    }
  };

  root.ShadowReignStory = StoryArchive;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = StoryArchive;
  }
})(typeof window !== "undefined" ? window : globalThis);
