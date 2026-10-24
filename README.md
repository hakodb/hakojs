# hakojs

> Part of [**HakoDB**](https://github.com/hakodb/hakodb) — embedded document DB with native vector search and multi-plane sync, written in Rust. The engine + C ABI live in `hakodb/hakodb`; this repo holds the JavaScript/TypeScript SDK.

JavaScript/TypeScript SDK for HakoDB:
high-level client (`client.ts`: `HakoClient`, `HakoConfig`) and native
FFI bindings over koffi/Bun (`native.ts`). Tauri lives in `@hakodb/tauri`
(sibling repo [`hakodb/hakotaurits`](https://github.com/hakodb/hakotaurits)).

## Compatibility

| hakojs | hako core |
|---|---|
| 0.5.13 | `cloud_sync` branch / `v0.8.21`+ release asset |
| 0.5.15 | `hakodb v0.12.3` (archive: `relocateDocs`/`load`/`unload`/`unloadedCollections`) |
| 0.5.16 | `hakodb v0.13.3` (`createVectorIndex` + `findNear` KNN over `hk_engine_find_near`) |
| 0.5.17 | `hakodb v0.14.0` (`createTraverseIndex` + `findPaths` graph BFS over `hk_engine_find_paths`) |
| 0.5.18 | `hakodb v0.15.0` (Phase B: `createEdgeIndex` + `shortestPaths` Dijkstra over `hk_engine_shortest_paths`) |
| 0.5.19 | `hakodb v0.15.3` (native DLL refresh: ring-only TLS + shared sync framing) |
| 0.5.20 | `hakodb v0.16.0` (`createCloudSyncServer` room params: `roomName`/`roomKey`) |
| 0.5.21 | `hakodb v0.16.0` (Bun FFI arity fix) |
| 0.5.22 | `hakodb v0.16.5` (schemas, versioned reads, quiescence, explain, elemMatch/allEq/near/traverse, raw C-ABI parity) |
| 0.5.23 | `hakodb v0.18.0` (P2 JSON read paths: `getJson` point + query fast paths, view dotted-path pulls) |
| 0.5.24 | `hakodb v0.19.0` (`min`/`max` simple aggregation, `null` when no numeric value) |

## Setup — native library

`native.ts` loads the HakoDB cdylib. Resolution order:
`loadNativeBindings(explicitPath)` → `HAKODB_LIB_PATH` env →
`./native/<lib>`. Populate it with the sync script:

```powershell
.\sync-native.ps1 -CoreDir C:\Dev\libs\hakodb
.\sync-native.ps1 -Tag v0.19.0
```

Binaries under `native/` are git-ignored.
