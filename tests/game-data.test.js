const assert = require("assert");
const Data = require("../js/data.js");

assert.strictEqual(Data.characters.length, 4, "Should contain 4 3D playable characters");
assert.strictEqual(Data.bosses.length, 3, "Should contain 3 3D arena bosses");
assert.strictEqual(Data.levels.length, 3, "Should contain 3 3D chapters");
Data.characters.forEach(c => {
  assert.ok(c.hp >= 100 && c.attack > 0 && c.speed > 0, `Invalid stats for ${c.id}`);
});
console.log("✔ tests/game-data.test.js passed (3D Roster & Arena Data verified)");
