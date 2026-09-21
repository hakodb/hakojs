// export {
//   HakoClient,
//   HakoConfig,      // NEW: Required for tuning durability/memory
//   DurabilityMode,      // NEW: Required for config
//   CollectionReference,
//   DocumentReference,
//   DocumentSnapshot,
//   Query,
//   WriteBatch,
//   type HakoDocData,
//   type HakoClientOptions,
//   type Unsubscribe,    // NEW: Useful for typing listener cleanup
//   type Primitive       // NEW: Useful for custom data types
// } from './client';

// export { 
//   loadNativeBindings, 
//   type NativeBindings,
//   type WatchCallback   // NEW: Useful for advanced FFI users
// } from './native';

// export {
//   TauriHako,
//   TauriCollectionReference,
//   TauriDocumentReference,
//   TauriDocumentSnapshot,
//   TauriQuery,
//   TauriWriteBatch,
//   type HakoRecord,
//   type HakoPrimitive,
//   type FilterOperator
// } from './tauri';

export * from './client';
export * from './native';
// ponytail: the Tauri client moved to the standalone @firelite/tauri
// package (firelite-tauri-ts repo) with the gateway split — it shares
// type names with the native client, so it was never merged here anyway.