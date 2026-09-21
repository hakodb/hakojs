/**
 * HakoDB Node.js example (TypeScript SDK, koffi FFI backend).
 *
 * Setup & run (from the repository root):
 *
 *   npm install                                        # koffi + msgpack
 *   npm install --prefix examples/node                 # tsx for running TS
 *   ..\sync-native.ps1 -CoreDir C:\Dev\libs\firelite   # -> native/hakodb.dll
 *   node --import tsx examples/node/index.ts           # (or cd examples/node)
 *
 * You can also drop the --features and comment out the demoNetAndCloudSync()
 * call if you only want the core CRUD/query part.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DurabilityMode,
  HakoClient,
  HakoConfig,
} from "../../src/index.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..", ".."
);
const libName =
  process.platform === "win32"
    ? "hakodb.dll"
    : process.platform === "darwin"
      ? "libhakodb.dylib"
      : "libhakodb.so";
const libraryPath = path.join(repoRoot, "native", libName);

async function main(): Promise<void> {
  // ---- Open with a configuration (durability / tuning) ----
  const config: HakoConfig = await HakoClient.createConfig(libraryPath);
  config.setDurability(DurabilityMode.Always).setQueryWorkers(4);
  const db = await HakoClient.open("demo.db", { config, libraryPath });

  // ---- Write documents ----
  await db.set("users", "u1", { name: "Alice", age: 32, active: true });
  await db.set("users", "u2", { name: "Bob", age: 27, active: true });
  console.log("inserted u1, u2");

  // ---- Read a document ----
  const snap = await db.get("users", "u1");
  console.log("u1 ->", snap.exists ? snap.data() : "not found");

  // ---- Query (firestore-style constraints) ----
  const rows = await db
    .collection("users")
    .where("age", ">=", 27)
    .orderBy("age", "desc")
    .limit(10)
    .get();
  console.log("query(age>=27) ->", rows);

  // ---- Aggregation ----
  console.log(
    "count(users) =",
    await db.collection("users").count()
  );

  // ---- Atomic batch ----
  const batch = db.batch();
  batch.set(db.collection("users").doc("u3"), { name: "Carol", age: 41 });
  batch.set(db.collection("users").doc("u4"), { name: "Dave", age: 50 });
  await batch.commit();
  console.log("batch committed (u3, u4)");

  // ---- Real-time watch ----
  const unsubscribe = db
    .collection("users")
    .onSnapshot((docs) => console.log("snapshot:", docs));
  await db.set("users", "u5", { name: "Eve", age: 22 });
  await new Promise((r) => setTimeout(r, 250));
  await unsubscribe();

  await demoNetAndCloudSync(db);

  await db.close();
  console.log("done");
}

/** Requires the shared library built with --features net-sync,cloud-sync
 *  and, for NetSync, a Tokio host runtime (use hako-cli serve --net-sync
 *  for a working LAN mesh from other languages). */
async function demoNetAndCloudSync(db: HakoClient): Promise<void> {
  const syncer = db.createNetSyncer("demo-room", "secret-key");
  try {
    await syncer.start(4456);
    console.log("net sync status:", await syncer.status());
  } catch (err) {
    console.warn("net sync skipped:", err);
  } finally {
    await syncer.close();
  }

  // Room-agnostic cloud SERVER: not bound to any room, hosts any (room, key).
  const server = db.createCloudSyncServer("node-server", "server-token");
  server.close();

  // Offline-first cloud CLIENT: picks its own room + server.
  const cloud = db.createCloudSyncClient("c1", "room", "secret-key", "token");
  cloud.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
