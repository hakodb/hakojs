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
