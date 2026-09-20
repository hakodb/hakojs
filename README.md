# firelite-js

JavaScript/TypeScript SDK for [FireLite](https://github.com/rizaptk/firelite):
high-level client (`client.ts`), native FFI bindings over koffi/Bun
(`native.ts`), and Tauri gateway client (`tauri.ts` — moving to the
standalone `firelite-tauri-ts` package with the gateway split).

## Compatibility

| firelite-js | firelite core |
|---|---|
| 0.5.12 | `cloud_sync` branch / `v0.8.20`+ release asset |

## Setup — native library

`native.ts` loads the FireLite cdylib. Resolution order:
`loadNativeBindings(explicitPath)` → `FIRELITE_LIB_PATH` env →
`./native/<lib>`. Populate it with the sync script:

```powershell
.\sync-native.ps1 -CoreDir C:\Dev\libs\firelite
.\sync-native.ps1 -Tag v0.8.20
```

Binaries under `native/` are git-ignored.

## Usage

```ts
import { FireLiteClient } from "@firelite/client";

const db = await FireLiteClient.open("./data.firelite", {
  libraryPath: "./native/firelite.dll", // optional override
});

await db.collection("users").doc("alice").set({
  name: "Alice",
  age: 30,
  active: true,
});

const snap = await db.collection("users").doc("alice").get();
if (snap.exists) {
  console.log(snap.data());
}

const rows = await db
  .collection("users")
  .where("age", "==", 30)
  .orderBy("name", "asc")
  .limit(10)
  .select("name", "age")
  .get();

// deferred blobs: large binary fields come back as { __blob__: { len, offset } }
// placeholders; resolve per-doc only when the bytes are actually needed
const deferred = await db
  .collection("bench")
  .where("active", "==", true)
  .deferBlobs()
  .limit(20)
  .get();

const batch = db.batch();
batch
  .set(db.collection("users").doc("bob"), { name: "Bob", age: 31 })
  .delete(db.collection("users").doc("alice"));
await batch.commit();

// cloud sync + real-time snapshots
// room-agnostic server (not bound to any room):
const server = db.createCloudSyncServer("server-1", "master-token");
await server.start("0.0.0.0:8080");
// offline-first client that picks its room + server:
const cs = db.createCloudSyncClient("device-1", "game", "room-key", "token");
await cs.start("ws://host:8080");

const stop = await db.collection("users").onSnapshot((rows) => {
  console.log("live rows", rows);
});
// later: await stop();

await db.close();
```

Value mapping to the FFI builder: `string` → `fl_doc_insert_str`, integer/float → `fl_doc_insert_int`/`fl_doc_insert_float`, `boolean` → `fl_doc_insert_bool`, `null` → `fl_doc_insert_null`, `Uint8Array` → `fl_doc_insert_bin`, document references → `fl_doc_insert_reference`.

## Install & check

```sh
npm install
npx tsc --noEmit
```

## Examples

`examples/node` (koffi, needs `tsx`) and `examples/bun` run CRUD,
query, batch, and a live watch snapshot against `../native`:

```sh
npm install --prefix examples/node
cd examples/node && node --import tsx index.ts
bun examples/bun/index.ts   # from the repo root
```
