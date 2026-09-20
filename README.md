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

## Install & check

```sh
npm install
npx tsc --noEmit
```
