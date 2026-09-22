# hakojs

> Part of [**HakoDB**](https://github.com/hakodb/hakodb) — embedded Firestore-style document DB in Rust. The engine + C ABI live in `hakodb/hakodb`; this repo holds the JavaScript/TypeScript SDK.

JavaScript/TypeScript SDK for HakoDB:
high-level client (`client.ts`: `HakoClient`, `HakoConfig`) and native
FFI bindings over koffi/Bun (`native.ts`). Tauri lives in `@hakodb/tauri`
(sibling repo [`hakodb/hakotaurits`](https://github.com/hakodb/hakotaurits)).

## Compatibility

| hakojs | hako core |
|---|---|
| 0.5.13 | `cloud_sync` branch / `v0.8.21`+ release asset |

## Setup — native library

`native.ts` loads the HakoDB cdylib. Resolution order:
`loadNativeBindings(explicitPath)` → `HAKODB_LIB_PATH` env →
`./native/<lib>`. Populate it with the sync script:

```powershell
.\sync-native.ps1 -CoreDir C:\Dev\libs\firelite
.\sync-native.ps1 -Tag v0.8.21
```

Binaries under `native/` are git-ignored.
