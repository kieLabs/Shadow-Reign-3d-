(function (root) {
  class SynthAudioEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (this.ctx || typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playTone(freq, type, duration, gainVal = 0.12, slideTo = null) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        if (this.ctx.state === "suspended") this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
        }
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    slash() {
      this.playTone(420, "sawtooth", 0.11, 0.1, 140);
    }

    heavySlash() {
      this.playTone(260, "square", 0.22, 0.15, 75);
    }

    hit() {
      this.playTone(130, "triangle", 0.12, 0.18, 55);
    }

    block() {
      this.playTone(680, "sine", 0.1, 0.14, 920);
    }

    special() {
      this.playTone(520, "sawtooth", 0.45, 0.18, 110);
    }

    bossRoar() {
      this.playTone(95, "sawtooth", 0.6, 0.2, 42);
    }
  }

  root.ShadowReignAudio = new SynthAudioEngine();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.ShadowReignAudio;
  }
})(typeof window !== "undefined" ? window : globalThis);
