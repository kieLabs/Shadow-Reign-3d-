const assert = require("assert");
const Device = require("../js/device.js");
const Controls = require("../js/controls.js");

const profile = Device.getViewportProfile();
assert.ok(profile.width > 0 && profile.height > 0, "Viewport profile dimensions must be positive");
assert.strictEqual(typeof profile.isMobile, "boolean", "isMobile flag must be boolean");
assert.strictEqual(typeof Controls.getMovementVector, "function", "Controls should expose getMovementVector");
console.log("✔ tests/mobile-presentation.test.js passed (Mobile Viewport & Controls verified)");
