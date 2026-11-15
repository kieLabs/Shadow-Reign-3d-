(function (root) {
  const DeviceManager = {
    isTouchDevice() {
      if (typeof window === "undefined") return false;
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 900
      );
    },
    getPixelRatio() {
      if (typeof window === "undefined") return 1;
      return Math.min(window.devicePixelRatio || 1, 2);
    },
    getViewportProfile() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1280;
      const h = typeof window !== "undefined" ? window.innerHeight : 720;
      return {
        width: w,
        height: h,
        aspect: w / Math.max(1, h),
        isMobile: w <= 768 || this.isTouchDevice()
      };
    }
  };

  root.ShadowReignDevice = DeviceManager;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DeviceManager;
  }
})(typeof window !== "undefined" ? window : globalThis);
