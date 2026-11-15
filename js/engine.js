(function (root) {
  const Data = root.ShadowReignData || (typeof require !== "undefined" ? require("./data.js") : {});
  const Device = root.ShadowReignDevice || (typeof require !== "undefined" ? require("./device.js") : {});

  class Engine3D {
    constructor() {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.cameraModeIndex = 0;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;
      this.slashEffects = [];
    }

    init(containerEl) {
      if (typeof THREE === "undefined" || !containerEl) return false;
      const profile = Device.getViewportProfile();

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x07080d);
      this.scene.fog = new THREE.FogExp2(0x07080d, 0.022);

      this.camera = new THREE.PerspectiveCamera(52, profile.aspect, 0.1, 160);
      this.camera.position.set(0, 11, 16);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      this.renderer.setSize(profile.width, profile.height);
      this.renderer.setPixelRatio(Device.getPixelRatio());
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      containerEl.innerHTML = "";
      containerEl.appendChild(this.renderer.domElement);

      this.setupLighting();

      window.addEventListener("resize", () => this.onResize());
      return true;
    }

    setupLighting() {
      const hemi = new THREE.HemisphereLight(0xc4b5fd, 0x0f172a, 0.75);
      this.scene.add(hemi);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
      dirLight.position.set(14, 26, 16);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 70;
      const d = 26;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      this.scene.add(dirLight);
    }

    cycleCameraMode() {
      const modes = Data.cameraModes || [];
      this.cameraModeIndex = (this.cameraModeIndex + 1) % modes.length;
      return modes[this.cameraModeIndex];
    }

    triggerShake(duration = 0.2, intensity = 0.45) {
      this.shakeTimer = duration;
      this.shakeIntensity = intensity;
    }

    spawn3DSlashEffect(player, isSpecial = false) {
      if (!this.scene || typeof THREE === "undefined") return;
      const radius = isSpecial ? 4.8 : 2.1;
      const geo = new THREE.RingGeometry(radius * 0.65, radius, 24, 1, 0, isSpecial ? Math.PI * 2 : Math.PI);
      const mat = new THREE.MeshBasicMaterial({
        color: isSpecial ? 0x67e8f9 : 0xc4b5fd,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = player.rotationY - Math.PI / 2;
      mesh.position.set(player.x, 1.2, player.z);
      this.scene.add(mesh);
      this.slashEffects.push({ mesh, life: 0.22, maxLife: 0.22 });
    }

    projectToScreen(worldObj) {
      if (!this.camera || typeof THREE === "undefined") return { x: 400, y: 300 };
      const vec = new THREE.Vector3(worldObj.x, (worldObj.y || 0) + 2.4, worldObj.z);
      vec.project(this.camera);
      return {
        x: (vec.x * 0.5 + 0.5) * window.innerWidth,
        y: (-(vec.y * 0.5) + 0.5) * window.innerHeight
      };
    }

    updateCameraAndEffects(dt, target) {
      if (!this.camera || !target) return;
      const modes = Data.cameraModes || [{ offset: { x: 0, y: 11, z: 16 }, lookY: 1.4 }];
      const mode = modes[this.cameraModeIndex] || modes[0];

      const desiredX = target.x + mode.offset.x;
      const desiredY = mode.offset.y;
      const desiredZ = target.z + mode.offset.z;

      this.camera.position.x += (desiredX - this.camera.position.x) * Math.min(1, dt * 7);
      this.camera.position.y += (desiredY - this.camera.position.y) * Math.min(1, dt * 7);
      this.camera.position.z += (desiredZ - this.camera.position.z) * Math.min(1, dt * 7);

      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      }

      this.camera.lookAt(target.x, mode.lookY, target.z);

      for (let i = this.slashEffects.length - 1; i >= 0; i--) {
        const fx = this.slashEffects[i];
        fx.life -= dt;
        fx.mesh.scale.multiplyScalar(1 + dt * 2.5);
        fx.mesh.material.opacity = Math.max(0, fx.life / fx.maxLife);
        if (fx.life <= 0) {
          this.scene.remove(fx.mesh);
          this.slashEffects.splice(i, 1);
        }
      }
    }

    render() {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    onResize() {
      if (!this.renderer || !this.camera) return;
      const profile = Device.getViewportProfile();
      this.camera.aspect = profile.aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(profile.width, profile.height);
    }
  }

  root.ShadowReignEngine = new Engine3D();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.ShadowReignEngine;
  }
})(typeof window !== "undefined" ? window : globalThis);
