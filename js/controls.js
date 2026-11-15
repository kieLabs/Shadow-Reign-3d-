(function (root) {
  class InputController {
    constructor() {
      this.keys = {};
      this.joyVec = { x: 0, z: 0 };
      this.joyActive = false;
      this.joyOrigin = { x: 0, y: 0 };
      this.actionQueue = [];
      this.touchBlockHeld = false;
    }

    init() {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      window.addEventListener("keydown", e => {
        const k = e.key.toLowerCase();
        this.keys[k] = true;
        if (k === "j") this.queueAction("light");
        if (k === "k") this.queueAction("heavy");
        if (k === "l" || k === "shift") this.queueAction("dodge");
        if (k === "u" || k === "e") this.queueAction("special");
      });

      window.addEventListener("keyup", e => {
        this.keys[e.key.toLowerCase()] = false;
      });

      const canvasContainer = document.getElementById("webgl-container");
      if (canvasContainer) {
        canvasContainer.addEventListener("mousedown", e => {
          if (e.button === 0) this.queueAction("light");
        });
      }

      this.bindMobileJoystick();
      this.bindTouchButtons();
    }

    queueAction(type) {
      this.actionQueue.push(type);
    }

    consumeActions() {
      const copy = this.actionQueue.slice();
      this.actionQueue.length = 0;
      return copy;
    }

    isBlockingActive() {
      return Boolean(this.keys[" "] || this.touchBlockHeld);
    }

    getMovementVector() {
      let x = 0;
      let z = 0;
      if (this.keys["w"] || this.keys["arrowup"]) z -= 1;
      if (this.keys["s"] || this.keys["arrowdown"]) z += 1;
      if (this.keys["a"] || this.keys["arrowleft"]) x -= 1;
      if (this.keys["d"] || this.keys["arrowright"]) x += 1;

      if (this.joyActive) {
        x += this.joyVec.x;
        z += this.joyVec.z;
      }
      return { x, z };
    }

    bindMobileJoystick() {
      const base = document.getElementById("joystick-base");
      const stick = document.getElementById("joystick-stick");
      if (!base || !stick) return;

      const maxRadius = 42;
      const handleMove = (clientX, clientY) => {
        const dx = clientX - this.joyOrigin.x;
        const dy = clientY - this.joyOrigin.y;
        const dist = Math.min(maxRadius, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        stick.style.transform = `translate(${sx}px, ${sy}px)`;
        this.joyVec.x = sx / maxRadius;
        this.joyVec.z = sy / maxRadius;
      };

      base.addEventListener("pointerdown", e => {
        this.joyActive = true;
        const rect = base.getBoundingClientRect();
        this.joyOrigin.x = rect.left + rect.width / 2;
        this.joyOrigin.y = rect.top + rect.height / 2;
        if (base.setPointerCapture) base.setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      });

      base.addEventListener("pointermove", e => {
        if (!this.joyActive) return;
        handleMove(e.clientX, e.clientY);
      });

      const endJoy = () => {
        this.joyActive = false;
        this.joyVec.x = 0;
        this.joyVec.z = 0;
        stick.style.transform = "translate(0px, 0px)";
      };
      base.addEventListener("pointerup", endJoy);
      base.addEventListener("pointercancel", endJoy);
    }

    bindTouchButtons() {
      const bindTap = (id, action) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("pointerdown", e => {
          e.preventDefault();
          this.queueAction(action);
        });
      };

      bindTap("btn-touch-attack", "light");
      bindTap("btn-touch-heavy", "heavy");
      bindTap("btn-touch-dodge", "dodge");
      bindTap("btn-touch-special", "special");

      const blockBtn = document.getElementById("btn-touch-block");
      if (blockBtn) {
        blockBtn.addEventListener("pointerdown", e => {
          e.preventDefault();
          this.touchBlockHeld = true;
        });
        blockBtn.addEventListener("pointerup", () => {
          this.touchBlockHeld = false;
        });
        blockBtn.addEventListener("pointerleave", () => {
          this.touchBlockHeld = false;
        });
      }
    }
  }

  root.ShadowReignControls = new InputController();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.ShadowReignControls;
  }
})(typeof window !== "undefined" ? window : globalThis);
