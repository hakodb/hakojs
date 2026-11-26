# hakojs

> Part of [**HakoDB**](https://github.com/hakodb/hakodb) — embedded document DB with native vector search and multi-plane sync, written in Rust. The engine + C ABI live in `hakodb/hakodb`; this repo holds the JavaScript/TypeScript SDK.

JavaScript/TypeScript SDK for HakoDB:
high-level client (`client.ts`: `HakoClient`, `HakoConfig`) and native
FFI bindings over koffi/Bun (`native.ts`). Tauri lives in `@hakodb/tauri`
(sibling repo [`hakodb/hakotaurits`](https://github.com/hakodb/hakotaurits)).

## Compatibility

Works against the corresponding core release; each release pairs with a matching `hakodb` tag (see the releases page for the exact pairing).

## Setup — native library

`native.ts` loads the HakoDB cdylib. Resolution order:
`loadNativeBindings(explicitPath)` → `HAKODB_LIB_PATH` env →
`./native/<lib>`. Populate it with the sync script:

```powershell
# from a local core checkout (build it first: cargo build --release)
.\sync-native.ps1 -CoreDir C:\Dev\libs\hakodb
# or from a core release (pass the tag you want)
.\sync-native.ps1 -Tag <core-release-tag>
```

Binaries under `native/` are git-ignored.

## API guidance: query and write paths

Consumers should not have to guess which execution or write entry point to use. The core exposes one canonical executor plus advisory-deprecated wrappers and several materialization lanes with different costs.

### Execution lanes

| Lane | Returns | Use when |
|---|---|---|
| canonical executor (`hk_query_execute_ex` / SDK default) | JSON documents for an application | ordinary API calls |
| JSON egress (`hk_query_execute_json`) | JSON from pinned bytes, no owned document | wire/egress output |
| handles (`hk_query_execute_to_handles`) | borrowed document handles | engine throughput, caller reads selected fields |
| raw (`hk_query_execute_raw`) | pinned storage bytes | index-satisfied scans, zero decode |
| aggregation / explain | aggregate values or plan report | tuning and aggregate-only queries |

Do not compare a JSON-document lane with an engine-only lane and call it the same benchmark. Mark lanes without an equivalent in another engine as not applicable.

### Choosing a read lane in application code

| Need | API | Cost |
|---|---|---|
| Full documents (`HakoDocData[]`) | `query.get()` | `execute_ex` + `JSON.parse` |
| JSON egress / wire output | `query.get({ mode: "json" })` | pinned bytes, no JS objects |
| Only a few fields | `query.select(...).get()` | projected rows, still parsed |
| Typed fields, no JSON | `query.getViewRows(fields)` | borrowed view; returns only requested fields |
| Engine-only scan | `getRaw()` / `viewDoc()` | no `HakoDocData`; diagnostic, not a `get()` replacement |

`getRaw()`, `viewDoc()` and the `query_*` diagnostic lanes are fast because they deliberately do not materialize documents. Their checksums are count-only or partial-field; never compare them with a SQL row lane and call it the same workload.

### In this repository

- Query.get({ mode: "docs" | "json" | "handles" | "raw" }) is the single entry point; getJson() is a deprecated alias
- queryExecuteEx is canonical; queryExecute/queryExecuteWithCancel are legacy wrappers
- insertJSON for one document, batch().setJSON() for bulk writes
- client.ensureIndexes(schema) / client.dropIndexes(collection) are the canonical index pair; granular create*/drop* methods are advisory-deprecated (edge and tuned vector V2 stay advanced)
- effectiveConfig() is the single introspection call (durability, indexes, quiescence, stats); quiescenceStatus(), isIndexesReady() and getStats() are advisory-deprecated
- findPathsFull() / shortestPathsFull() are canonical graph lanes; findPaths() / shortestPaths() are advisory-deprecated
- findNear() and hybridSearch() accept optional filters via the canonical filtered lanes
- HakoConfig durability and awaitQuiescent before measuring or paging

### Further reading

- Core decision table: https://github.com/hakodb/hakodb/blob/main/docs/ffi-query-lanes.md
- Manual C ABI chapter: https://hakodb.github.io/manual/sdk-c-abi.html
