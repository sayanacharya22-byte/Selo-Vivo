import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = await readFile(resolve("contract/src/selo-vivo.compact"), "utf8");

assert.match(source, /pragma language_version >= 0\.23/);
assert.match(source, /witness private_holder_secret\(\): Bytes<32>/);
assert.match(source, /export ledger verified_credentials: Counter/);
assert.match(source, /constructor\(root: Bytes<32>\)/);
assert.match(source, /issuer_root = disclose\(root\)/);
assert.doesNotMatch(source, /circuit register_issuer_root/);
assert.match(source, /used_nullifiers: Set<Bytes<32>>/);
assert.match(source, /disclose\(nullifier\)/);
assert.match(source, /last_disclosed_class = disclose\(required_class\)/);
assert.doesNotMatch(source, /disclose\(holder_secret\)/);
assert.doesNotMatch(source, /disclose\(expiry_epoch\)/);

console.log("Compact privacy boundary checks passed.");
