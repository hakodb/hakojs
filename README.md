# hakojs

JavaScript/TypeScript SDK for HakoDB:
high-level client (`client.ts`: `HakoClient`, `HakoConfig`) and native
FFI bindings over koffi/Bun (`native.ts`). Tauri lives in `@hakodb/tauri`
(sibling dir, renaming with repo creation).

## Compatibility

| hakojs | hako core |
|---|---|
| 0.5.12 | `cloud_sync` branch / `v0.8.21`+ release asset |

## Setup — native library

`native.ts` loads the HakoDB cdylib. Resolution order:
`loadNativeBindings(explicitPath)` → `HAKODB_LIB_PATH` env →
`./native/<lib>`. Populate it with the sync script:

```powershell
.\sync-native.ps1 -CoreDir C:\Dev\libs\firelite
.\sync-native.ps1 -Tag v0.8.21
```

Binaries under `native/` are git-ignored.
