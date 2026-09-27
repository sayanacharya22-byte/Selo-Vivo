import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const managed = resolve(root, "contract", "managed", "selo-vivo");
const publicRoot = resolve(root, "frontend", "public");
const generatedRoot = resolve(root, "frontend", "generated", "selo-vivo");

if (!existsSync(managed)) {
  throw new Error("Compiled contract output is missing. Run npm run contracts:compile first.");
}

for (const directory of ["keys", "zkir"]) {
  const source = resolve(managed, directory);
  const destination = resolve(publicRoot, directory);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
}

await rm(generatedRoot, { recursive: true, force: true });
await mkdir(generatedRoot, { recursive: true });
await cp(resolve(managed, "contract"), resolve(generatedRoot, "contract"), { recursive: true });

console.log("Synced Midnight contract bindings and proving assets into the frontend.");
