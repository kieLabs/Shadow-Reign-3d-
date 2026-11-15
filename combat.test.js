const assert = require("assert");
const Combat = require("../js/combat.js");

const d = Combat.distance3D({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 });
assert.strictEqual(d, 5, "3D Euclidean distance on X-Z plane should equal 5");

const unblocked = Combat.calculateDamage(20, 1.0, 0, false);
const blocked = Combat.calculateDamage(20, 1.0, 0, true);
assert.strictEqual(unblocked, 20, "Unblocked base damage should equal 20");
assert.strictEqual(blocked, 5, "Blocked damage should mitigate 75%");
console.log("✔ tests/combat.test.js passed (3D Distance & Mitigation verified)");
