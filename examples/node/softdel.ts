/**
 * Soft-delete / sweeper / restore smoke (core 0.20.0 FFI sync).
 *
 *   node --import tsx examples/node/softdel.ts
 */
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { HakoClient } from "../../src/index.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..", ".."
);
const libraryPath = path.join(repoRoot, "native", "hakodb.dll");

async function main(): Promise<void> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hako-softdel-"));
  const db = await HakoClient.open(path.join(dir, "smoke.db"), { libraryPath });
  try {
    await db.set("users", "u1", { name: "Alice", age: 32 });

    // Default delete is soft since core 0.20.0.
    await db.delete("users", "u1");
    if ((await db.get("users", "u1")).exists) {
      throw new Error("deleted doc must be invisible");
    }

    const avail = await db.restoreAvailable();
    if (!Array.isArray(avail) || avail.length !== 1 || avail[0].col !== "users" || avail[0].id !== "u1") {
      throw new Error("restoreAvailable mismatch: " + JSON.stringify(avail));
    }

    await db.restore("users", "u1");
    if (!(await db.get("users", "u1")).exists) {
      throw new Error("restore should bring the doc back");
    }
    if ((await db.restoreAvailable()).length !== 0) {
      throw new Error("record should be consumed after restore");
    }

    // Force parity: legacy shape retains nothing.
    await db.set("users", "u2", { name: "Bob" });
    await db.deleteEx("users", "u2", true);
    if ((await db.restoreAvailable()).length !== 0) {
      throw new Error("force delete must not retain");
    }

    // deleteQueue shares the shape; nothing is due in a fresh engine.
    const queue = await db.deleteQueue();
    if (!Array.isArray(queue) || queue.length !== 0) {
      throw new Error("deleteQueue mismatch: " + JSON.stringify(queue));
    }

    // Escape hatch works regardless of maintenance mode.
    const swept = await db.sweepNow();
    if (swept < 0) throw new Error("sweepNow failed: " + swept);

    console.log("soft-delete smoke OK (sweepNow=" + swept + ")");
  } finally {
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
